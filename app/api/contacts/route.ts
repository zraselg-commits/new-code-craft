import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createContact } from "@lib/firestore";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional().nullable(),
  service: z.string().max(100).optional().nullable(),
  details: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }
  try {
    const { name, email, phone, service, details } = result.data;
    await createContact({ name, email, phone: phone ?? null, service: service ?? null, details });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact insert error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
