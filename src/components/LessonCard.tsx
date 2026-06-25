import Link from "next/link";
import type { Lesson } from "@/types/course";

type Props = {
  lesson: Lesson;
  courseSlug: string;
  index: number;
  total: number;
};

export function LessonCard({ lesson, courseSlug, index, total }: Props) {
  return (
    <Link
      href={`/estudios/${courseSlug}/${lesson.id}`}
      className="group block w-full rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg"
    >
      <span className="absolute top-4 right-4 font-serif text-4xl text-navy/8 group-hover:text-gold/20">
        {String(lesson.id).padStart(2, "0")}
      </span>
      <p className="mb-1 text-xs font-semibold tracking-wider text-gold uppercase">{lesson.part}</p>
      <h3 className="font-serif text-xl text-navy pr-12">{lesson.title}</h3>
      <p className="mt-2 text-sm text-navy/70">{lesson.subtitle}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-navy/50">
        <span>
          Lección {lesson.id} de {total}
        </span>
        <span>·</span>
        <span>{lesson.questions.length} preguntas</span>
        <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  );
}
