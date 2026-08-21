"use client";

import Link from "next/link";
import type { CourseCatalogItem } from "@/types/course";
import { useLocale } from "@/components/LocaleProvider";
import { courseCopy } from "@/lib/i18n";

type Props = {
  course: CourseCatalogItem;
  featured?: boolean;
};

export function CourseCard({ course, featured }: Props) {
  const { locale, t } = useLocale();
  const copy = courseCopy(locale, course.slug, {
    title: course.title,
    subtitle: course.subtitle,
    author: course.author,
    description: course.description,
    category: course.category,
  });
  const isOfficial = course.slug === "guia-nacional";

  const className = [
    "group block w-full rounded-2xl border p-5 sm:p-6 shadow-sm transition-all text-left",
    featured || isOfficial
      ? "border-gold/50 bg-white ring-1 ring-gold/20 hover:shadow-md"
      : "border-navy/10 bg-white hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg",
    !course.available ? "opacity-60 pointer-events-none" : "",
  ].join(" ");

  const inner = (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {isOfficial && (
          <span className="rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {t.course.official}
          </span>
        )}
        <span className="text-xs font-medium text-navy/50">{copy.category}</span>
      </div>

      <h3 className="font-serif text-xl sm:text-2xl text-navy leading-snug">{copy.title}</h3>
      <p className="mt-1 text-sm text-navy/55">{copy.author}</p>
      <p className="mt-3 text-sm text-navy/70 leading-relaxed">{copy.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/50">
        {course.available ? (
          <>
            {course.format === "reading" ? (
              <span>{t.course.readingDoc}</span>
            ) : (
              <>
                <span>
                  {course.lessonCount} {t.course.lessons}
                </span>
                {course.estimatedWeeks ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      ~{course.estimatedWeeks} {t.course.weeks}
                    </span>
                  </>
                ) : null}
              </>
            )}
            <span className="ml-auto text-gold transition-transform group-hover:translate-x-1">
              {course.format === "reading" ? t.course.read : t.course.viewCourse}
            </span>
          </>
        ) : (
          <span className="rounded-full bg-navy/10 px-3 py-1 text-navy/60">{t.course.comingSoon}</span>
        )}
      </div>
    </>
  );

  if (!course.available) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href={`/estudios/${course.slug}`} className={className}>
      {inner}
    </Link>
  );
}
