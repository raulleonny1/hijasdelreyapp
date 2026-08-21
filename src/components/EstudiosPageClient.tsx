"use client";

import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { useLocale } from "@/components/LocaleProvider";
import type { CourseCatalogItem } from "@/types/course";
import { GUIA_NACIONAL_SLUG } from "@/lib/course-constants";

type Props = {
  courses: CourseCatalogItem[];
  sessionNombre: string | null;
  justRegistered: boolean;
};

export function EstudiosPageClient({ courses, sessionNombre, justRegistered }: Props) {
  const { t } = useLocale();
  const guia = courses.find((c) => c.slug === GUIA_NACIONAL_SLUG);
  const biblioteca = courses.filter((c) => c.slug !== GUIA_NACIONAL_SLUG);

  return (
    <div className="page-container py-8 sm:py-12">
      {justRegistered && (
        <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/15 px-5 py-4 text-center text-sm text-navy">
          {t.estudios.welcomeBanner}
        </div>
      )}

      <header className="mb-10 max-w-2xl">
        {sessionNombre ? (
          <>
            <p className="text-xs font-semibold tracking-wider text-gold uppercase">
              {t.estudios.libraryEyebrow}
            </p>
            <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy">
              {t.estudios.hello} {sessionNombre}
            </h1>
            <p className="mt-3 text-navy/70 leading-relaxed">{t.estudios.loggedInBlurb}</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl sm:text-4xl text-navy">{t.estudios.guestTitle}</h1>
            <p className="mt-3 text-navy/70 leading-relaxed">{t.estudios.guestBlurb}</p>
          </>
        )}
      </header>

      {guia && (
        <section className="mb-10">
          <CourseCard course={guia} featured />
          {sessionNombre && guia.available && (
            <Link
              href={`/estudios/${GUIA_NACIONAL_SLUG}/1`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-navy-light"
            >
              {t.estudios.goLesson1}
            </Link>
          )}
        </section>
      )}

      {biblioteca.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl text-navy">{t.estudios.formationLibrary}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {biblioteca.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
