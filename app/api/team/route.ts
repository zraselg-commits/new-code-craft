import { NextResponse } from "next/server";
import { readTeam } from "../admin/team/route";

// Always dynamic — admin changes must reflect instantly
export const dynamic = "force-dynamic";

/** Public endpoint — no authentication required */
export async function GET() {
  return NextResponse.json(readTeam(), {
    headers: { "Cache-Control": "no-store" },
  });
}
