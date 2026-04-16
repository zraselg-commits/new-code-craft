import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import {
  updateLocalPackage,
  deleteLocalPackage,
} from "@lib/local-services-store";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    const updated = updateLocalPackage(params.id, {
      ...(body.name         !== undefined && { name:         body.name }),
      ...(body.name_bn      !== undefined && { name_bn:      body.name_bn }),
      ...(body.tier         !== undefined && { tier:         body.tier }),
      ...(body.price        !== undefined && { price:        String(body.price) }),
      ...(body.features     !== undefined && { features:     body.features }),
      ...(body.features_bn  !== undefined && { features_bn:  body.features_bn }),
      ...(body.deliveryDays !== undefined && { deliveryDays: Number(body.deliveryDays) }),
      ...(body.revisions    !== undefined && { revisions:    body.revisions }),
      ...(body.isPopular    !== undefined && { isPopular:    body.isPopular }),
    });
    if (!updated) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const deleted = deleteLocalPackage(params.id);
    if (!deleted) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
