import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import * as fs from "fs";
import * as path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  ext: string;
}

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const files: MediaFile[] = fs
      .readdirSync(UPLOAD_DIR)
      .filter((f) => !f.startsWith("."))
      .map((filename) => {
        const filePath = path.join(UPLOAD_DIR, filename);
        const stat = fs.statSync(filePath);
        return {
          filename,
          url: `/uploads/${filename}`,
          size: stat.size,
          createdAt: stat.birthtime.toISOString(),
          ext: path.extname(filename).toLowerCase().replace(".", ""),
        };
      })
      .filter((f) => ["jpg", "jpeg", "png", "webp", "gif", "svg", "ico", "avif"].includes(f.ext))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  if (!filename) return NextResponse.json({ error: "Missing filename" }, { status: 400 });

  // Security: prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safe);

  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "File not found" }, { status: 404 });

  fs.unlinkSync(filePath);
  return NextResponse.json({ ok: true });
}
