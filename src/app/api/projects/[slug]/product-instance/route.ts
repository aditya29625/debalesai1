import { NextRequest, NextResponse } from "next/server";
import { getProjectAuth } from "@/lib/auth";
import { canAccessProject } from "@/lib/access";
import { getProductInstance } from "@/lib/services/project.service";

type Params = { params: Promise<{ slug: string }> };

/** GET /api/projects/[slug]/product-instance */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const auth = await getProjectAuth(slug);
    if (!auth || !canAccessProject(auth.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const instance = await getProductInstance(slug);
    if (!instance) {
      return NextResponse.json({ error: "No product instance found" }, { status: 404 });
    }

    return NextResponse.json(instance);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
