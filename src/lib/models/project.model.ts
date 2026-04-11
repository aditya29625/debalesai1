import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Project =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
