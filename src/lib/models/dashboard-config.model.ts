import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWidget {
  id: string;
  type: "stat-card" | "chart" | "table" | "text-block" | "list" | "progress";
  title: string;
  span?: number; // grid column span (1-4)
  config: Record<string, unknown>;
}

export interface ISection {
  id: string;
  title: string;
  columns: number;
  order: number;
  widgets: IWidget[];
}

export interface IDashboardConfig extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  pageTitle: string;
  sections: ISection[];
  updatedAt: Date;
}

const WidgetSchema = new Schema<IWidget>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["stat-card", "chart", "table", "text-block", "list", "progress"],
      required: true,
    },
    title: { type: String, required: true },
    span: { type: Number, default: 1 },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    columns: { type: Number, default: 3 },
    order: { type: Number, default: 0 },
    widgets: { type: [WidgetSchema], default: [] },
  },
  { _id: false }
);

const DashboardConfigSchema = new Schema<IDashboardConfig>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    pageTitle: { type: String, default: "Admin Dashboard" },
    sections: { type: [SectionSchema], default: [] },
  },
  { timestamps: true }
);

export const DashboardConfig =
  mongoose.models.DashboardConfig ||
  mongoose.model<IDashboardConfig>("DashboardConfig", DashboardConfigSchema);
