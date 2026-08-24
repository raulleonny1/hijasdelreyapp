import { getAdminFirestore } from "@/lib/firebase/admin";
import { GUIA_NACIONAL_SLUG } from "@/lib/course-constants";
import { getCourseCatalog, getCourse } from "@/lib/courses";
import type { UserRecord } from "@/lib/users-db";

const USERS = "users";
const ANSWERS = "answers";

export type PublicUser = Omit<UserRecord, "pinHash">;

export async function listAllUsers(): Promise<PublicUser[]> {
  const db = getAdminFirestore();
  const snap = await db.collection(USERS).get();
  return snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        nombre: String(d.nombre ?? ""),
        apellido: String(d.apellido ?? ""),
        fechaNacimiento: String(d.fechaNacimiento ?? ""),
        email: String(d.email ?? ""),
        createdAt: String(d.createdAt ?? ""),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type CourseProgress = {
  courseId: string;
  title: string;
  percent: number;
  answered: number;
  total: number;
  lessonsTouched: number;
  lessonCount: number;
  lastActivityAt: string | null;
};

export type UserStudyOverview = {
  userId: string;
  overallPercent: number;
  courses: CourseProgress[];
  /** Cursos en los que ya respondió algo */
  startedCourses: CourseProgress[];
  lastActivityAt: string | null;
};

type AnswerDoc = {
  userId: string;
  courseId: string;
  lessonId: number;
  responses: Record<string, string>;
  updatedAt: string;
};

async function loadQuestionTotals(): Promise<
  Map<string, { title: string; lessonCount: number; questionsByLesson: Map<number, number> }>
> {
  const catalog = getCourseCatalog("es").filter((c) => c.available);
  const out = new Map<
    string,
    { title: string; lessonCount: number; questionsByLesson: Map<number, number> }
  >();

  for (const meta of catalog) {
    const course = await getCourse(meta.slug, "es");
    if (!course) continue;
    const questionsByLesson = new Map<number, number>();
    for (const lesson of course.lessons) {
      questionsByLesson.set(lesson.id, lesson.questions.length);
    }
    out.set(meta.slug, {
      title: meta.title,
      lessonCount: course.lessons.length,
      questionsByLesson,
    });
  }
  return out;
}

/**
 * Resuelve userId / courseId / lessonId desde el documento Firestore.
 * Formato actual: `{userId}_{courseId}_{lessonId}`
 * Legado (guía): `{userId}_{lessonId}`
 */
function resolveAnswerFields(
  docId: string,
  data: Record<string, unknown>,
  knownCourseIds: string[]
): Omit<AnswerDoc, "responses" | "updatedAt"> | null {
  let userId = String(data.userId ?? "").trim();
  let courseId = String(data.courseId ?? "").trim();
  let lessonId = Number(data.lessonId ?? data.studyId ?? 0);

  if (!userId || !lessonId || !courseId) {
    const lessonMatch = docId.match(/_(\d+)$/);
    if (lessonMatch) {
      if (!lessonId) lessonId = Number(lessonMatch[1]);
      const rest = docId.slice(0, -(lessonMatch[1].length + 1));
      const sorted = [...knownCourseIds].sort((a, b) => b.length - a.length);
      let matched = false;
      for (const slug of sorted) {
        const suffix = `_${slug}`;
        if (rest.endsWith(suffix)) {
          if (!courseId) courseId = slug;
          if (!userId) userId = rest.slice(0, -suffix.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        if (!userId) userId = rest;
        if (!courseId) courseId = GUIA_NACIONAL_SLUG;
      }
    }
  }

  if (!courseId) courseId = GUIA_NACIONAL_SLUG;
  if (!userId || !Number.isFinite(lessonId) || lessonId <= 0) return null;

  return { userId, courseId, lessonId };
}

export async function getStudyOverviewByUser(
  userIds: string[]
): Promise<Record<string, UserStudyOverview>> {
  const totals = await loadQuestionTotals();
  const knownCourseIds = [...totals.keys()];
  const db = getAdminFirestore();
  const snap = await db.collection(ANSWERS).get();

  const byUser = new Map<string, AnswerDoc[]>();
  for (const doc of snap.docs) {
    const d = doc.data() as Record<string, unknown>;
    const resolved = resolveAnswerFields(doc.id, d, knownCourseIds);
    if (!resolved) continue;
    if (userIds.length > 0 && !userIds.includes(resolved.userId)) continue;

    const responses = (d.responses ?? {}) as Record<string, string>;
    const list = byUser.get(resolved.userId) ?? [];
    list.push({
      ...resolved,
      responses,
      updatedAt: String(d.updatedAt ?? ""),
    });
    byUser.set(resolved.userId, list);
  }

  const result: Record<string, UserStudyOverview> = {};
  const ids = userIds.length > 0 ? userIds : [...byUser.keys()];

  for (const userId of ids) {
    const rawDocs = byUser.get(userId) ?? [];
    // Si hay doc legado y doc nuevo de la misma lección, quedarse con el más reciente
    const deduped = new Map<string, AnswerDoc>();
    for (const doc of rawDocs) {
      const key = `${doc.courseId}:${doc.lessonId}`;
      const prev = deduped.get(key);
      if (!prev || (doc.updatedAt && doc.updatedAt > (prev.updatedAt || ""))) {
        deduped.set(key, doc);
      }
    }
    const docs = [...deduped.values()];
    const courses: CourseProgress[] = [];
    let lastActivityAt: string | null = null;

    for (const [courseId, meta] of totals.entries()) {
      let answered = 0;
      let total = 0;
      const touched = new Set<number>();
      let courseLast: string | null = null;

      for (const [, qCount] of meta.questionsByLesson) {
        total += qCount;
      }

      for (const doc of docs.filter((x) => x.courseId === courseId)) {
        const expected = meta.questionsByLesson.get(doc.lessonId) ?? 0;
        const filled = Object.values(doc.responses).filter((v) => String(v).trim().length > 0)
          .length;
        answered += expected > 0 ? Math.min(filled, expected) : filled;
        if (filled > 0) touched.add(doc.lessonId);
        if (doc.updatedAt && (!courseLast || doc.updatedAt > courseLast)) {
          courseLast = doc.updatedAt;
        }
      }

      // Documentos de solo lectura (sin preguntas): progreso = lecciones con actividad
      if (total === 0 && meta.lessonCount > 0) {
        total = meta.lessonCount;
        answered = touched.size;
      }

      if (courseLast && (!lastActivityAt || courseLast > lastActivityAt)) {
        lastActivityAt = courseLast;
      }

      courses.push({
        courseId,
        title: meta.title,
        percent: total === 0 ? 0 : Math.round((answered / total) * 100),
        answered,
        total,
        lessonsTouched: touched.size,
        lessonCount: meta.lessonCount,
        lastActivityAt: courseLast,
      });
    }

    // Solo cursos empezados (con al menos una respuesta) → evita diluir el % con cursos no tocados
    const startedCourses = courses
      .filter((c) => c.answered > 0 || c.lessonsTouched > 0)
      .sort((a, b) => {
        const ta = a.lastActivityAt ?? "";
        const tb = b.lastActivityAt ?? "";
        return tb.localeCompare(ta) || b.percent - a.percent;
      });

    const startedAnswered = startedCourses.reduce((s, c) => s + c.answered, 0);
    const startedTotal = startedCourses.reduce((s, c) => s + c.total, 0);

    courses.sort((a, b) => b.percent - a.percent || a.title.localeCompare(b.title));

    result[userId] = {
      userId,
      overallPercent:
        startedTotal === 0 ? 0 : Math.round((startedAnswered / startedTotal) * 100),
      courses,
      startedCourses,
      lastActivityAt,
    };
  }

  return result;
}
