import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deletePrayerRequest } from "@/lib/prayer-db";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  try {
    await deletePrayerRequest(id, session.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[prayer DELETE]", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    if (msg === "FORBIDDEN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
