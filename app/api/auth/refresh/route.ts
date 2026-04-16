import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, signToken } from "@lib/auth";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return NextResponse.json({ token, user });
}
