"use client";

import Link from "next/link";
import { LessonCard } from "@/components/LessonCard";
import { ReadingDocument } from "@/components/ReadingDocument";
import { useLocale } from "@/components/LocaleProvider";
import { courseCopy } from "@/lib/i18n";
import type { Course } from "@/types/course";

type Props = {
  courseSlug: string;
  course: Course;
  isReading: boolean;
};

export function CoursePageClient({ courseSlug, course, isReading }: Props) {
  const { locale, t } = useLocale();
  const copy = courseCopy(locale, courseSlug, {
    title: course.title,
    subtitle: course.subtitle ?? "",
    author: course.author ?? "",
    description: course.description ?? "",
    category: course.category ?? "",
  });

  if (isReading) {
    const lesson = course.lessons[0];
    return (
      <div className="page-container py-8 sm:py-12">
        <Link
          href="/estudios"
          className="inline-flex items-center gap-1 text-sm text-navy/60 transition hover:text-navy"
        >
          {t.course.backLibrary}
        </Link>

        <div className="mt-6 rounded-none bg-white p-4 shadow-none sm:mt-8 sm:rounded-2xl sm:p-10 sm:shadow-sm">
          <ReadingDocument
            title={copy.title}
            subtitle={copy.subtitle}
            author={copy.author}
            content={lesson.content}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 sm:py-12">
      <Link
        href="/estudios"
        className="inline-flex items-center gap-1 text-sm text-navy/60 transition hover:text-navy"
      >
        {t.course.backCourses}
      </Link>

      <header className="mt-6 mb-10 max-w-3xl">
        <p className="text-xs font-semibold tracking-wider text-gold uppercase">{copy.category}</p>
        <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy leading-snug">
          {copy.title}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-navy/70">{copy.subtitle}</p>
        <p className="mt-1 text-sm text-navy/50">{copy.author}</p>
        <p className="mt-4 text-navy/70 leading-relaxed">{copy.description}</p>
        <p className="mt-4 text-sm text-navy/50">
          {course.lessonCount} {t.course.lessons}
          {course.estimatedWeeks
            ? ` · ~${course.estimatedWeeks} ${t.course.weeksSuggested}`
            : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {course.lessons.map((lesson, i) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            courseSlug={courseSlug}
            index={i}
            total={course.lessons.length}
          />
        ))}
      </div>
    </div>
  );
}
