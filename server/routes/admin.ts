import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { orders, users, services, packages } from "../schema.js";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAdmin, AuthRequest } from "../middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalOrders] = await db.select({ count: count() }).from(orders);
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [revenueRow] = await db
      .select({ total: sql<string>`COALESCE(SUM(price::numeric), 0)` })
      .from(orders)
      .where(eq(orders.status, "completed"));
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return res.json({
      totalOrders: totalOrders.count,
      totalUsers: totalUsers.count,
      totalRevenue: revenueRow.total,
      recentOrders,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders", async (_req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return res.json(allOrders);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const uuidParam = z.string().uuid();

router.get("/orders/:id", async (req: Request, res: Response) => {
  if (!uuidParam.safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid id" });
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req: Request, res: Response) => {
  if (!uuidParam.safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid id" });
  const schema = z.object({
    status: z.enum(["pending", "processing", "completed"]).optional(),
    paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional(),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Validation failed" });

  try {
    const [updated] = await db
      .update(orders)
      .set(result.data)
      .where(eq(orders.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Order not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", async (_req: Request, res: Response) => {
  try {
    const allUsers = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt));
    return res.json(allUsers);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id", async (req: Request, res: Response) => {
  if (!uuidParam.safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid id" });
  const schema = z.object({ role: z.enum(["user", "admin"]) });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Validation failed" });

  try {
    const [updated] = await db
      .update(users)
      .set({ role: result.data.role })
      .where(eq(users.id, req.params.id))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });
    if (!updated) return res.status(404).json({ error: "User not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const serviceSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(100),
  category: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

router.get("/services", async (_req: Request, res: Response) => {
  try {
    const allServices = await db.select().from(services).orderBy(services.createdAt);
    const allPackages = await db.select().from(packages);
    const result = allServices.map((svc) => ({
      ...svc,
      packages: allPackages.filter((p) => p.serviceId === svc.id),
    }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/services", async (req: Request, res: Response) => {
  const result = serviceSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
  try {
    const [svc] = await db.insert(services).values(result.data).returning();
    return res.status(201).json(svc);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/services/:id", async (req: Request, res: Response) => {
  if (!uuidParam.safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid id" });
  const result = serviceSchema.partial().safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Validation failed" });
  try {
    const [updated] = await db
      .update(services)
      .set(result.data)
      .where(eq(services.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Service not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/services/:id", async (req: Request, res: Response) => {
  if (!uuidParam.safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid id" });
  try {
    await db.delete(services).where(eq(services.id, req.params.id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const packageSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().min(1).max(100),
  tier: z.string().min(1),
  price: z.number().or(z.string()),
  features: z.array(z.string()),
  deliveryDays: z.number().int().positive(),
  revisions: z.number().int().min(0).nullable().optional(),
  isPopular: z.boolean().optional(),
});

router.get("/packages", async (_req: Request, res: Response) => {
  try {
    const allPackages = await db.select().from(packages);
    return res.json(allPackages);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/packages", async (req: Request, res: Response) => {
  const result = packageSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
  try {
    const [pkg] = await db.insert(packages).values({
      ...result.data,
      price: String(result.data.price),
    }).returning();
    return res.status(201).json(pkg);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/packages/:id", async (req: Request, res: Response) => {
  if (!uuidParam.safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid id" });
  const result = packageSchema.partial().safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Validation failed" });
  try {
    const data = result.data.price !== undefined
      ? { ...result.data, price: String(result.data.price) }
      : result.data;
    const [updated] = await db
      .update(packages)
      .set(data)
      .where(eq(packages.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Package not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/packages/:id", async (req: Request, res: Response) => {
  if (!uuidParam.safeParse(req.params.id).success) return res.status(400).json({ error: "Invalid id" });
  try {
    await db.delete(packages).where(eq(packages.id, req.params.id));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
