import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { getSession } from "@/lib/auth";
import { getCourseCatalog, GUIA_NACIONAL_SLUG } from "@/lib/courses";

type Props = {
  searchParams?: Promise<{ registrado?: string }>;
};

export default async function EstudiosPage({ searchParams }: Props) {
  const courses = getCourseCatalog();
  const session = await getSession();
  const params = searchParams ? await searchParams : {};
  const justRegistered = params.registrado === "1";
  const guia = courses.find((c) => c.slug === GUIA_NACIONAL_SLUG);
  const biblioteca = courses.filter((c) => c.slug !== GUIA_NACIONAL_SLUG);

  return (
    <div className="page-container py-8 sm:py-12">
      {justRegistered && (
        <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/15 px-5 py-4 text-center text-sm text-navy">
          ¡Bienvenida! Su cuenta está lista. Elija un curso para comenzar.
        </div>
      )}

      <header className="mb-10 max-w-2xl">
        {session ? (
          <>
            <p className="text-xs font-semibold tracking-wider text-gold uppercase">
              Biblioteca de estudios
            </p>
            <h1 className="mt-2 font-serif text-2xl sm:text-4xl text-navy">
              Hola, {session.nombre}
            </h1>
            <p className="mt-3 text-navy/70 leading-relaxed">
              Elija un curso o documento. Los estudios incluyen resumen, lectura y preguntas; los
              documentos de lectura muestran el material completo. Sus respuestas se guardan
              automáticamente.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl sm:text-4xl text-navy">Cursos de estudio</h1>
            <p className="mt-3 text-navy/70 leading-relaxed">
              Inicie sesión con su PIN para acceder a los cursos y guardar sus reflexiones.
            </p>
          </>
        )}
      </header>

      {guia && (
        <section className="mb-10">
          <CourseCard course={guia} featured />
          {session && guia.available && (
            <Link
              href={`/estudios/${GUIA_NACIONAL_SLUG}/1`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-navy-light"
            >
              Ir directo a la lección 1 de la Guía Nacional →
            </Link>
          )}
        </section>
      )}

      {biblioteca.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl text-navy">Biblioteca de formación</h2>
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
