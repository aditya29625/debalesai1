/**
 * AI Service — controlled AI flow using Google Gemini.
 * The service layer decides when to call AI and with what context.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { type IIntegration } from "../models";
import { getMockIntegrationData } from "./integration.service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AIContext {
  userMessage: string;
  conversationHistory: { role: string; content: string }[];
  integrations: IIntegration[];
  productType: string;
}

interface AIResponse {
  reply: string;
  steps: { type: string; content: string }[];
}

export async function generateAIResponse(ctx: AIContext): Promise<AIResponse> {
  const steps: { type: string; content: string }[] = [];

  // Check which integrations are enabled and gather mock data
  const enabledIntegrations = ctx.integrations.filter((i) => i.enabled);

  let integrationContext = "";
  for (const integration of enabledIntegrations) {
    steps.push({
      type: integration.type,
      content: `Querying ${integration.name}...`,
    });
    const mockData = getMockIntegrationData(integration.type);
    integrationContext += `\n[${integration.name} Data]: ${JSON.stringify(mockData)}`;
  }

  // Build the system prompt
  const systemPrompt = `You are an AI Sales Assistant. You help users with product questions, customer data, and sales insights.
${integrationContext ? `\nYou have access to the following integration data:${integrationContext}` : ""}
${enabledIntegrations.length > 0 ? "\nUse the integration data to inform your responses when relevant." : "\nNo integrations are currently enabled."}
Keep responses concise and helpful. If asked about products, orders, or customers, reference the integration data.`;

  // Build conversation history for the model
  const history = ctx.conversationHistory.slice(-10).map((msg) => ({
    role: msg.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.content }],
  }));

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history,
      systemInstruction: systemPrompt,
    });

    steps.push({ type: "analyzing", content: "Generating response..." });

    const result = await chat.sendMessage(ctx.userMessage);
    const reply = result.response.text();

    return { reply, steps };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI generation error:", errorMessage);

    // Fallback response
    return {
      reply: `I apologize, but I'm having trouble generating a response right now. ${
        enabledIntegrations.length > 0
          ? "However, I can see your integrations are active. Please try again in a moment."
          : "Please try again in a moment."
      }`,
      steps: [
        ...steps,
        { type: "error", content: `AI service temporarily unavailable: ${errorMessage}` },
      ],
    };
  }
}
