/**
 * lib/analytics.ts
 * Simple file-based analytics: records page views to scripts/analytics.ndjson
 */
import * as fs from "fs";
import * as path from "path";

export interface PageViewEvent {
  ts: number;        // unix ms
  path: string;
  referrer?: string;
  device?: string;   // "mobile" | "desktop" | "tablet"
  ua?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  views: number;
}

export interface PageStats {
  path: string;
  views: number;
}

export interface DeviceStats {
  device: string;
  views: number;
}

export interface ReferrerStats {
  referrer: string;
  views: number;
}

const ANALYTICS_FILE = path.join(process.cwd(), "scripts", "analytics.ndjson");
const MAX_LINES = 100_000;

function ensureDir() {
  const dir = path.dirname(ANALYTICS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function recordPageView(event: PageViewEvent): void {
  try {
    ensureDir();
    const line = JSON.stringify(event) + "\n";
    fs.appendFileSync(ANALYTICS_FILE, line, "utf-8");

    // Rotate if too large (keep last MAX_LINES entries)
    const content = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    const lines = content.split("\n").filter(Boolean);
    if (lines.length > MAX_LINES) {
      const trimmed = lines.slice(-MAX_LINES).join("\n") + "\n";
      fs.writeFileSync(ANALYTICS_FILE, trimmed, "utf-8");
    }
  } catch {
    // ignore write errors
  }
}

export function readPageViews(limitDays = 30): PageViewEvent[] {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) return [];
    const cutoff = Date.now() - limitDays * 24 * 60 * 60 * 1000;
    const content = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line) as PageViewEvent; } catch { return null; }
      })
      .filter((e): e is PageViewEvent => e !== null && e.ts >= cutoff);
  } catch {
    return [];
  }
}

export function aggregateAnalytics(days = 30) {
  const events = readPageViews(days);

  // Daily stats
  const dailyMap = new Map<string, number>();
  const pageMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();

  for (const e of events) {
    const date = new Date(e.ts).toISOString().slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);

    // Skip admin paths in page stats
    if (!e.path.startsWith("/admin") && !e.path.startsWith("/api")) {
      pageMap.set(e.path, (pageMap.get(e.path) ?? 0) + 1);
    }

    const device = e.device ?? "desktop";
    deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1);

    if (e.referrer && e.referrer !== "direct") {
      try {
        const ref = new URL(e.referrer).hostname;
        referrerMap.set(ref, (referrerMap.get(ref) ?? 0) + 1);
      } catch {
        referrerMap.set(e.referrer, (referrerMap.get(e.referrer) ?? 0) + 1);
      }
    }
  }

  // Fill missing days
  const daily: DailyStats[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    daily.push({ date: d, views: dailyMap.get(d) ?? 0 });
  }

  const topPages: PageStats[] = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, views]) => ({ path, views }));

  const devices: DeviceStats[] = [...deviceMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([device, views]) => ({ device, views }));

  const referrers: ReferrerStats[] = [...referrerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrer, views]) => ({ referrer, views }));

  return {
    totalViews: events.length,
    daily,
    topPages,
    devices,
    referrers,
  };
}
