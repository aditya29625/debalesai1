import { connectDB } from "../db";
import { Message, type IMessage } from "../models";

export async function getMessages(conversationId: string) {
  await connectDB();
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean<IMessage[]>();

  return messages.map((m) => ({
    _id: m._id.toString(),
    conversationId: m.conversationId.toString(),
    role: m.role,
    content: m.content,
    stepType: m.stepType,
    createdAt: m.createdAt,
  }));
}

export async function createMessage(
  conversationId: string,
  role: "user" | "assistant" | "step",
  content: string,
  stepType?: string
) {
  await connectDB();
  const message = await Message.create({
    conversationId,
    role,
    content,
    stepType,
  });

  return {
    _id: message._id.toString(),
    conversationId: message.conversationId.toString(),
    role: message.role,
    content: message.content,
    stepType: message.stepType,
    createdAt: message.createdAt,
  };
}
