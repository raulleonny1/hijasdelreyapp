import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StudyTabs } from "@/components/StudyTabs";
import { getAllCourseSlugs, getCourse, getCourseMeta, getLesson } from "@/lib/courses";

type Props = {
  params: Promise<{ courseSlug: string; lessonId: string }>;
};

export async function generateStaticParams() {
  const slugs = getAllCourseSlugs();
  const params: { courseSlug: string; lessonId: string }[] = [];

  for (const courseSlug of slugs) {
    const course = await getCourse(courseSlug);
    if (!course) continue;
    for (const lesson of course.lessons) {
      params.push({ courseSlug, lessonId: String(lesson.id) });
    }
  }

  return params;
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonId: lessonIdStr } = await params;
  const lessonId = Number(lessonIdStr);
  const meta = getCourseMeta(courseSlug);

  if (!meta || !meta.available || Number.isNaN(lessonId)) notFound();

  const course = await getCourse(courseSlug);
  if (!course) notFound();

  // Documentos de lectura se muestran enteros en /estudios/[slug]
  if (course.format === "reading" || meta.format === "reading") {
    redirect(`/estudios/${courseSlug}`);
  }

  const lesson = await getLesson(courseSlug, lessonId);
  if (!lesson) notFound();

  const total = course.lessons.length;
  const prev = lessonId > 1 ? lessonId - 1 : null;
  const next = lessonId < total ? lessonId + 1 : null;

  return (
    <div className="page-container max-w-4xl py-6 sm:py-10">
      <Link
        href={`/estudios/${courseSlug}`}
        className="inline-flex items-center gap-1 text-sm text-navy/60 transition hover:text-navy"
      >
        ← {meta.title}
      </Link>

      <header className="mt-6 mb-10">
        <p className="text-xs font-semibold tracking-wider text-gold uppercase">{lesson.part}</p>
        <p className="mt-2 font-serif text-sm text-navy/50">
          Lección {lesson.id} de {total}
        </p>
        <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy leading-snug">
          {lesson.title}
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
            ← Lección {prev}
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={`/estudios/${courseSlug}/${next}`}
            className="rounded-full bg-navy px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-navy-light sm:px-5"
          >
            Lección {next} →
          </Link>
        ) : (
          <p className="text-center text-sm text-navy/50 sm:text-left">¡Ha completado este curso!</p>
        )}
      </nav>
    </div>
  );
}
