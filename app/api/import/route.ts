import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@lib/firebase-admin";
import bcrypt from "bcryptjs";

const SEED_KEY = process.env.SEED_SECRET || "codecraftbd-seed-2026";

// Map snake_case PostgreSQL export → camelCase Firestore
function mapService(row: Record<string, unknown>) {
  return {
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as string,
    description: row.description as string,
    imageUrl: (row.image_url as string | null) ?? null,
    tags: (row.tags as string[]) ?? [],
    isActive: Boolean(row.is_active ?? true),
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

function mapPackage(row: Record<string, unknown>, serviceIdMap: Map<string, string>) {
  const originalServiceId = row.service_id as string;
  const firestoreServiceId = serviceIdMap.get(originalServiceId) ?? originalServiceId;
  return {
    serviceId: firestoreServiceId,
    name: row.name as string,
    tier: row.tier as string,
    price: String(row.price ?? "0"),
    features: (row.features as string[]) ?? [],
    deliveryDays: Number(row.delivery_days ?? 7),
    revisions: row.revisions != null ? Number(row.revisions) : null,
    isPopular: Boolean(row.is_popular ?? false),
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

function mapOrder(row: Record<string, unknown>, userIdMap: Map<string, string>, serviceIdMap: Map<string, string>, packageIdMap: Map<string, string>) {
  const origUserId = row.user_id as string | null;
  const origServiceId = row.service_id as string | null;
  const origPackageId = row.package_id as string | null;
  return {
    userId: (origUserId ? userIdMap.get(origUserId) ?? origUserId : null),
    serviceId: (origServiceId ? serviceIdMap.get(origServiceId) ?? origServiceId : null),
    packageId: (origPackageId ? packageIdMap.get(origPackageId) ?? origPackageId : null),
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    customerPhone: (row.customer_phone as string) ?? "",
    serviceName: row.service_name as string,
    packageName: row.package_name as string,
    price: String(row.price ?? "0"),
    notes: (row.notes as string) ?? "",
    status: (row.status as string) ?? "pending",
    paymentStatus: (row.payment_status as string) ?? "unpaid",
    paymentMethod: null,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

function mapContact(row: Record<string, unknown>) {
  return {
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string | null) ?? null,
    service: (row.service as string | null) ?? null,
    details: (row.details as string) ?? "",
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

function mapBlogPost(row: Record<string, unknown>, authorIdMap: Map<string, string>) {
  const origAuthorId = row.author_id as string | null;
  return {
    slug: row.slug as string,
    title: row.title as string,
    excerpt: (row.excerpt as string) ?? "",
    content: (row.content as string) ?? "",
    coverImage: (row.cover_image as string | null) ?? null,
    tags: (row.tags as string[]) ?? [],
    published: Boolean(row.published ?? false),
    publishedAt: (row.published_at as string | null) ?? null,
    authorId: origAuthorId ? (authorIdMap.get(origAuthorId) ?? null) : null,
    authorName: (row.author_name as string | null) ?? "Code Craft BD Team",
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  // Auth check
  const key = req.headers.get("x-seed-key") || req.nextUrl.searchParams.get("key");
  if (!key || key !== SEED_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let exportData: Record<string, unknown>;
  try {
    exportData = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tables = exportData.tables as Record<string, { rows: Record<string, unknown>[] }>;
  if (!tables) {
    return NextResponse.json({ error: "Missing tables in export data" }, { status: 400 });
  }

  const db = getFirestoreDb();
  const results: string[] = [];
  const errors: string[] = [];

  // ID maps: original PG id → Firestore doc id
  const userIdMap = new Map<string, string>();
  const serviceIdMap = new Map<string, string>();
  const packageIdMap = new Map<string, string>();
  const authorIdMap = new Map<string, string>();

  // ── 1. Users ───────────────────────────────────────────────────────
  if (tables.users?.rows) {
    for (const row of tables.users.rows) {
      const origId = row.id as string;
      try {
        // Check if email already exists
        const existingSnap = await db.collection("users")
          .where("email", "==", row.email)
          .limit(1).get();

        if (!existingSnap.empty) {
          const firestoreId = existingSnap.docs[0].id;
          userIdMap.set(origId, firestoreId);
          authorIdMap.set(origId, firestoreId);
          results.push(`skip user (exists): ${row.email}`);
          continue;
        }

        // Hash a default password for imported users
        const passwordHash = await bcrypt.hash("123456", 10);
        const ref = db.collection("users").doc();
        await ref.set({
          name: row.name,
          email: row.email,
          phone: row.phone ?? null,
          role: row.role ?? "user",
          googleId: row.google_id ?? null,
          passwordHash,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(String(row.name || "User"))}&backgroundColor=6366f1,8b5cf6,a855f7&fontFamily=Arial&fontSize=40&fontWeight=700`,
          createdAt: row.created_at ?? new Date().toISOString(),
        });
        userIdMap.set(origId, ref.id);
        authorIdMap.set(origId, ref.id);
        results.push(`created user: ${row.email} (Firestore id: ${ref.id}) — default password: 123456`);
      } catch (err) {
        errors.push(`user ${row.email}: ${String(err)}`);
      }
    }
  }

  // ── 2. Services ───────────────────────────────────────────────────
  if (tables.services?.rows) {
    for (const row of tables.services.rows) {
      const origId = row.id as string;
      try {
        const mapped = mapService(row);
        const existingSnap = await db.collection("services")
          .where("slug", "==", mapped.slug)
          .limit(1).get();

        if (!existingSnap.empty) {
          const firestoreId = existingSnap.docs[0].id;
          serviceIdMap.set(origId, firestoreId);
          // Update imageUrl if missing
          const existingData = existingSnap.docs[0].data();
          if (!existingData.imageUrl && mapped.imageUrl) {
            await existingSnap.docs[0].ref.update({ imageUrl: mapped.imageUrl });
            results.push(`updated service (imageUrl): ${mapped.title}`);
          } else {
            results.push(`skip service (exists): ${mapped.title}`);
          }
          continue;
        }

        const ref = db.collection("services").doc();
        await ref.set(mapped);
        serviceIdMap.set(origId, ref.id);
        results.push(`created service: ${mapped.title} (${ref.id})`);
      } catch (err) {
        errors.push(`service ${row.title}: ${String(err)}`);
      }
    }
  }

  // ── 3. Packages ───────────────────────────────────────────────────
  if (tables.packages?.rows) {
    for (const row of tables.packages.rows) {
      const origId = row.id as string;
      try {
        const mapped = mapPackage(row, serviceIdMap);
        // Check if already exists for this service+tier
        const existingSnap = await db.collection("packages")
          .where("serviceId", "==", mapped.serviceId)
          .where("tier", "==", mapped.tier)
          .limit(1).get();

        if (!existingSnap.empty) {
          packageIdMap.set(origId, existingSnap.docs[0].id);
          results.push(`skip package (exists): ${mapped.name} / ${mapped.tier}`);
          continue;
        }

        const ref = db.collection("packages").doc();
        await ref.set(mapped);
        packageIdMap.set(origId, ref.id);
        results.push(`created package: ${mapped.name} (${ref.id})`);
      } catch (err) {
        errors.push(`package ${row.name}: ${String(err)}`);
      }
    }
  }

  // ── 4. Orders ──────────────────────────────────────────────────────
  if (tables.orders?.rows) {
    for (const row of tables.orders.rows) {
      try {
        const mapped = mapOrder(row, userIdMap, serviceIdMap, packageIdMap);
        // Check duplicates by customerEmail + serviceName + price
        const existingSnap = await db.collection("orders")
          .where("customerEmail", "==", mapped.customerEmail)
          .where("serviceName", "==", mapped.serviceName)
          .where("price", "==", mapped.price)
          .limit(1).get();

        if (!existingSnap.empty) {
          results.push(`skip order (exists): ${mapped.customerName} / ${mapped.serviceName}`);
          continue;
        }

        const ref = db.collection("orders").doc();
        await ref.set(mapped);
        results.push(`created order: ${mapped.customerName} — ${mapped.serviceName} $${mapped.price} (${ref.id})`);
      } catch (err) {
        errors.push(`order ${row.id}: ${String(err)}`);
      }
    }
  }

  // ── 5. Contacts ────────────────────────────────────────────────────
  if (tables.contacts?.rows) {
    for (const row of tables.contacts.rows) {
      try {
        const mapped = mapContact(row);
        // Check by email
        const existingSnap = await db.collection("contacts")
          .where("email", "==", mapped.email)
          .limit(1).get();

        if (!existingSnap.empty) {
          results.push(`skip contact (exists): ${mapped.email}`);
          continue;
        }

        const ref = db.collection("contacts").doc();
        await ref.set(mapped);
        results.push(`created contact: ${mapped.name} / ${mapped.email} (${ref.id})`);
      } catch (err) {
        errors.push(`contact ${row.email}: ${String(err)}`);
      }
    }
  }

  // ── 6. Blog Posts ─────────────────────────────────────────────────
  if (tables.blog_posts?.rows) {
    for (const row of tables.blog_posts.rows) {
      try {
        const mapped = mapBlogPost(row, authorIdMap);
        const existingSnap = await db.collection("blogPosts")
          .where("slug", "==", mapped.slug)
          .limit(1).get();

        if (!existingSnap.empty) {
          results.push(`skip blog post (exists): ${mapped.title}`);
          continue;
        }

        const ref = db.collection("blogPosts").doc();
        await ref.set(mapped);
        results.push(`created blog post: ${mapped.title} (${ref.id})`);
      } catch (err) {
        errors.push(`blog post ${row.slug}: ${String(err)}`);
      }
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    imported: results.length,
    results,
    errors,
  });
}
