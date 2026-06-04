import { getAdminFirestore } from "@/lib/firebase/admin";

const ANSWERS = "answers";

export type StudyAnswers = Record<number, string>;

function answersDocId(userId: string, studyId: number): string {
  return `${userId}_${studyId}`;
}

export async function getStudyAnswers(
  userId: string,
  studyId: number,
): Promise<StudyAnswers> {
  const db = getAdminFirestore();
  const doc = await db.collection(ANSWERS).doc(answersDocId(userId, studyId)).get();
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
  studyId: number,
  questionId: number,
  value: string,
): Promise<StudyAnswers> {
  const db = getAdminFirestore();
  const ref = db.collection(ANSWERS).doc(answersDocId(userId, studyId));
  const current = await getStudyAnswers(userId, studyId);
  current[questionId] = value;

  const responses: Record<string, string> = {};
  for (const [k, v] of Object.entries(current)) {
    responses[String(k)] = v;
  }

  await ref.set(
    {
      userId,
      studyId,
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
): Promise<{ overall: number; byStudy: Record<number, number> }> {
  const byStudy: Record<number, number> = {};
  let totalQuestions = 0;
  let totalAnswered = 0;

  for (const study of studies) {
    const answers = await getStudyAnswers(userId, study.id);
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
