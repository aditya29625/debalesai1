import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProjectsForUser } from "@/lib/services/project.service";

/** GET /api/projects — list projects for the current user */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await getProjectsForUser(user._id);
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
