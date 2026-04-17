import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";

// Admin-only platform — no user accounts to update
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  if (params.id === "local-admin-001") {
    return NextResponse.json({ id: "local-admin-001", name: "Admin", email: user.email, role: "admin" });
  }
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json({ id: params.id, message: "No-op: user updates not required in local mode." });
}
