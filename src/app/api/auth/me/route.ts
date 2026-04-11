import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/auth/me — get current logged-in user */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
