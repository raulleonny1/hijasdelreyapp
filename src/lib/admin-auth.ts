import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-constants";

const MAX_AGE = 60 * 60 * 12; // 12 horas

export type AdminSession = {
  role: "admin";
  at: number;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "hijas-del-rey-dev-secret-cambiar-en-produccion";
  return new TextEncoder().encode(`admin:${secret}`);
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    return { role: "admin", at: Number(payload.iat ?? 0) };
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const token = await createAdminToken();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
