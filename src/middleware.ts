import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("rc_auth_token")?.value;

  // Admin routes — redirect to /admin/login (JWT-based admin auth)
  if (pathname.startsWith("/admin")) {
    // Allow /admin/login itself to pass through
    if (pathname === "/admin/login") return NextResponse.next();
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Profile routes — redirect to /login (general user auth)
  if (pathname.startsWith("/profile")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(profile|admin)(.*)"],
};
