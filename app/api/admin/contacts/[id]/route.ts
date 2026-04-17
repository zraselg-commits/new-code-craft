import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { findLocalContactById, deleteLocalContact } from "@lib/local-contacts-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const contact = findLocalContactById(params.id);
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const deleted = deleteLocalContact(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
