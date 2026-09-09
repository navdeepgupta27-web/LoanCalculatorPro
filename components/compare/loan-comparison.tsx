"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/components/analytics/activity-tracker";
import { BalanceChart, type ChartSeries } from "@/components/charts/balance-chart";
import { ShareBar } from "@/components/share/share-bar";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { SliderField } from "@/components/ui/slider-field";
import { useToast } from "@/components/ui/toast";
import { useCountry, useFormat } from "@/components/country/country-provider";
import { instalmentWords } from "@/lib/naming";
import {
  compareLoans,
  comparisonToCsv,
  downloadCsv,
  type CompareCandidate,
} from "@/lib/loan";
import { loanTypesFor, localiseLoanType, LOAN_TYPE_MAP, type LoanTypeId } from "@/lib/site";
import { cn } from "@/lib/utils";

/** A lender's rate row, passed in from the database for one-tap prefill. */
export interface RateOption {
  bankName: string;
  loanType: LoanTypeId;
  minRate: number;
  processingFeePct: number | null;
  maxTenureYears: number | null;
}

interface Lender {
  id: string;
  name: string;
  rate: number;
  tenure: number;
  procFee: number;
  gst: number;
}

const PALETTE = ["#6366f1", "#10b981", "#f97316", "#ec4899"];

let nextId = 100;
const makeId = () => `lender-${nextId++}`;

function seedLenders(type: LoanTypeId): Lender[] {
  const d = LOAN_TYPE_MAP[type].defaults;
  return [
    { id: makeId(), name: "Lender A", rate: d.rate, tenure: d.tenureYears, procFee: d.procFee, gst: 18 },
    {
      id: makeId(),
      name: "Lender B",
      rate: Math.round((d.rate + 0.35) * 100) / 100,
      tenure: d.tenureYears,
      procFee: Math.max(0, d.procFee - 0.25),
      gst: 18,
    },
  ];
}

