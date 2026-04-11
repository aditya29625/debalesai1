import mongoose, { Schema, Document, Types } from "mongoose";

export type MessageRole = "user" | "assistant" | "step";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  role: MessageRole;
  content: string;
  stepType?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    role: { type: String, enum: ["user", "assistant", "step"], required: true },
    content: { type: String, required: true },
    stepType: { type: String },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
