import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { getFirestoreDb } from "@lib/firebase-admin";
import * as fs from "fs";
import * as path from "path";

// GET all contacts (admin only)
export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  try {
    const db = getFirestoreDb();
    const snap = await db.collection("contacts").orderBy("createdAt", "desc").limit(100).get();
    const contacts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json(contacts);
  } catch {
    // Fallback to db-export.json
    try {
      const filePath = path.join(process.cwd(), "scripts", "db-export.json");
      if (!fs.existsSync(filePath)) return NextResponse.json([]);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const contacts = (data.tables?.contacts?.rows ?? []).map((c: Record<string, unknown>) => ({
        id: c.id, name: c.name, email: c.email, details: c.details, createdAt: c.created_at,
      }));
      return NextResponse.json(contacts);
    } catch {
      return NextResponse.json([]);
    }
  }
}

