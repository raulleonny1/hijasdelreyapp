import catalogData from "@/data/course-catalog.json";
import type { Course, CourseCatalog, CourseCatalogItem, Lesson } from "@/types/course";
import { getStudies, getStudy } from "@/lib/studies";
import type { Study } from "@/types/study";

export const GUIA_NACIONAL_SLUG = "guia-nacional";

const catalog = catalogData as CourseCatalog;

const courseModules: Record<string, () => Promise<Course>> = {
  anglicanismo: async () => (await import("@/data/courses/anglicanismo.json")).default as Course,
  "matrimonio-iere": async () =>
    (await import("@/data/courses/matrimonio-iere.json")).default as Course,
  "idiomas-biblia": async () =>
    (await import("@/data/courses/idiomas-biblia.json")).default as Course,
  "calvino-vida-cristiana": async () =>
    (await import("@/data/courses/calvino-vida-cristiana.json")).default as Course,
  "lewis-problema-dolor": async () =>
    (await import("@/data/courses/lewis-problema-dolor.json")).default as Course,
  "libros-biblia": async () => (await import("@/data/courses/libros-biblia.json")).default as Course,
  "pulpito-cristiano": async () =>
    (await import("@/data/courses/pulpito-cristiano.json")).default as Course,
};

function studyToLesson(study: Study): Lesson {
  return {
    id: study.id,
    title: study.title,
    part: study.part,
    subtitle: study.subtitle,
    summary: study.summary,
    content: study.content,
    questions: study.questions,
  };
}

function guiaNacionalCourse(): Course {
  const meta = catalog.courses.find((c) => c.slug === GUIA_NACIONAL_SLUG)!;
  const lessons = getStudies().map(studyToLesson);
  return {
    ...meta,
    lessons,
    lessonCount: lessons.length,
    available: true,
  };
}

export function getCourseCatalog(): CourseCatalogItem[] {
  return catalog.courses;
}

export function getCourseMeta(slug: string): CourseCatalogItem | undefined {
  return catalog.courses.find((c) => c.slug === slug);
}

export async function getCourse(slug: string): Promise<Course | null> {
  if (slug === GUIA_NACIONAL_SLUG) {
    return guiaNacionalCourse();
  }
  const loader = courseModules[slug];
  if (!loader) return null;
  return loader();
}

export async function getCourseLessons(slug: string): Promise<Lesson[]> {
  const course = await getCourse(slug);
  return course?.lessons ?? [];
}

export async function getLesson(slug: string, lessonId: number): Promise<Lesson | undefined> {
  if (slug === GUIA_NACIONAL_SLUG) {
    const study = getStudy(lessonId);
    return study ? studyToLesson(study) : undefined;
  }
  const course = await getCourse(slug);
  return course?.lessons.find((l) => l.id === lessonId);
}

export function getAllCourseSlugs(): string[] {
  return catalog.courses.filter((c) => c.available).map((c) => c.slug);
}
