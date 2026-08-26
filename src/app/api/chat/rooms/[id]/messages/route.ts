import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  canAccessRoom,
  getRoom,
  listMessages,
  sendTextMessage,
} from "@/lib/chat-db";
import type { ChatLocale } from "@/types/chat";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: roomId } = await ctx.params;
  try {
    const room = await getRoom(roomId);
    if (!room || !canAccessRoom(room, session.id)) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    const params = new URL(request.url).searchParams;
    const after = params.get("after") ?? undefined;
    const messages = await listMessages(roomId, { after });
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("[chat messages GET]", e);
    return NextResponse.json({ error: "Error al cargar mensajes" }, { status: 500 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: roomId } = await ctx.params;
  try {
    const room = await getRoom(roomId);
    if (!room || !canAccessRoom(room, session.id)) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const text = String(body.text ?? "");
    const sourceLocale: ChatLocale = body.sourceLocale === "en" ? "en" : "es";
    const senderName = `${session.nombre} ${session.apellido}`.trim();

    const message = await sendTextMessage({
      roomId,
      senderId: session.id,
      senderName,
      text,
      sourceLocale,
    });
    return NextResponse.json({ message });
  } catch (e) {
    console.error("[chat messages POST]", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg === "BAD_TEXT") {
      return NextResponse.json({ error: "Mensaje vacío o demasiado largo" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
