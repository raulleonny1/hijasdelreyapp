"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "@/types/study";

type Props = {
  studyId: number;
  questions: Question[];
};

function calcProgress(answers: Record<number, string>, total: number): number {
  if (total === 0) return 0;
  const answered = Object.values(answers).filter((v) => v.trim().length > 0).length;
  return Math.round((answered / total) * 100);
}

export function QuestionsForm({ studyId, questions }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/answers?studyId=${studyId}`)
      .then((r) => (r.ok ? r.json() : { answers: {} }))
      .then((d) => {
        const a = d.answers ?? {};
        setAnswers(a);
        setProgress(calcProgress(a, questions.length));
      })
      .catch(() => setAnswers({}))
      .finally(() => setLoading(false));
  }, [studyId, questions.length]);

  const persistAnswer = useCallback(
    (questionId: number, value: string) => {
      fetch("/api/answers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyId, questionId, value }),
      }).then(() => {
        setSaved(questionId);
        setTimeout(() => setSaved(null), 1500);
      });
    },
    [studyId],
  );

  const handleChange = useCallback(
    (questionId: number, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value };
        setProgress(calcProgress(next, questions.length));
        return next;
      });

      if (saveTimers.current[questionId]) {
        clearTimeout(saveTimers.current[questionId]);
      }
      saveTimers.current[questionId] = setTimeout(() => {
        persistAnswer(questionId, value);
      }, 600);
    },
    [questions.length, persistAnswer],
  );

  if (loading) {
    return (
      <p className="rounded-xl bg-white p-8 text-center text-navy/60">Cargando sus respuestas…</p>
    );
  }

  if (questions.length === 0) {
    return (
      <p className="rounded-xl bg-white p-8 text-center text-navy/60">
        Las preguntas de este estudio se están preparando. Consulte la guía impresa mientras tanto.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-navy/70">Progreso en este estudio</span>
        <span className="font-semibold text-navy">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-navy/10">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {questions.map((q) => (
        <label
          key={q.id}
          className="block rounded-2xl border border-navy/10 bg-white p-4 sm:p-6 shadow-sm transition focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold/20"
        >
          <span className="mb-3 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
              {q.id}
            </span>
            <span className="pt-1 text-navy leading-snug">{q.text}</span>
          </span>
          <textarea
            rows={4}
            value={answers[q.id] ?? ""}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder="Escriba su reflexión aquí…"
            className="mt-2 w-full resize-y rounded-xl border border-navy/15 bg-cream/50 px-4 py-3 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/30"
          />
          {saved === q.id && (
            <p className="mt-2 text-xs text-gold">Guardado en Firebase</p>
          )}
        </label>
      ))}
    </div>
  );
}
