import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonCard } from "@/components/LessonCard";
import { getCourse, getCourseMeta } from "@/lib/courses";

type Props = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateStaticParams() {
  const { getAllCourseSlugs } = await import("@/lib/courses");
  return getAllCourseSlugs().map((courseSlug) => ({ courseSlug }));
}

export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params;
  const meta = getCourseMeta(courseSlug);
  if (!meta || !meta.available) notFound();

  const course = await getCourse(courseSlug);
  if (!course || course.lessons.length === 0) notFound();

  return (
    <div className="page-container py-8 sm:py-12">
      <Link
        href="/estudios"
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition"
      >
        ← Todos los cursos
      </Link>

      <header className="mt-6 mb-10 max-w-3xl">
        <p className="text-xs font-semibold tracking-wider text-gold uppercase">{course.category}</p>
        <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy leading-snug">
          {course.title}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-navy/70">{course.subtitle}</p>
        <p className="mt-1 text-sm text-navy/50">{course.author}</p>
        <p className="mt-4 text-navy/70 leading-relaxed">{course.description}</p>
        <p className="mt-4 text-sm text-navy/50">
          {course.lessonCount} lecciones
          {course.estimatedWeeks ? ` · ~${course.estimatedWeeks} semanas sugeridas` : ""}
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
