import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "hdr_session";
const PUBLIC_PATHS = ["/", "/login", "/registro"];
const AUTH_ONLY_PATHS = ["/login", "/registro"];

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "hijas-del-rey-dev-secret-cambiar-en-produccion";
  return new TextEncoder().encode(secret);
}

async function isValidSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

function safeRedirectPath(from: string | null): string | null {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return null;
  if (AUTH_ONLY_PATHS.includes(from)) return null;
  return from;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = token ? await isValidSession(token) : false;
  const isPublic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic) {
    // Solo sacar de login/registro si ya hay sesión (nunca redirigir "/" → "/" )
    if (valid && AUTH_ONLY_PATHS.includes(pathname)) {
      const from = safeRedirectPath(request.nextUrl.searchParams.get("from"));
      if (from) {
        return NextResponse.redirect(new URL(from, request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!valid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
