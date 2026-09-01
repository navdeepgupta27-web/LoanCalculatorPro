import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "brand" | "accent" | "amber" | "rose" | "neutral" | "sky";

const TONES: Record<Tone, string> = {
  brand:
    "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-200 dark:border-brand-800",
  accent:
    "bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/40 dark:text-accent-200 dark:border-accent-800",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
  rose:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800",
  sky:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800",
  neutral:
    "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
