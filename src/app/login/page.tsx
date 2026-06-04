"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthCard, AuthLink } from "@/components/AuthCard";
import { PinInput } from "@/components/PinInput";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/estudios";
  const registered = searchParams.get("registrado") === "1";

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) {
      setError("Ingrese los 4 dígitos de su PIN.");
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
        setError(data.error ?? "No se pudo iniciar sesión.");
        setPin("");
        return;
      }
      const target =
        from && from.startsWith("/") && !from.startsWith("//") && from !== "/" ? from : "/estudios";
      window.location.href = target;
    } catch {
      setError("Error de conexión. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Bienvenida"
      subtitle="Ingrese su PIN de 4 dígitos para continuar"
      footer={
        <>
          ¿Primera vez aquí?{" "}
          <AuthLink href="/registro">Crear cuenta</AuthLink>
        </>
      }
    >
      {registered && (
        <p className="mb-6 rounded-xl bg-gold/15 px-4 py-3 text-sm text-navy text-center">
          ¡Registro exitoso! Use el PIN que eligió para entrar.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <PinInput value={pin} onChange={setPin} autoFocus label="Su PIN personal" />
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
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </AuthCard>
  );
}
