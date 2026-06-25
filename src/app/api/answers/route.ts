import { NextResponse } from "next/server";
import { getStudyAnswers, saveStudyAnswer } from "@/lib/answers-db";
import { getSession } from "@/lib/auth";
import { GUIA_NACIONAL_SLUG } from "@/lib/courses";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const studyId = Number(params.get("studyId"));
  const courseId = params.get("courseId") ?? GUIA_NACIONAL_SLUG;

  if (!studyId || Number.isNaN(studyId)) {
    return NextResponse.json({ error: "studyId requerido" }, { status: 400 });
  }

  try {
    const answers = await getStudyAnswers(session.id, studyId, courseId);
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
    const { studyId, questionId, value, courseId = GUIA_NACIONAL_SLUG } = await request.json();
    if (!studyId || !questionId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const answers = await saveStudyAnswer(
      session.id,
      Number(studyId),
      Number(questionId),
      String(value ?? ""),
      String(courseId),
    );
    return NextResponse.json({ ok: true, answers });
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
