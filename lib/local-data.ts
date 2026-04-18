/**
 * local-data.ts
 * Reads the db-export.json and returns it in Firestore-compatible shapes.
 * Used as a fallback when Firebase is not configured (local dev without credentials).
 */

import * as fs from "fs";
import * as path from "path";

interface PgService {
  id: string; title: string; slug: string; category: string;
  description: string; image_url: string | null; tags: string[];
  is_active: boolean; created_at: string;
}
interface PgPackage {
  id: string; service_id: string; name: string; tier: string;
  price: string; features: string[]; delivery_days: number;
  revisions: number | null; is_popular: boolean; created_at: string;
}
interface PgOrder {
  id: string; user_id: string | null; service_id: string | null;
  package_id: string | null; customer_name: string; customer_email: string;
  customer_phone: string; service_name: string; package_name: string;
  price: string; notes: string; status: string; payment_status: string;
  created_at: string;
}
interface PgBlogPost {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover_image: string | null; tags: string[]; published: boolean;
  published_at: string | null; author_id: string | null; created_at: string; updated_at: string;
}
interface PgUser {
  id: string; name: string; email: string; phone: string | null;
  role: string; google_id: string | null; created_at: string;
}
interface PgContact {
  id: string; name: string; email: string; details: string; created_at: string;
}

interface DbExport {
  tables: {
    services?: { rows: PgService[] };
    packages?: { rows: PgPackage[] };
    orders?: { rows: PgOrder[] };
    blog_posts?: { rows: PgBlogPost[] };
    users?: { rows: PgUser[] };
    contacts?: { rows: PgContact[] };
  };
}

function loadExport(): DbExport {
  // NOTE: No in-memory cache — always read from disk so admin changes
  // are reflected instantly on VPS without a restart.
  const filePath = path.join(process.cwd(), "scripts", "db-export.json");
  if (!fs.existsSync(filePath)) return { tables: {} };
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as DbExport;
  } catch {
    return { tables: {} };
  }
}

export function getLocalServicesAll() {
  const data = loadExport();
  const rows = data.tables.services?.rows ?? [];
  const pkgRows = data.tables.packages?.rows ?? [];

  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    category: s.category,
    description: s.description,
    imageUrl: s.image_url ?? null,
    tags: s.tags ?? [],
    isActive: s.is_active,
    createdAt: s.created_at,
    packages: pkgRows
      .filter((p) => p.service_id === s.id)
      .map((p) => ({
        id: p.id,
        serviceId: s.id,
        name: p.name,
        tier: p.tier,
        price: p.price,
        features: p.features ?? [],
        deliveryDays: p.delivery_days,
        revisions: p.revisions ?? null,
        isPopular: p.is_popular,
        createdAt: p.created_at,
      })),
  }));
}

export function getLocalServices() {
  return getLocalServicesAll().filter((s) => s.isActive);
}

export function getLocalService(slug: string) {
  return getLocalServicesAll().find((s) => s.slug === slug) ?? null;
}


export function getLocalPackages(serviceId?: string) {
  const rows = loadExport().tables.packages?.rows ?? [];
  return rows
    .filter((p) => !serviceId || p.service_id === serviceId)
    .map((p) => ({
      id: p.id,
      serviceId: p.service_id,
      name: p.name,
      tier: p.tier,
      price: p.price,
      features: p.features ?? [],
      deliveryDays: p.delivery_days,
      revisions: p.revisions ?? null,
      isPopular: p.is_popular,
      createdAt: p.created_at,
    }));
}

export function getLocalBlogPosts() {
  const rows = loadExport().tables.blog_posts?.rows ?? [];
  return rows
    .filter((p) => p.published)
    .sort((a, b) =>
      (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at)
    )
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.cover_image ?? null,
      tags: p.tags ?? [],
      published: p.published,
      publishedAt: p.published_at ?? null,
      authorId: p.author_id ?? null,
      authorName: "Code Craft BD Team",
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
}

export function getLocalBlogPost(slug: string) {
  return getLocalBlogPosts().find((p) => p.slug === slug) ?? null;
}

export function getLocalUsers() {
  return (loadExport().tables.users?.rows ?? []).map((u) => ({
    id: u.id, name: u.name, email: u.email,
    phone: u.phone ?? null, role: u.role,
    googleId: u.google_id ?? null,
    passwordHash: null, avatarUrl: null,
    createdAt: u.created_at,
  }));
}

export function getLocalOrders() {
  return (loadExport().tables.orders?.rows ?? []).map((o) => ({
    id: o.id,
    userId: o.user_id ?? null,
    serviceId: o.service_id ?? null,
    packageId: o.package_id ?? null,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    serviceName: o.service_name,
    packageName: o.package_name,
    price: o.price,
    notes: o.notes,
    status: o.status,
    paymentStatus: o.payment_status,
    paymentMethod: null,
    createdAt: o.created_at,
  }));
}
