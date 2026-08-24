import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ADMIN_GATE_PIN } from "@/lib/admin-constants";
import { deleteUserAndData, updateUser } from "@/lib/users-db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nombre, apellido, fechaNacimiento, email, pin } = body;

    if (!nombre?.trim() || !apellido?.trim()) {
      return NextResponse.json({ error: "Nombre y apellido son obligatorios." }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico no válido." }, { status: 400 });
    }
    if (!fechaNacimiento || !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      return NextResponse.json({ error: "Fecha de nacimiento no válida." }, { status: 400 });
    }
    if (pin && pin === ADMIN_GATE_PIN) {
      return NextResponse.json({ error: "Este PIN está reservado." }, { status: 400 });
    }

    const user = await updateUser(id, {
      nombre,
      apellido,
      fechaNacimiento,
      email,
      pin: pin || undefined,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        fechaNacimiento: user.fechaNacimiento,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
      }
      if (e.message === "EMAIL_EXISTS") {
        return NextResponse.json({ error: "Este correo ya está en uso." }, { status: 409 });
      }
      if (e.message === "PIN_EXISTS") {
        return NextResponse.json({ error: "Este PIN ya está en uso." }, { status: 409 });
      }
      if (e.message === "BAD_PIN" || e.message === "BAD_BIRTHDATE") {
        return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await deleteUserAndData(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
