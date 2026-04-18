import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// Always dynamic — serves user-uploaded files
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".avif": "image/avif",
};

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Sanitize path — prevent directory traversal
    const segments = params.path.map((s) => path.basename(s));
    const filePath = path.join(process.cwd(), "public", "uploads", ...segments);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const file = fs.readFileSync(filePath);
    const ext  = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type":  contentType,
        // Cache for 1 year — filenames include timestamps so they're unique
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Internal error", { status: 500 });
  }
}
