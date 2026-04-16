import { NextResponse } from "next/server";
import { readTeam } from "../admin/team/route";

/** Public endpoint — no authentication required */
export async function GET() {
  return NextResponse.json(readTeam());
}
