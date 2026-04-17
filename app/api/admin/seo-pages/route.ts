import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { readSeoPages, writeSeoPages } from "@lib/seo-pages";
import type { SeoPageMap } from "@lib/seo-pages";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json(readSeoPages());
}

export async function PUT(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const body = await req.json() as SeoPageMap;
    if (typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    writeSeoPages(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
