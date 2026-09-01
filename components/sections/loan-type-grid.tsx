import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { formatCompact, formatPercent } from "@/lib/format";
import { LOAN_TYPES } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LoanTypeGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {LOAN_TYPES.map((t, i) => (
        <Reveal key={t.id} delay={i * 60}>
          <Link
            href={`/${t.slug}`}
            className="card card-lift group relative flex h-full flex-col overflow-hidden p-5"
          >
            {/* Accent wash keyed to the loan type, revealed on hover. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-[0.14] blur-2xl transition-opacity duration-500 group-hover:opacity-30",
                t.gradient,
              )}
            />

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                  t.gradient,
                )}
              >
                {t.emoji}
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--text)]">
                  {t.label} EMI
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Up to {formatCompact(t.ranges.amount[1])} · {t.ranges.tenure[1]} yrs
                </p>
              </div>
            </div>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              {t.blurb}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span className="text-xs text-[var(--text-muted)]">
                Typical rate from{" "}
                <strong className="text-[var(--text-secondary)]">
                  {formatPercent(t.defaults.rate)}
                </strong>
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-brand-300">
                Calculate
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h11m0 0-4-4m4 4-4 4" />
                </svg>
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
