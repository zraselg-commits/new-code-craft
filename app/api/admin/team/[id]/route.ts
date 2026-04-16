import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { readTeam, writeTeam, TeamMember } from "../route";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const body = await req.json() as Partial<TeamMember>;
  const list = readTeam();
  const idx = list.findIndex((m) => m.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.name && !body.avatar) body.avatar = body.name.substring(0, 2).toUpperCase();
  list[idx] = { ...list[idx], ...body, id: params.id };
  writeTeam(list);
  return NextResponse.json(list[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const list = readTeam().filter((m) => m.id !== params.id);
  writeTeam(list);
  return NextResponse.json({ ok: true });
}
