/**
 * Internal helper for API routes to access local db-export data.
 * Separate from lib/local-data.ts to avoid circular dependencies.
 */
import * as fs from "fs";
import * as path from "path";

let _cache: Record<string, unknown> | null = null;

export function loadExport(): { tables: Record<string, { rows: Record<string, unknown>[] }> } {
  if (_cache) return _cache as ReturnType<typeof loadExport>;
  const filePath = path.join(process.cwd(), "scripts", "db-export.json");
  if (!fs.existsSync(filePath)) return { tables: {} };
  try {
    _cache = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, unknown>;
    return _cache as ReturnType<typeof loadExport>;
  } catch {
    return { tables: {} };
  }
}
