"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import { useFormat } from "@/components/country/country-provider";
import { clamp, cn } from "@/lib/utils";

import { Input } from "./field";

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  /** Show the Indian-numbering words below the field ("Fifty Lakh"). */
  showWords?: boolean;
  /** Preset chips under the slider for one-tap common values. */
  presets?: number[];
  formatPreset?: (v: number) => string;
  hint?: ReactNode;
  decimals?: number;
}

/**
 * A number input and a range slider bound to one value.
 *
 * Typing is never fought: the text field keeps its own draft string so a
 * half-typed "12" is not clamped up to the minimum mid-keystroke. The value is
 * only clamped on blur, and the slider always reflects the committed number.
 */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  showWords,
  presets,
  formatPreset,
  hint,
  decimals = 0,
}: SliderFieldProps) {
  const { compact: formatCompact, words: numberToWords } = useFormat();
  // Resolved here rather than as a default parameter: the formatter depends
  // on the country, which is only available once the hook has run.
  const preset = formatPreset ?? formatCompact;

  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  const pct = useMemo(() => {
    if (max === min) return 0;
    return clamp(((value - min) / (max - min)) * 100, 0, 100);
  }, [value, min, max]);

  const commit = (raw: string) => {
    const parsed = Number(raw.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed)) {
      setDraft(null);
      return;
    }
    onChange(clamp(parsed, min, max));
    setDraft(null);
  };

  const display = draft ?? (decimals > 0 ? String(value) : String(Math.round(value)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[0.78rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]"
        >
          {label}
        </label>
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {preset(min)} – {preset(max)}
        </span>
      </div>

      <Input
        id={id}
        type="text"
        inputMode="decimal"
        prefix={prefix}
        suffix={suffix}
        value={display}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="font-semibold tnum"
        aria-label={label}
      />

      <input
        type="range"
        className="range-input mt-0.5"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        aria-valuetext={`${prefix ?? ""}${value}${suffix ?? ""}`}
      />

      {showWords && value > 0 && (
        <p className="text-xs font-medium italic text-brand-600 dark:text-brand-300">
          {numberToWords(value)} Rupees
        </p>
      )}

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(clamp(p, min, max))}
              className={cn(
                "rounded-lg border px-2 py-1 text-xs font-semibold transition-all duration-150",
                Math.abs(p - value) < 0.001
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300",
              )}
            >
              {preset(p)}
            </button>
          ))}
        </div>
      )}

      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
