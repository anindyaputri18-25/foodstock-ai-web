import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import type { Role } from "@/types/domain";

const ROLE_PREFIX: Record<Role, string> = {
  admin: "/admin",
  dinas: "/dinas",
  bulog: "/bulog",
  distributor: "/distributor",
};

const PROTECTED_PREFIXES = [...Object.values(ROLE_PREFIX), "/profil"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirected", "1");
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/profil")) return NextResponse.next();
  // Admin diberi akses lintas peran khusus ke halaman impor data historis.
  if (session.role === "admin" && pathname === "/dinas/input-stok") return NextResponse.next();

  const allowedPrefix = ROLE_PREFIX[session.role];
  if (!pathname.startsWith(allowedPrefix)) {
    // Role tidak cocok dengan area yang diminta -> arahkan ke dashboard miliknya sendiri.
    return NextResponse.redirect(new URL(allowedPrefix, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dinas/:path*", "/bulog/:path*", "/distributor/:path*", "/profil/:path*"],
};
