import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  productInstanceId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    productInstanceId: { type: Schema.Types.ObjectId, ref: "ProductInstance", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Conversation" },
  },
  { timestamps: true }
);

ConversationSchema.index({ projectId: 1, productInstanceId: 1 });
ConversationSchema.index({ userId: 1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
