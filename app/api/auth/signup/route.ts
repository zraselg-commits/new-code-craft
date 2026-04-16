import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@lib/auth";
import { findUserByEmail, createUser, defaultAvatarUrl } from "@lib/firestore";

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().max(20).optional(),
});

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const result = signupSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }
  const { name, email, password, phone } = result.data;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({
      name,
      email,
      passwordHash,
      phone: phone ?? null,
      avatarUrl: defaultAvatarUrl(name),
      googleId: null,
      role: "user",
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = NextResponse.json(
      { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ?? null } },
      { status: 201 }
    );
    res.cookies.set("rc_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
