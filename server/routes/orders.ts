import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { orders, services, packages } from "../schema.js";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middleware.js";

const router = Router();

const createOrderSchema = z.object({
  serviceId: z.string().min(1),
  packageId: z.string().min(1),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
  }
  const { serviceId, packageId, customerPhone, notes } = result.data;
  const user = req.user!;

  try {
    const [svc] = await db.select().from(services).where(eq(services.id, serviceId));
    if (!svc) return res.status(404).json({ error: "Service not found" });

    const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId));
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    if (pkg.serviceId !== serviceId) {
      return res.status(400).json({ error: "Package does not belong to the specified service" });
    }

    const [order] = await db.insert(orders).values({
      userId: user.id,
      serviceId,
      packageId,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: customerPhone || "",
      serviceName: svc.title,
      packageName: pkg.name,
      price: pkg.price,
      notes: notes || "",
    }).returning();

    return res.status(201).json(order);
  } catch (err) {
    console.error("Order create error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mine", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const myOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.user!.id));

    return res.json(myOrders);
  } catch (err) {
    console.error("Orders fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
