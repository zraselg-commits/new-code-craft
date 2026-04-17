import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signToken } from "@lib/auth";
import { checkRateLimit, resetRateLimit } from "@lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

const ADMIN_EMAIL = process.env.LOCAL_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "admin@codecraftbd.info";
const ADMIN_PASSWORD = process.env.LOCAL_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "admin123";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${Math.ceil((rl.retryAfter ?? 900) / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 900) } }
    );
  }

  const body = await req.json().catch(() => null);
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const { email, password } = result.data;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  resetRateLimit(`login:${ip}`);
  const token = signToken({ id: "local-admin-001", email, role: "admin" });
  const res = NextResponse.json({
    token,
    user: { id: "local-admin-001", name: "Admin", email, role: "admin" },
  });
  res.cookies.set("rc_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
