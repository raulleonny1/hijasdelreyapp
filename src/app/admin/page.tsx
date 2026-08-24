"use client";

import { useEffect, useMemo, useState } from "react";

type CourseProgress = {
  courseId: string;
  title: string;
  percent: number;
  answered: number;
  total: number;
  lessonsTouched: number;
  lessonCount: number;
  lastActivityAt: string | null;
};

type Member = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string;
  createdAt: string;
  progress: {
    userId: string;
    overallPercent: number;
    courses: CourseProgress[];
    startedCourses?: CourseProgress[];
    lastActivityAt: string | null;
  };
};

type LoginEvent = {
  id: string;
  userId: string;
  nombre: string;
  apellido: string;
  email: string;
  at: string;
  day: string;
};

type Overview = {
  stats: {
    totalUsers: number;
    loginsToday: number;
    uniqueLoginsToday: number;
    loginsLast30Days: number;
    avgProgress: number;
  };
  members: Member[];
  loginsByDay: { day: string; count: number; uniqueUsers: number }[];
  recentLogins: LoginEvent[];
  allLogins?: LoginEvent[];
};

type Section = "resumen" | "accesos" | "miembros";

const SECTIONS: { id: Section; label: string; short: string }[] = [
  { id: "resumen", label: "Resumen", short: "Resumen" },
  { id: "accesos", label: "Accesos por día", short: "Accesos" },
  { id: "miembros", label: "Editar / eliminar", short: "Miembros" },
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

function startedCoursesOf(m: Member): CourseProgress[] {
  if (m.progress.startedCourses && m.progress.startedCourses.length > 0) {
    return m.progress.startedCourses;
  }
  return m.progress.courses.filter((c) => c.answered > 0 || c.lessonsTouched > 0);
}

function progressHint(m: Member): string {
  const started = startedCoursesOf(m);
  if (started.length === 0) return "Sin respuestas aún";
  const top = started[0];
  return `${top.title} · ${top.answered}/${top.total} respuestas`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toDayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("resumen");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const todayKey = new Date().toISOString().slice(0, 10);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(todayKey);

  const [editing, setEditing] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    fechaNacimiento: "",
    pin: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo cargar el panel.");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setError("Error de conexión al cargar el panel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [section]);

  const loginCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data?.loginsByDay ?? []) map.set(d.day, d.count);
    return map;
  }, [data]);

  const dayLogins = useMemo(() => {
    if (!data) return [];
    const list = data.allLogins ?? data.recentLogins;
    return list.filter((e) => e.day === selectedDay).sort((a, b) => b.at.localeCompare(a.at));
  }, [data, selectedDay]);

  const filteredMembers = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.members;
    return data.members.filter((m) =>
      `${m.nombre} ${m.apellido} ${m.email}`.toLowerCase().includes(q)
    );
  }, [data, query]);

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  const calendarCells = useMemo(() => {
    const firstDow = new Date(calYear, calMonth, 1).getDay();
    const startOffset = (firstDow + 6) % 7;
    const total = daysInMonth(calYear, calMonth);
    const cells: { day: number | null; key: string | null }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ day: null, key: null });
    for (let d = 1; d <= total; d++) {
      cells.push({ day: d, key: toDayKey(calYear, calMonth, d) });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, key: null });
    return cells;
  }, [calYear, calMonth]);

  const openEdit = (m: Member) => {
    setEditing(m);
    setFormError("");
    setEditForm({
      nombre: m.nombre,
      apellido: m.apellido,
      email: m.email,
      fechaNacimiento: m.fechaNacimiento,
      pin: "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editForm.nombre,
          apellido: editForm.apellido,
          email: editForm.email,
          fechaNacimiento: editForm.fechaNacimiento,
          pin: editForm.pin || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error ?? "No se pudo guardar.");
        return;
      }
      setEditing(null);
      await load();
    } catch {
      setFormError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (m: Member) => {
    const ok = window.confirm(
      `¿Eliminar a ${m.nombre} ${m.apellido}? Se borrarán también sus respuestas y accesos.`
    );
    if (!ok) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${m.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo eliminar.");
        return;
      }
      if (editing?.id === m.id) setEditing(null);
      await load();
    } catch {
      setError("Error de conexión al eliminar.");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/admin-logout", { method: "POST" });
    window.location.href = "/login";
  };

  const selectSection = (id: Section) => {
    setSection(id);
    setExpanded(null);
  };

  const inputClass =
    "min-h-11 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-base text-navy outline-none focus:border-navy/40 touch-manipulation";

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#f7f4ee_0%,#ffffff_45%)] text-navy">
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col md:flex-row">
        {/* Cabecera + menú: en iPhone arriba; desde iPad (md) lateral */}
        <aside
          className="sticky top-0 z-40 shrink-0 border-b border-white/10 bg-navy text-white md:static md:flex md:w-60 md:flex-col md:border-b-0 md:border-r md:border-white/10 lg:w-64"
          style={{
            paddingTop: "max(0.5rem, env(safe-area-inset-top))",
            paddingLeft: "max(0px, env(safe-area-inset-left))",
          }}
        >
          <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-2 md:block md:px-5 md:pb-4 md:pt-5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                Administración
              </p>
              <h1 className="mt-0.5 font-serif text-base leading-snug md:text-lg">Hijas del Rey</h1>
              <p className="mt-0.5 hidden text-xs text-white/55 md:block">Panel de seguimiento</p>
            </div>
            <div className="flex shrink-0 gap-1.5 md:hidden">
              <button
                type="button"
                onClick={() => void load()}
                className="min-h-10 rounded-full border border-white/25 px-3 text-xs text-white/90 touch-manipulation"
              >
                Sync
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="min-h-10 rounded-full bg-gold px-3 text-xs font-semibold text-navy-dark touch-manipulation"
              >
                Salir
              </button>
            </div>
          </div>

          {/* Tabs horizontales en móvil; vertical en iPad+ */}
          <nav
            className="flex gap-1 overflow-x-auto px-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-col md:gap-1 md:overflow-visible md:px-3 md:pb-4 [&::-webkit-scrollbar]:hidden"
            aria-label="Secciones del panel"
          >
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSection(s.id)}
                className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium touch-manipulation md:w-full md:rounded-xl md:px-3 md:text-left ${
                  section === s.id
                    ? "bg-gold text-navy-dark shadow-sm"
                    : "bg-white/10 text-white/85 hover:bg-white/15 md:bg-transparent md:hover:bg-white/10"
                }`}
              >
                <span className="md:hidden">{s.short}</span>
                <span className="hidden md:inline">{s.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden space-y-2 border-t border-white/10 px-3 py-4 md:block">
            <button
              type="button"
              onClick={() => void load()}
              className="min-h-11 w-full rounded-full border border-white/20 px-3 text-sm text-white/85 touch-manipulation hover:bg-white/10"
            >
              Actualizar datos
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="min-h-11 w-full rounded-full bg-gold px-3 text-sm font-semibold text-navy-dark touch-manipulation hover:bg-gold-light"
            >
              Salir
            </button>
          </div>
        </aside>

        <main
          className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-8"
          style={{
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          {loading && (
            <p className="rounded-2xl border border-navy/10 bg-white p-8 text-center text-navy/60">
              Cargando panel…
            </p>
          )}

          {error && !loading && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {data && !loading && section === "resumen" && (
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl">Resumen</h2>
                <p className="mt-1 text-sm text-navy/55">Vista general de la comunidad</p>
              </div>
              <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  { label: "Registradas", value: String(data.stats.totalUsers) },
                  {
                    label: "Accesos hoy",
                    value: String(data.stats.loginsToday),
                    hint: `${data.stats.uniqueLoginsToday} personas`,
                  },
                  { label: "30 días", value: String(data.stats.loginsLast30Days) },
                  { label: "Progreso", value: `${data.stats.avgProgress}%` },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/45 sm:text-[11px]">
                      {card.label}
                    </p>
                    <p className="mt-2 font-serif text-2xl sm:text-3xl">{card.value}</p>
                    {card.hint ? <p className="mt-1 text-xs text-navy/50">{card.hint}</p> : null}
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="font-serif text-lg sm:text-xl">Progreso reciente</h3>
                <p className="mt-1 text-xs text-navy/50 sm:text-sm">
                  Según las respuestas guardadas en cada curso
                </p>
                <div className="mt-4 space-y-4">
                  {[...data.members]
                    .sort((a, b) => {
                      const ta = a.progress.lastActivityAt ?? "";
                      const tb = b.progress.lastActivityAt ?? "";
                      if (ta || tb) return tb.localeCompare(ta);
                      return b.progress.overallPercent - a.progress.overallPercent;
                    })
                    .slice(0, 8)
                    .map((m) => {
                      const started = startedCoursesOf(m);
                      return (
                        <div key={m.id} className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-sm text-gold">
                              {(m.nombre[0] ?? "?").toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {m.nombre} {m.apellido}
                              </p>
                              <p className="truncate text-[11px] text-navy/45">{progressHint(m)}</p>
                              <div className="mt-1.5">
                                <ProgressBar value={m.progress.overallPercent} />
                              </div>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-navy">
                              {m.progress.overallPercent}%
                            </span>
                          </div>
                          {started.length > 1 && (
                            <ul className="ml-[52px] space-y-1">
                              {started.slice(0, 3).map((c) => (
                                <li
                                  key={c.courseId}
                                  className="flex items-center justify-between gap-2 text-[11px] text-navy/55"
                                >
                                  <span className="min-w-0 truncate">{c.title}</span>
                                  <span className="shrink-0 tabular-nums">
                                    {c.percent}% · {c.answered}/{c.total}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  {data.members.length === 0 && (
                    <p className="py-6 text-center text-sm text-navy/50">Aún no hay registradas.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {data && !loading && section === "accesos" && (
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl">Accesos por día</h2>
                <p className="mt-1 text-sm text-navy/55">
                  Toque un día del calendario para ver quién ingresó
                </p>
              </div>

              {/* iPhone: calendario arriba, lista abajo. iPad+: lado a lado */}
              <div className="grid gap-5 md:grid-cols-2 md:items-start lg:grid-cols-[minmax(280px,360px)_1fr]">
                <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      aria-label="Mes anterior"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-navy/70 touch-manipulation hover:bg-navy/5"
                      onClick={() => {
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear((y) => y - 1);
                        } else setCalMonth((m) => m - 1);
                      }}
                    >
                      ←
                    </button>
                    <p className="font-serif text-base capitalize sm:text-lg">{monthLabel}</p>
                    <button
                      type="button"
                      aria-label="Mes siguiente"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-navy/70 touch-manipulation hover:bg-navy/5"
                      onClick={() => {
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear((y) => y + 1);
                        } else setCalMonth((m) => m + 1);
                      }}
                    >
                      →
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-navy/40">
                    {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                      <span key={d} className="py-1">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1.5">
                    {calendarCells.map((cell, idx) => {
                      if (!cell.day || !cell.key) {
                        return <span key={`e-${idx}`} className="min-h-11" />;
                      }
                      const count = loginCountByDay.get(cell.key) ?? 0;
                      const selected = selectedDay === cell.key;
                      const isToday = cell.key === todayKey;
                      return (
                        <button
                          key={cell.key}
                          type="button"
                          onClick={() => setSelectedDay(cell.key!)}
                          className={`relative flex min-h-11 items-center justify-center rounded-xl text-sm touch-manipulation transition ${
                            selected
                              ? "bg-navy text-white shadow-md"
                              : count > 0
                                ? "bg-gold/30 text-navy active:bg-gold/50"
                                : "text-navy/70 active:bg-navy/10"
                          } ${isToday && !selected ? "ring-1 ring-gold" : ""}`}
                        >
                          {cell.day}
                          {count > 0 && (
                            <span
                              className={`absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                                selected ? "bg-gold" : "bg-navy/55"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-xs text-navy/50">
                    Punto = hubo accesos ese día
                  </p>
                </div>

                <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-6">
                  <h3 className="font-serif text-lg leading-snug sm:text-xl">
                    {new Date(`${selectedDay}T12:00:00`).toLocaleDateString("es", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h3>
                  <p className="mt-1 text-sm text-navy/55">
                    {dayLogins.length} acceso{dayLogins.length === 1 ? "" : "s"}
                  </p>

                  {dayLogins.length === 0 ? (
                    <p className="py-10 text-center text-sm text-navy/50">
                      Nadie ingresó este día.
                    </p>
                  ) : (
                    <ul className="mt-4 max-h-[55dvh] space-y-0 overflow-y-auto overscroll-contain divide-y divide-navy/8 md:max-h-[60dvh]">
                      {dayLogins.map((e) => (
                        <li
                          key={e.id}
                          className="flex min-h-14 items-start justify-between gap-3 py-3 first:pt-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {e.nombre} {e.apellido}
                            </p>
                            <p className="truncate text-xs text-navy/45">{e.email}</p>
                          </div>
                          <p className="shrink-0 pt-0.5 text-[11px] text-navy/50">
                            {formatDate(e.at)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {data && !loading && section === "miembros" && (
            <div className="space-y-5 sm:space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl">Editar / eliminar</h2>
                  <p className="mt-1 text-sm text-navy/55">Gestione las cuentas registradas</p>
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o correo…"
                  className={`${inputClass} sm:max-w-xs`}
                />
              </div>

              <div className="space-y-3">
                {filteredMembers.length === 0 && (
                  <p className="rounded-2xl border border-navy/10 bg-white py-10 text-center text-sm text-navy/50">
                    Sin resultados.
                  </p>
                )}
                {filteredMembers.map((m) => {
                  const open = expanded === m.id;
                  return (
                    <div
                      key={m.id}
                      className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"
                    >
                      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left touch-manipulation"
                          onClick={() => setExpanded(open ? null : m.id)}
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-sm text-gold">
                            {(m.nombre[0] ?? "?").toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {m.nombre} {m.apellido}
                            </span>
                            <span className="block truncate text-xs text-navy/50">{m.email}</span>
                            <span className="mt-0.5 block text-xs text-navy/45 sm:hidden">
                              Progreso {m.progress.overallPercent}%
                            </span>
                          </span>
                        </button>
                        <span className="hidden text-xs text-navy/50 sm:inline">
                          {m.progress.overallPercent}%
                        </span>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                          <button
                            type="button"
                            onClick={() => openEdit(m)}
                            className="min-h-11 rounded-full border border-navy/15 px-4 text-sm font-medium touch-manipulation hover:bg-navy/5"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void removeMember(m)}
                            className="min-h-11 rounded-full border border-red-200 px-4 text-sm font-medium text-red-700 touch-manipulation hover:bg-red-50 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      {open && (
                        <div className="border-t border-navy/10 bg-cream/30 px-4 py-4 text-sm">
                          <p>
                            <span className="text-navy/45">Registro: </span>
                            {formatDate(m.createdAt)}
                          </p>
                          <p className="mt-1">
                            <span className="text-navy/45">Última actividad: </span>
                            {formatDate(m.progress.lastActivityAt)}
                          </p>
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-navy/55">Progreso en cursos empezados</span>
                              <span className="font-semibold text-navy">
                                {m.progress.overallPercent}%
                              </span>
                            </div>
                            <ProgressBar value={m.progress.overallPercent} />
                          </div>
                          {startedCoursesOf(m).length > 0 ? (
                            <ul className="mt-4 space-y-3">
                              {startedCoursesOf(m).map((c) => (
                                <li key={c.courseId}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-navy">{c.title}</p>
                                      <p className="text-[11px] text-navy/45">
                                        {c.answered} de {c.total} respuestas ·{" "}
                                        {c.lessonsTouched}/{c.lessonCount} lecciones
                                      </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold tabular-nums text-navy">
                                      {c.percent}%
                                    </span>
                                  </div>
                                  <div className="mt-1.5">
                                    <ProgressBar value={c.percent} />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-xs text-navy/50">
                              Todavía no ha guardado respuestas en ningún curso.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-navy/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div
            role="dialog"
            aria-label="Editar miembro"
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
          >
            <h3 className="font-serif text-xl">Editar miembro</h3>
            <p className="mt-1 text-sm text-navy/55">Los cambios se guardan en Firebase</p>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-navy/70">Nombre</span>
                  <input
                    className={inputClass}
                    value={editForm.nombre}
                    onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-navy/70">Apellido</span>
                  <input
                    className={inputClass}
                    value={editForm.apellido}
                    onChange={(e) => setEditForm((f) => ({ ...f, apellido: e.target.value }))}
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block text-navy/70">Correo</span>
                <input
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-navy/70">Fecha de nacimiento</span>
                <input
                  type="date"
                  className={inputClass}
                  value={editForm.fechaNacimiento}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, fechaNacimiento: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-navy/70">Nuevo PIN (opcional)</span>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Vacío = no cambiar"
                  className={inputClass}
                  value={editForm.pin}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      pin: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                />
              </label>
              {formError && (
                <p className="text-sm text-red-600" role="alert">
                  {formError}
                </p>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="min-h-11 rounded-full px-4 text-sm text-navy/70 touch-manipulation hover:bg-navy/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveEdit()}
                className="min-h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white touch-manipulation hover:bg-navy-light disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
