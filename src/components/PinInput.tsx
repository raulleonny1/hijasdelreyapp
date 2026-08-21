"use client";

import { useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  autoFocus?: boolean;
};

export function PinInput({ value, onChange, length = 4, label, autoFocus }: Props) {
  const { t } = useLocale();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setDigit = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    while (arr.length < length) arr.push("");
    arr[index] = clean;
    const next = arr.join("").replace(/\s/g, "").slice(0, length);
    onChange(next);
    if (clean && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div>
      {label && <p className="mb-3 text-sm font-medium text-navy/80">{label}</p>}
      <div className="flex justify-center gap-2 sm:gap-4 max-w-xs mx-auto" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoFocus={autoFocus && i === 0}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`${t.pinDigit} ${i + 1}`}
            value={digits[i]?.trim() ? digits[i] : ""}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-12 w-11 sm:h-16 sm:w-14 rounded-xl border-2 border-navy/20 bg-white text-center text-xl sm:text-2xl font-semibold text-navy shadow-sm transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        ))}
      </div>
    </div>
  );
}
