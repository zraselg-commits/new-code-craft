import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import * as fs from "fs";
import * as path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Raster types that sharp can compress
const SHARP_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

async function compressWithSharp(buffer: Buffer, mimeType: string, originalName: string): Promise<{ buffer: Buffer; filename: string }> {
  // Dynamic import — sharp uses native modules
  const sharp = (await import("sharp")).default;
  const baseName = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${Date.now()}_${baseName}.webp`;
  const compressed = await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  return { buffer: compressed, filename };
}

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/ico", "image/x-icon", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only image files are allowed (JPG, PNG, WebP, GIF, SVG)" }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB input
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);
    let filename: string;
    let outputBuffer: Buffer;

    if (SHARP_TYPES.has(file.type)) {
      try {
        // Compress + convert to WebP
        const result = await compressWithSharp(inputBuffer, file.type, file.name);
        filename = result.filename;
        outputBuffer = result.buffer;
      } catch {
        // Sharp failed — fall back to original
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
        filename = `${Date.now()}_${safeName}`;
        outputBuffer = inputBuffer;
      }
    } else {
      // SVG / GIF / ICO — keep as-is
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
      filename = `${Date.now()}_${safeName}`;
      outputBuffer = inputBuffer;
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, outputBuffer);

    const publicUrl = `/uploads/${filename}`;
    const originalSizeKB = Math.round(file.size / 1024);
    const newSizeKB = Math.round(outputBuffer.length / 1024);

    return NextResponse.json({
      url: publicUrl,
      filename,
      originalSizeKB,
      compressedSizeKB: newSizeKB,
      savedPercent: Math.round((1 - newSizeKB / originalSizeKB) * 100),
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
