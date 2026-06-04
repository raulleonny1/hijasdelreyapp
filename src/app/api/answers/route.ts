import { NextResponse } from "next/server";
import { getStudyAnswers, saveStudyAnswer } from "@/lib/answers-db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const studyId = Number(new URL(request.url).searchParams.get("studyId"));
  if (!studyId || Number.isNaN(studyId)) {
    return NextResponse.json({ error: "studyId requerido" }, { status: 400 });
  }

  try {
    const answers = await getStudyAnswers(session.id, studyId);
    return NextResponse.json({ answers });
  } catch {
    return NextResponse.json({ error: "Error al cargar respuestas" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { studyId, questionId, value } = await request.json();
    if (!studyId || !questionId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const answers = await saveStudyAnswer(
      session.id,
      Number(studyId),
      Number(questionId),
      String(value ?? ""),
    );
    return NextResponse.json({ ok: true, answers });
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
