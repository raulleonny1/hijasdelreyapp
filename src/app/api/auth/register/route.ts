import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { ADMIN_GATE_PIN } from "@/lib/admin-constants";
import { createUser } from "@/lib/users-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, apellido, fechaNacimiento, email, pin, pinConfirm } = body;

    if (!nombre?.trim() || !apellido?.trim()) {
      return NextResponse.json({ error: "Nombre y apellido son obligatorios." }, { status: 400 });
    }
    if (!fechaNacimiento) {
      return NextResponse.json({ error: "Seleccione su fecha de nacimiento." }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico no válido." }, { status: 400 });
    }
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "El PIN debe tener exactamente 4 dígitos." }, { status: 400 });
    }
    if (pin === ADMIN_GATE_PIN) {
      return NextResponse.json(
        { error: "Este PIN está reservado. Elija otro PIN de 4 dígitos." },
        { status: 400 }
      );
    }
    if (pin !== pinConfirm) {
      return NextResponse.json({ error: "Los PIN no coinciden." }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      return NextResponse.json({ error: "Fecha de nacimiento no válida." }, { status: 400 });
    }
    const birth = new Date(`${fechaNacimiento}T12:00:00`);
    if (Number.isNaN(birth.getTime()) || birth > new Date()) {
      return NextResponse.json({ error: "Fecha de nacimiento no válida." }, { status: 400 });
    }

    const user = await createUser({
      nombre,
      apellido,
      fechaNacimiento,
      email,
      pin,
    });

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
    if (e instanceof Error && e.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { error: "Este correo ya está registrado. Inicie sesión con su PIN." },
        { status: 409 },
      );
    }
    if (e instanceof Error && e.message === "PIN_EXISTS") {
      return NextResponse.json(
        { error: "Este PIN ya está en uso. Elija otro PIN de 4 dígitos." },
        { status: 409 },
      );
    }
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Firebase Admin no configurado") || msg.includes("FIREBASE")) {
      return NextResponse.json(
        {
          error:
            "Firebase no está configurado en el servidor. En Vercel agregue FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY (ver CONFIGURAR-FIREBASE.md) y haga Redeploy.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "No se pudo completar el registro." }, { status: 500 });
  }
}
