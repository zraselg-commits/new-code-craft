import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import {
  updateLocalService,
  deleteLocalService,
} from "@lib/local-services-store";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    const updated = updateLocalService(params.id, {
      ...(body.title        !== undefined && { title:          body.title }),
      ...(body.title_bn     !== undefined && { title_bn:       body.title_bn }),
      ...(body.slug         !== undefined && { slug:           body.slug }),
      ...(body.category     !== undefined && { category:       body.category }),
      ...(body.description  !== undefined && { description:    body.description }),
      ...(body.description_bn !== undefined && { description_bn: body.description_bn }),
      ...(body.imageUrl     !== undefined && { imageUrl:       body.imageUrl }),
      ...(body.tags         !== undefined && { tags:           body.tags }),
      ...(body.isActive     !== undefined && { isActive:       body.isActive }),
    });
    if (!updated) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const deleted = deleteLocalService(params.id);
    if (!deleted) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
