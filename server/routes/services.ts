import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { services, packages } from "../schema.js";
import { eq, and, sql } from "drizzle-orm";

const slugParam = z.string().regex(/^[a-z0-9-]+$/).min(1).max(100);

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const includePackages = req.query.include === "packages";
  try {
    if (includePackages) {
      const result = await db.query.services.findMany({
        where: eq(services.isActive, true),
        with: { packages: true },
      });
      res.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
      return res.json(result);
    }

    const svcs = await db
      .select({
        id: services.id,
        title: services.title,
        slug: services.slug,
        category: services.category,
        description: sql<string>`LEFT(${services.description}, 160)`,
        imageUrl: services.imageUrl,
        tags: services.tags,
        isActive: services.isActive,
        createdAt: services.createdAt,
      })
      .from(services)
      .where(eq(services.isActive, true));

    const pkgRows = await db
      .select({
        serviceId: packages.serviceId,
        minPrice: sql<string>`MIN(${packages.price}::numeric)`,
      })
      .from(packages)
      .groupBy(packages.serviceId);

    const priceMap = new Map(pkgRows.map((r) => [r.serviceId, r.minPrice]));

    const result = svcs.map((svc) => ({
      ...svc,
      startingPrice: priceMap.get(svc.id) || null,
    }));

    res.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
    return res.json(result);
  } catch (err) {
    console.error("Services fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req: Request, res: Response) => {
  if (!slugParam.safeParse(req.params.slug).success) return res.status(400).json({ error: "Invalid slug" });
  try {
    const svc = await db.query.services.findFirst({
      where: and(eq(services.slug, req.params.slug), eq(services.isActive, true)),
      with: { packages: true },
    });

    if (!svc) return res.status(404).json({ error: "Service not found" });
    res.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
    return res.json(svc);
  } catch (err) {
    console.error("Service detail error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
