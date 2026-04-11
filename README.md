# Debales AI — Multi-tenant AI Sales Assistant

A full-stack multi-tenant AI assistant platform with a **config-driven admin dashboard**, real AI chat (Gemini), and integration management. Built with Next.js 15 (App Router), TypeScript, MongoDB, TanStack Query, and Tailwind CSS.

---

## 🏗️ Architecture

```
Access (pure rules) → Services (business logic + data) → Routes (thin handlers) → Hooks (TanStack Query) → UI (React)
```

### Multi-tenant Model

```
Project (tenant boundary)
  ├── ProjectMember (userId + role: admin | member)
  ├── ProductInstance (AI assistant config + integration toggles)
  │     └── Integrations[] (Shopify / CRM — toggleable)
  ├── Conversation (scoped to project + product instance + user)
  │     └── Message (user | assistant | step)
  └── DashboardConfig (config-driven admin UI — sections + widgets)
```

### Layer Breakdown

| Layer      | Location                     | Responsibility                                         |
|------------|------------------------------|--------------------------------------------------------|
| **Access** | `src/lib/access.ts`          | Pure authorization rules (no DB calls)                 |
| **Service**| `src/lib/services/*.ts`      | Business logic, DB queries, AI orchestration           |
| **Route**  | `src/app/api/***/route.ts`   | Thin HTTP handlers, Zod validation, call services      |
| **Hook**   | `src/hooks/use-*.ts`         | TanStack Query hooks — no direct DB access from client |
| **UI**     | `src/app/***/page.tsx`       | React components consuming hooks                       |

---

## 🚀 Setup & Run

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** running locally (or a MongoDB Atlas connection string)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/debales-ai
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key at: https://aistudio.google.com/apikey

### 3. Seed the database
```bash
npm run seed
```

This creates:
- **3 users**: Alice Admin, Bob Member, Carol Admin
- **2 projects**: `acme-corp`, `globex-inc`
- **Product instances** with Shopify + CRM integrations
- **Dashboard configs** with sections and widgets

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 👤 Demo Users & Access

| User         | acme-corp  | globex-inc |
|--------------|------------|------------|
| Alice Admin  | **admin**  | member     |
| Bob Member   | member     | ✗          |
| Carol Admin  | ✗          | **admin**  |

- **Admins** can access the Admin Dashboard and toggle integrations.
- **Members** can use the AI chat but cannot access admin features.
- **Non-members** are blocked from the project entirely.

---

## 📊 Config-Driven Admin Dashboard

### Where it lives
- **Collection**: `dashboardconfigs`
- **Page**: `/projects/[slug]/admin`
- **Access**: Admin role only (server-enforced)

### How it works
The admin dashboard reads a `DashboardConfig` document from MongoDB and dynamically renders sections and widgets. **No code changes needed** — just edit the DB document.

### Widget Types
| Type          | Description                          |
|---------------|--------------------------------------|
| `stat-card`   | KPI card with value, change, icon    |
| `chart`       | Bar chart with data array + labels   |
| `table`       | Table with headers + rows            |
| `text-block`  | Info/warning/success text block      |
| `list`        | Key-value list with optional icons   |
| `progress`    | Progress bars with labels + values   |

### How to edit the dashboard config (MongoDB)

1. Open your MongoDB client (MongoDB Compass, mongosh, or Atlas UI)
2. Navigate to the `debales-ai` database → `dashboardconfigs` collection
3. Find the document for your project (e.g., `pageTitle: "Acme Corp — Admin Dashboard"`)
4. Modify the document. Examples:

**Change the page title:**
```json
{ "$set": { "pageTitle": "My New Dashboard Title" } }
```

**Add a new widget to a section:**
```json
{
  "$push": {
    "sections.0.widgets": {
      "id": "new-widget",
      "type": "stat-card",
      "title": "New Metric",
      "span": 1,
      "config": {
        "value": "99",
        "change": "+10%",
        "changeType": "positive",
        "icon": "🚀"
      }
    }
  }
}
```

**Remove a section:**
```json
{ "$pull": { "sections": { "id": "notices" } } }
```

5. Refresh the admin dashboard page — the UI updates immediately.

---

## 🤖 AI Chat & Integrations

### AI Integration
- Uses **Google Gemini 2.0 Flash** (free tier)
- Controlled flow: the service layer decides when/how to call AI
- Conversation history is passed as context
- Integration data is injected into the system prompt

### Integration Simulation
- **Shopify-style**: Mock product catalog, orders, and revenue data
- **CRM-style**: Mock contacts, deals, and pipeline data
- Toggleable per project (admin only)
- When enabled, the AI references integration data in responses

### Rate Limiting
- Gemini free tier has rate limits
- Fallback response is generated on API errors
- Error steps are shown in the chat UI

---

## 📂 Environment Variables

| Variable       | Required | Description                            |
|----------------|----------|----------------------------------------|
| `MONGODB_URI`  | Yes      | MongoDB connection string              |
| `GEMINI_API_KEY`| No*     | Google Gemini API key for AI chat      |

*Chat will use fallback responses without a valid API key.

---

## 🧪 What's Mocked

- **Authentication**: Cookie-based "login as" — no passwords
- **Integrations**: Shopify and CRM return static mock data
- **AI**: Real Gemini API calls, but with fallback on failure

---

## 📁 Key Files

```
src/
├── app/
│   ├── api/                          # Route handlers
│   │   ├── auth/                     # Login/logout/users
│   │   └── projects/[slug]/          # Project-scoped APIs
│   ├── projects/
│   │   └── [slug]/
│   │       ├── admin/page.tsx        # ⭐ Config-driven dashboard
│   │       ├── chat/[id]/page.tsx    # Chat interface
│   │       ├── layout.tsx            # Sidebar + navigation
│   │       └── page.tsx              # Project home
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Login page
├── components/
│   └── providers.tsx                 # TanStack Query provider
├── hooks/                            # Client-side hooks
│   ├── use-auth.ts
│   ├── use-conversations.ts
│   ├── use-dashboard.ts
│   └── use-projects.ts
├── lib/
│   ├── access.ts                     # ⭐ Pure access rules
│   ├── auth.ts                       # Server auth utilities
│   ├── db.ts                         # MongoDB connection
│   ├── schemas.ts                    # Zod validation schemas
│   ├── models/                       # Mongoose models
│   └── services/                     # ⭐ Business logic layer
│       ├── ai.service.ts
│       ├── conversation.service.ts
│       ├── dashboard.service.ts
│       ├── integration.service.ts
│       ├── message.service.ts
│       └── project.service.ts
└── scripts/
    └── seed.ts                       # Database seeder
```

---

## 🔑 Assumptions

1. Auth is simplified (cookie-based stub) — production would use NextAuth or similar
2. Integration data is mocked — real Shopify/CRM APIs would replace `integration.service.ts`
3. Config-driven rendering is **only** on the admin dashboard (per requirements)
4. Chat / product UI uses standard React components
5. Dashboard config changes take effect on next page load (no WebSocket push)
