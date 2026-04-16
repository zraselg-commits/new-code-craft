import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signToken } from "@lib/auth";
import { isFirebaseConfigured, verifyFirebaseToken } from "@lib/firebase-admin";
import { findUserByGoogleId, findUserByEmail, updateUser, createUser, defaultAvatarUrl } from "@lib/firestore";

const googleSchema = z.object({
  idToken: z.string().min(1),
  phone: z.string().max(20).optional(),
  createAccount: z.boolean().optional(),
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
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured on this server." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const result = googleSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }
  const { idToken, phone, createAccount } = result.data;

  try {
    const decoded = await verifyFirebaseToken(idToken);

    if (decoded.signInProvider !== "google.com") {
      return NextResponse.json({ error: "Only Google sign-in is supported." }, { status: 401 });
    }
    if (!decoded.emailVerified) {
      return NextResponse.json({ error: "Google account email is not verified." }, { status: 401 });
    }
    if (!decoded.email) {
      return NextResponse.json({ error: "Google account has no email address." }, { status: 401 });
    }

    const byGoogleId = await findUserByGoogleId(decoded.uid);
    const byEmail = byGoogleId ? null : await findUserByEmail(decoded.email);
    const existing = byGoogleId ?? byEmail ?? null;

    if (existing) {
      if (!existing.googleId) {
        await updateUser(existing.id, { googleId: decoded.uid });
      }
      const token = signToken({ id: existing.id, email: existing.email, role: existing.role });
      const res = NextResponse.json({
        token,
        user: { id: existing.id, name: existing.name, email: existing.email, role: existing.role },
        isNewUser: false,
      });
      return setAuthCookie(res, token);
    }

    if (!createAccount) {
      return NextResponse.json({ status: "needs_phone", email: decoded.email, name: decoded.name });
    }

    const photoUrl = typeof decoded["picture"] === "string" ? decoded["picture"] : null;
    const created = await createUser({
      name: decoded.name,
      email: decoded.email,
      googleId: decoded.uid,
      phone: phone ?? null,
      avatarUrl: photoUrl || defaultAvatarUrl(decoded.name),
      passwordHash: null,
      role: "user",
    });

    const token = signToken({ id: created.id, email: created.email, role: created.role });
    const res = NextResponse.json({
      token,
      user: { id: created.id, name: created.name, email: created.email, role: created.role, avatarUrl: created.avatarUrl ?? null },
      isNewUser: true,
    });
    return setAuthCookie(res, token);
  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Google sign-in failed. Please try again." }, { status: 401 });
  }
}
