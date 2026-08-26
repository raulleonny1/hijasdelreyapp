"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { CHAT_UNREAD_EVENT } from "@/lib/chat-constants";

type User = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
};

const AUTH_PAGES = ["/login", "/registro"];

export function Header() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [unread, setUnread] = useState(0);
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  const refreshUnread = useCallback(() => {
    fetch("/api/chat/unread")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.total === "number") {
          setUnread(Math.max(0, d.total));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isAuthPage || isAdminPage) return;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, [pathname, isAuthPage, isAdminPage]);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    refreshUnread();
    const id = setInterval(refreshUnread, 4000);
    const onRefresh = () => refreshUnread();
    window.addEventListener(CHAT_UNREAD_EVENT, onRefresh);
    return () => {
      clearInterval(id);
      window.removeEventListener(CHAT_UNREAD_EVENT, onRefresh);
    };
  }, [user, refreshUnread]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (isAuthPage || isAdminPage) return null;

  const homeHref = user ? "/estudios" : "/";
  const studiesActive =
    pathname === "/estudios" || pathname.startsWith("/estudios/");
  const chatActive = pathname === "/chat" || pathname.startsWith("/chat/");
  const prayerActive = pathname === "/oracion" || pathname.startsWith("/oracion/");
  const homeActive = pathname === "/";
  const unreadLabel = unread > 99 ? "99+" : String(unread);

  const navLinkClass = (active: boolean, emphasize?: "gold" | "outline") => {
    if (emphasize === "gold") {
      return `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all sm:px-4 sm:py-2 sm:text-sm ${
        active
          ? "bg-gold text-navy-dark shadow-md ring-2 ring-gold-light/40"
          : "bg-gold text-navy-dark shadow-sm hover:bg-gold-light"
      }`;
    }
    if (emphasize === "outline") {
      return `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all sm:px-4 sm:py-2 sm:text-sm ${
        active
          ? "bg-gold text-navy-dark shadow-md ring-2 ring-gold-light/40"
          : "border border-gold/45 text-gold-light hover:bg-gold hover:text-navy-dark"
      }`;
    }
    return `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
      active
        ? "bg-white/15 text-white"
        : "text-white/85 hover:bg-white/10 hover:text-white"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-6xl px-3 py-2 sm:px-6 sm:py-2.5">
        {/* Fila 1: logo + idioma + cuenta (sin solapes) */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={homeHref}
            className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3"
          >
            <Image
              src="/logo.jpeg"
              alt={t.brand}
              width={44}
              height={44}
              className="h-9 w-9 shrink-0 rounded-full ring-2 ring-gold/40 sm:h-11 sm:w-11"
            />
            <div className="hidden min-w-0 md:block">
              <p className="truncate font-serif text-sm leading-snug text-white">{t.brand}</p>
              <p className="mt-0.5 text-[10px] tracking-widest text-gold-light/80 uppercase">
                {t.studyGuide}
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher variant="header" />
            {checked && (
              <>
                {user ? (
                  <div className="flex items-center gap-1 border-l border-white/20 pl-1.5 sm:gap-2 sm:pl-3">
                    <span className="hidden max-w-[90px] truncate text-xs text-white/80 lg:inline">
                      {user.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10 sm:px-3 sm:py-1.5"
                    >
                      {t.nav.logout}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 border-l border-white/20 pl-1.5 sm:gap-2 sm:pl-3">
                    <Link
                      href="/login"
                      className="rounded-full px-2 py-1 text-xs text-white/90 hover:bg-white/10 sm:px-3 sm:py-1.5 sm:text-sm"
                    >
                      {t.nav.enter}
                    </Link>
                    <Link
                      href="/registro"
                      className="rounded-full bg-gold px-2 py-1 text-xs font-semibold text-navy-dark hover:bg-gold-light sm:px-3 sm:py-1.5 sm:text-sm"
                    >
                      <span className="hidden sm:inline">{t.nav.register}</span>
                      <span className="sm:hidden">{t.nav.registerShort}</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fila 2: navegación centrada, scroll horizontal si hace falta */}
        <nav
          className="mt-2 flex items-center justify-start gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center sm:gap-2 [&::-webkit-scrollbar]:hidden"
          aria-label="Principal"
        >
          {user ? (
            <>
              <Link href="/estudios" className={navLinkClass(studiesActive)}>
                {t.nav.studies}
              </Link>
              <Link href="/chat" className={`relative ${navLinkClass(chatActive, "gold")}`}>
                {t.nav.chat}
                {unread > 0 ? (
                  <span
                    className="absolute -right-1 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-navy"
                    aria-label={`${unread}`}
                  >
                    {unreadLabel}
                  </span>
                ) : null}
              </Link>
              <Link href="/oracion" className={navLinkClass(prayerActive, "outline")}>
                {t.nav.prayer}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className={navLinkClass(homeActive, homeActive ? "gold" : undefined)}
              >
                {t.nav.home}
              </Link>
              <Link
                href="/estudios"
                className={navLinkClass(studiesActive, studiesActive ? "gold" : undefined)}
              >
                {t.nav.studies}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
