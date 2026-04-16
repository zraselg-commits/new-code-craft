import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@lib/auth";
import { updateUser, findUserById } from "@lib/firestore";

const patchSchema = z.object({
  currentPassword: z.string().optional().default(""),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Validation failed" }, { status: 400 });
  }

  const { currentPassword, newPassword } = result.data;

  const user = await findUserById(authUser.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.passwordHash) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUser(authUser.id, { passwordHash });

  return NextResponse.json({ ok: true, message: "Password updated successfully" });
}
