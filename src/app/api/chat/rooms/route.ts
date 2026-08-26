import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  buildNameMap,
  getOrCreateDmRoom,
  listRoomsForUser,
} from "@/lib/chat-db";
import { getUserById } from "@/lib/users-db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const nameById = await buildNameMap();
    const rooms = await listRoomsForUser(session.id, nameById);
    return NextResponse.json({ rooms });
  } catch (e) {
    console.error("[chat rooms GET]", e);
    return NextResponse.json({ error: "Error al cargar conversaciones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const otherUserId = String(body.otherUserId ?? "").trim();
    if (!otherUserId) {
      return NextResponse.json({ error: "otherUserId requerido" }, { status: 400 });
    }

    const other = await getUserById(otherUserId);
    if (!other) {
      return NextResponse.json({ error: "Miembro no encontrada" }, { status: 404 });
    }

    const room = await getOrCreateDmRoom(
      session.id,
      other.id,
      `${other.nombre} ${other.apellido}`.trim(),
    );
    return NextResponse.json({ room });
  } catch (e) {
    console.error("[chat rooms POST]", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INVALID_DM") {
      return NextResponse.json({ error: "No puede chatear consigo misma" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al abrir chat privado" }, { status: 500 });
  }
}
