import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] " +
  "px-3.5 py-2.5 text-[0.9375rem] transition-all duration-200 " +
  "placeholder:text-[var(--text-muted)] " +
  "hover:border-[var(--border-strong)] " +
  "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  /** Right-aligned annotation in the label row, e.g. a live value. */
  aside?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label + control + hint/error, with consistent spacing everywhere. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  aside,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[0.78rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {aside && <div className="text-sm font-semibold text-brand-600 dark:text-brand-300">{aside}</div>}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Fixed adornment rendered inside the control, e.g. "₹" or "%". */
  prefix?: string;
  suffix?: string;
  invalid?: boolean;
};

export function Input({ className, prefix, suffix, invalid, ...rest }: InputProps) {
  if (!prefix && !suffix) {
    return (
      <input
        className={cn(CONTROL, invalid && "border-red-400 focus:border-red-500 focus:ring-red-500/12", className)}
        {...rest}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-200",
        "focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/12 hover:border-[var(--border-strong)]",
        invalid && "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/12",
        className,
      )}
    >
      {prefix && (
        <span className="pl-3.5 pr-0.5 text-[0.9375rem] font-semibold text-[var(--text-muted)] select-none">
          {prefix}
        </span>
      )}
      <input
        className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-[0.9375rem] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
        {...rest}
      />
      {suffix && (
        <span className="pr-3.5 pl-0.5 text-[0.9375rem] font-semibold text-[var(--text-muted)] select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-28 resize-y leading-relaxed", className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          CONTROL,
          "cursor-pointer appearance-none bg-none pr-10",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 7.5 5 5 5-5" />
      </svg>
    </div>
  );
}
