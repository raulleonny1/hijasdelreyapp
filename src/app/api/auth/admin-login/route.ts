import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/admin-auth";
import { ADMIN_GATE_PIN } from "@/lib/admin-constants";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    if (pin !== ADMIN_GATE_PIN) {
      return NextResponse.json({ error: "Acceso de administración no autorizado." }, { status: 401 });
    }
    await setAdminSessionCookie();
    return NextResponse.json({ ok: true, role: "admin" });
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar sesión de administración." }, { status: 500 });
  }
}
