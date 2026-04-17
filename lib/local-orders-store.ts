/**
 * local-orders-store.ts
 * File-based orders persistence — saves to scripts/orders.json
 */
import * as fs from "fs";
import * as path from "path";

const FILE = path.join(process.cwd(), "scripts", "orders.json");

export interface LocalOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  packageName: string;
  price: string;
  notes: string;
  status: "pending" | "processing" | "completed";
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod: string | null;
  serviceId: string | null;
  packageId: string | null;
  userId: string | null;
  createdAt: string;
}

function read(): LocalOrder[] {
  if (!fs.existsSync(FILE)) return [];
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")); } catch { return []; }
}

function write(data: LocalOrder[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function listLocalOrders(): LocalOrder[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findLocalOrderById(id: string): LocalOrder | null {
  return read().find((o) => o.id === id) ?? null;
}

export function createLocalOrder(
  data: Omit<LocalOrder, "id" | "createdAt">
): LocalOrder {
  const orders = read();
  const order: LocalOrder = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  write(orders);
  return order;
}

export function updateLocalOrder(
  id: string,
  data: Partial<Pick<LocalOrder, "status" | "paymentStatus">>
): LocalOrder | null {
  const orders = read();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...data };
  write(orders);
  return orders[idx];
}

export function countLocalOrders(): number { return read().length; }

export function sumLocalRevenue(): number {
  return read()
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parseFloat(o.price || "0"), 0);
}

export function recentLocalOrders(limit = 10): LocalOrder[] {
  return listLocalOrders().slice(0, limit);
}
