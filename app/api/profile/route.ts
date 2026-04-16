import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@lib/auth";
import { updateUser, findUserById } from "@lib/firestore";

const patchSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  avatarUrl: z.string().max(500_000).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const user = await findUserById(authUser.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    createdAt: user.createdAt,
    hasPassword: !!user.passwordHash,
  });
}

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (result.data.name !== undefined) updates.name = result.data.name;
  if (result.data.phone !== undefined) updates.phone = result.data.phone;
  if (result.data.avatarUrl !== undefined) updates.avatarUrl = result.data.avatarUrl;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    await updateUser(authUser.id, updates as Parameters<typeof updateUser>[1]);
    const updated = await findUserById(authUser.id);
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone ?? null,
      avatarUrl: updated.avatarUrl ?? null,
      role: updated.role,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
