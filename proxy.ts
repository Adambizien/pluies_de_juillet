import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getUserRole } from "@/lib/getUserRole";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  if (!token && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname === "/profile" || req.nextUrl.pathname.startsWith("/planning"))) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  if (token && req.nextUrl.pathname.startsWith("/admin")) {
    const userId = (token as Record<string, unknown>).id as string;
    const currentRole = await getUserRole(userId);
    
    if (currentRole !== "admin") {
      const newUrl = new URL("/", req.nextUrl.origin);
      return NextResponse.redirect(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/profile", "/planning/:path*"],
};
