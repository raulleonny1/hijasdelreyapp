import { StudyCard } from "@/components/StudyCard";
import { getStudies } from "@/lib/studies";

export default function EstudiosPage() {
  const studies = getStudies();

  return (
    <div className="page-container py-8 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <h1 className="font-serif text-2xl sm:text-4xl text-navy">Los doce estudios</h1>
        <p className="mt-3 max-w-2xl text-navy/70 leading-relaxed">
          Cada sesión incluye un resumen, el material de lectura y preguntas para reflexionar. Sus
          respuestas se guardan de forma privada en su dispositivo.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {studies.map((study, i) => (
          <StudyCard key={study.id} study={study} index={i} />
        ))}
      </div>
    </div>
  );
}
