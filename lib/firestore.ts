import { getFirestoreDb } from "./firebase-admin";
import { readLocalServices, getActiveLocalServices } from "./local-services-store";
import type { Firestore, DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";

function db(): Firestore {
  return getFirestoreDb();
}

function now(): string {
  return new Date().toISOString();
}

function toStr(val: unknown): string | null {
  if (val == null) return null;
  if (val && typeof val === "object" && "toDate" in val) {
    return (val as { toDate(): Date }).toDate().toISOString();
  }
  return String(val);
}

function docData<T>(snap: DocumentSnapshot | QueryDocumentSnapshot): T | null {
  if (!snap.exists) return null;
  const data = snap.data() as Record<string, unknown>;
  return { ...data, id: snap.id } as T;
}

// ─── Type definitions ────────────────────────────────────────────────────────

export interface FSUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
  role: string;
  createdAt: string;
}

export function defaultAvatarUrl(name: string): string {
  const seed = encodeURIComponent(name.trim() || "User");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1,8b5cf6,a855f7&fontFamily=Arial&fontSize=40&fontWeight=700`;
}

export interface FSService {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  imageUrl?: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface FSPackage {
  id: string;
  serviceId: string;
  name: string;
  tier: string;
  price: string;
  features: string[];
  deliveryDays: number;
  revisions?: number | null;
  isPopular: boolean;
  createdAt: string;
}

export interface FSOrder {
  id: string;
  userId?: string | null;
  serviceId?: string | null;
  packageId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  packageName: string;
  price: string;
  notes: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  createdAt: string;
}

export interface FSContact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  details: string;
  createdAt: string;
}

export interface FSBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  tags: string[];
  published: boolean;
  publishedAt?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

const USERS = "users";

export async function findUserById(id: string): Promise<FSUser | null> {
  const snap = await db().collection(USERS).doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data() as Record<string, unknown>;
  return { ...d, id: snap.id, createdAt: toStr(d.createdAt) ?? now() } as FSUser;
}

export async function findUserByEmail(email: string): Promise<FSUser | null> {
  const snaps = await db().collection(USERS).where("email", "==", email).limit(1).get();
  if (snaps.empty) return null;
  const snap = snaps.docs[0];
  const d = snap.data() as Record<string, unknown>;
  return { ...d, id: snap.id, createdAt: toStr(d.createdAt) ?? now() } as FSUser;
}

export async function findUserByGoogleId(googleId: string): Promise<FSUser | null> {
  const snaps = await db().collection(USERS).where("googleId", "==", googleId).limit(1).get();
  if (snaps.empty) return null;
  const snap = snaps.docs[0];
  const d = snap.data() as Record<string, unknown>;
  return { ...d, id: snap.id, createdAt: toStr(d.createdAt) ?? now() } as FSUser;
}

export async function findUserByPhone(phone: string): Promise<FSUser | null> {
  const snaps = await db().collection(USERS).where("phone", "==", phone).limit(1).get();
  if (snaps.empty) return null;
  const snap = snaps.docs[0];
  const d = snap.data() as Record<string, unknown>;
  return { ...d, id: snap.id, createdAt: toStr(d.createdAt) ?? now() } as FSUser;
}

export async function createUser(data: Omit<FSUser, "id" | "createdAt">): Promise<FSUser> {
  const ref = db().collection(USERS).doc();
  const createdAt = now();
  await ref.set({ ...data, createdAt });
  return { ...data, id: ref.id, createdAt };
}

export async function updateUser(id: string, data: Partial<Omit<FSUser, "id" | "createdAt">>): Promise<void> {
  await db().collection(USERS).doc(id).update(data as Record<string, unknown>);
}

export async function listUsers(): Promise<FSUser[]> {
  const snaps = await db().collection(USERS).orderBy("createdAt", "desc").get();
  return snaps.docs.map((snap) => {
    const d = snap.data() as Record<string, unknown>;
    return { ...d, id: snap.id, createdAt: toStr(d.createdAt) ?? now() } as FSUser;
  });
}

export async function countUsers(): Promise<number> {
  const snaps = await db().collection(USERS).count().get();
  return snaps.data().count;
}

// ─── Services ────────────────────────────────────────────────────────────────

const SERVICES = "services";

function normalizeService(snap: DocumentSnapshot | QueryDocumentSnapshot): FSService {
  const d = snap.data() as Record<string, unknown>;
  return {
    ...d,
    id: snap.id,
    tags: (d.tags as string[]) ?? [],
    isActive: Boolean(d.isActive ?? true),
    createdAt: toStr(d.createdAt) ?? now(),
  } as FSService;
}

export async function listServices(activeOnly = true): Promise<FSService[]> {
  // Use a single equality filter only — orderBy on a different field needs a composite index
  // so we sort in memory instead (dataset is small)
  let query: FirebaseFirestore.Query = db().collection(SERVICES);
  if (activeOnly) query = query.where("isActive", "==", true);
  const snaps = await query.get();
  const rows = snaps.docs.map(normalizeService);
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function findServiceBySlug(slug: string): Promise<FSService | null> {
  try {
    // Only filter by slug (equality) — checking isActive in code avoids a composite index
    const snaps = await db().collection(SERVICES)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snaps.empty) return null;
    const svc = normalizeService(snaps.docs[0]);
    return svc.isActive ? svc : null;
  } catch {
    // Firebase unavailable — fall back to local JSON store
    const locals = getActiveLocalServices();
    const found = locals.find((s) => s.slug === slug);
    if (!found) return null;
    return {
      id: found.id,
      title: found.title,
      slug: found.slug,
      category: found.category,
      description: found.description,
      imageUrl: found.imageUrl,
      tags: found.tags,
      isActive: found.isActive,
      createdAt: found.createdAt,
      packages: [],
    } as FSService;
  }
}

export async function findServiceById(id: string): Promise<FSService | null> {
  const snap = await db().collection(SERVICES).doc(id).get();
  if (!snap.exists) return null;
  return normalizeService(snap);
}

export async function createService(data: Omit<FSService, "id" | "createdAt">): Promise<FSService> {
  const ref = db().collection(SERVICES).doc();
  const createdAt = now();
  await ref.set({ ...data, createdAt });
  return { ...data, id: ref.id, createdAt };
}

export async function updateService(id: string, data: Partial<Omit<FSService, "id" | "createdAt">>): Promise<FSService | null> {
  const ref = db().collection(SERVICES).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update(data as Record<string, unknown>);
  const updated = await ref.get();
  return normalizeService(updated);
}

export async function deleteService(id: string): Promise<void> {
  await db().collection(SERVICES).doc(id).delete();
}

// ─── Packages ────────────────────────────────────────────────────────────────

const PACKAGES = "packages";

function normalizePackage(snap: DocumentSnapshot | QueryDocumentSnapshot): FSPackage {
  const d = snap.data() as Record<string, unknown>;
  return {
    ...d,
    id: snap.id,
    features: (d.features as string[]) ?? [],
    price: String(d.price ?? "0"),
    deliveryDays: Number(d.deliveryDays ?? 7),
    revisions: d.revisions != null ? Number(d.revisions) : null,
    isPopular: Boolean(d.isPopular ?? false),
    createdAt: toStr(d.createdAt) ?? now(),
  } as FSPackage;
}

export async function listPackages(serviceId?: string): Promise<FSPackage[]> {
  let query: FirebaseFirestore.Query = db().collection(PACKAGES);
  if (serviceId) query = query.where("serviceId", "==", serviceId);
  const snaps = await query.get();
  return snaps.docs.map(normalizePackage);
}

export async function findPackageById(id: string): Promise<FSPackage | null> {
  const snap = await db().collection(PACKAGES).doc(id).get();
  if (!snap.exists) return null;
  return normalizePackage(snap);
}

export async function createPackage(data: Omit<FSPackage, "id" | "createdAt">): Promise<FSPackage> {
  const ref = db().collection(PACKAGES).doc();
  const createdAt = now();
  await ref.set({ ...data, createdAt });
  return { ...data, id: ref.id, createdAt };
}

export async function updatePackage(id: string, data: Partial<Omit<FSPackage, "id" | "createdAt">>): Promise<FSPackage | null> {
  const ref = db().collection(PACKAGES).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update(data as Record<string, unknown>);
  const updated = await ref.get();
  return normalizePackage(updated);
}

export async function deletePackage(id: string): Promise<void> {
  await db().collection(PACKAGES).doc(id).delete();
}

// ─── Orders ──────────────────────────────────────────────────────────────────

const ORDERS = "orders";

function normalizeOrder(snap: DocumentSnapshot | QueryDocumentSnapshot): FSOrder {
  const d = snap.data() as Record<string, unknown>;
  return {
    ...d,
    id: snap.id,
    price: String(d.price ?? "0"),
    status: String(d.status ?? "pending"),
    paymentStatus: String(d.paymentStatus ?? "unpaid"),
    createdAt: toStr(d.createdAt) ?? now(),
  } as FSOrder;
}

export async function listOrders(): Promise<FSOrder[]> {
  const snaps = await db().collection(ORDERS).orderBy("createdAt", "desc").get();
  return snaps.docs.map(normalizeOrder);
}

export async function listOrdersByUser(userId: string): Promise<FSOrder[]> {
  const snaps = await db().collection(ORDERS).where("userId", "==", userId).get();
  return snaps.docs.map(normalizeOrder);
}

export async function findOrderById(id: string): Promise<FSOrder | null> {
  const snap = await db().collection(ORDERS).doc(id).get();
  if (!snap.exists) return null;
  return normalizeOrder(snap);
}

export async function createOrder(data: Omit<FSOrder, "id" | "createdAt">): Promise<FSOrder> {
  const ref = db().collection(ORDERS).doc();
  const createdAt = now();
  await ref.set({ ...data, createdAt });
  return { ...data, id: ref.id, createdAt };
}

export async function updateOrder(id: string, data: Partial<Omit<FSOrder, "id" | "createdAt">>): Promise<FSOrder | null> {
  const ref = db().collection(ORDERS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update(data as Record<string, unknown>);
  const updated = await ref.get();
  return normalizeOrder(updated);
}

export async function countOrders(): Promise<number> {
  const snaps = await db().collection(ORDERS).count().get();
  return snaps.data().count;
}

export async function sumOrderRevenue(): Promise<number> {
  const snaps = await db().collection(ORDERS).where("status", "==", "completed").get();
  return snaps.docs.reduce((acc, snap) => {
    const price = parseFloat(String((snap.data() as Record<string, unknown>).price ?? "0"));
    return acc + (isNaN(price) ? 0 : price);
  }, 0);
}

export async function recentOrders(limit = 10): Promise<FSOrder[]> {
  const snaps = await db().collection(ORDERS).orderBy("createdAt", "desc").limit(limit).get();
  return snaps.docs.map(normalizeOrder);
}

// ─── Contacts ────────────────────────────────────────────────────────────────

const CONTACTS = "contacts";

export async function createContact(data: Omit<FSContact, "id" | "createdAt">): Promise<FSContact> {
  const ref = db().collection(CONTACTS).doc();
  const createdAt = now();
  await ref.set({ ...data, createdAt });
  return { ...data, id: ref.id, createdAt };
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

const BLOG = "blogPosts";

function normalizeBlogPost(snap: DocumentSnapshot | QueryDocumentSnapshot): FSBlogPost {
  const d = snap.data() as Record<string, unknown>;
  return {
    ...d,
    id: snap.id,
    tags: (d.tags as string[]) ?? [],
    published: Boolean(d.published ?? false),
    publishedAt: toStr(d.publishedAt),
    createdAt: toStr(d.createdAt) ?? now(),
    updatedAt: toStr(d.updatedAt) ?? now(),
  } as FSBlogPost;
}

export async function listPublishedPosts(): Promise<FSBlogPost[]> {
  // Single equality filter; sort in memory to avoid composite index requirement
  const snaps = await db().collection(BLOG).where("published", "==", true).get();
  const rows = snaps.docs.map(normalizeBlogPost);
  return rows.sort((a, b) =>
    (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)
  );
}

export async function listAllPosts(): Promise<FSBlogPost[]> {
  const snaps = await db().collection(BLOG).get();
  const rows = snaps.docs.map(normalizeBlogPost);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findPostBySlug(slug: string): Promise<FSBlogPost | null> {
  // Filter by slug only; check published in code to avoid composite index
  const snaps = await db().collection(BLOG)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snaps.empty) return null;
  const post = normalizeBlogPost(snaps.docs[0]);
  return post.published ? post : null;
}

export async function findPostById(id: string): Promise<FSBlogPost | null> {
  const snap = await db().collection(BLOG).doc(id).get();
  if (!snap.exists) return null;
  return normalizeBlogPost(snap);
}

export async function createPost(data: Omit<FSBlogPost, "id" | "createdAt" | "updatedAt">): Promise<FSBlogPost> {
  const ref = db().collection(BLOG).doc();
  const ts = now();
  await ref.set({ ...data, createdAt: ts, updatedAt: ts });
  return { ...data, id: ref.id, createdAt: ts, updatedAt: ts };
}

export async function updatePost(id: string, data: Partial<Omit<FSBlogPost, "id" | "createdAt">>): Promise<FSBlogPost | null> {
  const ref = db().collection(BLOG).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const updateData = { ...data, updatedAt: now() };
  await ref.update(updateData as Record<string, unknown>);
  const updated = await ref.get();
  return normalizeBlogPost(updated);
}

export async function deletePost(id: string): Promise<void> {
  await db().collection(BLOG).doc(id).delete();
}
