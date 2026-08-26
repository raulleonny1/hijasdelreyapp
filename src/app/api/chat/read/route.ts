import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessRoom, getRoom, markRoomRead } from "@/lib/chat-db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const roomId = String(body.roomId ?? "").trim();
    if (!roomId) {
      return NextResponse.json({ error: "roomId requerido" }, { status: 400 });
    }

    const room = await getRoom(roomId);
    if (!room || !canAccessRoom(room, session.id)) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    const at = typeof body.at === "string" && body.at ? body.at : new Date().toISOString();
    await markRoomRead(session.id, roomId, at);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[chat read]", e);
    return NextResponse.json({ error: "Error al marcar leído" }, { status: 500 });
  }
}
