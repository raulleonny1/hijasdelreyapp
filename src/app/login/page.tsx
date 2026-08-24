"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthCard, AuthLink } from "@/components/AuthCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PinInput } from "@/components/PinInput";
import { useLocale } from "@/components/LocaleProvider";
import { ADMIN_GATE_PIN } from "@/lib/admin-constants";
import { translateApiError } from "@/lib/i18n";

type Mode = "pin" | "choose";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/estudios";
  const registered = searchParams.get("registrado") === "1";
  const { locale, t } = useLocale();
  const L = t.login;

  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<Mode>("pin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const studentTarget =
    from && from.startsWith("/") && !from.startsWith("//") && from !== "/" && !from.startsWith("/admin")
      ? from
      : "/estudios";

  const loginAsStudent = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateApiError(locale, data.error, L.errLogin));
        setPin("");
        setMode("pin");
        return;
      }
      window.location.href = studentTarget;
    } catch {
      setError(L.errConnection);
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: ADMIN_GATE_PIN }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo entrar como administradora.");
        setMode("pin");
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError(L.errConnection);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) {
      setError(L.errPinLength);
      return;
    }
    if (pin === ADMIN_GATE_PIN) {
      setMode("choose");
      return;
    }
    await loginAsStudent();
  };

  return (
    <AuthCard
      title={L.title}
      subtitle={L.subtitle}
      languageSwitcher={<LanguageSwitcher variant="auth" />}
      footer={
        <>
          {L.firstTime} <AuthLink href="/registro">{L.createAccount}</AuthLink>
        </>
      }
    >
      {registered && (
        <p className="mb-6 rounded-xl bg-gold/15 px-4 py-3 text-sm text-navy text-center">
          {L.registeredOk}
        </p>
      )}

      {mode === "choose" ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-navy/10 bg-cream/40 px-4 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">PIN 1970</p>
            <p className="mt-2 text-sm text-navy/80 leading-relaxed">
              ¿Cómo desea ingresar?
            </p>
          </div>
          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => void loginAsAdmin()}
            className="w-full rounded-full bg-navy py-3.5 font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar como administradora"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void loginAsStudent()}
            className="w-full rounded-full border border-navy/20 bg-white py-3.5 font-semibold text-navy transition hover:bg-navy/5 disabled:opacity-50"
          >
            Entrar como estudiante
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setMode("pin");
              setPin("");
              setError("");
            }}
            className="w-full text-sm text-navy/55 hover:text-navy"
          >
            Volver
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <PinInput value={pin} onChange={setPin} autoFocus label={L.pinLabel} />
          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full rounded-full bg-navy py-3.5 font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            {loading ? L.entering : L.enter}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
