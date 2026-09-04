"use client";

import { Fragment, useState } from "react";

import { Segmented } from "@/components/ui/segmented";
import { useFormat } from "@/components/country/country-provider";
import type { LoanResult } from "@/lib/loan";
import { cn } from "@/lib/utils";

type View = "yearly" | "monthly";

const HEAD_CELL =
  "px-3 py-2.5 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]";

/**
 * Amortisation schedule.
 *
 * Defaults to the yearly roll-up because a 30-year loan is 360 rows, and nobody
 * reads 360 rows — each year expands to its months on demand. The monthly view
 * pages in chunks rather than rendering every row at once.
 */
export function ScheduleTable({ result }: { result: LoanResult }) {
  const { currency: formatCurrency } = useFormat();

  const [view, setView] = useState<View>("yearly");
  const [openYears, setOpenYears] = useState<Set<number>>(
    () => new Set(result.yearly[0] ? [result.yearly[0].year] : []),
  );
  const [monthLimit, setMonthLimit] = useState(60);

  if (!result.schedule.length) return null;

  const toggleYear = (year: number) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
        <div>
          <h3 className="font-display text-base font-bold text-[var(--text)]">
            Amortisation Schedule
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {result.schedule.length} instalments · every rupee accounted for
          </p>
        </div>
        <Segmented
          size="sm"
          className="w-[13rem] no-print"
          options={[
            { value: "yearly", label: "Year-wise" },
            { value: "monthly", label: "Month-wise" },
          ]}
          value={view}
          onChange={(v) => setView(v as View)}
        />
      </div>

      <div className="overflow-x-auto print-full">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead className="bg-[var(--bg-subtle)]">
            <tr>
              <th className={cn(HEAD_CELL, "text-left")}>Period</th>
              <th className={cn(HEAD_CELL, "text-right")}>Payment</th>
              <th className={cn(HEAD_CELL, "text-right")}>Principal</th>
              <th className={cn(HEAD_CELL, "text-right")}>Interest</th>
              {result.hasPrepayment && <th className={cn(HEAD_CELL, "text-right")}>Prepaid</th>}
              <th className={cn(HEAD_CELL, "text-right")}>Balance</th>
              <th className={cn(HEAD_CELL, "text-right")}>Paid</th>
            </tr>
          </thead>

          {view === "yearly" ? (
            <tbody>
              {result.yearly.map((y) => {
                const isOpen = openYears.has(y.year);
                return (
                  <Fragment key={y.year}>
                    <tr
                      onClick={() => toggleYear(y.year)}
                      className="cursor-pointer border-t border-[var(--border)] bg-[var(--surface)] font-semibold transition-colors hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="px-3 py-2.5 text-left">
                        <span className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 20 20"
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform duration-200",
                              isOpen && "rotate-90",
                            )}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m7.5 5 5 5-5 5" />
                          </svg>
                          {y.year}
                          <span className="text-xs font-normal text-[var(--text-muted)]">
                            ({y.months.length} mo)
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tnum">{formatCurrency(y.totalPaid)}</td>
                      <td className="px-3 py-2.5 text-right tnum text-[var(--color-principal)]">
                        {formatCurrency(y.principal)}
                      </td>
                      <td className="px-3 py-2.5 text-right tnum text-[var(--color-interest)]">
                        {formatCurrency(y.interest)}
                      </td>
                      {result.hasPrepayment && (
                        <td className="px-3 py-2.5 text-right tnum text-accent-600 dark:text-accent-400">
                          {y.prepayment > 0 ? formatCurrency(y.prepayment) : "—"}
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-right tnum">{formatCurrency(y.closingBalance)}</td>
                      <td className="px-3 py-2.5 text-right tnum">
                        {y.months[y.months.length - 1].paidPct.toFixed(0)}%
                      </td>
                    </tr>

                    {isOpen &&
                      y.months.map((m) => (
                        <tr
                          key={`${y.year}-${m.month}`}
                          className={cn(
                            "border-t border-[var(--border)] text-[0.8125rem] text-[var(--text-secondary)]",
                            m.prepayment > 0 && "bg-accent-50/60 dark:bg-accent-950/25",
                          )}
                        >
                          <td className="py-2 pl-9 pr-3 text-left">
                            {m.label}
                            {m.prepayment > 0 && (
                              <span className="ml-1.5 text-accent-600 dark:text-accent-400">●</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tnum">{formatCurrency(m.emi)}</td>
                          <td className="px-3 py-2 text-right tnum">{formatCurrency(m.principal)}</td>
                          <td className="px-3 py-2 text-right tnum">{formatCurrency(m.interest)}</td>
                          {result.hasPrepayment && (
                            <td className="px-3 py-2 text-right tnum text-accent-600 dark:text-accent-400">
                              {m.prepayment > 0 ? formatCurrency(m.prepayment) : "—"}
                            </td>
                          )}
                          <td className="px-3 py-2 text-right tnum">{formatCurrency(m.closingBalance)}</td>
                          <td className="px-3 py-2 text-right tnum">{m.paidPct.toFixed(1)}%</td>
                        </tr>
                      ))}
                  </Fragment>
                );
              })}
            </tbody>
          ) : (
            <tbody>
              {result.schedule.slice(0, monthLimit).map((m) => (
                <tr
                  key={m.month}
                  className={cn(
                    "border-t border-[var(--border)] text-[0.8125rem] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]",
                    m.prepayment > 0 && "bg-accent-50/60 font-medium dark:bg-accent-950/25",
                  )}
                >
                  <td className="px-3 py-2 text-left">
                    <span className="mr-2 text-[var(--text-muted)] tnum">{m.month}</span>
                    {m.label}
                  </td>
                  <td className="px-3 py-2 text-right tnum">{formatCurrency(m.emi)}</td>
                  <td className="px-3 py-2 text-right tnum text-[var(--color-principal)]">
                    {formatCurrency(m.principal)}
                  </td>
                  <td className="px-3 py-2 text-right tnum text-[var(--color-interest)]">
                    {formatCurrency(m.interest)}
                  </td>
                  {result.hasPrepayment && (
                    <td className="px-3 py-2 text-right tnum text-accent-600 dark:text-accent-400">
                      {m.prepayment > 0 ? formatCurrency(m.prepayment) : "—"}
                    </td>
                  )}
                  <td className="px-3 py-2 text-right tnum">{formatCurrency(m.closingBalance)}</td>
                  <td className="px-3 py-2 text-right tnum">{m.paidPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {view === "monthly" && monthLimit < result.schedule.length && (
        <div className="border-t border-[var(--border)] p-3 text-center no-print">
          <button
            type="button"
            onClick={() => setMonthLimit((n) => n + 120)}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
          >
            Show {Math.min(120, result.schedule.length - monthLimit)} more of{" "}
            {result.schedule.length - monthLimit} remaining
          </button>
        </div>
      )}
    </div>
  );
}
