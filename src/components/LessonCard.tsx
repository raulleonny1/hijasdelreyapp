"use client";

import Link from "next/link";
import type { Lesson } from "@/types/course";
import { useLocale } from "@/components/LocaleProvider";
import { formatMsg } from "@/lib/i18n";

type Props = {
  lesson: Lesson;
  courseSlug: string;
  index: number;
  total: number;
};

export function LessonCard({ lesson, courseSlug, total }: Props) {
  const { t } = useLocale();
  const homeStudy =
    courseSlug === "guia-nacional"
      ? t.home.studies.find((s) => s.id === lesson.id)
      : undefined;
  const title = homeStudy?.title ?? lesson.title;
  const part = homeStudy?.part ?? lesson.part;

  return (
    <Link
      href={`/estudios/${courseSlug}/${lesson.id}`}
      className="group relative block w-full rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg"
    >
      <span className="absolute top-4 right-4 font-serif text-4xl text-navy/8 group-hover:text-gold/20">
        {String(lesson.id).padStart(2, "0")}
      </span>
      <p className="mb-1 text-xs font-semibold tracking-wider text-gold uppercase">{part}</p>
      <h3 className="font-serif text-xl text-navy pr-12">{title}</h3>
      <p className="mt-2 text-sm text-navy/70">{lesson.subtitle}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-navy/50">
        <span>{formatMsg(t.lesson.of, { id: lesson.id, total })}</span>
        <span>·</span>
        <span>
          {lesson.questions.length} {t.lesson.questions}
        </span>
        <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  );
}
