import { connectDB } from "../db";
import {
  Conversation,
  Project,
  ProductInstance,
  type IConversation,
  type IProject,
} from "../models";

export async function getConversations(projectSlug: string, userId: string) {
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean<IProject>();
  if (!project) return [];

  const conversations = await Conversation.find({
    projectId: project._id,
    userId,
  })
    .sort({ updatedAt: -1 })
    .lean<IConversation[]>();

  return conversations.map((c) => ({
    _id: c._id.toString(),
    title: c.title,
    projectId: c.projectId.toString(),
    productInstanceId: c.productInstanceId.toString(),
    userId: c.userId.toString(),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function createConversation(
  projectSlug: string,
  userId: string,
  title?: string
) {
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean<IProject>();
  if (!project) throw new Error("Project not found");

  const productInstance = await ProductInstance.findOne({
    projectId: project._id,
  }).lean();
  if (!productInstance) throw new Error("No product instance for this project");

  const conversation = await Conversation.create({
    projectId: project._id,
    productInstanceId: productInstance._id,
    userId,
    title: title || "New Conversation",
  });

  return {
    _id: conversation._id.toString(),
    title: conversation.title,
    projectId: conversation.projectId.toString(),
    productInstanceId: conversation.productInstanceId.toString(),
    userId: conversation.userId.toString(),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export async function getConversationById(conversationId: string) {
  await connectDB();
  const conv = await Conversation.findById(conversationId).lean<IConversation>();
  if (!conv) return null;
  return {
    _id: conv._id.toString(),
    title: conv.title,
    projectId: conv.projectId.toString(),
    productInstanceId: conv.productInstanceId.toString(),
    userId: conv.userId.toString(),
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  };
}

export async function updateConversationTitle(conversationId: string, title: string) {
  await connectDB();
  await Conversation.findByIdAndUpdate(conversationId, { title });
}
