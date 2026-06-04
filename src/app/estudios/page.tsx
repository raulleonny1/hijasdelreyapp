import Link from "next/link";
import { StudyCard } from "@/components/StudyCard";
import { getSession } from "@/lib/auth";
import { getStudies } from "@/lib/studies";

type Props = {
  searchParams?: Promise<{ registrado?: string }>;
};

export default async function EstudiosPage({ searchParams }: Props) {
  const studies = getStudies();
  const session = await getSession();
  const params = searchParams ? await searchParams : {};
  const justRegistered = params.registrado === "1";

  return (
    <div className="page-container py-8 sm:py-12">
      {justRegistered && (
        <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/15 px-5 py-4 text-center text-sm text-navy">
          ¡Bienvenida! Su cuenta está lista. Elija un estudio para comenzar.
        </div>
      )}

      <div className="mb-8 sm:mb-12">
        {session ? (
          <>
            <p className="text-xs font-semibold tracking-wider text-gold uppercase">
              Su guía de estudio
            </p>
            <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy">
              Hola, {session.nombre}
            </h1>
            <p className="mt-3 max-w-2xl text-navy/70 leading-relaxed">
              Los doce estudios están listos. Cada sesión incluye resumen, lectura y preguntas.
              Sus respuestas se guardan en la nube.
            </p>
            <Link
              href="/estudios/1"
              className="mt-6 inline-flex rounded-full bg-navy px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-light"
            >
              Continuar con el Estudio 1 →
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl sm:text-4xl text-navy">Los doce estudios</h1>
            <p className="mt-3 max-w-2xl text-navy/70 leading-relaxed">
              Inicie sesión con su PIN para acceder a los estudios y guardar sus reflexiones.
            </p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {studies.map((study, i) => (
          <StudyCard key={study.id} study={study} index={i} />
        ))}
      </div>
    </div>
  );
}
