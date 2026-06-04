import { NextResponse } from "next/server";
import { getUserProgress } from "@/lib/answers-db";
import { getSession } from "@/lib/auth";
import { getStudies } from "@/lib/studies";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const progress = await getUserProgress(session.id, getStudies());
    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Error al calcular progreso" }, { status: 500 });
  }
}
