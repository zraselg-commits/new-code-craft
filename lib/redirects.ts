/**
 * lib/redirects.ts
 * Read/write redirect rules stored in scripts/redirects.json
 */
import * as fs from "fs";
import * as path from "path";

export interface RedirectRule {
  id: string;
  from: string;
  to: string;
  type: 301 | 302;
  createdAt: string;
}

const REDIRECTS_FILE = path.join(process.cwd(), "scripts", "redirects.json");

function ensureDir() {
  const dir = path.dirname(REDIRECTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readRedirects(): RedirectRule[] {
  try {
    if (!fs.existsSync(REDIRECTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(REDIRECTS_FILE, "utf-8")) as RedirectRule[];
  } catch {
    return [];
  }
}

export function writeRedirects(rules: RedirectRule[]): void {
  ensureDir();
  fs.writeFileSync(REDIRECTS_FILE, JSON.stringify(rules, null, 2), "utf-8");
}

export function addRedirect(from: string, to: string, type: 301 | 302 = 301): RedirectRule {
  const rules = readRedirects();
  const newRule: RedirectRule = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from,
    to,
    type,
    createdAt: new Date().toISOString(),
  };
  rules.push(newRule);
  writeRedirects(rules);
  return newRule;
}

export function deleteRedirect(id: string): boolean {
  const rules = readRedirects();
  const filtered = rules.filter((r) => r.id !== id);
  if (filtered.length === rules.length) return false;
  writeRedirects(filtered);
  return true;
}

export function updateRedirect(id: string, from: string, to: string, type: 301 | 302): boolean {
  const rules = readRedirects();
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  rules[idx] = { ...rules[idx], from, to, type };
  writeRedirects(rules);
  return true;
}
