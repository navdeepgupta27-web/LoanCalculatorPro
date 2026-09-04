import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { RISK_LABEL, SCHEMES } from "@/lib/schemes";
import { cn } from "@/lib/utils";

/**
 * The eight investment and savings calculators, laid out like the loan grid.
 *
 * Risk is on the face of every card rather than hidden a click away: a SIP
 * projection and a PPF maturity are not the same kind of number, and a grid
 * that showed them identically would imply they were.
 */
export function SchemeGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {SCHEMES.map((s, i) => (
        <Reveal key={s.id} delay={i * 50}>
          <Link
            href={`/${s.slug}`}
            className="card card-lift group relative flex h-full flex-col overflow-hidden p-5"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-[0.14] blur-2xl transition-opacity duration-500 group-hover:opacity-30",
                s.gradient,
              )}
            />

            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                s.gradient,
              )}
            >
              {s.emoji}
            </span>

            <h3 className="mt-3 font-display text-base font-bold text-[var(--text)]">{s.name}</h3>

            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              {s.blurb}
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
              <span className="text-xs text-[var(--text-muted)]">
                {s.kind === "guaranteed"
                  ? "Guaranteed return"
                  : `Market-linked · ${RISK_LABEL[s.risk]} risk`}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-brand-300">
                Open
                <svg
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
