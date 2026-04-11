/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Seed Script — run with: npx tsx scripts/seed.ts
 * Populates MongoDB with demo users, projects, product instances,
 * and a dashboard config document.
 */

const mongoose = require("mongoose");
const path = require("path");

// Load env
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/debales-ai";

async function seed() {
  console.log("🔗 Connecting to MongoDB...", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  const db = mongoose.connection.db;

  // ─── Clear existing data ───
  const collections = ["users", "projects", "projectmembers", "productinstances", "conversations", "messages", "dashboardconfigs"];
  for (const col of collections) {
    try {
      await db.collection(col).drop();
    } catch {
      // collection might not exist
    }
  }
  console.log("🗑️  Cleared existing data");

  // ─── Users ───
  const users = await db.collection("users").insertMany([
    { name: "Alice Admin", email: "alice@example.com", createdAt: new Date(), updatedAt: new Date() },
    { name: "Bob Member", email: "bob@example.com", createdAt: new Date(), updatedAt: new Date() },
    { name: "Carol Admin", email: "carol@example.com", createdAt: new Date(), updatedAt: new Date() },
  ]);
  const userIds = Object.values(users.insertedIds);
  console.log(`👥 Created ${userIds.length} users`);

  // ─── Projects ───
  const projects = await db.collection("projects").insertMany([
    { name: "Acme Corp", slug: "acme-corp", description: "E-commerce platform with AI-powered sales assistant", createdAt: new Date(), updatedAt: new Date() },
    { name: "Globex Inc", slug: "globex-inc", description: "CRM-focused workspace for B2B sales team", createdAt: new Date(), updatedAt: new Date() },
  ]);
  const projectIds = Object.values(projects.insertedIds);
  console.log(`📁 Created ${projectIds.length} projects`);

  // ─── Project Members ───
  await db.collection("projectmembers").insertMany([
    // Acme Corp: Alice=admin, Bob=member
    { userId: userIds[0], projectId: projectIds[0], role: "admin", createdAt: new Date(), updatedAt: new Date() },
    { userId: userIds[1], projectId: projectIds[0], role: "member", createdAt: new Date(), updatedAt: new Date() },
    // Globex Inc: Carol=admin, Alice=member
    { userId: userIds[2], projectId: projectIds[1], role: "admin", createdAt: new Date(), updatedAt: new Date() },
    { userId: userIds[0], projectId: projectIds[1], role: "member", createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log("👤 Assigned members to projects");

  // ─── Product Instances ───
  await db.collection("productinstances").insertMany([
    {
      projectId: projectIds[0],
      productType: "ai-sales-assistant",
      nameSpace: "acme-sales",
      displayName: "Acme Sales AI",
      integrations: [
        { name: "Acme Shopify Store", enabled: true, type: "shopify" },
        { name: "Acme CRM", enabled: true, type: "crm" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      projectId: projectIds[1],
      productType: "ai-sales-assistant",
      nameSpace: "globex-sales",
      displayName: "Globex Sales AI",
      integrations: [
        { name: "Globex Shopify", enabled: false, type: "shopify" },
        { name: "Globex CRM", enabled: true, type: "crm" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("🤖 Created product instances with integrations");

  // ─── Dashboard Config ───
  await db.collection("dashboardconfigs").insertMany([
    {
      projectId: projectIds[0],
      pageTitle: "Acme Corp — Admin Dashboard",
      sections: [
        {
          id: "overview",
          title: "Key Metrics",
          columns: 4,
          order: 0,
          widgets: [
            {
              id: "total-revenue",
              type: "stat-card",
              title: "Total Revenue",
              span: 1,
              config: { value: "$48,523", change: "+12.5%", changeType: "positive", icon: "💰" },
            },
            {
              id: "active-users",
              type: "stat-card",
              title: "Active Users",
              span: 1,
              config: { value: "1,247", change: "+8.2%", changeType: "positive", icon: "👥" },
            },
            {
              id: "conversations",
              type: "stat-card",
              title: "Conversations",
              span: 1,
              config: { value: "342", change: "-2.1%", changeType: "negative", icon: "💬" },
            },
            {
              id: "conversion-rate",
              type: "stat-card",
              title: "Conversion Rate",
              span: 1,
              config: { value: "3.2%", change: "+0.4%", changeType: "positive", icon: "📈" },
            },
          ],
        },
        {
          id: "analytics",
          title: "Analytics",
          columns: 3,
          order: 1,
          widgets: [
            {
              id: "weekly-sales",
              type: "chart",
              title: "Weekly Sales",
              span: 2,
              config: {
                data: [4200, 6500, 4800, 8100, 5500, 9200, 7300],
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                color: "#6366f1",
              },
            },
            {
              id: "pipeline-summary",
              type: "list",
              title: "Sales Pipeline",
              span: 1,
              config: {
                items: [
                  { label: "Discovery", value: "8 deals", icon: "🔍" },
                  { label: "Proposal", value: "5 deals", icon: "📄" },
                  { label: "Negotiation", value: "3 deals", icon: "🤝" },
                  { label: "Closed Won", value: "12 deals", icon: "🎉" },
                ],
              },
            },
          ],
        },
        {
          id: "performance",
          title: "Team Performance",
          columns: 2,
          order: 2,
          widgets: [
            {
              id: "team-goals",
              type: "progress",
              title: "Q2 Goals Progress",
              span: 1,
              config: {
                items: [
                  { label: "Revenue Target", value: 48523, max: 75000, color: "#6366f1" },
                  { label: "New Customers", value: 89, max: 120, color: "#10b981" },
                  { label: "Demo Calls", value: 156, max: 200, color: "#f59e0b" },
                ],
              },
            },
            {
              id: "top-products",
              type: "table",
              title: "Top Products",
              span: 1,
              config: {
                headers: ["Product", "Sales", "Revenue"],
                rows: [
                  ["Premium Headphones", "89", "$13,340"],
                  ["Organic T-Shirt", "234", "$9,358"],
                  ["Water Bottle", "156", "$3,899"],
                  ["Face Moisturizer", "67", "$2,344"],
                ],
              },
            },
          ],
        },
        {
          id: "notices",
          title: "Notices",
          columns: 2,
          order: 3,
          widgets: [
            {
              id: "system-notice",
              type: "text-block",
              title: "System Update",
              span: 1,
              config: {
                content: "AI model has been upgraded to Gemini 2.0 Flash. Response quality and speed have been improved across all conversations.",
                variant: "info",
              },
            },
            {
              id: "integration-alert",
              type: "text-block",
              title: "Integration Notice",
              span: 1,
              config: {
                content: "Shopify sync completed. 5 new products imported, 23 orders synced in the last 24 hours.",
                variant: "success",
              },
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      projectId: projectIds[1],
      pageTitle: "Globex Inc — Admin Dashboard",
      sections: [
        {
          id: "overview",
          title: "Overview",
          columns: 3,
          order: 0,
          widgets: [
            {
              id: "pipeline-value",
              type: "stat-card",
              title: "Pipeline Value",
              span: 1,
              config: { value: "$285K", change: "+18%", changeType: "positive", icon: "💎" },
            },
            {
              id: "total-deals",
              type: "stat-card",
              title: "Active Deals",
              span: 1,
              config: { value: "24", change: "+3", changeType: "positive", icon: "📋" },
            },
            {
              id: "close-rate",
              type: "stat-card",
              title: "Close Rate",
              span: 1,
              config: { value: "34%", change: "+5%", changeType: "positive", icon: "🎯" },
            },
          ],
        },
        {
          id: "crm-data",
          title: "CRM Insights",
          columns: 2,
          order: 1,
          widgets: [
            {
              id: "contacts-table",
              type: "table",
              title: "Recent Contacts",
              span: 1,
              config: {
                headers: ["Name", "Company", "Stage"],
                rows: [
                  ["Sarah Chen", "TechCorp", "Negotiation"],
                  ["Mike Peters", "StartupXYZ", "Proposal"],
                  ["Lisa Wang", "Enterprise Co", "Closed Won"],
                ],
              },
            },
            {
              id: "deal-progress",
              type: "progress",
              title: "Deal Pipeline",
              span: 1,
              config: {
                items: [
                  { label: "Discovery", value: 4, max: 10, color: "#3b82f6" },
                  { label: "Proposal", value: 5, max: 8, color: "#8b5cf6" },
                  { label: "Negotiation", value: 3, max: 5, color: "#f59e0b" },
                  { label: "Closed", value: 12, max: 15, color: "#10b981" },
                ],
              },
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("📊 Created dashboard configs");

  // ─── Summary ───
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│        🎉  Seed Complete!                │");
  console.log("├─────────────────────────────────────────┤");
  console.log("│  Users:                                  │");
  console.log(`│    Alice Admin  → ID: ${userIds[0]}       `);
  console.log(`│    Bob Member   → ID: ${userIds[1]}       `);
  console.log(`│    Carol Admin  → ID: ${userIds[2]}       `);
  console.log("│                                          │");
  console.log("│  Projects:                               │");
  console.log("│    acme-corp  → Alice(admin), Bob(member) │");
  console.log("│    globex-inc → Carol(admin), Alice(member)│");
  console.log("│                                          │");
  console.log("│  Dashboard Config:                       │");
  console.log("│    Collection: dashboardconfigs           │");
  console.log("│    Drives: /projects/[slug]/admin page    │");
  console.log("└─────────────────────────────────────────┘");

  await mongoose.disconnect();
  console.log("\n✅ Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
