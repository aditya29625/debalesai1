import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

/** GET /api/auth/users — list all seed users (for "login as" picker) */
export async function GET() {
  try {
    await connectDB();
    const users = await User.find().lean();
    return NextResponse.json(
      users.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
