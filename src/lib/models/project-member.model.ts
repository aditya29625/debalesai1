import mongoose, { Schema, Document, Types } from "mongoose";

export type Role = "admin" | "member";

export interface IProjectMember extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  role: Role;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true }
);

ProjectMemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export const ProjectMember =
  mongoose.models.ProjectMember ||
  mongoose.model<IProjectMember>("ProjectMember", ProjectMemberSchema);
