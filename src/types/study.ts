import type { ContentBlock } from "./course";

export type Question = {
  id: number;
  text: string;
  type?: "open" | "reflection";
};

export type Study = {
  id: number;
  num: string;
  title: string;
  part: string;
  subtitle: string;
  summary: string;
  content: ContentBlock[];
  questions: Question[];
  enrichment?: string[] | null;
};

export type Intro = {
  title: string;
  subtitle: string;
  edition: string;
  description: string;
  purposes: string[];
  motto: string;
  mottoTranslation: string;
  initials: string;
  scripture: string;
};

export type StudyData = {
  intro: Intro;
  studies: Study[];
};
