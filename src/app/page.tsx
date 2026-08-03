import Image from "next/image";
import Link from "next/link";
import { PwaInstallButton } from "@/components/PwaInstallButton";
import { data, getStudies } from "@/lib/studies";

function CrossOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`w-8 h-8 text-gold ${className}`} aria-hidden>
      <path
        fill="currentColor"
        d="M14 2h4v10h10v4H18v10h-4V16H4v-4h10V2z"
        opacity="0.7"
      />
    </svg>
  );
}

export default function HomePage() {
  const studies = getStudies();
  const { intro } = data;

  return (
    <>
      {/* Hero — solo visitantes sin sesión (con sesión el middleware envía a /estudios) */}
      <section className="relative min-h-[100dvh] sm:min-h-[90vh] overflow-hidden bg-navy text-white">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201, 162, 39, 0.15) 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 100% 50%, rgba(10, 74, 143, 0.4) 0%, transparent 50%),
              linear-gradient(180deg, #001a3d 0%, #002d62 45%, #002d62 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20">
          <p className="animate-fade-up mb-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] text-gold uppercase max-w-[280px] sm:max-w-none">
            <span className="hidden sm:block h-px w-8 bg-gold/50 shrink-0" />
            <span>La Orden de las Hijas del Rey</span>
            <span className="hidden sm:block h-px w-8 bg-gold/50 shrink-0" />
          </p>

          <div className="animate-fade-up home-logo-stage relative mb-10">
            <div className="home-logo-rays" aria-hidden />
            <div className="home-logo-glow" aria-hidden />
            <div className="home-logo-ring home-logo-ring-a" aria-hidden />
            <div className="home-logo-ring home-logo-ring-b" aria-hidden />
            <span className="home-logo-spark" style={{ top: "10%", left: "18%" }} aria-hidden />
            <span
              className="home-logo-spark"
              style={{ top: "16%", right: "14%", animationDelay: "0.5s" }}
              aria-hidden
            />
            <span
              className="home-logo-spark"
              style={{ bottom: "14%", left: "22%", animationDelay: "1s" }}
              aria-hidden
            />
            <span
              className="home-logo-spark"
              style={{ bottom: "18%", right: "18%", animationDelay: "1.4s" }}
              aria-hidden
            />
            <div className="home-logo-frame">
              <Image
                src="/logo.jpeg"
                alt="La Orden de las Hijas del Rey"
                width={220}
                height={220}
                className="h-auto w-[min(220px,70vw)] rounded-2xl"
                priority
              />
            </div>
          </div>

          <h1
            className="animate-fade-up max-w-4xl text-center font-serif text-3xl leading-[1.2] sm:text-5xl lg:text-6xl px-1"
            style={{ animationDelay: "80ms" }}
          >
            {intro.title}
          </h1>
          <p className="animate-fade-up mt-5 max-w-2xl text-center text-lg text-white/80 sm:text-xl">
            {intro.subtitle}
          </p>
          <p className="animate-fade-up mt-6 max-w-2xl text-center text-base leading-relaxed text-white/65">
            {intro.description}
          </p>

          <div
            className="animate-fade-up mt-8 sm:mt-10 flex w-full max-w-sm sm:max-w-none flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-5 px-2 sm:px-0"
            style={{ animationDelay: "160ms" }}
          >
            <Link
              href="/registro"
              className="w-full sm:w-auto sm:min-w-[200px] rounded-full bg-gold px-8 py-3.5 sm:px-10 sm:py-4 text-center text-sm sm:text-base font-semibold text-navy-dark shadow-lg shadow-gold/20 transition hover:bg-gold-light"
            >
              Crear mi cuenta
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto sm:min-w-[200px] rounded-full border border-white/25 bg-white/5 px-8 py-3.5 sm:px-10 sm:py-4 text-center text-sm sm:text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Entrar con PIN
            </Link>
            <div className="flex w-full justify-center sm:w-auto">
              <PwaInstallButton />
            </div>
          </div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      {/* Escritura */}
      <section className="relative -mt-8 bg-cream px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <CrossOrnament className="mx-auto mb-6" />
          <blockquote className="font-serif text-xl leading-relaxed text-navy/90 italic sm:text-3xl px-2">
            {intro.scripture.replace(" — ", "\n— ")}
          </blockquote>
          <div className="mx-auto mt-8 flex justify-center gap-2">
            <span className="h-px w-16 bg-gold/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-px w-16 bg-gold/40" />
          </div>
        </div>
      </section>

      {/* Los 12 estudios */}
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Su camino</p>
            <h2 className="mt-3 font-serif text-2xl sm:text-4xl text-navy px-2">Doce semanas de preparación</h2>
            <p className="mx-auto mt-4 max-w-xl text-navy/60">
              Cada sesión incluye lectura, reflexión y preguntas para compartir en comunidad.
              Inicie sesión para guardar sus respuestas en la nube.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <div
                key={study.id}
                className="group rounded-2xl border border-navy/8 bg-cream/50 p-6 transition hover:border-gold/30 hover:shadow-md"
              >
                <span className="font-serif text-3xl text-navy/10 group-hover:text-gold/30 transition">
                  {String(study.id).padStart(2, "0")}
                </span>
                <p className="mt-2 text-[10px] font-semibold tracking-wider text-gold uppercase">
                  {study.part}
                </p>
                <h3 className="mt-1 font-serif text-lg text-navy leading-snug">{study.title}</h3>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/login?from=/estudios"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3.5 font-medium text-white transition hover:bg-navy-light"
            >
              Acceder a los estudios
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Propósito */}
      <section className="bg-cream px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl text-navy text-center mb-3">Propósito de la guía</h2>
          <p className="text-center text-navy/55 mb-12">Fundamentos de su preparación espiritual</p>
          <ul className="grid gap-5 sm:grid-cols-2">
            {intro.purposes.map((purpose, i) => (
              <li
                key={i}
                className="flex gap-5 rounded-2xl border border-navy/8 bg-white p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-lg text-gold">
                  {i + 1}
                </span>
                <p className="text-navy/85 leading-relaxed pt-2">{purpose}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lema */}
      <section className="relative overflow-hidden bg-navy px-4 py-24 sm:px-6 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.12)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="font-serif text-2xl sm:text-3xl tracking-wide text-gold-light">
            {intro.motto}
          </p>
          <p className="mt-4 text-lg text-white/75">{intro.mottoTranslation}</p>
          <p className="mt-6 text-sm font-medium tracking-widest text-gold">{intro.initials}</p>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-16 sm:px-6 bg-cream border-t border-navy/5">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-navy/70 mb-6">
            Cuando esté lista, cree su cuenta y comience el Estudio Uno con su PIN personal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/registro"
              className="rounded-full bg-gold px-8 py-3 font-semibold text-navy-dark hover:bg-gold-light transition"
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-navy/20 px-8 py-3 font-medium text-navy hover:bg-navy/5 transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
