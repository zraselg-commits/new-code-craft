/**
 * local-services-store.ts
 * JSON-file-based storage for services + packages.
 * Works as primary storage in local dev (no Firebase required).
 * Admin panel writes here; public API reads from here.
 */

import * as fs from "fs";
import * as path from "path";

const SERVICES_FILE = path.join(process.cwd(), "scripts", "services-data.json");
const PACKAGES_FILE = path.join(process.cwd(), "scripts", "packages-data.json");

/* ── Types ──────────────────────────────────────────────────────── */
export interface LocalService {
  id: string;
  title: string;       title_bn?: string;
  slug: string;
  category: string;
  description: string; description_bn?: string;
  imageUrl: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface LocalPackage {
  id: string;
  serviceId: string;
  name: string;        name_bn?: string;
  tier: string;
  price: string;
  features: string[];  features_bn?: string[];
  deliveryDays: number;
  revisions: number | null;
  isPopular: boolean;
  createdAt: string;
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function ensure(file: string, defaultVal: unknown[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2), "utf-8");
  }
}

function readJSON<T>(file: string, fallback: T[]): T[] {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch { return fallback; }
}

function writeJSON(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

/* ── Services ────────────────────────────────────────────────────── */
export function readLocalServices(): LocalService[] {
  ensure(SERVICES_FILE, []);
  return readJSON<LocalService>(SERVICES_FILE, []);
}

export function writeLocalServices(data: LocalService[]) {
  writeJSON(SERVICES_FILE, data);
}

export function getActiveLocalServices(): LocalService[] {
  return readLocalServices().filter((s) => s.isActive !== false);
}

/* ── Packages ────────────────────────────────────────────────────── */
export function readLocalPackages(serviceId?: string): LocalPackage[] {
  ensure(PACKAGES_FILE, []);
  const all = readJSON<LocalPackage>(PACKAGES_FILE, []);
  return serviceId ? all.filter((p) => p.serviceId === serviceId) : all;
}

export function writeLocalPackages(data: LocalPackage[]) {
  writeJSON(PACKAGES_FILE, data);
}

/* ── CRUD helpers used by admin API routes ───────────────────────── */
export function createLocalService(data: Omit<LocalService, "id" | "createdAt">): LocalService {
  const services = readLocalServices();
  const service: LocalService = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
  services.push(service);
  writeLocalServices(services);
  return service;
}

export function updateLocalService(id: string, patch: Partial<LocalService>): LocalService | null {
  const services = readLocalServices();
  const idx = services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  services[idx] = { ...services[idx], ...patch };
  writeLocalServices(services);
  return services[idx];
}

export function deleteLocalService(id: string): boolean {
  const services = readLocalServices();
  const next = services.filter((s) => s.id !== id);
  if (next.length === services.length) return false;
  writeLocalServices(next);
  // Also remove related packages
  const pkgs = readLocalPackages().filter((p) => p.serviceId !== id);
  writeLocalPackages(pkgs);
  return true;
}

export function createLocalPackage(data: Omit<LocalPackage, "id" | "createdAt">): LocalPackage {
  const pkgs = readLocalPackages();
  const pkg: LocalPackage = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
  pkgs.push(pkg);
  writeLocalPackages(pkgs);
  return pkg;
}

export function updateLocalPackage(id: string, patch: Partial<LocalPackage>): LocalPackage | null {
  const pkgs = readLocalPackages();
  const idx = pkgs.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  pkgs[idx] = { ...pkgs[idx], ...patch };
  writeLocalPackages(pkgs);
  return pkgs[idx];
}

export function deleteLocalPackage(id: string): boolean {
  const pkgs = readLocalPackages();
  const next = pkgs.filter((p) => p.id !== id);
  if (next.length === pkgs.length) return false;
  writeLocalPackages(next);
  return true;
}
