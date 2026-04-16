import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@lib/auth";
import { findServiceById, findPackageById, createOrder } from "@lib/firestore";

const createOrderSchema = z.object({
  serviceId: z.string().min(1),
  packageId: z.string().min(1),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAuth(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const result = createOrderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }
  const { serviceId, packageId, customerPhone, notes, paymentMethod } = result.data;

  try {
    const svc = await findServiceById(serviceId);
    if (!svc) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const pkg = await findPackageById(packageId);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    if (pkg.serviceId !== serviceId) {
      return NextResponse.json({ error: "Package does not belong to the specified service" }, { status: 400 });
    }

    const order = await createOrder({
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
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: paymentMethod || null,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("Order create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
