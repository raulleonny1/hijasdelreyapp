"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
};

const AUTH_PAGES = ["/login", "/registro"];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    if (isAuthPage) return;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, [pathname, isAuthPage]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (isAuthPage) return null;

  const homeHref = user ? "/estudios" : "/";
  const navLinks = user
    ? [{ href: "/estudios", label: "Estudios" }]
    : [
        { href: "/", label: "Inicio" },
        { href: "/estudios", label: "Estudios" },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        <Link
          href={homeHref}
          className="flex min-w-0 shrink items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3"
        >
          <Image
            src="/logo.jpeg"
            alt="La Orden de las Hijas del Rey"
            width={44}
            height={44}
            className="h-10 w-10 shrink-0 rounded-full ring-2 ring-gold/40 sm:h-12 sm:w-12"
          />
          <div className="hidden min-w-0 sm:block">
            <p className="font-serif text-sm leading-snug text-white">
              La Orden de las Hijas del Rey
            </p>
            <p className="mt-0.5 text-[10px] tracking-widest text-gold-light/80 uppercase">
              Guía de estudio
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <nav className="flex gap-0.5 sm:gap-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href === "/estudios" && pathname.startsWith("/estudios"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                    active
                      ? "bg-gold text-navy-dark"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {checked && (
            <>
              {user ? (
                <div className="flex items-center gap-1 border-l border-white/20 pl-1.5 sm:gap-2 sm:pl-3">
                  <span className="hidden max-w-[72px] truncate text-xs text-white/80 md:inline lg:max-w-[100px]">
                    {user.nombre}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10 sm:px-3 sm:py-1.5"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 border-l border-white/20 pl-1.5 sm:gap-2 sm:pl-3">
                  <Link
                    href="/login"
                    className="rounded-full px-2 py-1 text-xs text-white/90 hover:bg-white/10 sm:px-3 sm:py-1.5 sm:text-sm"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registro"
                    className="rounded-full bg-gold px-2 py-1 text-xs font-semibold text-navy-dark hover:bg-gold-light sm:px-3 sm:py-1.5 sm:text-sm"
                  >
                    <span className="hidden sm:inline">Registrarse</span>
                    <span className="sm:hidden">Registro</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
