"use client";

import Link from "next/link";
import { StudyTabs } from "@/components/StudyTabs";
import { useLocale } from "@/components/LocaleProvider";
import { courseCopy, formatMsg } from "@/lib/i18n";
import type { Lesson } from "@/types/course";

type Props = {
  courseSlug: string;
  lesson: Lesson;
  total: number;
  courseTitle: string;
  prev: number | null;
  next: number | null;
};

export function LessonPageClient({
  courseSlug,
  lesson,
  total,
  courseTitle,
  prev,
  next,
}: Props) {
  const { locale, t } = useLocale();
  const copy = courseCopy(locale, courseSlug, {
    title: courseTitle,
    subtitle: "",
    author: "",
    description: "",
    category: "",
  });
  const homeStudy =
    courseSlug === "guia-nacional"
      ? t.home.studies.find((s) => s.id === lesson.id)
      : undefined;

  return (
    <div className="page-container max-w-4xl py-6 sm:py-10">
      <Link
        href={`/estudios/${courseSlug}`}
        className="inline-flex items-center gap-1 text-sm text-navy/60 transition hover:text-navy"
      >
        ← {copy.title}
      </Link>

      <header className="mt-6 mb-10">
        <p className="text-xs font-semibold tracking-wider text-gold uppercase">
          {homeStudy?.part ?? lesson.part}
        </p>
        <p className="mt-2 font-serif text-sm text-navy/50">
          {formatMsg(t.lesson.of, { id: lesson.id, total })}
        </p>
        <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy leading-snug">
          {homeStudy?.title ?? lesson.title}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-navy/70">{lesson.subtitle}</p>
      </header>

      <StudyTabs lesson={lesson} courseSlug={courseSlug} />

      <nav className="mt-12 flex flex-col-reverse gap-3 border-t border-navy/10 pt-6 sm:mt-16 sm:flex-row sm:justify-between sm:gap-4 sm:pt-8">
        {prev ? (
          <Link
            href={`/estudios/${courseSlug}/${prev}`}
            className="rounded-full border border-navy/20 px-4 py-2.5 text-center text-sm text-navy hover:bg-navy/5 sm:px-5"
          >
            {formatMsg(t.lesson.prev, { id: prev })}
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={`/estudios/${courseSlug}/${next}`}
            className="rounded-full bg-navy px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-navy-light sm:px-5"
          >
            {formatMsg(t.lesson.next, { id: next })}
          </Link>
        ) : (
          <p className="text-center text-sm text-navy/50 sm:text-left">{t.lesson.completed}</p>
        )}
      </nav>
    </div>
  );
}
