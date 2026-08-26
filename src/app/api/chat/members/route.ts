import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listChatMembers } from "@/lib/chat-db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const members = await listChatMembers(session.id);
    return NextResponse.json({ members });
  } catch (e) {
    console.error("[chat members]", e);
    return NextResponse.json({ error: "Error al cargar miembros" }, { status: 500 });
  }
}
