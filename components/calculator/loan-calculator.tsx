"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { trackEvent } from "@/components/analytics/activity-tracker";
import { BalanceChart, type ChartSeries } from "@/components/charts/balance-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { YearlyBars } from "@/components/charts/yearly-bars";
import { ShareBar } from "@/components/share/share-bar";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { SliderField } from "@/components/ui/slider-field";
import { useToast } from "@/components/ui/toast";
import { useCountry, useFormat } from "@/components/country/country-provider";
import { instalmentWords } from "@/lib/naming";
import {
  calculateLoan,
  downloadCsv,
  scheduleToCsv,
  type LoanResult,
  type Prepayment,
  type PrepaymentMode,
  type RecurringPrepayment,
} from "@/lib/loan";
import { loanTypesFor, localiseLoanType, LOAN_TYPE_MAP, type LoanTypeId } from "@/lib/site";
import { cn } from "@/lib/utils";

import { PrepaymentPanel } from "./prepayment-panel";
import { ScheduleTable } from "./schedule-table";
import { StatCards } from "./stat-cards";

/* ------------------------------------------------------------------ */
/* URL state — makes every calculation a shareable link                */
/* ------------------------------------------------------------------ */

interface CalcState {
  loanType: LoanTypeId;
  amount: number;
  rate: number;
  tenure: number;
  procFee: number;
  gst: number;
  prepayments: Prepayment[];
  recurring: RecurringPrepayment | null;
  mode: PrepaymentMode;
}

function defaultsFor(loanType: LoanTypeId): CalcState {
  const t = LOAN_TYPE_MAP[loanType];
  return {
    loanType,
    amount: t.defaults.amount,
    rate: t.defaults.rate,
    tenure: t.defaults.tenureYears,
    procFee: t.defaults.procFee,
    gst: 18,
    prepayments: [],
    recurring: null,
    mode: "reduceTenure",
  };
}

/** Query parameters the calculator owns; everything else is left untouched. */
const OWNED_PARAMS = new Set(["amt", "rate", "yrs", "pf", "gst", "pp", "rec", "mode"]);

function encodeState(s: CalcState): string {
  const p = new URLSearchParams();
  p.set("amt", String(Math.round(s.amount)));
  p.set("rate", String(s.rate));
  p.set("yrs", String(s.tenure));
  if (s.procFee) p.set("pf", String(s.procFee));
  if (s.gst !== 18) p.set("gst", String(s.gst));
  if (s.prepayments.length) {
    p.set("pp", s.prepayments.map((x) => `${Math.round(x.amount)}@${x.month}`).join(","));
    p.set("mode", s.mode === "reduceEMI" ? "emi" : "ten");
  }
  if (s.recurring) {
    p.set("rec", `${Math.round(s.recurring.amount)}:${s.recurring.frequency}:${s.recurring.startMonth}`);
    p.set("mode", s.mode === "reduceEMI" ? "emi" : "ten");
  }
  return p.toString();
}

