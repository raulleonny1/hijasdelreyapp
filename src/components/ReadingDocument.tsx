import type { ContentBlock, ContentHeading } from "@/types/course";

type Props = {
  title: string;
  subtitle?: string;
  author?: string;
  content: ContentBlock[];
};

function headingClass(level: number): string {
  if (level <= 1) {
    return "mt-10 mb-3 scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] font-serif text-[1.35rem] sm:mt-12 sm:mb-4 sm:text-3xl text-navy leading-snug border-b border-gold/30 pb-3";
  }
  if (level === 2) {
    return "mt-8 mb-3 scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] font-serif text-[1.2rem] sm:mt-10 sm:text-2xl text-navy leading-snug";
  }
  return "mt-6 mb-2 scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] font-serif text-[1.1rem] sm:mt-8 sm:text-xl text-navy/90 leading-snug";
}

function isHeading(block: ContentBlock): block is ContentHeading {
  return typeof block === "object" && block !== null && block.type === "heading";
}

export function ReadingDocument({ title, subtitle, author, content }: Props) {
  const toc = content.filter(isHeading).filter((h) => (h.level ?? 2) <= 2).slice(0, 24);

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8 border-b border-navy/10 pb-6 sm:mb-10 sm:pb-8">
        <p className="text-xs font-semibold tracking-wider text-gold uppercase">
          Documento de lectura
        </p>
        <h1 className="mt-3 font-serif text-[1.75rem] leading-snug text-navy sm:text-4xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-base text-navy/65 sm:text-lg">{subtitle}</p> : null}
        {author ? <p className="mt-2 text-sm text-navy/50">{author}</p> : null}
      </header>

      {toc.length > 4 && (
        <nav
          aria-label="Índice"
          className="mb-8 rounded-2xl border border-navy/10 bg-cream/60 p-4 sm:mb-10 sm:p-6"
        >
          <p className="mb-2 text-xs font-semibold tracking-wider text-gold uppercase">Contenido</p>
          <ol className="space-y-1 text-sm text-navy/80 sm:space-y-2">
            {toc.map((h, i) => (
              <li key={`${h.text}-${i}`} className={(h.level ?? 2) > 1 ? "pl-3" : ""}>
                <a
                  href={`#sec-${i}`}
                  className="block min-h-11 py-2.5 leading-snug transition hover:text-navy active:text-navy touch-manipulation"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="reading-doc">
        {(() => {
          let tocIndex = 0;
          return content.map((block, index) => {
            if (typeof block === "string") {
              return (
                <p
                  key={index}
                  className="mb-4 whitespace-pre-wrap text-base leading-[1.75] text-navy/85 sm:text-[1.05rem] sm:leading-[1.8]"
                >
                  {block}
                </p>
              );
            }

            if (block.type === "heading") {
              const level = block.level ?? 2;
              const Tag = (level <= 1 ? "h2" : level === 2 ? "h3" : "h4") as
                | "h2"
                | "h3"
                | "h4";
              const id =
                level <= 2
                  ? (() => {
                      const current = tocIndex;
                      tocIndex += 1;
                      return `sec-${current}`;
                    })()
                  : undefined;
              return (
                <Tag key={index} id={id} className={headingClass(level)}>
                  {block.text}
                </Tag>
              );
            }

            if (block.type === "image") {
              return (
                <figure
                  key={index}
                  className="my-6 -mx-4 overflow-hidden border-y border-navy/10 bg-cream/40 sm:mx-0 sm:my-8 sm:rounded-2xl sm:border sm:shadow-sm"
                >
                  {/* Imágenes del documento: <img> nativo para mejor compatibilidad móvil */}
                  <img
                    src={block.src}
                    alt={block.alt ?? "Imagen del documento"}
                    className="h-auto w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              );
            }

            return null;
          });
        })()}
      </div>
    </article>
  );
}
