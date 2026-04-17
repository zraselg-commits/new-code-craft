import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { readRedirects, writeRedirects, addRedirect, deleteRedirect, updateRedirect } from "@lib/redirects";
import { z } from "zod";

const redirectSchema = z.object({
  from: z.string().min(1).startsWith("/"),
  to: z.string().min(1),
  type: z.union([z.literal(301), z.literal(302)]).default(301),
});

const updateSchema = redirectSchema.extend({ id: z.string().min(1) });

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json(readRedirects());
}

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const result = redirectSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });

  const rule = addRedirect(result.data.from, result.data.to, result.data.type);
  return NextResponse.json(rule, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const result = updateSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const ok = updateRedirect(result.data.id, result.data.from, result.data.to, result.data.type);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const ok = deleteRedirect(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
