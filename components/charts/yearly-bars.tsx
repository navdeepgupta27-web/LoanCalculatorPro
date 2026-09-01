"use client";

import { useEffect, useState } from "react";

import { formatCompact, formatCurrency } from "@/lib/format";
import type { YearSummary } from "@/lib/loan";
import { cn } from "@/lib/utils";

/**
 * Principal vs interest paid each calendar year, as stacked bars.
 *
 * This is the view that makes the shape of a loan obvious: in the early years
 * the orange (interest) block dwarfs the indigo (principal) one, and the ratio
 * inverts only in the back half.
 */
export function YearlyBars({ years, className }: { years: YearSummary[]; className?: string }) {
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (!years.length) return null;

  const max = Math.max(...years.map((y) => y.principal + y.interest + y.prepayment));
  const active = hover !== null ? years[hover] : null;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-center gap-[3px] overflow-x-auto pb-2 sm:gap-1.5">
        {years.map((y, i) => {
          const total = y.principal + y.interest + y.prepayment;
          const heightPct = max > 0 ? (total / max) * 100 : 0;
          const principalPct = total > 0 ? (y.principal / total) * 100 : 0;
          const prepayPct = total > 0 ? (y.prepayment / total) * 100 : 0;
          const interestPct = 100 - principalPct - prepayPct;

          return (
            <button
              key={y.year}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="group flex min-w-[16px] flex-1 flex-col items-center gap-1.5"
              aria-label={`${y.year}: principal ${formatCurrency(y.principal)}, interest ${formatCurrency(y.interest)}`}
            >
              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-md transition-[height] duration-[900ms] ease-[var(--ease-out-expo)]"
                style={{
                  height: drawn ? `${Math.max(3, (heightPct / 100) * 160)}px` : "0px",
                  transitionDelay: `${Math.min(i * 35, 500)}ms`,
                }}
              >
                <div
                  className={cn("w-full transition-opacity", hover !== null && hover !== i && "opacity-40")}
                  style={{ height: `${principalPct}%`, background: "var(--color-principal)" }}
                />
                {prepayPct > 0 && (
                  <div
                    className={cn("w-full transition-opacity", hover !== null && hover !== i && "opacity-40")}
                    style={{ height: `${prepayPct}%`, background: "var(--color-savings)" }}
                  />
                )}
                <div
                  className={cn("w-full transition-opacity", hover !== null && hover !== i && "opacity-40")}
                  style={{ height: `${interestPct}%`, background: "var(--color-interest)" }}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold tabular-nums transition-colors sm:text-[10px]",
                  hover === i ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                )}
              >
                {String(y.year).slice(2)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 min-h-[3.25rem] rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2.5">
        {active ? (
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 text-xs">
            <span className="font-display font-bold text-[var(--text)]">{active.year}</span>
            <span className="text-[var(--text-secondary)]">
              Principal{" "}
              <strong className="text-[var(--color-principal)] tnum">{formatCompact(active.principal)}</strong>
            </span>
            <span className="text-[var(--text-secondary)]">
              Interest{" "}
              <strong className="text-[var(--color-interest)] tnum">{formatCompact(active.interest)}</strong>
            </span>
            {active.prepayment > 0 && (
              <span className="text-[var(--text-secondary)]">
                Prepaid{" "}
                <strong className="text-[var(--color-savings)] tnum">{formatCompact(active.prepayment)}</strong>
              </span>
            )}
            <span className="text-[var(--text-secondary)]">
              Balance <strong className="text-[var(--text)] tnum">{formatCompact(active.closingBalance)}</strong>
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-principal)" }} />
              Principal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-interest)" }} />
              Interest
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-savings)" }} />
              Prepayment
            </span>
            <span className="hidden sm:inline">· hover a bar for the year&rsquo;s split</span>
          </div>
        )}
      </div>
    </div>
  );
}
