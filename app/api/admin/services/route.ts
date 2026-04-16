import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import {
  readLocalServices,
  readLocalPackages,
  createLocalService,
} from "@lib/local-services-store";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const allServices = readLocalServices();
    const allPackages = readLocalPackages();
    const result = allServices.map((svc) => ({
      ...svc,
      packages: allPackages.filter((p) => p.serviceId === svc.id),
    }));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.slug || !body?.category) {
    return NextResponse.json({ error: "title, slug, and category are required" }, { status: 400 });
  }

  try {
    const svc = createLocalService({
      title:       body.title ?? "",
      title_bn:    body.title_bn ?? "",
      slug:        body.slug ?? "",
      category:    body.category ?? "",
      description: body.description ?? "",
      description_bn: body.description_bn ?? "",
      imageUrl:    body.imageUrl ?? null,
      tags:        Array.isArray(body.tags) ? body.tags : [],
      isActive:    body.isActive !== false,
    });
    return NextResponse.json(svc, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
