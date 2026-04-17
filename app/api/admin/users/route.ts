import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";

// Admin-only platform — no public user accounts
// Returns just the admin user derived from env credentials
export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json([
    { id: "local-admin-001", name: "Admin", email: user.email, role: "admin", createdAt: new Date().toISOString() },
  ]);
}
