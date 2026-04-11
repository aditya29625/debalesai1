import { NextRequest, NextResponse } from "next/server";
import { getProjectAuth } from "@/lib/auth";
import { canManageIntegrations, canAccessProject } from "@/lib/access";
import { toggleIntegration, getProductInstance } from "@/lib/services/project.service";
import { toggleIntegrationSchema } from "@/lib/schemas";

type Params = { params: Promise<{ slug: string }> };

/** GET /api/projects/[slug]/integrations — get integrations */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canAccessProject(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const instance = await getProductInstance(slug);
    return NextResponse.json(instance?.integrations || []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** PATCH /api/projects/[slug]/integrations — toggle an integration */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canManageIntegrations(auth.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = toggleIntegrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const integrations = await toggleIntegration(
      slug,
      parsed.data.integrationName,
      parsed.data.enabled
    );
    return NextResponse.json(integrations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
