/**
 * local-contacts-store.ts
 * File-based contact form persistence — saves to scripts/contacts.json
 */
import * as fs from "fs";
import * as path from "path";

const FILE = path.join(process.cwd(), "scripts", "contacts.json");

export interface LocalContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  details: string;
  createdAt: string;
}

function read(): LocalContact[] {
  if (!fs.existsSync(FILE)) return [];
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")); } catch { return []; }
}

function write(data: LocalContact[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function listLocalContacts(): LocalContact[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findLocalContactById(id: string): LocalContact | null {
  return read().find((c) => c.id === id) ?? null;
}

export function createLocalContact(
  data: Omit<LocalContact, "id" | "createdAt">
): LocalContact {
  const contacts = read();
  const contact: LocalContact = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  contacts.unshift(contact);
  write(contacts);
  return contact;
}

export function deleteLocalContact(id: string): boolean {
  const contacts = read();
  const filtered = contacts.filter((c) => c.id !== id);
  if (filtered.length === contacts.length) return false;
  write(filtered);
  return true;
}
