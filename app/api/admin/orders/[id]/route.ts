import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@lib/auth";
import { findLocalOrderById, updateLocalOrder } from "@lib/local-orders-store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const order = findLocalOrderById(params.id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const patchSchema = z.object({
    status: z.enum(["pending", "processing", "completed"]).optional(),
    paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional(),
  });
  const body = await req.json().catch(() => null);
  const result = patchSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const updated = updateLocalOrder(params.id, result.data);
  if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(updated);
}
