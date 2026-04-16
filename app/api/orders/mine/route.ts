import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@lib/auth";
import { listOrdersByUser } from "@lib/firestore";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAuth(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const myOrders = await listOrdersByUser(user.id);
    return NextResponse.json(myOrders);
  } catch (err) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
