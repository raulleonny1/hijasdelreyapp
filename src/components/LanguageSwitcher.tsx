"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/lib/i18n";

type Props = {
  /** header = barra superior (oscuro); auth = login/registro (claro) */
  variant?: "header" | "auth";
};

export function LanguageSwitcher({ variant = "header" }: Props) {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();

  const choose = (code: Locale) => {
    if (code === locale) return;
    setLocale(code);
    router.refresh();
  };

  const btn = (code: Locale, short: string) => {
    const active = locale === code;
    if (variant === "auth") {
      return (
        <button
          type="button"
          onClick={() => choose(code)}
          aria-pressed={active}
          aria-label={code === "es" ? t.language.es : t.language.en}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            active
              ? "bg-navy text-white"
              : "border border-navy/20 text-navy/70 hover:bg-navy/5"
          }`}
        >
          {short}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => choose(code)}
        aria-pressed={active}
        aria-label={code === "es" ? t.language.es : t.language.en}
        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition sm:px-2.5 sm:text-xs ${
          active
            ? "bg-gold text-navy-dark"
            : "border border-white/20 text-white/80 hover:bg-white/10"
        }`}
      >
        {short}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t.language.group}>
      {btn("es", "ES")}
      {btn("en", "EN")}
    </div>
  );
}
