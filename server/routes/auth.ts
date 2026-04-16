import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../db.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, AuthRequest } from "../middleware.js";
import { verifyFirebaseToken, firebaseConfigured } from "../firebase.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().max(20).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const smartSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z.object({
  idToken: z.string().min(1),
  phone: z.string().max(20).optional(),
  createAccount: z.boolean().optional(),
});

function userResponse(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post("/signup", async (req: Request, res: Response) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
  }
  const { name, email, password, phone } = result.data;

  try {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash, phone: phone ?? null })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ token, user: userResponse(user) });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
  }
  const { email, password } = result.data;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.passwordHash) {
      return res.status(401).json({ error: "This account uses Google sign-in. Please use Continue with Google." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ token, user: userResponse(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/smart", async (req: Request, res: Response) => {
  const result = smartSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
  }
  const { email, password } = result.data;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.json({ status: "new_user" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "This account uses Google sign-in. Please use Continue with Google." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ status: "logged_in", token, user: userResponse(user) });
  } catch (err) {
    console.error("Smart auth error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/google", async (req: Request, res: Response) => {
  if (!firebaseConfigured) {
    return res.status(503).json({ error: "Google sign-in is not configured on this server." });
  }

  const result = googleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
  }
  const { idToken, phone, createAccount } = result.data;

  try {
    const decoded = await verifyFirebaseToken(idToken);

    if (decoded.signInProvider !== "google.com") {
      return res.status(401).json({ error: "Only Google sign-in is supported." });
    }
    if (!decoded.emailVerified) {
      return res.status(401).json({ error: "Google account email is not verified." });
    }
    if (!decoded.email) {
      return res.status(401).json({ error: "Google account has no email address." });
    }

    const [byGoogleId] = await db.select().from(users).where(eq(users.googleId, decoded.uid));
    const [byEmail] = byGoogleId ? [] : await db.select().from(users).where(eq(users.email, decoded.email));
    const existing = byGoogleId ?? byEmail ?? null;

    if (existing) {
      if (!existing.googleId) {
        await db.update(users).set({ googleId: decoded.uid }).where(eq(users.id, existing.id));
      }
      const token = signToken({ id: existing.id, email: existing.email, role: existing.role });
      return res.json({ token, user: userResponse(existing), isNewUser: false });
    }

    if (!createAccount) {
      return res.json({ status: "needs_phone", email: decoded.email, name: decoded.name });
    }

    const [created] = await db
      .insert(users)
      .values({
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.uid,
        phone: phone ?? null,
        passwordHash: null,
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    const token = signToken({ id: created.id, email: created.email, role: created.role });
    return res.json({ token, user: userResponse(created), isNewUser: true });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ error: "Google sign-in failed. Please try again." });
  }
});

router.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

router.post("/refresh", requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.json({ token, user });
});

export default router;
