import type { Question } from "./study";

export type Lesson = {
  id: number;
  title: string;
  part: string;
  subtitle: string;
  summary: string;
  content: string[];
  questions: Question[];
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  category: string;
  lessonCount: number;
  estimatedWeeks?: number;
  available: boolean;
  lessons: Lesson[];
};

export type CourseCatalogItem = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  category: string;
  lessonCount: number;
  estimatedWeeks?: number;
  available: boolean;
};

export type CourseCatalog = {
  courses: CourseCatalogItem[];
};
