import studyData from "@/data/studies.json";
import type { Study, StudyData } from "@/types/study";

export const data = studyData as StudyData;

export function getStudies(): Study[] {
  return data.studies;
}

export function getStudy(id: number): Study | undefined {
  return data.studies.find((s) => s.id === id);
}

export function normalizeParagraph(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").trim();
}
