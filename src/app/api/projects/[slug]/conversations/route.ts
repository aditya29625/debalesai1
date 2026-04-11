import { NextRequest, NextResponse } from "next/server";
import { getProjectAuth } from "@/lib/auth";
import { canAccessProject, canCreateConversation } from "@/lib/access";
import {
  getConversations,
  createConversation,
} from "@/lib/services/conversation.service";
import { createConversationSchema } from "@/lib/schemas";

type Params = { params: Promise<{ slug: string }> };

/** GET /api/projects/[slug]/conversations */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canAccessProject(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const conversations = await getConversations(slug, auth.user._id);
    return NextResponse.json(conversations);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/projects/[slug]/conversations */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canCreateConversation(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createConversationSchema.safeParse(body);
    const title = parsed.success ? parsed.data.title : undefined;

    const conversation = await createConversation(slug, auth.user._id, title);
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
