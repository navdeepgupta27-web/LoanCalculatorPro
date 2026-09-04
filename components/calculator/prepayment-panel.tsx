"use client";

import { useState } from "react";

import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { useFormat } from "@/components/country/country-provider";
import type { Prepayment, PrepaymentMode, RecurringFrequency, RecurringPrepayment } from "@/lib/loan";
import { cn } from "@/lib/utils";

interface PrepaymentPanelProps {
  prepayments: Prepayment[];
  onPrepaymentsChange: (next: Prepayment[]) => void;
  recurring: RecurringPrepayment | null;
  onRecurringChange: (next: RecurringPrepayment | null) => void;
  mode: PrepaymentMode;
  onModeChange: (mode: PrepaymentMode) => void;
  maxMonths: number;
}

/**
 * Extra-payment controls: any number of one-off lump sums plus an optional
 * standing extra payment, and the choice of what the lender does with them.
 *
 * The mode toggle is the single most valuable control on the page — the same
 * ₹5 lakh saves wildly different amounts depending on whether it shortens the
 * term or shrinks the instalment — so it is stated in plain words, not jargon.
 */
export function PrepaymentPanel({
  prepayments,
  onPrepaymentsChange,
  recurring,
  onRecurringChange,
  mode,
  onModeChange,
  maxMonths,
}: PrepaymentPanelProps) {
  const { symbol, compact: formatCompact } = useFormat();

  const [open, setOpen] = useState(false);
  const active = prepayments.length > 0 || !!recurring;

  const updatePrepayment = (index: number, patch: Partial<Prepayment>) => {
    onPrepaymentsChange(prepayments.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const addPrepayment = () => {
    const lastMonth = prepayments.length ? Math.max(...prepayments.map((p) => p.month)) : 0;
    onPrepaymentsChange([
      ...prepayments,
      { month: Math.min(maxMonths, lastMonth + 12 || 12), amount: 100000 },
    ]);
    setOpen(true);
  };

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors duration-300",
        active
          ? "border-accent-300 bg-accent-50/50 dark:border-accent-800 dark:bg-accent-950/20"
          : "border-[var(--border)] bg-[var(--bg-subtle)]",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm transition-colors",
              active ? "bg-accent-500 text-white" : "bg-[var(--surface)] text-[var(--text-muted)]",
            )}
          >
            ₹
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-bold text-[var(--text)]">Part Payments</span>
            <span className="text-xs text-[var(--text-muted)]">
              {active
                ? `${prepayments.length} lump sum${prepayments.length === 1 ? "" : "s"}${recurring ? " + recurring" : ""}`
                : "Optional — see what paying extra saves"}
            </span>
          </span>
        </span>
        <svg
          viewBox="0 0 20 20"
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-300",
            open && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-expo)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 border-t border-[var(--border)] px-4 py-4">
            <Segmented
              label="What should the extra payment do?"
              value={mode}
              onChange={(v) => onModeChange(v as PrepaymentMode)}
              options={[
                {
                  value: "reduceTenure",
                  label: "Cut tenure",
                  description: "EMI stays the same and the loan finishes earlier. Saves the most interest.",
                },
                {
                  value: "reduceEMI",
                  label: "Cut EMI",
                  description: "Term stays the same and the monthly instalment drops. Eases cash flow.",
                },
              ]}
            />

            <div className="flex flex-col gap-3">
              {prepayments.map((p, i) => (
                <div
                  key={i}
                  className="flex items-end gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5"
                >
                  <Field label="Amount" className="flex-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      prefix={symbol}
                      value={p.amount || ""}
                      onChange={(e) =>
                        updatePrepayment(i, { amount: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })
                      }
                      className="text-sm"
                    />
                  </Field>
                  <Field label="After month" className="w-28">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={p.month || ""}
                      onChange={(e) =>
                        updatePrepayment(i, {
                          month: Math.min(
                            maxMonths,
                            Math.max(1, Number(e.target.value.replace(/[^0-9]/g, "")) || 1),
                          ),
                        })
                      }
                      className="text-sm"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => onPrepaymentsChange(prepayments.filter((_, idx) => idx !== i))}
                    aria-label={`Remove part payment of ${formatCompact(p.amount)}`}
                    className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 5l10 10M15 5L5 15" />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addPrepayment}
                className="rounded-lg border border-dashed border-[var(--border-strong)] py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-accent-400 hover:text-accent-600 dark:hover:text-accent-400"
              >
                + Add a lump-sum payment
              </button>
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <label className="mb-2 flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={!!recurring}
                  onChange={(e) =>
                    onRecurringChange(
                      e.target.checked
                        ? { amount: 5000, frequency: "monthly", startMonth: 1 }
                        : null,
                    )
                  }
                  className="h-4 w-4 accent-accent-600"
                />
                <span className="text-sm font-semibold text-[var(--text)]">
                  Also pay something extra regularly
                </span>
              </label>

              {recurring && (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <Field label="Extra amount">
                    <Input
                      type="text"
                      inputMode="numeric"
                      prefix={symbol}
                      value={recurring.amount || ""}
                      onChange={(e) =>
                        onRecurringChange({
                          ...recurring,
                          amount: Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
                        })
                      }
                      className="text-sm"
                    />
                  </Field>
                  <Field label="How often">
                    <Select
                      value={recurring.frequency}
                      onChange={(e) =>
                        onRecurringChange({
                          ...recurring,
                          frequency: e.target.value as RecurringFrequency,
                        })
                      }
                      className="text-sm"
                    >
                      <option value="monthly">Every month</option>
                      <option value="quarterly">Every quarter</option>
                      <option value="yearly">Every year</option>
                    </Select>
                  </Field>
                  <Field label="Starting month" className="col-span-2 sm:col-span-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={recurring.startMonth || ""}
                      onChange={(e) =>
                        onRecurringChange({
                          ...recurring,
                          startMonth: Math.max(1, Number(e.target.value.replace(/[^0-9]/g, "")) || 1),
                        })
                      }
                      className="text-sm"
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
