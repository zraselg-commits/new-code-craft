import jwt from "jsonwebtoken";
import { findUserById } from "./firestore";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload: { id: string; email: string; role: string }): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; email: string; role: string } {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
}

function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get("rc_auth_token")?.value;
  if (cookie) return cookie;
  return null;
}

export async function getAuthUser(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    // ── Local admin bypass — no Firebase call needed ──
    if (payload.id === "local-admin-001") {
      return { id: payload.id, name: "Admin", email: payload.email, role: "admin", phone: null, avatarUrl: null };
    }
    const user = await findUserById(payload.id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? null,
      avatarUrl: user.avatarUrl ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return { user: null, error: "Authentication required", status: 401 };
  return { user, error: null, status: 200 };
}

export async function requireAdmin(req: NextRequest) {
  const { user, error, status } = await requireAuth(req);
  if (!user) return { user: null, error, status };
  if (user.role !== "admin") return { user: null, error: "Admin access required", status: 403 };
  return { user, error: null, status: 200 };
}
