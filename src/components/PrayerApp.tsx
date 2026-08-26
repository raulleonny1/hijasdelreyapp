"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { PrayerRequest } from "@/types/prayer";

type Tab = "read" | "publish" | "mine";

type SessionUser = {
  id: string;
  nombre: string;
  apellido: string;
};

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function PrayerApp({ user }: { user: SessionUser }) {
  const { locale, t } = useLocale();
  const P = t.prayer;
  const [tab, setTab] = useState<Tab>("read");
  const [shared, setShared] = useState<PrayerRequest[]>([]);
  const [mine, setMine] = useState<PrayerRequest[]>([]);
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const loadShared = useCallback(async () => {
    const res = await fetch("/api/prayer");
    if (!res.ok) throw new Error("load");
    const data = await res.json();
    setShared(data.requests ?? []);
  }, []);

  const loadMine = useCallback(async () => {
    const res = await fetch("/api/prayer?mine=1");
    if (!res.ok) throw new Error("load");
    const data = await res.json();
    setMine(data.requests ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await loadShared();
      } catch {
        if (!cancelled) setError(P.loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadShared, P.loadError]);

  useEffect(() => {
    if (tab !== "mine") return;
    let cancelled = false;
    (async () => {
      try {
        await loadMine();
      } catch {
        if (!cancelled) setError(P.loadError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, loadMine, P.loadError]);

  const publish = async () => {
    if (saving) return;
    setError(null);
    setOkMsg(null);
    if (!text.trim()) {
      setError(P.errEmpty);
      return;
    }
    if (!consent) {
      setError(P.errConsent);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/prayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), shareWithOthers: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : P.publishError);
        return;
      }
      setText("");
      setConsent(false);
      setOkMsg(P.published);
      setTab("read");
      await loadShared();
      await loadMine().catch(() => undefined);
    } catch {
      setError(P.publishError);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(P.confirmDelete)) return;
    try {
      const res = await fetch(`/api/prayer/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(P.deleteError);
        return;
      }
      setMine((prev) => prev.filter((p) => p.id !== id));
      setShared((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError(P.deleteError);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "read", label: P.tabRead },
    { id: "publish", label: P.tabPublish },
    { id: "mine", label: P.tabMine },
  ];

  return (
    <div className="page-container py-4 sm:py-6">
      <div className="mb-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">
          {t.brandShort}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-navy sm:text-3xl">{P.title}</h1>
        <p className="mt-2 text-sm text-navy/65 leading-relaxed">{P.subtitle}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-1 rounded-full border border-navy/10 bg-white p-1 shadow-sm sm:inline-flex">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setError(null);
              setOkMsg(null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
              tab === item.id
                ? "bg-navy text-white"
                : "text-navy/70 hover:bg-cream"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-3 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p className="mb-3 max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {okMsg}
        </p>
      ) : null}

      {loading && tab === "read" ? (
        <p className="text-sm text-navy/50">{P.loading}</p>
      ) : null}

      {tab === "read" && !loading ? (
        <div className="mx-auto max-w-2xl space-y-3">
          {shared.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white px-5 py-10 text-center text-sm text-navy/50">
              {P.emptyShared}
            </div>
          ) : (
            shared.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-gold/30 bg-white px-4 py-4 shadow-sm sm:px-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">
                    {item.authorId === user.id ? P.you : item.authorName}
                  </p>
                  <time className="text-xs text-navy/40">
                    {formatDate(item.createdAt, locale)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy/80">
                  {item.text}
                </p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-gold">
                  {P.sharedBadge}
                </p>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "publish" ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-6">
          <label className="block text-sm font-medium text-navy" htmlFor="prayer-text">
            {P.yourRequest}
          </label>
          <textarea
            id="prayer-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder={P.placeholder}
            className="mt-2 w-full resize-y rounded-xl border border-navy/15 bg-cream/40 px-3 py-2.5 text-sm text-navy outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
          />
          <p className="mt-1 text-right text-[11px] text-navy/40">{text.length}/2000</p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-navy/10 bg-cream/50 px-3 py-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
            />
            <span className="text-sm leading-snug text-navy/80">{P.consentLabel}</span>
          </label>
          <p className="mt-2 text-xs text-navy/45">{P.consentHint}</p>

          <button
            type="button"
            disabled={saving}
            onClick={() => void publish()}
            className="mt-5 w-full rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-50 sm:w-auto"
          >
            {saving ? P.publishing : P.publish}
          </button>
        </div>
      ) : null}

      {tab === "mine" ? (
        <div className="mx-auto max-w-2xl space-y-3">
          {mine.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white px-5 py-10 text-center text-sm text-navy/50">
              {P.emptyMine}
            </div>
          ) : (
            mine.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-navy/10 bg-white px-4 py-4 shadow-sm sm:px-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <time className="text-xs text-navy/40">
                    {formatDate(item.createdAt, locale)}
                  </time>
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    className="text-xs font-medium text-red-700 hover:underline"
                  >
                    {P.delete}
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy/80">
                  {item.text}
                </p>
                <p className="mt-2 text-[11px] text-navy/45">
                  {item.shareWithOthers ? P.sharedBadge : P.privateBadge}
                </p>
              </article>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
