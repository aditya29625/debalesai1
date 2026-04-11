import { z } from "zod";

// ── Auth ──
export const loginSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

// ── Project ──
export const projectSlugSchema = z.object({
  slug: z.string().min(1),
});

// ── Conversation ──
export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const conversationIdSchema = z.object({
  conversationId: z.string().min(1),
});

// ── Message ──
export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
  conversationId: z.string().min(1),
});

// ── Integration toggle ──
export const toggleIntegrationSchema = z.object({
  integrationName: z.string().min(1),
  enabled: z.boolean(),
});

// ── Dashboard Config ──
export const widgetSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["stat-card", "chart", "table", "text-block", "list", "progress"]),
  title: z.string().min(1),
  span: z.number().min(1).max(4).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const sectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  columns: z.number().min(1).max(4).optional(),
  order: z.number().optional(),
  widgets: z.array(widgetSchema),
});

export const dashboardConfigSchema = z.object({
  pageTitle: z.string().min(1).optional(),
  sections: z.array(sectionSchema).optional(),
});

// ── Types derived from Zod ──
export type LoginInput = z.infer<typeof loginSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ToggleIntegrationInput = z.infer<typeof toggleIntegrationSchema>;
export type DashboardConfigInput = z.infer<typeof dashboardConfigSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
