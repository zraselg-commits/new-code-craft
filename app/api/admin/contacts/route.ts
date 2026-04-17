import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { listLocalContacts, deleteLocalContact } from "@lib/local-contacts-store";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json(listLocalContacts());
}

export async function DELETE(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  deleteLocalContact(id);
  return NextResponse.json({ success: true });
}
