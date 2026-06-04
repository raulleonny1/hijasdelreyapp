import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
};

const COOKIE_NAME = "hdr_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "hijas-del-rey-dev-secret-cambiar-en-produccion";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.id || !payload.email) return null;
    return {
      id: String(payload.id),
      nombre: String(payload.nombre ?? ""),
      apellido: String(payload.apellido ?? ""),
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