function decodeState(search: string, loanType: LoanTypeId): CalcState {
  const base = defaultsFor(loanType);
  const p = new URLSearchParams(search);
  const num = (key: string, fallback: number) => {
    const raw = p.get(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const prepayments: Prepayment[] = (p.get("pp") ?? "")
    .split(",")
    .filter(Boolean)
    .map((chunk) => {
      const [amount, month] = chunk.split("@");
      return { amount: Number(amount) || 0, month: Number(month) || 1 };
    })
    .filter((x) => x.amount > 0);

  let recurring: RecurringPrepayment | null = null;
  const rec = p.get("rec");
  if (rec) {
    const [amount, frequency, startMonth] = rec.split(":");
    if (Number(amount) > 0 && ["monthly", "quarterly", "yearly"].includes(frequency)) {
      recurring = {
        amount: Number(amount),
        frequency: frequency as RecurringPrepayment["frequency"],
        startMonth: Number(startMonth) || 1,
      };
    }
  }

  return {
    ...base,
    amount: num("amt", base.amount),
    rate: num("rate", base.rate),
    tenure: num("yrs", base.tenure),
    procFee: num("pf", base.procFee),
    gst: num("gst", base.gst),
    prepayments,
    recurring,
    mode: p.get("mode") === "emi" ? "reduceEMI" : "reduceTenure",
  };
}

/* ------------------------------------------------------------------ */

type ChartTab = "split" | "balance" | "yearly";

export function LoanCalculator({
  loanType: initialType = "home",
  showTypeSelector = true,
  className,
}: {
  loanType?: LoanTypeId;
  showTypeSelector?: boolean;
  className?: string;
}) {
  const country = useCountry();
  const words = instalmentWords(country.code);
  const types = loanTypesFor(country.code);
  const { symbol, compact: formatCompact, currency: formatCurrency, percent: formatPercent, tenure: formatTenure } = useFormat();

  const { toast } = useToast();
  const [state, setState] = useState<CalcState>(() => defaultsFor(initialType));
  const [chartTab, setChartTab] = useState<ChartTab>("split");

  // Read any shared link once, on mount. Reading window directly (rather than
  // useSearchParams) keeps this page statically renderable — no Suspense
  // boundary and no forced dynamic rendering just to support a share link.
  useEffect(() => {
    if (!window.location.search) return;
    // Applied synchronously, before the debounced writer below can run. An
    // earlier version deferred this to requestAnimationFrame to avoid the
    // cascading-render lint warning, but rAF is suspended in background tabs
    // while setTimeout is not — so a share link opened in a background tab had
    // its parameters overwritten with the defaults before they were ever read.
    // One extra render on mount is the right trade for not losing the input.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(decodeState(window.location.search, initialType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror state back into the address bar, debounced so dragging a slider
  // does not write a history entry per frame.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = new URLSearchParams(encodeState(state));
      // Carry over any parameter the calculator does not own — campaign tags
      // in particular, which would otherwise be wiped from the URL moments
      // after landing.
      new URLSearchParams(window.location.search).forEach((value, key) => {
        if (!OWNED_PARAMS.has(key)) next.set(key, value);
      });
      window.history.replaceState(null, "", `${window.location.pathname}?${next}`);
    }, 400);
    return () => window.clearTimeout(id);
  }, [state]);

  const patch = useCallback((next: Partial<CalcState>) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);

  // Localised so the body copy uses the market's name for the product.
  const config = localiseLoanType(country.code, LOAN_TYPE_MAP[state.loanType]);

  const result: LoanResult = useMemo(
    () =>
      calculateLoan({
        amount: state.amount,
        rate: state.rate,
        tenureYears: state.tenure,
        processingFeePct: state.procFee,
        gstPct: state.gst,
        prepayments: state.prepayments,
        recurring: state.recurring,
        mode: state.mode,
      }),
    [state],
  );

  // The same loan with no extra payments, for the dashed comparison line.
  const baselineResult: LoanResult | null = useMemo(() => {
    if (!result.hasPrepayment) return null;
    return calculateLoan({
      amount: state.amount,
      rate: state.rate,
      tenureYears: state.tenure,
      processingFeePct: state.procFee,
      gstPct: state.gst,
    });
  }, [state, result.hasPrepayment]);

  const changeLoanType = (id: LoanTypeId) => {
    setState(defaultsFor(id));
    trackEvent("loan_type_change", { loanType: id });
  };

  const series: ChartSeries[] = useMemo(() => {
    const out: ChartSeries[] = [
      {
        name: result.hasPrepayment ? "With part payments" : "Outstanding balance",
        color: "var(--color-principal)",
        points: result.schedule.map((r) => ({ x: r.month, y: r.closingBalance, label: r.label })),
      },
    ];
    if (baselineResult) {
      out.push({
        name: "Without part payments",
        color: "var(--color-interest)",
        dashed: true,
        points: baselineResult.schedule.map((r) => ({
          x: r.month,
          y: r.closingBalance,
          label: r.label,
        })),
      });
    }
    return out;
  }, [result, baselineResult]);

  const exportCsv = () => {
    downloadCsv(
      `${config.label.toLowerCase().replace(/\s+/g, "-")}-schedule.csv`,
      scheduleToCsv(result, `${config.label} — ${formatCurrency(state.amount)} at ${formatPercent(state.rate)}`),
    );
    trackEvent("export_csv", { loanType: state.loanType });
    toast("Schedule downloaded");
  };

  const amountPresets = useMemo(() => {
    const [min, max] = config.ranges.amount;
    return [min, max * 0.05, max * 0.15, max * 0.3].map((v) => Math.round(v / 10000) * 10000).filter((v) => v >= min);
  }, [config]);

  const shareTitle = `${config.label} of ${formatCompact(state.amount)} at ${formatPercent(state.rate)} — EMI ${formatCurrency(result.emi)}`;

  return (
    <div className={cn("w-full", className)}>
      {showTypeSelector && (
        <div className="mb-6 flex flex-wrap justify-center gap-2 no-print">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => changeLoanType(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-200",
                state.loanType === t.id
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-[var(--shadow-glow)] dark:bg-brand-950 dark:text-brand-200"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:-translate-y-0.5 hover:border-brand-300 hover:text-[var(--text)]",
              )}
              aria-pressed={state.loanType === t.id}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:gap-8">
        {/* ---------------- Inputs ---------------- */}
        {/* min-w-0: without it a grid item defaults to min-width:auto, and the
            wide amortisation table below forces the whole column open. */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="card flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-[var(--text)]">
                {config.emoji} {config.label} details
              </h2>
              <button
                type="button"
                onClick={() => {
                  setState(defaultsFor(state.loanType));
                  toast("Reset to defaults", "info");
                }}
                className="text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-brand-600 dark:hover:text-brand-300 no-print"
              >
                Reset
              </button>
            </div>

            <SliderField
              label="Loan amount"
              prefix={symbol}
              value={state.amount}
              onChange={(amount) => patch({ amount })}
              min={config.ranges.amount[0]}
              max={config.ranges.amount[1]}
              step={config.ranges.amount[2]}
              showWords
              presets={amountPresets}
            />

            <SliderField
              label="Interest rate"
              suffix="% p.a."
              value={state.rate}
              onChange={(rate) => patch({ rate })}
              min={config.ranges.rate[0]}
              max={config.ranges.rate[1]}
              step={config.ranges.rate[2]}
              decimals={2}
              formatPreset={(v) => `${v}%`}
            />

            <SliderField
              label="Tenure"
              suffix="years"
              value={state.tenure}
              onChange={(tenure) => patch({ tenure })}
              min={config.ranges.tenure[0]}
              max={config.ranges.tenure[1]}
              step={config.ranges.tenure[2]}
              formatPreset={(v) => `${v}y`}
              hint={`${Math.round(state.tenure * 12)} monthly instalments`}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Processing fee" hint="% of loan amount">
                <Input
                  type="text"
                  inputMode="decimal"
                  suffix="%"
                  value={state.procFee}
                  onChange={(e) => patch({ procFee: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                />
              </Field>
              <Field label="GST on fee" hint="18% is standard">
                <Input
                  type="text"
                  inputMode="decimal"
                  suffix="%"
                  value={state.gst}
                  onChange={(e) => patch({ gst: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                />
              </Field>
            </div>

            <PrepaymentPanel
              prepayments={state.prepayments}
              onPrepaymentsChange={(prepayments) => patch({ prepayments })}
              recurring={state.recurring}
              onRecurringChange={(recurring) => patch({ recurring })}
              mode={state.mode}
              onModeChange={(mode) => patch({ mode })}
              maxMonths={Math.round(state.tenure * 12)}
            />
          </div>
        </aside>

        {/* ---------------- Results ---------------- */}
        <section className="flex min-w-0 flex-col gap-5">
          {result.error ? (
            <div className="card border-amber-300 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/40">
              <p className="font-display text-base font-bold text-amber-900 dark:text-amber-200">
                Check the numbers
              </p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">{result.error}</p>
            </div>
          ) : (
            <>
              <StatCards result={result} />

              {result.hasPrepayment && result.savings.interest > 0 && (
                <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-accent-600 to-accent-700 p-5 text-white shadow-[0_8px_28px_-10px_rgb(5_150_105/0.6)] animate-[scale-in_0.4s_var(--ease-out-expo)]">
                  <span
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
                  />
                  <h3 className="flex items-center gap-2 font-display text-base font-bold">
                    <span className="text-lg">🎉</span> What your part payments save
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-white/15 p-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-white/75">
                        Interest saved
                      </p>
                      <p className="font-display text-xl font-extrabold tnum">
                        {formatCurrency(result.savings.interest)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/15 p-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-white/75">
                        Time saved
                      </p>
                      <p className="font-display text-xl font-extrabold tnum">
                        {result.savings.months > 0 ? formatTenure(result.savings.months) : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/15 p-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-white/75">
                        {state.mode === "reduceEMI" ? "New EMI" : "Loan clears"}
                      </p>
                      <p className="font-display text-xl font-extrabold tnum">
                        {state.mode === "reduceEMI"
                          ? formatCurrency(result.savings.newEmi)
                          : result.actual.payoffLabel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/15 p-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-white/75">
                        Total prepaid
                      </p>
                      <p className="font-display text-xl font-extrabold tnum">
                        {formatCurrency(result.actual.totalPrepaid)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/80">
                    Paying {formatCurrency(result.actual.totalPrepaid)} early returns{" "}
                    {formatCurrency(result.savings.interest)} in avoided interest — a{" "}
                    {((result.savings.interest / Math.max(1, result.actual.totalPrepaid)) * 100).toFixed(0)}%
                    return on money you were going to pay the bank anyway.
                  </p>
                </div>
              )}

              {/* Charts */}
              <div className="card p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    Where your money goes
                  </h3>
                  <Segmented
                    size="sm"
                    className="w-[19rem] no-print"
                    value={chartTab}
                    onChange={(v) => setChartTab(v as ChartTab)}
                    options={[
                      { value: "split", label: "Split" },
                      { value: "balance", label: "Balance" },
                      { value: "yearly", label: "By year" },
                    ]}
                  />
                </div>

                {chartTab === "split" && (
                  <div className="animate-[fade-in_0.35s_ease]">
                    <DonutChart
                      centerLabel="Total repayment"
                      centerValue={formatCompact(result.actual.totalPayment)}
                      segments={[
                        { label: "Principal", value: state.amount, color: "var(--color-principal)" },
                        {
                          label: "Interest",
                          value: result.actual.totalInterest,
                          color: "var(--color-interest)",
                        },
                        { label: "Fees + GST", value: result.feesTotal, color: "var(--color-savings)" },
                      ]}
                    />
                  </div>
                )}

                {chartTab === "balance" && (
                  <div className="animate-[fade-in_0.35s_ease]">
                    <BalanceChart series={series} />
                  </div>
                )}

                {chartTab === "yearly" && (
                  <div className="animate-[fade-in_0.35s_ease]">
                    <YearlyBars years={result.yearly} />
                  </div>
                )}
              </div>

              <ScheduleTable result={result} />

              <div className="card flex flex-wrap items-center justify-between gap-4 p-4 no-print">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={exportCsv}>
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 3v10m0 0 4-4m-4 4-4-4M3 16h14" />
                    </svg>
                    Download CSV
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      trackEvent("print_schedule", { loanType: state.loanType });
                      window.print();
                    }}
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 7V3h8v4M6 15H4V9h12v6h-2M6 13h8v4H6z" />
                    </svg>
                    Print / PDF
                  </Button>
                </div>

                <ShareBar title={shareTitle} label="" />
              </div>
            </>
          )}
        </section>
      </div>

      {/* Mobile summary bar — the EMI stays visible while scrolling inputs. */}
      {!result.error && (
        <div className="glass fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2.5 lg:hidden no-print">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Monthly {words.noun}
            </p>
            <p className="font-display text-lg font-extrabold text-brand-600 tnum dark:text-brand-300">
              {formatCurrency(result.emi)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Total interest
            </p>
            <p className="font-display text-lg font-extrabold text-[var(--color-interest)] tnum">
              {formatCompact(result.actual.totalInterest)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
