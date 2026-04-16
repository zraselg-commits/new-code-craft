import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { readPortfolio, writePortfolio, PortfolioItem } from "../route";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const body = await req.json() as Partial<PortfolioItem>;
  const list = readPortfolio();
  const idx = list.findIndex((p) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body, id: params.id };
  writePortfolio(list);
  return NextResponse.json(list[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const list = readPortfolio().filter((p) => p.id !== params.id);
  writePortfolio(list);
  return NextResponse.json({ ok: true });
}
