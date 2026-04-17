import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@lib/analytics";

// Detect device type from User-Agent
function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  const mobile = /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const tablet = /ipad|android(?!.*mobile)/i.test(ua);
  if (tablet) return "tablet";
  if (mobile) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pagePath = String(body.path || "/").slice(0, 500);
    const referrer = String(body.referrer || "direct").slice(0, 500);
    const ua = req.headers.get("user-agent") || "";

    recordPageView({
      ts: Date.now(),
      path: pagePath,
      referrer,
      device: detectDevice(ua),
      ua: ua.slice(0, 200),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
