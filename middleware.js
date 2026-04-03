import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/authSession";

function isPublicPath(pathname) {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/.well-known")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname.endsWith(".xml") || pathname.endsWith(".txt") || pathname.endsWith(".html")) return true;
  return false;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("yn_session")?.value;
  const payload = await verifySessionToken(token);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
