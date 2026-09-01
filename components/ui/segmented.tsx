"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
  /** Optional one-line explanation shown under the control when selected. */
  description?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Segmented control. The selected pill is an absolutely-positioned sliding
 * element rather than a background on the active button, so the highlight
 * glides between options instead of jumping.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = "md",
}: SegmentedProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const active = options[index];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-[0.78rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {label}
        </span>
      )}

      <div
        role="radiogroup"
        aria-label={label}
        className="relative flex rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-1"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-lg bg-[var(--surface)] shadow-sm ring-1 ring-black/5 transition-transform duration-300 ease-[var(--ease-out-expo)] dark:ring-white/10"
          style={{
            width: `calc((100% - 0.5rem) / ${options.length})`,
            transform: `translateX(calc(${index} * 100%))`,
            left: "0.25rem",
          }}
        />
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative z-10 flex-1 rounded-lg font-semibold transition-colors duration-200",
              size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
              o.value === value
                ? "text-brand-700 dark:text-brand-200"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
          >
            {o.icon && <span className="mr-1">{o.icon}</span>}
            {o.label}
          </button>
        ))}
      </div>

      {active?.description && (
        <p key={active.value} className="animate-[fade-in_0.3s_ease] text-xs text-[var(--text-muted)]">
          {active.description}
        </p>
      )}
    </div>
  );
}
