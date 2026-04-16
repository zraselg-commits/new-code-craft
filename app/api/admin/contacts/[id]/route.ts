import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { getFirestoreDb } from "@lib/firebase-admin";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  try {
    const db = getFirestoreDb();
    await db.collection("contacts").doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