export function LoanComparison({ rateOptions = [] }: { rateOptions?: RateOption[] }) {
  const country = useCountry();
  const words = instalmentWords(country.code);
  const types = loanTypesFor(country.code);
  const { symbol, compact: formatCompact, currency: formatCurrency, percent: formatPercent, rate: formatRate, tenure: formatTenure } = useFormat();

  const { toast } = useToast();
  const [loanType, setLoanType] = useState<LoanTypeId>("home");
  const [amount, setAmount] = useState(LOAN_TYPE_MAP.home.defaults.amount);
  const [lenders, setLenders] = useState<Lender[]>(() => seedLenders("home"));
  const [view, setView] = useState<"table" | "chart">("table");

  const config = localiseLoanType(country.code, LOAN_TYPE_MAP[loanType]);
  const availableRates = useMemo(
    () => rateOptions.filter((r) => r.loanType === loanType),
    [rateOptions, loanType],
  );

  const changeType = (id: LoanTypeId) => {
    setLoanType(id);
    setAmount(LOAN_TYPE_MAP[id].defaults.amount);
    setLenders(seedLenders(id));
  };

  const update = (id: string, patch: Partial<Lender>) =>
    setLenders((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const addLender = () => {
    if (lenders.length >= 4) return;
    setLenders((prev) => [
      ...prev,
      {
        id: makeId(),
        name: `Lender ${String.fromCharCode(65 + prev.length)}`,
        rate: config.defaults.rate,
        tenure: config.defaults.tenureYears,
        procFee: config.defaults.procFee,
        gst: 18,
      },
    ]);
  };

  /** Fill a card from a bank's published rate row. */
  const applyRate = (id: string, key: string) => {
    const option = availableRates.find((r) => r.bankName === key);
    if (!option) return;
    update(id, {
      name: option.bankName,
      rate: option.minRate,
      ...(option.processingFeePct != null ? { procFee: option.processingFeePct } : {}),
      ...(option.maxTenureYears != null
        ? { tenure: Math.min(option.maxTenureYears, config.ranges.tenure[1]) }
        : {}),
    });
    trackEvent("compare_prefill", { bank: option.bankName, loanType });
  };

  const candidates: CompareCandidate[] = useMemo(
    () =>
      lenders.map((l) => ({
        id: l.id,
        name: l.name.trim() || "Unnamed",
        amount,
        rate: l.rate,
        tenureYears: l.tenure,
        processingFeePct: l.procFee,
        gstPct: l.gst,
      })),
    [lenders, amount],
  );

  const rows = useMemo(() => compareLoans(candidates), [candidates]);
  const valid = rows.filter((r) => !r.result.error);
  const best = valid.find((r) => r.rank === 1);

  const series: ChartSeries[] = valid.map((r, i) => ({
    name: r.name,
    color: PALETTE[i % PALETTE.length],
    points: r.result.schedule.map((s) => ({ x: s.month, y: s.closingBalance, label: s.label })),
  }));

  const exportCsv = () => {
    downloadCsv("loan-comparison.csv", comparisonToCsv(rows));
    trackEvent("export_comparison", { lenders: rows.length });
    toast("Comparison downloaded");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Shared loan basics ---------- */}
      <div className="card p-5">
        <h2 className="font-display text-base font-bold text-[var(--text)]">
          1. What are you borrowing?
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          The same amount is applied to every lender, so the comparison is like for like.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => changeType(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-200",
                loanType === t.id
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-300 hover:text-[var(--text)]",
              )}
            >
              <span>{t.emoji}</span>
              {t.shortLabel}
            </button>
          ))}
        </div>

        <div className="mt-5 max-w-md">
          <SliderField
            label="Loan amount"
            prefix={symbol}
            value={amount}
            onChange={setAmount}
            min={config.ranges.amount[0]}
            max={config.ranges.amount[1]}
            step={config.ranges.amount[2]}
            showWords
          />
        </div>
      </div>

      {/* ---------- Lender cards ---------- */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--text)]">
              2. Add the offers
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Up to four lenders. Enter the rate and fee each one quoted you.
            </p>
          </div>
          {lenders.length < 4 && (
            <Button variant="secondary" size="sm" onClick={addLender}>
              + Add lender
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {lenders.map((l, i) => {
            const row = rows.find((r) => r.id === l.id);
            const isBest = row?.rank === 1 && valid.length > 1;

            return (
              <div
                key={l.id}
                className={cn(
                  "card relative flex flex-col gap-3 p-4 transition-all duration-300",
                  isBest && "border-accent-400 shadow-[0_0_0_1px_rgb(16_185_129/0.25),0_8px_28px_-12px_rgb(16_185_129/0.5)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 rounded-t-[var(--radius-card)]"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />

                {isBest && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-accent-500 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">
                    Cheapest
                  </span>
                )}

                <div className="flex items-start justify-between gap-2 pt-1">
                  <Input
                    aria-label="Lender name"
                    value={l.name}
                    onChange={(e) => update(l.id, { name: e.target.value })}
                    className="!py-1.5 font-display text-sm font-bold"
                    placeholder="Bank name"
                  />
                  {lenders.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setLenders((prev) => prev.filter((x) => x.id !== l.id))}
                      aria-label={`Remove ${l.name}`}
                      className="mt-1 shrink-0 text-[var(--text-muted)] transition-colors hover:text-red-500"
                    >
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5 5l10 10M15 5L5 15" />
                      </svg>
                    </button>
                  )}
                </div>

                {availableRates.length > 0 && (
                  <Select
                    aria-label="Prefill from published rates"
                    value=""
                    onChange={(e) => applyRate(l.id, e.target.value)}
                    className="!py-1.5 text-xs"
                  >
                    <option value="">Prefill from published rates…</option>
                    {availableRates.map((r) => (
                      <option key={r.bankName} value={r.bankName}>
                        {r.bankName} — from {formatRate(r.minRate)}
                      </option>
                    ))}
                  </Select>
                )}

                <Field label="Interest rate">
                  <Input
                    type="text"
                    inputMode="decimal"
                    suffix="%"
                    value={l.rate}
                    onChange={(e) => update(l.id, { rate: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                    className="!py-1.5 text-sm"
                  />
                </Field>

                <Field label="Tenure">
                  <Input
                    type="text"
                    inputMode="numeric"
                    suffix="yrs"
                    value={l.tenure}
                    onChange={(e) => update(l.id, { tenure: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })}
                    className="!py-1.5 text-sm"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Fee %">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={l.procFee}
                      onChange={(e) => update(l.id, { procFee: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                      className="!py-1.5 text-sm"
                    />
                  </Field>
                  <Field label="GST %">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={l.gst}
                      onChange={(e) => update(l.id, { gst: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                      className="!py-1.5 text-sm"
                    />
                  </Field>
                </div>

                {row && !row.result.error && (
                  <div className="mt-1 space-y-1.5 border-t border-[var(--border)] pt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[var(--text-muted)]">{words.abbr}</span>
                      <span className="font-display text-lg font-extrabold text-[var(--text)] tnum">
                        {formatCurrency(row.result.emi)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Total cost</span>
                      <span className="text-sm font-bold text-[var(--text-secondary)] tnum">
                        {formatCompact(row.result.totalCost)}
                      </span>
                    </div>
                    {row.costOverBest > 0 && (
                      <p className="rounded-md bg-red-50 px-2 py-1 text-[0.7rem] font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                        +{formatCompact(row.costOverBest)} vs cheapest
                      </p>
                    )}
                  </div>
                )}

                {row?.result.error && (
                  <p className="rounded-md bg-amber-50 px-2 py-1.5 text-[0.7rem] text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    {row.result.error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- Verdict ---------- */}
      {best && valid.length > 1 && (
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-accent-600 to-accent-700 p-5 text-white shadow-[0_8px_28px_-10px_rgb(5_150_105/0.6)]">
          <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/75">The verdict</p>
          <h3 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
            {best.name} costs you the least
          </h3>
          <p className="mt-2 max-w-3xl text-sm text-white/85">
            At {formatPercent(best.input.rate)} over {formatTenure(best.result.actual.tenureMonths)}, you
            pay {formatCurrency(best.result.emi)} a month and{" "}
            {formatCurrency(best.result.totalCost)} in total including fees and GST
            {valid.length > 1 && (
              <>
                {" "}
                — {formatCurrency(Math.max(...valid.map((v) => v.costOverBest)))} less than the most
                expensive offer here
              </>
            )}
            .
          </p>
        </div>
      )}

      {/* ---------- Detail ---------- */}
      {valid.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
            <h2 className="font-display text-base font-bold text-[var(--text)]">
              3. The detail, side by side
            </h2>
            <Segmented
              size="sm"
              className="w-[13rem] no-print"
              value={view}
              onChange={(v) => setView(v as "table" | "chart")}
              options={[
                { value: "table", label: "Table" },
                { value: "chart", label: "Balance" },
              ]}
            />
          </div>

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] border-collapse text-sm">
                <thead className="bg-[var(--bg-subtle)]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Measure
                    </th>
                    {valid.map((r, i) => (
                      <th key={r.id} className="px-4 py-2.5 text-right text-[0.8125rem] font-bold text-[var(--text)]">
                        <span className="flex items-center justify-end gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                          {r.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Interest rate", get: (r: (typeof valid)[number]) => formatPercent(r.input.rate) },
                    { label: "Tenure", get: (r: (typeof valid)[number]) => formatTenure(r.result.actual.tenureMonths) },
                    { label: `Monthly ${words.noun}`, get: (r: (typeof valid)[number]) => formatCurrency(r.result.emi), strong: true },
                    { label: "Total interest", get: (r: (typeof valid)[number]) => formatCurrency(r.result.actual.totalInterest) },
                    { label: "Processing fee", get: (r: (typeof valid)[number]) => formatCurrency(r.result.processingFee) },
                    { label: "GST on fee", get: (r: (typeof valid)[number]) => formatCurrency(r.result.gst) },
                    { label: "Total cost", get: (r: (typeof valid)[number]) => formatCurrency(r.result.totalCost), strong: true },
                    { label: "Last instalment", get: (r: (typeof valid)[number]) => r.result.actual.payoffLabel },
                    {
                      label: "Extra vs cheapest",
                      get: (r: (typeof valid)[number]) =>
                        r.costOverBest > 0 ? `+${formatCurrency(r.costOverBest)}` : "— cheapest",
                    },
                  ].map((row) => (
                    <tr key={row.label} className="border-t border-[var(--border)]">
                      <td className="px-4 py-2.5 text-left text-[var(--text-secondary)]">{row.label}</td>
                      {valid.map((r) => (
                        <td
                          key={r.id}
                          className={cn(
                            "px-4 py-2.5 text-right tnum",
                            row.strong ? "font-bold text-[var(--text)]" : "text-[var(--text-secondary)]",
                            row.label === "Extra vs cheapest" &&
                              (r.costOverBest > 0
                                ? "text-red-600 dark:text-red-400"
                                : "font-semibold text-accent-600 dark:text-accent-400"),
                          )}
                        >
                          {row.get(r)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <BalanceChart series={series} height={300} />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] p-4 no-print">
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              Download comparison (CSV)
            </Button>
            <ShareBar
              title={`Comparing ${valid.length} ${config.label.toLowerCase()} offers on ${formatCompact(amount)}`}
              label=""
            />
          </div>
        </div>
      )}
    </div>
  );
}
