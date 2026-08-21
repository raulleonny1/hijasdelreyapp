"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthCard, AuthLink } from "@/components/AuthCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PinInput } from "@/components/PinInput";
import { useLocale } from "@/components/LocaleProvider";
import { translateApiError } from "@/lib/i18n";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/estudios";
  const registered = searchParams.get("registrado") === "1";
  const { locale, t } = useLocale();
  const L = t.login;

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) {
      setError(L.errPinLength);
      return;
    }
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
        return;
      }
      const target =
        from && from.startsWith("/") && !from.startsWith("//") && from !== "/" ? from : "/estudios";
      window.location.href = target;
    } catch {
      setError(L.errConnection);
    } finally {
      setLoading(false);
    }
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
      <form onSubmit={handleSubmit} className="space-y-6">
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
    </AuthCard>
  );
}
