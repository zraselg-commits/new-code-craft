import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import * as fs from "fs";
import * as path from "path";

const ROBOTS_OVERRIDE = path.join(process.cwd(), "scripts", "robots-override.txt");

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const text = fs.existsSync(ROBOTS_OVERRIDE)
      ? fs.readFileSync(ROBOTS_OVERRIDE, "utf-8")
      : null;
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: null });
  }
}

export async function PUT(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const { text } = await req.json();
    if (typeof text !== "string") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const dir = path.dirname(ROBOTS_OVERRIDE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ROBOTS_OVERRIDE, text, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  if (fs.existsSync(ROBOTS_OVERRIDE)) fs.unlinkSync(ROBOTS_OVERRIDE);
  return NextResponse.json({ ok: true });
}
