import { NextRequest, NextResponse } from "next/server";
import { getProjectAuth } from "@/lib/auth";
import { canAccessAdminDashboard } from "@/lib/access";
import { getDashboardConfig, updateDashboardConfig } from "@/lib/services/dashboard.service";
import { dashboardConfigSchema } from "@/lib/schemas";

type Params = { params: Promise<{ slug: string }> };

/** GET /api/projects/[slug]/dashboard-config — admin only */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canAccessAdminDashboard(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const config = await getDashboardConfig(slug);
    if (!config) {
      return NextResponse.json({ error: "Dashboard config not found" }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** PUT /api/projects/[slug]/dashboard-config — admin only */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canAccessAdminDashboard(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = dashboardConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const config = await updateDashboardConfig(slug, parsed.data);
    return NextResponse.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
