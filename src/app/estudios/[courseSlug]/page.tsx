import { notFound } from "next/navigation";
import { CoursePageClient } from "@/components/CoursePageClient";
import { getCourse, getCourseMeta } from "@/lib/courses";
import { getRequestLocale } from "@/lib/locale-server";

type Props = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateStaticParams() {
  const { getAllCourseSlugs } = await import("@/lib/courses");
  return getAllCourseSlugs().map((courseSlug) => ({ courseSlug }));
}

export default async function CoursePage({ params }: Props) {
  const locale = await getRequestLocale();
  const { courseSlug } = await params;
  const meta = getCourseMeta(courseSlug, locale);
  if (!meta || !meta.available) notFound();

  const course = await getCourse(courseSlug, locale);
  if (!course || course.lessons.length === 0) notFound();

  const isReading = course.format === "reading" || meta.format === "reading";

  return (
    <CoursePageClient courseSlug={courseSlug} course={course} isReading={isReading} />
  );
}
