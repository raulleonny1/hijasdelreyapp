"use client";

import { useState } from "react";
import { AuthCard, AuthLink } from "@/components/AuthCard";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PinInput } from "@/components/PinInput";
import { useLocale } from "@/components/LocaleProvider";
import { translateApiError } from "@/lib/i18n";

export default function RegistroPage() {
  const { locale, t } = useLocale();
  const R = t.register;

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !apellido.trim()) {
      setError(R.errNameRequired);
      return;
    }
    if (!fechaNacimiento || !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      setError(R.errBirthDate);
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(R.errEmail);
      return;
    }
    if (pin.length !== 4) {
      setError(R.errPinLength);
      return;
    }
    if (pin !== pinConfirm) {
      setError(R.errPinMismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          fechaNacimiento,
          email,
          pin,
          pinConfirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateApiError(locale, data.error, R.errRegister));
        return;
      }
      window.location.href = "/estudios?registrado=1";
    } catch {
      setError(R.errConnection);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-3 text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20";

  return (
    <AuthCard
      title={R.title}
      subtitle={R.subtitle}
      languageSwitcher={<LanguageSwitcher variant="auth" />}
      footer={
        <>
          {R.hasAccount} <AuthLink href="/login">{R.signInPin}</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy/80">{R.firstName}</label>
            <input
              className={inputClass}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={R.placeholderFirst}
              autoComplete="given-name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy/80">{R.lastName}</label>
            <input
              className={inputClass}
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder={R.placeholderLast}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <BirthDatePicker
          value={fechaNacimiento}
          onChange={(v) => {
            setFechaNacimiento(v);
            if (error) setError("");
          }}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-navy/80">{R.email}</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={R.placeholderEmail}
            autoComplete="email"
            required
          />
        </div>

        <PinInput value={pin} onChange={setPin} label={R.pinCreate} />
        <PinInput value={pinConfirm} onChange={setPinConfirm} label={R.pinConfirm} />

        {error && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold py-3.5 font-semibold text-navy-dark transition hover:bg-gold-light disabled:opacity-50"
        >
          {loading ? R.submitting : R.submit}
        </button>
      </form>
    </AuthCard>
  );
}
