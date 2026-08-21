import studyDataEs from "@/data/studies.json";
import studyDataEn from "@/data/en/studies.json";
import type { Study, StudyData } from "@/types/study";
import type { Locale } from "@/lib/i18n";

const dataEs = studyDataEs as StudyData;
const dataEn = studyDataEn as StudyData;

/** Spanish study data (legacy export). */
export const data = dataEs;

export function getStudies(locale: Locale = "es"): Study[] {
  return (locale === "en" ? dataEn : dataEs).studies;
}

export function getStudy(id: number, locale: Locale = "es"): Study | undefined {
  return getStudies(locale).find((s) => s.id === id);
}

export function getIntro(locale: Locale = "es") {
  return (locale === "en" ? dataEn : dataEs).intro;
}

export async function getStudiesAsync(locale: Locale = "es"): Promise<Study[]> {
  return getStudies(locale);
}

export async function getStudyAsync(
  id: number,
  locale: Locale = "es"
): Promise<Study | undefined> {
  return getStudy(id, locale);
}

export function normalizeParagraph(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

/** Kept for callers that await before sync getStudies(locale). */
export async function ensureLocaleStudies(_locale: Locale): Promise<void> {
  /* EN is statically imported */
}
