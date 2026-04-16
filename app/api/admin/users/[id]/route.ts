import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@lib/auth";
import { updateUser, findUserById } from "@lib/firestore";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  if (!params.id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const patchSchema = z.object({ role: z.enum(["user", "admin"]) });
  const body = await req.json().catch(() => null);
  const result = patchSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  try {
    const existing = await findUserById(params.id);
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await updateUser(params.id, { role: result.data.role });
    return NextResponse.json({ id: existing.id, name: existing.name, email: existing.email, role: result.data.role });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
