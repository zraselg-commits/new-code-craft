import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
      headers: { "User-Agent": "codecraftbd.info/1.0" },
    });
    clearTimeout(id);
    const data = await res.json();
    return NextResponse.json({ country_code: data.country_code ?? "UNKNOWN" });
  } catch {
    return NextResponse.json({ country_code: "UNKNOWN" });
  }
}
