"use client";

import { useState } from "react";
import type { Lesson } from "@/types/course";
import { normalizeParagraph } from "@/lib/studies";
import { QuestionsForm } from "./QuestionsForm";

type Tab = "resumen" | "lectura" | "preguntas";

type Props = {
  lesson: Lesson;
  courseSlug: string;
};

export function StudyTabs({ lesson, courseSlug }: Props) {
  const [tab, setTab] = useState<Tab>("resumen");

  const tabs: { id: Tab; label: string }[] = [
    { id: "resumen", label: "Resumen" },
    { id: "lectura", label: "Lectura" },
    { id: "preguntas", label: "Preguntas" },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 border-b border-navy/10 pb-4 sm:flex sm:flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-2 py-2.5 text-xs font-medium transition-all sm:px-5 sm:text-sm sm:w-auto ${
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
            <h2 className="font-serif text-2xl text-navy mb-4">Resumen del estudio</h2>
            <p className="text-lg leading-relaxed text-navy/90">{lesson.summary}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-navy/5 p-4">
                <p className="text-xs font-semibold tracking-wider text-gold uppercase">Sección</p>
                <p className="mt-1 text-navy">{lesson.part}</p>
              </div>
              <div className="rounded-xl bg-navy/5 p-4">
                <p className="text-xs font-semibold tracking-wider text-gold uppercase">Enfoque</p>
                <p className="mt-1 text-navy">{lesson.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab("preguntas")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-light"
            >
              Ir a las preguntas de reflexión
            </button>
          </section>
        )}

        {tab === "lectura" && (
          <section className="prose-study max-w-none rounded-2xl bg-white p-5 sm:p-8 shadow-sm">
            <h2 className="font-serif text-2xl text-navy mb-6">Material de estudio</h2>
            {lesson.content.length === 0 ? (
              <p className="text-navy/60 italic">
                El contenido de esta lección se encuentra en el material impreso. Utilice la sección de
                preguntas para su reflexión.
              </p>
            ) : (
              lesson.content.map((para, i) => {
                const text = normalizeParagraph(para);
                const isQuote =
                  text.includes("Anónimo") ||
                  (text.length < 200 && text.split("\n").length > 2);
                if (isQuote && text.length < 350) {
                  return (
                    <blockquote
                      key={i}
                      className="my-6 border-l-4 border-gold pl-6 font-serif text-lg italic text-navy/80"
                    >
                      {text.replace(/\s*Anónimo\s*$/i, "").trim()}
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="text-navy/85">
                    {text}
                  </p>
                );
              })
            )}
          </section>
        )}

        {tab === "preguntas" && (
          <section>
            <div className="mb-6 rounded-xl bg-navy/5 border border-navy/10 p-4 text-sm text-navy/80">
              <p>
                No hay respuestas correctas o incorrectas. Sus reflexiones se guardan en este
                dispositivo de forma privada. Prepárese para compartir con su grupo cuando lo
                desee.
              </p>
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
