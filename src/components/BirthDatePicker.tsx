"use client";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type Props = {
  value: string;
  onChange: (isoDate: string) => void;
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function BirthDatePicker({ value, onChange }: Props) {
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const day = parsed ? parsed.getDate() : 0;
  const month = parsed ? parsed.getMonth() + 1 : 0;
  const year = parsed ? parsed.getFullYear() : 0;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const maxDay = month && year ? daysInMonth(year, month) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const update = (d: number, m: number, y: number) => {
    if (!d || !m || !y) {
      onChange("");
      return;
    }
    const clampedDay = Math.min(d, daysInMonth(y, m));
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
    onChange(iso);
  };

  const selectClass =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3.5 text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 appearance-none cursor-pointer";

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-navy/80">Fecha de nacimiento</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs text-navy/50">Día</label>
          <select
            className={selectClass}
            value={day || ""}
            onChange={(e) => update(Number(e.target.value), month, year)}
          >
            <option value="">—</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-navy/50">Mes</label>
          <select
            className={selectClass}
            value={month || ""}
            onChange={(e) => update(day, Number(e.target.value), year)}
          >
            <option value="">—</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-navy/50">Año</label>
          <select
            className={selectClass}
            value={year || ""}
            onChange={(e) => update(day, month, Number(e.target.value))}
          >
            <option value="">—</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      {value && (
        <p className="mt-2 text-center text-sm text-gold font-medium">
          {new Date(value + "T12:00:00").toLocaleDateString("es", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
