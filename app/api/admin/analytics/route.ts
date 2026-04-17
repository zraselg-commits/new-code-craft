import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { aggregateAnalytics } from "@lib/analytics";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") || "30"), 90);

  const data = aggregateAnalytics(days);
  return NextResponse.json(data);
}
