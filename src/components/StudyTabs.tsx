"use client";

import { useState } from "react";
import type { ContentBlock, Lesson } from "@/types/course";
import { useLocale } from "@/components/LocaleProvider";
import { normalizeParagraph } from "@/lib/studies";
import { QuestionsForm } from "./QuestionsForm";

type Tab = "resumen" | "lectura" | "preguntas";

type Props = {
  lesson: Lesson;
  courseSlug: string;
};

function renderBlock(block: ContentBlock, index: number, imageAlt: string) {
  if (typeof block === "string") {
    const text = normalizeParagraph(block);
    const isQuote =
      text.includes("Anónimo") || (text.length < 200 && text.split("\n").length > 2);
    if (isQuote && text.length < 350) {
      return (
        <blockquote
          key={index}
          className="my-6 border-l-4 border-gold pl-6 font-serif text-lg italic text-navy/80"
        >
          {text.replace(/\s*Anónimo\s*$/i, "").trim()}
        </blockquote>
      );
    }
    return (
      <p key={index} className="whitespace-pre-wrap text-navy/85">
        {text}
      </p>
    );
  }

  if (block.type === "heading") {
    const level = block.level ?? 2;
    const className =
      level <= 1
        ? "mt-8 mb-3 font-serif text-xl sm:text-2xl text-navy leading-snug"
        : "mt-8 mb-3 font-serif text-lg sm:text-xl text-navy leading-snug";
    return (
      <h3 key={index} className={className}>
        {block.text}
      </h3>
    );
  }

  if (block.type === "image") {
    return (
      <figure key={index} className="my-6 overflow-hidden rounded-xl border border-navy/10 bg-cream/40 sm:my-8">
        <img
          src={block.src}
          alt={block.alt ?? imageAlt}
          className="h-auto w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </figure>
    );
  }

  return null;
}

export function StudyTabs({ lesson, courseSlug }: Props) {
  const { t } = useLocale();
  const S = t.studyTabs;
  const [tab, setTab] = useState<Tab>("resumen");

  const tabs: { id: Tab; label: string }[] = [
    { id: "resumen", label: S.summary },
    { id: "lectura", label: S.reading },
    { id: "preguntas", label: S.questions },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 border-b border-navy/10 pb-4 sm:flex sm:flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full px-2 py-2.5 text-xs font-medium transition-all touch-manipulation sm:px-5 sm:text-sm sm:w-auto ${
              tab === t.id
                ? "bg-navy text-white shadow-md"
                : "bg-white text-navy/70 hover:bg-navy/5"
            }`}
          >
            {t.label}
            {t.id === "preguntas" && lesson.questions.length > 0 && (
              <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">
                {lesson.questions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 animate-fade-up">
        {tab === "resumen" && (
          <section className="rounded-2xl border border-gold/30 bg-gradient-to-br from-white to-cream p-5 sm:p-8">
            <h2 className="font-serif text-2xl text-navy mb-4">{S.summaryTitle}</h2>
            <p className="text-lg leading-relaxed text-navy/90">{lesson.summary}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-navy/5 p-4">
                <p className="text-xs font-semibold tracking-wider text-gold uppercase">{S.section}</p>
                <p className="mt-1 text-navy">{lesson.part}</p>
              </div>
              <div className="rounded-xl bg-navy/5 p-4">
                <p className="text-xs font-semibold tracking-wider text-gold uppercase">{S.focus}</p>
                <p className="mt-1 text-navy">{lesson.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab("lectura")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-light"
            >
              {S.goReading}
            </button>
          </section>
        )}

        {tab === "lectura" && (
          <section className="prose-study max-w-none rounded-2xl bg-white p-5 sm:p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-navy mb-6">{S.material}</h2>
            {lesson.content.length === 0 ? (
              <p className="text-navy/60 italic">{S.emptyContent}</p>
            ) : (
              lesson.content.map((block, i) => renderBlock(block, i, S.imageAlt))
            )}
          </section>
        )}

        {tab === "preguntas" && (
          <section>
            <div className="mb-6 rounded-xl bg-navy/5 border border-navy/10 p-4 text-sm text-navy/80">
              <p>{S.questionsIntro}</p>
            </div>
            <QuestionsForm
              studyId={lesson.id}
              courseSlug={courseSlug}
              questions={lesson.questions}
            />
          </section>
        )}
      </div>
    </div>
  );
}
