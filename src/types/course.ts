import type { Question } from "./study";

export type ContentImage = {
  type: "image";
  src: string;
  alt?: string;
};

export type ContentHeading = {
  type: "heading";
  text: string;
  level?: number;
};

export type ContentBlock = string | ContentImage | ContentHeading;

export type CourseFormat = "study" | "reading";

export type Lesson = {
  id: number;
  title: string;
  part: string;
  subtitle: string;
  summary: string;
  content: ContentBlock[];
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
  format?: CourseFormat;
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
  format?: CourseFormat;
};

export type CourseCatalog = {
  courses: CourseCatalogItem[];
};
