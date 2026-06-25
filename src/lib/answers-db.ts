import { getAdminFirestore } from "@/lib/firebase/admin";
import { GUIA_NACIONAL_SLUG } from "@/lib/courses";

const ANSWERS = "answers";

export type StudyAnswers = Record<number, string>;

function answersDocId(userId: string, courseId: string, lessonId: number): string {
  return `${userId}_${courseId}_${lessonId}`;
}

function legacyDocId(userId: string, lessonId: number): string {
  return `${userId}_${lessonId}`;
}

export async function getStudyAnswers(
  userId: string,
  lessonId: number,
  courseId: string = GUIA_NACIONAL_SLUG,
): Promise<StudyAnswers> {
  const db = getAdminFirestore();
  let doc = await db.collection(ANSWERS).doc(answersDocId(userId, courseId, lessonId)).get();
  if (!doc.exists && courseId === GUIA_NACIONAL_SLUG) {
    doc = await db.collection(ANSWERS).doc(legacyDocId(userId, lessonId)).get();
  }
  if (!doc.exists) return {};
  const data = doc.data()?.responses ?? {};
  const out: StudyAnswers = {};
  for (const [key, value] of Object.entries(data)) {
    out[Number(key)] = String(value);
  }
  return out;
}

export async function saveStudyAnswer(
  userId: string,
  lessonId: number,
  questionId: number,
  value: string,
  courseId: string = GUIA_NACIONAL_SLUG,
): Promise<StudyAnswers> {
  const db = getAdminFirestore();
  const ref = db.collection(ANSWERS).doc(answersDocId(userId, courseId, lessonId));
  const current = await getStudyAnswers(userId, lessonId, courseId);
  current[questionId] = value;

  const responses: Record<string, string> = {};
  for (const [k, v] of Object.entries(current)) {
    responses[String(k)] = v;
  }

  await ref.set(
    {
      userId,
      courseId,
      studyId: lessonId,
      lessonId,
      responses,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return current;
}

export async function getUserProgress(
  userId: string,
  studies: { id: number; questions: { id: number }[] }[],
  courseId: string = GUIA_NACIONAL_SLUG,
): Promise<{ overall: number; byStudy: Record<number, number> }> {
  const byStudy: Record<number, number> = {};
  let totalQuestions = 0;
  let totalAnswered = 0;

  for (const study of studies) {
    const answers = await getStudyAnswers(userId, study.id, courseId);
    const total = study.questions.length;
    const answered = study.questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
    byStudy[study.id] = total === 0 ? 0 : Math.round((answered / total) * 100);
    totalQuestions += total;
    totalAnswered += answered;
  }

  return {
    overall: totalQuestions === 0 ? 0 : Math.round((totalAnswered / totalQuestions) * 100),
    byStudy,
  };
}
