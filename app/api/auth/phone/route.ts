import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@lib/auth";
import { findUserByPhone, createUser, defaultAvatarUrl } from "@lib/firestore";

const phoneLoginSchema = z.object({
  phone: z.string().min(7).max(20),
  password: z.string().min(1),
});

const phoneSignupSchema = z.object({
  phone: z.string().min(7).max(20),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
});

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function setAuthCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set("rc_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (body?.action === "signup") {
    const result = phoneSignupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
    }
    const { phone, name, password } = result.data;

    try {
      const existing = await findUserByPhone(phone);
      if (existing) {
        return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const fakeEmail = `phone_${phone.replace(/\D/g, "")}@codecraftbd.info`;
      const user = await createUser({
        name,
        email: fakeEmail,
        passwordHash,
        phone,
        avatarUrl: defaultAvatarUrl(name),
        googleId: null,
        role: "user",
      });

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      const res = NextResponse.json({
        status: "signed_up",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ?? null, phone: user.phone ?? null },
      }, { status: 201 });
      return setAuthCookie(res, token);
    } catch (err) {
      console.error("Phone signup error:", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  const result = phoneLoginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }
  const { phone, password } = result.data;

  try {
    const user = await findUserByPhone(phone);
    if (!user) {
      return NextResponse.json({ status: "new_user" });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "This account uses another sign-in method." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({
      status: "logged_in",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ?? null, phone: user.phone ?? null },
    });
    return setAuthCookie(res, token);
  } catch (err) {
    console.error("Phone login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
