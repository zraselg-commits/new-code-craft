import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import {
  readLocalServices,
  readLocalPackages,
  getActiveLocalServices,
} from "@lib/local-services-store";

// Always dynamic — admin changes must reflect instantly
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const includePackages = req.nextUrl.searchParams.get("include") === "packages";

  try {
    const allServices = getActiveLocalServices();
    const allPkgs = readLocalPackages();

    if (includePackages) {
      const result = allServices.map((svc) => ({
        ...svc,
        packages: allPkgs.filter((p) => p.serviceId === svc.id),
      }));
      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Build startingPrice from packages
    const priceMap = new Map<string, string>();
    for (const pkg of allPkgs) {
      const cur = priceMap.get(pkg.serviceId);
      if (cur === undefined || parseFloat(pkg.price) < parseFloat(cur)) {
        priceMap.set(pkg.serviceId, pkg.price);
      }
    }

    const result = allServices.map((svc) => ({
      ...svc,
      packages: allPkgs.filter((p) => p.serviceId === svc.id),
      startingPrice: priceMap.get(svc.id) ?? null,
    }));

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Services API error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
