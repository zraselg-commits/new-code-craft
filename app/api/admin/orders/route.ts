import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { listLocalOrders } from "@lib/local-orders-store";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json(listLocalOrders());
}
