import { NextRequest, NextResponse } from "next/server";
import { getProjectAuth } from "@/lib/auth";
import { canAccessProject, canSendMessage } from "@/lib/access";
import { getMessages, createMessage } from "@/lib/services/message.service";
import { getConversationById, updateConversationTitle } from "@/lib/services/conversation.service";
import { getProductInstance } from "@/lib/services/project.service";
import { generateAIResponse } from "@/lib/services/ai.service";
import { sendMessageSchema } from "@/lib/schemas";

type Params = { params: Promise<{ slug: string; conversationId: string }> };

/** GET /api/projects/[slug]/conversations/[conversationId]/messages */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug, conversationId } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canAccessProject(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const conversation = await getConversationById(conversationId);
    if (!conversation || conversation.projectId !== (await getProjectId(slug))) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await getMessages(conversationId);
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/projects/[slug]/conversations/[conversationId]/messages — send + get AI reply */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug, conversationId } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canAccessProject(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (!canSendMessage(auth.role, conversation.userId, auth.user._id)) {
      return NextResponse.json({ error: "Cannot send messages in this conversation" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse({ ...body, conversationId });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Save user message
    const userMessage = await createMessage(conversationId, "user", parsed.data.content);

    // Get integration context
    const productInstance = await getProductInstance(slug);

    // Get conversation history for AI context
    const existingMessages = await getMessages(conversationId);
    const history = existingMessages
      .filter((m) => m.role !== "step")
      .map((m) => ({ role: m.role, content: m.content }));

    // Generate AI response
    const aiResponse = await generateAIResponse({
      userMessage: parsed.data.content,
      conversationHistory: history,
      integrations: productInstance?.integrations || [],
      productType: productInstance?.productType || "ai-sales-assistant",
    });

    // Save step messages
    const stepMessages = [];
    for (const step of aiResponse.steps) {
      const stepMsg = await createMessage(conversationId, "step", step.content, step.type);
      stepMessages.push(stepMsg);
    }

    // Save assistant response
    const assistantMessage = await createMessage(conversationId, "assistant", aiResponse.reply);

    // Update conversation title if it's the first message
    if (existingMessages.length === 0) {
      const title = parsed.data.content.substring(0, 50) + (parsed.data.content.length > 50 ? "..." : "");
      await updateConversationTitle(conversationId, title);
    }

    return NextResponse.json({
      userMessage,
      stepMessages,
      assistantMessage,
    });
  } catch (error) {
    console.error("Message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getProjectId(slug: string): Promise<string> {
  const { getProjectBySlug } = await import("@/lib/services/project.service");
  const project = await getProjectBySlug(slug);
  return project?._id || "";
}
