import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "hdr_session";
const PUBLIC_PATHS = ["/", "/login", "/registro"];
const AUTH_ONLY_PATHS = ["/login", "/registro"];
const DEFAULT_APP_PATH = "/estudios";

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
  if (from === "/" || AUTH_ONLY_PATHS.includes(from)) return null;
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
    if (valid) {
      if (pathname === "/") {
        const dest = new URL(DEFAULT_APP_PATH, request.url);
        const registrado = request.nextUrl.searchParams.get("registrado");
        if (registrado === "1") dest.searchParams.set("registrado", "1");
        return NextResponse.redirect(dest);
      }
      if (AUTH_ONLY_PATHS.includes(pathname)) {
        const from = safeRedirectPath(request.nextUrl.searchParams.get("from"));
        return NextResponse.redirect(new URL(from ?? DEFAULT_APP_PATH, request.url));
      }
    }
    return NextResponse.next();
  }

  if (!valid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const legacyStudy = pathname.match(/^\/estudios\/(\d+)$/);
  if (legacyStudy) {
    return NextResponse.redirect(
      new URL(`/estudios/guia-nacional/${legacyStudy[1]}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
