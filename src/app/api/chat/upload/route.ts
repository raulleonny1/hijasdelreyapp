import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessRoom, getRoom, sendAudioMessage } from "@/lib/chat-db";
import type { ChatLocale } from "@/types/chat";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const roomId = String(form.get("roomId") ?? "").trim();
    const durationMs = Number(form.get("durationMs") ?? 0);
    const sourceLocale: ChatLocale =
      String(form.get("sourceLocale") ?? "") === "en" ? "en" : "es";
    const file = form.get("file");

    if (!roomId || !(file instanceof File)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const room = await getRoom(roomId);
    if (!room || !canAccessRoom(room, session.id)) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Audio demasiado grande (máx. 5 MB)" }, { status: 400 });
    }

    const contentType = file.type || "audio/webm";
    const ext =
      contentType.includes("mp4") || contentType.includes("m4a")
        ? "m4a"
        : contentType.includes("ogg")
          ? "ogg"
          : "webm";

    const buffer = Buffer.from(await file.arrayBuffer());
    const senderName = `${session.nombre} ${session.apellido}`.trim();

    const message = await sendAudioMessage({
      roomId,
      senderId: session.id,
      senderName,
      sourceLocale,
      audioBuffer: buffer,
      contentType,
      durationMs: Number.isFinite(durationMs) ? Math.max(0, Math.round(durationMs)) : 0,
      ext,
    });

    return NextResponse.json({ message });
  } catch (e) {
    console.error("[chat upload]", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Storage") || msg.includes("storageBucket")) {
      return NextResponse.json(
        { error: "Almacenamiento de audio no configurado" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Error al subir audio" }, { status: 500 });
  }
}
