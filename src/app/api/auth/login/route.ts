import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { findUserByPin } from "@/lib/users-db";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Ingrese su PIN de 4 dígitos." }, { status: 400 });
    }

    const user = await findUserByPin(pin);
    if (!user) {
      return NextResponse.json({ error: "PIN incorrecto. Intente de nuevo." }, { status: 401 });
    }

    await setSessionCookie({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("FIREBASE_SERVICE_ACCOUNT")) {
      return NextResponse.json(
        { error: "Firebase no está configurado en el servidor." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Error al iniciar sesión." }, { status: 500 });
  }
}
