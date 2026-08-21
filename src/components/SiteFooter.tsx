"use client";

import { useLocale } from "@/components/LocaleProvider";

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="mt-16 border-t border-navy/10 bg-navy py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center text-sm text-white/70 px-4">
      <p className="font-serif text-gold-light">MAGNANIMITER CRUCEM SUSTINE</p>
      <p className="mt-1 text-xs">{t.footerEdition}</p>
    </footer>
  );
}
