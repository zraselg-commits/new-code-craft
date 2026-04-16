import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@lib/auth";
import { findUserByEmail } from "@lib/firestore";

const smartSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

// Local admin credentials for dev without Firebase
const LOCAL_ADMIN_EMAIL = process.env.LOCAL_ADMIN_EMAIL ?? "admin@codecraftbd.info";
const LOCAL_ADMIN_PASSWORD = process.env.LOCAL_ADMIN_PASSWORD ?? "admin123";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const result = smartSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }
  const { email, password } = result.data;

  // ── Local admin bypass (works without Firebase) ──
  if (email === LOCAL_ADMIN_EMAIL && password === LOCAL_ADMIN_PASSWORD) {
    const fakeAdminId = "local-admin-001";
    const token = signToken({ id: fakeAdminId, email, role: "admin" });
    const res = NextResponse.json({
      status: "logged_in",
      token,
      user: { id: fakeAdminId, name: "Admin", email, role: "admin" },
    });
    res.cookies.set("rc_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ status: "new_user" });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "This account uses Google sign-in. Please use Continue with Google." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({
      status: "logged_in",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set("rc_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Smart auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

