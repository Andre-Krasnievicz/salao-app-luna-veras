import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const role = request.cookies.get("session_role")?.value;
  const path = request.nextUrl.pathname;

  // Admin routes
  if (path.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(
        new URL("/login?redirect=" + encodeURIComponent(path), request.url),
      );
    }
  }

  // Client routes
  if (path.startsWith("/cliente")) {
    if (!role) {
      return NextResponse.redirect(
        new URL("/login?redirect=" + encodeURIComponent(path), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cliente/:path*"],
};
