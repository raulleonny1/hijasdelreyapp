import Link from "next/link";
import { notFound } from "next/navigation";
import { StudyTabs } from "@/components/StudyTabs";
import { getStudies, getStudy } from "@/lib/studies";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getStudies().map((s) => ({ id: String(s.id) }));
}

export default async function StudyPage({ params }: Props) {
  const { id } = await params;
  const studyId = Number(id);
  const study = getStudy(studyId);

  if (!study) notFound();

  const prev = studyId > 1 ? studyId - 1 : null;
  const next = studyId < 12 ? studyId + 1 : null;

  return (
    <div className="page-container max-w-4xl py-6 sm:py-10">
      <Link
        href="/estudios"
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition"
      >
        ← Todos los estudios
      </Link>

      <header className="mt-6 mb-10">
        <p className="text-xs font-semibold tracking-wider text-gold uppercase">{study.part}</p>
        <p className="mt-2 font-serif text-sm text-navy/50">Estudio {study.id} de 12</p>
        <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy leading-snug">{study.title}</h1>
        <p className="mt-2 text-base sm:text-lg text-navy/70">{study.subtitle}</p>
      </header>

      <StudyTabs study={study} />

      <nav className="mt-12 sm:mt-16 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4 border-t border-navy/10 pt-6 sm:pt-8">
        {prev ? (
          <Link
            href={`/estudios/${prev}`}
            className="rounded-full border border-navy/20 px-4 py-2.5 text-center text-sm text-navy hover:bg-navy/5 sm:px-5"
          >
            ← Estudio {prev}
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={`/estudios/${next}`}
            className="rounded-full bg-navy px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-navy-light sm:px-5"
          >
            Estudio {next} →
          </Link>
        ) : (
          <p className="text-sm text-navy/50 text-center sm:text-left">¡Has completado la guía!</p>
        )}
      </nav>
    </div>
  );
}
