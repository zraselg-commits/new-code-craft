/**
 * lib/seo-pages.ts
 * Read/write per-page SEO overrides stored in scripts/seo-pages.json
 */
import * as fs from "fs";
import * as path from "path";

export interface PageSeoEntry {
  route: string;          // e.g. "/", "/about", "/blog/my-post"
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaJson?: string;    // raw JSON-LD string
  keywords?: string;
  updatedAt?: string;
}

export type SeoPageMap = Record<string, PageSeoEntry>;

const SEO_FILE = path.join(process.cwd(), "scripts", "seo-pages.json");

function ensureDir() {
  const dir = path.dirname(SEO_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readSeoPages(): SeoPageMap {
  try {
    if (!fs.existsSync(SEO_FILE)) return {};
    return JSON.parse(fs.readFileSync(SEO_FILE, "utf-8")) as SeoPageMap;
  } catch {
    return {};
  }
}

export function writeSeoPages(data: SeoPageMap): void {
  ensureDir();
  fs.writeFileSync(SEO_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getPageSeo(route: string): PageSeoEntry | null {
  const map = readSeoPages();
  return map[route] ?? null;
}

export function setPageSeo(route: string, entry: Partial<PageSeoEntry>): void {
  const map = readSeoPages();
  map[route] = { ...map[route], ...entry, route, updatedAt: new Date().toISOString() };
  writeSeoPages(map);
}
