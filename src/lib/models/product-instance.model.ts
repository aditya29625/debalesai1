import mongoose, { Schema, Document, Types } from "mongoose";

export interface IIntegration {
  name: string;
  enabled: boolean;
  type: "shopify" | "crm";
}

export interface IProductInstance extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  productType: string;
  nameSpace: string;
  displayName: string;
  integrations: IIntegration[];
  createdAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    name: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ["shopify", "crm"], required: true },
  },
  { _id: false }
);

const ProductInstanceSchema = new Schema<IProductInstance>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    productType: { type: String, required: true, default: "ai-sales-assistant" },
    nameSpace: { type: String, required: true },
    displayName: { type: String, required: true },
    integrations: { type: [IntegrationSchema], default: [] },
  },
  { timestamps: true }
);

ProductInstanceSchema.index({ projectId: 1 });

export const ProductInstance =
  mongoose.models.ProductInstance ||
  mongoose.model<IProductInstance>("ProductInstance", ProductInstanceSchema);
