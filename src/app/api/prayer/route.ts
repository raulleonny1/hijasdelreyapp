import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createPrayerRequest,
  listMyPrayerRequests,
  listSharedPrayerRequests,
} from "@/lib/prayer-db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const mine = new URL(request.url).searchParams.get("mine") === "1";
    if (mine) {
      const requests = await listMyPrayerRequests(session.id);
      return NextResponse.json({ requests });
    }
    const requests = await listSharedPrayerRequests();
    return NextResponse.json({ requests });
  } catch (e) {
    console.error("[prayer GET]", e);
    return NextResponse.json({ error: "Error al cargar pedidos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const text = String(body.text ?? "");
    const shareWithOthers = body.shareWithOthers === true;
    const authorName = `${session.nombre} ${session.apellido}`.trim();

    const prayer = await createPrayerRequest({
      authorId: session.id,
      authorName,
      text,
      shareWithOthers,
    });
    return NextResponse.json({ request: prayer });
  } catch (e) {
    console.error("[prayer POST]", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg === "BAD_TEXT") {
      return NextResponse.json({ error: "Pedido vacío o demasiado largo" }, { status: 400 });
    }
    if (msg === "CONSENT_REQUIRED") {
      return NextResponse.json(
        { error: "Debe aceptar que otras miembros lean su pedido" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Error al publicar" }, { status: 500 });
  }
}
