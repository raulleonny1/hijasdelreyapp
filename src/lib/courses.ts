import catalogEs from "@/data/course-catalog.json";
import type { Course, CourseCatalog, CourseCatalogItem, Lesson } from "@/types/course";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";
import { GUIA_NACIONAL_SLUG } from "@/lib/course-constants";
import { getStudies, getStudy, ensureLocaleStudies } from "@/lib/studies";
import type { Study } from "@/types/study";

export { GUIA_NACIONAL_SLUG } from "@/lib/course-constants";

const catalog = catalogEs as CourseCatalog;

const courseModulesEs: Record<string, () => Promise<Course>> = {
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

const courseModulesEn: Record<string, () => Promise<Course>> = {
  anglicanismo: async () =>
    (await import("@/data/en/courses/anglicanismo.json")).default as Course,
  "matrimonio-iere": async () =>
    (await import("@/data/en/courses/matrimonio-iere.json")).default as Course,
  "idiomas-biblia": async () =>
    (await import("@/data/en/courses/idiomas-biblia.json")).default as Course,
  "calvino-vida-cristiana": async () =>
    (await import("@/data/en/courses/calvino-vida-cristiana.json")).default as Course,
  "lewis-problema-dolor": async () =>
    (await import("@/data/en/courses/lewis-problema-dolor.json")).default as Course,
  "libros-biblia": async () =>
    (await import("@/data/en/courses/libros-biblia.json")).default as Course,
  "pulpito-cristiano": async () =>
    (await import("@/data/en/courses/pulpito-cristiano.json")).default as Course,
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

function localizeCatalogItem(item: CourseCatalogItem, locale: Locale): CourseCatalogItem {
  const copy = messages[locale].courses[item.slug];
  if (!copy) return item;
  return {
    ...item,
    title: copy.title,
    subtitle: copy.subtitle,
    author: copy.author,
    description: copy.description,
    category: copy.category,
  };
}

function guiaNacionalCourse(locale: Locale): Course {
  const meta = localizeCatalogItem(
    catalog.courses.find((c) => c.slug === GUIA_NACIONAL_SLUG)!,
    locale
  );
  const lessons = getStudies(locale).map(studyToLesson);
  return {
    ...meta,
    lessons,
    lessonCount: lessons.length,
    available: true,
  };
}

export function getCourseCatalog(locale: Locale = "es"): CourseCatalogItem[] {
  return catalog.courses.map((c) => localizeCatalogItem(c, locale));
}

export function getCourseMeta(slug: string, locale: Locale = "es"): CourseCatalogItem | undefined {
  const item = catalog.courses.find((c) => c.slug === slug);
  return item ? localizeCatalogItem(item, locale) : undefined;
}

export async function getCourse(slug: string, locale: Locale = "es"): Promise<Course | null> {
  if (slug === GUIA_NACIONAL_SLUG) {
    await ensureLocaleStudies(locale);
    return guiaNacionalCourse(locale);
  }
  const modules = locale === "en" ? courseModulesEn : courseModulesEs;
  const loader = modules[slug] ?? courseModulesEs[slug];
  if (!loader) return null;
  try {
    const course = await loader();
    const meta = localizeCatalogItem(
      {
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        author: course.author,
        description: course.description,
        category: course.category,
        lessonCount: course.lessonCount,
        estimatedWeeks: course.estimatedWeeks,
        available: course.available,
        format: course.format,
      },
      locale
    );
    return {
      ...course,
      ...meta,
      lessons: course.lessons,
      lessonCount: course.lessons.length,
    };
  } catch {
    // Si falta EN, no dejar vacío: volver a español
    if (locale === "en") {
      const fallback = courseModulesEs[slug];
      if (!fallback) return null;
      return fallback();
    }
    return null;
  }
}

export async function getCourseLessons(slug: string, locale: Locale = "es"): Promise<Lesson[]> {
  const course = await getCourse(slug, locale);
  return course?.lessons ?? [];
}

export async function getLesson(
  slug: string,
  lessonId: number,
  locale: Locale = "es"
): Promise<Lesson | undefined> {
  if (slug === GUIA_NACIONAL_SLUG) {
    await ensureLocaleStudies(locale);
    const study = getStudy(lessonId, locale);
    return study ? studyToLesson(study) : undefined;
  }
  const course = await getCourse(slug, locale);
  return course?.lessons.find((l) => l.id === lessonId);
}

export function getAllCourseSlugs(): string[] {
  return catalog.courses.filter((c) => c.available).map((c) => c.slug);
}
