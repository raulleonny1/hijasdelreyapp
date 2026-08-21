"use client";

import { useEffect, useId, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  value: string;
  onChange: (isoDate: string) => void;
};

function daysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function parseIso(value: string): { day: number; month: number; year: number } {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { day: 0, month: 0, year: 0 };
  }
  const [y, m, d] = value.split("-").map(Number);
  return { day: d, month: m, year: y };
}

function toIso(day: number, month: number, year: number): string {
  if (!day || !month || !year) return "";
  const clamped = Math.min(day, daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

export function BirthDatePicker({ value, onChange }: Props) {
  const { locale, t } = useLocale();
  const B = t.birthDate;
  const id = useId();
  const parsed = parseIso(value);
  const [day, setDay] = useState(parsed.day);
  const [month, setMonth] = useState(parsed.month);
  const [year, setYear] = useState(parsed.year);
  const [mode, setMode] = useState<"calendar" | "manual">("calendar");

  const currentYear = new Date().getFullYear();
  const maxDate = new Date().toISOString().slice(0, 10);
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const maxDay = daysInMonth(year || currentYear, month || 1);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    const p = parseIso(value);
    setDay(p.day);
    setMonth(p.month);
    setYear(p.year);
  }, [value]);

  const applyParts = (d: number, m: number, y: number) => {
    setDay(d);
    setMonth(m);
    setYear(y);
    onChange(toIso(d, m, y));
  };

  const handleNativeDate = (iso: string) => {
    if (!iso) {
      setDay(0);
      setMonth(0);
      setYear(0);
      onChange("");
      return;
    }
    const p = parseIso(iso);
    setDay(p.day);
    setMonth(p.month);
    setYear(p.year);
    onChange(iso);
  };

  const formatDisplay = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString(locale === "en" ? "en" : "es", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const selectClass =
    "w-full min-h-[48px] rounded-xl border border-navy/15 bg-white px-3 py-3 text-base text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 cursor-pointer touch-manipulation";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={`${id}-date`} className="text-sm font-medium text-navy/80">
          {B.label}
        </label>
        <button
          type="button"
          onClick={() => setMode(mode === "calendar" ? "manual" : "calendar")}
          className="text-xs text-navy/50 underline hover:text-gold"
        >
          {mode === "calendar" ? B.pickParts : B.useCalendar}
        </button>
      </div>

      {mode === "calendar" ? (
        <input
          id={`${id}-date`}
          type="date"
          value={value}
          max={maxDate}
          min="1920-01-01"
          onChange={(e) => handleNativeDate(e.target.value)}
          className={`${selectClass} block appearance-none`}
          required
        />
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label htmlFor={`${id}-day`} className="mb-1 block text-xs text-navy/50">
              {B.day}
            </label>
            <select
              id={`${id}-day`}
              className={selectClass}
              value={day || ""}
              onChange={(e) => applyParts(Number(e.target.value), month, year)}
            >
              <option value="">—</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-month`} className="mb-1 block text-xs text-navy/50">
              {B.month}
            </label>
            <select
              id={`${id}-month`}
              className={selectClass}
              value={month || ""}
              onChange={(e) => {
                const m = Number(e.target.value);
                let d = day;
                if (year && m && d > daysInMonth(year, m)) {
                  d = daysInMonth(year, m);
                }
                applyParts(d, m, year);
              }}
            >
              <option value="">—</option>
              {B.months.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-year`} className="mb-1 block text-xs text-navy/50">
              {B.year}
            </label>
            <select
              id={`${id}-year`}
              className={selectClass}
              value={year || ""}
              onChange={(e) => {
                const y = Number(e.target.value);
                let d = day;
                if (month && y && d > daysInMonth(y, month)) {
                  d = daysInMonth(y, month);
                }
                applyParts(d, month, y);
              }}
            >
              <option value="">—</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {value ? (
        <p className="mt-2 text-center text-sm font-medium text-gold" aria-live="polite">
          {formatDisplay(value)}
        </p>
      ) : (
        <p className="mt-2 text-center text-xs text-navy/45">{B.hint}</p>
      )}
    </div>
  );
}
