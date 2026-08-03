"use client";

import { useState } from "react";
import { AuthCard, AuthLink } from "@/components/AuthCard";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { PinInput } from "@/components/PinInput";

export default function RegistroPage() {
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
      setError("Nombre y apellido son obligatorios.");
      return;
    }
    if (!fechaNacimiento || !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
      setError("Seleccione su fecha de nacimiento (día, mes y año).");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }
    if (pin.length !== 4) {
      setError("El PIN debe tener 4 dígitos.");
      return;
    }
    if (pin !== pinConfirm) {
      setError("Los PIN no coinciden.");
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
        setError(data.error ?? "No se pudo registrar.");
        return;
      }
      // Recarga completa para que la cookie de sesión se aplique antes del middleware
      window.location.href = "/estudios?registrado=1";
    } catch {
      setError("Error de conexión. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-3 text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20";

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="La Orden de las Hijas del Rey — complete sus datos para acceder"
      footer={
        <>
          ¿Ya tiene cuenta? <AuthLink href="/login">Iniciar sesión con PIN</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy/80">Nombre</label>
            <input
              className={inputClass}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="María"
              autoComplete="given-name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy/80">Apellido</label>
            <input
              className={inputClass}
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="García"
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <BirthDatePicker
          value={fechaNacimiento}
          onChange={(v) => {
            setFechaNacimiento(v);
            if (error.includes("fecha")) setError("");
          }}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-navy/80">Correo electrónico</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
            autoComplete="email"
            required
          />
        </div>

        <PinInput value={pin} onChange={setPin} label="Cree su PIN (4 dígitos)" />
        <PinInput value={pinConfirm} onChange={setPinConfirm} label="Confirme su PIN" />

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
          {loading ? "Registrando…" : "Crear cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}
