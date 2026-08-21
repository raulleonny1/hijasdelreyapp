import { notFound, redirect } from "next/navigation";
import { LessonPageClient } from "@/components/LessonPageClient";
import { getAllCourseSlugs, getCourse, getCourseMeta, getLesson } from "@/lib/courses";
import { getRequestLocale } from "@/lib/locale-server";

type Props = {
  params: Promise<{ courseSlug: string; lessonId: string }>;
};

export async function generateStaticParams() {
  const slugs = getAllCourseSlugs();
  const params: { courseSlug: string; lessonId: string }[] = [];

  for (const courseSlug of slugs) {
    const course = await getCourse(courseSlug, "es");
    if (!course) continue;
    for (const lesson of course.lessons) {
      params.push({ courseSlug, lessonId: String(lesson.id) });
    }
  }

  return params;
}

export default async function LessonPage({ params }: Props) {
  const locale = await getRequestLocale();
  const { courseSlug, lessonId: lessonIdStr } = await params;
  const lessonId = Number(lessonIdStr);
  const meta = getCourseMeta(courseSlug, locale);

  if (!meta || !meta.available || Number.isNaN(lessonId)) notFound();

  const course = await getCourse(courseSlug, locale);
  if (!course) notFound();

  if (course.format === "reading" || meta.format === "reading") {
    redirect(`/estudios/${courseSlug}`);
  }

  const lesson = await getLesson(courseSlug, lessonId, locale);
  if (!lesson) notFound();

  const total = course.lessons.length;
  const prev = lessonId > 1 ? lessonId - 1 : null;
  const next = lessonId < total ? lessonId + 1 : null;

  return (
    <LessonPageClient
      courseSlug={courseSlug}
      lesson={lesson}
      total={total}
      courseTitle={meta.title}
      prev={prev}
      next={next}
    />
  );
}
