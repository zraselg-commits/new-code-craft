import { pgTable, text, numeric, timestamp, jsonb, boolean, integer, index } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  googleId: text("google_id"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_services_is_active").on(table.isActive),
  index("idx_services_category").on(table.category),
]);

export const packages = pgTable("packages", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  price: numeric("price").notNull().default("0"),
  features: text("features").array().notNull().default(sql`'{}'::text[]`),
  deliveryDays: integer("delivery_days").notNull().default(7),
  revisions: integer("revisions"),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_packages_service_id").on(table.serviceId),
]);

export const orders = pgTable("orders", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
  packageId: text("package_id").references(() => packages.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  serviceName: text("service_name").notNull().default(""),
  packageName: text("package_name").notNull().default(""),
  price: numeric("price").notNull().default("0"),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_orders_user_id").on(table.userId),
  index("idx_orders_service_id").on(table.serviceId),
  index("idx_orders_package_id").on(table.packageId),
  index("idx_orders_status").on(table.status),
  index("idx_orders_payment_status").on(table.paymentStatus),
  index("idx_orders_created_at").on(table.createdAt),
]);

export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverImage: text("cover_image"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_blog_posts_published").on(table.published),
  index("idx_blog_posts_author_id").on(table.authorId),
  index("idx_blog_posts_published_at").on(table.publishedAt),
]);

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  blogPosts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  packages: many(packages),
  orders: many(orders),
}));

export const packagesRelations = relations(packages, ({ one, many }) => ({
  service: one(services, { fields: [packages.serviceId], references: [services.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  service: one(services, { fields: [orders.serviceId], references: [services.id] }),
  package: one(packages, { fields: [orders.packageId], references: [packages.id] }),
}));
