import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import {
  readLocalPackages,
  createLocalPackage,
} from "@lib/local-services-store";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const serviceId = req.nextUrl.searchParams.get("serviceId") ?? undefined;
    return NextResponse.json(readLocalPackages(serviceId));
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  if (!body?.serviceId || !body?.name || !body?.tier) {
    return NextResponse.json({ error: "serviceId, name, and tier are required" }, { status: 400 });
  }

  try {
    const pkg = createLocalPackage({
      serviceId:    body.serviceId,
      name:         body.name,
      name_bn:      body.name_bn ?? "",
      tier:         body.tier,
      price:        String(body.price ?? "0"),
      features:     Array.isArray(body.features) ? body.features : [],
      features_bn:  Array.isArray(body.features_bn) ? body.features_bn : [],
      deliveryDays: Number(body.deliveryDays ?? 7),
      revisions:    body.revisions ?? null,
      isPopular:    body.isPopular ?? false,
    });
    return NextResponse.json(pkg, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
