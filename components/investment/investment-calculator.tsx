"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { trackEvent } from "@/components/analytics/activity-tracker";
import { BalanceChart, type ChartSeries } from "@/components/charts/balance-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { ShareBar } from "@/components/share/share-bar";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { SliderField } from "@/components/ui/slider-field";
import { useToast } from "@/components/ui/toast";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import {
  calculateAnnualScheme,
  calculateFd,
  calculateLumpsum,
  calculateNps,
  calculateRd,
  calculateSip,
  inflationAdjusted,
  type InvestmentResult,
  type NpsResult,
} from "@/lib/investment";
import type { SchemeConfig, SchemeId } from "@/lib/schemes";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

interface CalcState {
  monthly: number;
  yearly: number;
  lumpsum: number;
  years: number;
  rate: number;
  stepUp: number;
  compounding: number;
  // NPS only
  currentAge: number;
  retirementAge: number;
  annuityPercent: number;
  annuityRate: number;
}

function defaultsFor(scheme: SchemeConfig, storedRate: number | null): CalcState {
  return {
    monthly: scheme.id === "nps" || scheme.id === "epf" ? 10_000 : 10_000,
    yearly: Math.min(150_000, scheme.maxPerYear ?? 150_000),
    lumpsum: 100_000,
    years: scheme.defaultYears,
    rate: storedRate ?? scheme.defaultRate,
    stepUp: 0,
    compounding: scheme.id === "fd" ? 4 : 1,
    currentAge: 30,
    retirementAge: 60,
    annuityPercent: 40,
    annuityRate: 6,
  };
}

/** Query-string keys the calculator owns, so campaign tags survive. */
const OWNED = new Set([
  "amt", "yrs", "rate", "step", "comp", "age", "ret", "ann", "annr",
]);

/* ------------------------------------------------------------------ */

export function InvestmentCalculator({
  scheme,
  storedRate,
  rateSourceUrl,
  ratePeriod,
  rateVerified,
}: {
  scheme: SchemeConfig;
  storedRate: number | null;
  rateSourceUrl?: string | null;
  ratePeriod?: string | null;
  rateVerified?: boolean;
}) {
  const { toast } = useToast();
  const [state, setState] = useState<CalcState>(() => defaultsFor(scheme, storedRate));
  const [chartTab, setChartTab] = useState<"split" | "growth">("split");
  const [showInflation, setShowInflation] = useState(false);

  const patch = useCallback((next: Partial<CalcState>) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);

  // Read a shared link on mount. Synchronous rather than deferred to a frame —
  // rAF is suspended in background tabs, which would let the writer below
  // overwrite the shared values before they were ever applied.
  useEffect(() => {
    if (!window.location.search) return;
    const p = new URLSearchParams(window.location.search);
    const num = (k: string, fallback: number) => {
      const raw = p.get(k);
      const n = raw === null ? NaN : Number(raw);
      return Number.isFinite(n) && n >= 0 ? n : fallback;
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({
      ...prev,
      monthly: num("amt", prev.monthly),
      yearly: num("amt", prev.yearly),
      lumpsum: num("amt", prev.lumpsum),
      years: num("yrs", prev.years),
      rate: num("rate", prev.rate),
      stepUp: num("step", prev.stepUp),
      compounding: num("comp", prev.compounding),
      currentAge: num("age", prev.currentAge),
      retirementAge: num("ret", prev.retirementAge),
      annuityPercent: num("ann", prev.annuityPercent),
      annuityRate: num("annr", prev.annuityRate),
    }));
  }, []);

  // Mirror state into the URL, debounced.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const p = new URLSearchParams();
      const amount =
        scheme.id === "lumpsum" || scheme.id === "fd"
          ? state.lumpsum
          : scheme.id === "ppf" || scheme.id === "ssy"
            ? state.yearly
            : state.monthly;
      p.set("amt", String(Math.round(amount)));
      p.set("yrs", String(state.years));
      p.set("rate", String(state.rate));
      if (state.stepUp) p.set("step", String(state.stepUp));
      if (scheme.id === "fd") p.set("comp", String(state.compounding));
      if (scheme.id === "nps") {
        p.set("age", String(state.currentAge));
        p.set("ret", String(state.retirementAge));
        p.set("ann", String(state.annuityPercent));
        p.set("annr", String(state.annuityRate));
      }
      new URLSearchParams(window.location.search).forEach((v, k) => {
        if (!OWNED.has(k)) p.set(k, v);
      });
      window.history.replaceState(null, "", `${window.location.pathname}?${p}`);
    }, 400);
    return () => window.clearTimeout(id);
  }, [state, scheme.id]);

  /* ---------------- compute ---------------- */

  const result: InvestmentResult | NpsResult = useMemo(() => {
    switch (scheme.id) {
      case "sip":
        return calculateSip({
          monthlyAmount: state.monthly,
          years: state.years,
          expectedReturn: state.rate,
          annualStepUpPct: state.stepUp,
        });
      case "lumpsum":
        return calculateLumpsum({
          amount: state.lumpsum,
          years: state.years,
          expectedReturn: state.rate,
          compoundingPerYear: 1,
        });
      case "fd":
        return calculateFd({
          principal: state.lumpsum,
          years: state.years,
          annualRate: state.rate,
          compoundingPerYear: state.compounding,
        });
      case "rd":
        return calculateRd({
          monthlyDeposit: state.monthly,
          years: state.years,
          annualRate: state.rate,
        });
      case "ppf":
        return calculateAnnualScheme({
          yearlyContribution: state.yearly,
          contributionYears: state.years,
          maturityYears: state.years,
          annualRate: state.rate,
        });
      case "ssy":
        return calculateAnnualScheme({
          yearlyContribution: state.yearly,
          // Deposits run for 15 years; the balance then compounds to year 21.
          contributionYears: Math.min(15, state.years),
          maturityYears: state.years,
          annualRate: state.rate,
        });
      case "nps":
        return calculateNps({
          monthlyContribution: state.monthly,
          currentAge: state.currentAge,
          retirementAge: state.retirementAge,
          expectedReturn: state.rate,
          annuityPercent: state.annuityPercent,
          annuityRate: state.annuityRate,
        });
      case "epf":
      default:
        return calculateSip({
          monthlyAmount: state.monthly,
          years: state.years,
          expectedReturn: state.rate,
        });
    }
  }, [scheme.id, state]);

  const nps = scheme.id === "nps" ? (result as NpsResult) : null;

  const series: ChartSeries[] = useMemo(() => {
    if (!result.schedule.length) return [];
    return [
      {
        name: "Value",
        color: "var(--color-principal)",
        points: result.schedule.map((r) => ({
          x: r.period,
          y: r.closingBalance,
          label: r.label,
        })),
      },
      {
        name: "Invested",
        color: "var(--color-interest)",
        dashed: true,
        points: result.schedule.map((r) => ({
          x: r.period,
          y: r.cumulativeContribution,
          label: r.label,
        })),
      },
    ];
  }, [result]);

  const realValue = inflationAdjusted(result.maturityValue, state.years, 6);

  /* ---------------- input sets per scheme ---------------- */

  const usesYearly = scheme.id === "ppf" || scheme.id === "ssy";
  const usesLumpsum = scheme.id === "lumpsum" || scheme.id === "fd";
  const isStatutory = scheme.rateIsStatutory;

  const amountField = usesLumpsum ? (
    <SliderField
      label="Amount invested"
      prefix="₹"
      value={state.lumpsum}
      onChange={(lumpsum) => patch({ lumpsum })}
      min={1_000}
      max={10_000_000}
      step={1_000}
      showWords
      presets={[100_000, 500_000, 1_000_000, 5_000_000]}
    />
  ) : usesYearly ? (
    <SliderField
      label="Yearly deposit"
      prefix="₹"
      value={state.yearly}
      onChange={(yearly) => patch({ yearly })}
      min={scheme.minPerYear ?? 500}
      max={scheme.maxPerYear ?? 150_000}
      step={500}
      showWords
      presets={[
        scheme.minPerYear ?? 500,
        50_000,
        100_000,
        scheme.maxPerYear ?? 150_000,
      ]}
      hint={
        scheme.maxPerYear
          ? `Statutory ceiling: ${formatCurrency(scheme.maxPerYear)} a year`
          : undefined
      }
    />
  ) : (
    <SliderField
      label={scheme.id === "rd" ? "Monthly deposit" : "Monthly investment"}
      prefix="₹"
      value={state.monthly}
      onChange={(monthly) => patch({ monthly })}
      min={500}
      max={500_000}
      step={500}
      showWords
      presets={[5_000, 10_000, 25_000, 50_000]}
    />
  );

  return (
    <div className="w-full">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:gap-8">
        {/* ---------------- Inputs ---------------- */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="card flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-[var(--text)]">
                {scheme.emoji} {scheme.shortName} details
              </h2>
              <button
                type="button"
                onClick={() => {
                  setState(defaultsFor(scheme, storedRate));
                  toast("Reset to defaults", "info");
                }}
                className="text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-brand-600 dark:hover:text-brand-300 no-print"
              >
                Reset
              </button>
            </div>

            {scheme.id !== "nps" && amountField}

            {scheme.id === "nps" && (
              <>
                <SliderField
                  label="Monthly contribution"
                  prefix="₹"
                  value={state.monthly}
                  onChange={(monthly) => patch({ monthly })}
                  min={500}
                  max={200_000}
                  step={500}
                  showWords
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Current age">
                    <Input
                      inputMode="numeric"
                      value={state.currentAge}
                      onChange={(e) =>
                        patch({ currentAge: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Retirement age">
                    <Input
                      inputMode="numeric"
                      value={state.retirementAge}
                      onChange={(e) =>
                        patch({ retirementAge: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })
                      }
                    />
                  </Field>
                </div>
              </>
            )}

            {scheme.id !== "nps" && (
              <SliderField
                label={scheme.id === "ssy" ? "Years until maturity" : "Investment period"}
                suffix="years"
                value={state.years}
                onChange={(years) => patch({ years })}
                min={1}
                max={scheme.id === "ssy" ? 21 : 40}
                step={1}
                formatPreset={(v) => `${v}y`}
                hint={
                  scheme.id === "ssy"
                    ? "Deposits run for the first 15 years; the balance then compounds untouched."
                    : undefined
                }
              />
            )}

            <SliderField
              label={isStatutory ? "Interest rate" : "Expected annual return"}
              suffix="% p.a."
              value={state.rate}
              onChange={(rate) => patch({ rate })}
              min={1}
              max={isStatutory ? 15 : 30}
              step={0.1}
              decimals={2}
              formatPreset={(v) => `${v}%`}
              hint={
                isStatutory ? (
                  storedRate !== null ? (
                    <>
                      Government rate{ratePeriod ? ` for ${ratePeriod}` : ""}
                      {rateVerified ? "" : " — not yet confirmed by us"}.{" "}
                      {rateSourceUrl && (
                        <a
                          href={rateSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
                        >
                          Check the source
                        </a>
                      )}
                    </>
                  ) : (
                    "No published rate stored yet — enter the current one."
                  )
                ) : (
                  "An assumption, not a guarantee. Markets do not deliver a fixed rate."
                )
              }
            />

            {scheme.id === "sip" && (
              <SliderField
                label="Annual step-up"
                suffix="%"
                value={state.stepUp}
                onChange={(stepUp) => patch({ stepUp })}
                min={0}
                max={25}
                step={1}
                formatPreset={(v) => `${v}%`}
                hint="Raise the instalment each year, e.g. with your salary."
              />
            )}

            {scheme.id === "fd" && (
              <Field label="Compounding" hint="Quarterly is the Indian bank default">
                <Select
                  value={state.compounding}
                  onChange={(e) => patch({ compounding: Number(e.target.value) })}
                >
                  <option value={1}>Annually</option>
                  <option value={2}>Half-yearly</option>
                  <option value={4}>Quarterly</option>
                  <option value={12}>Monthly</option>
                </Select>
              </Field>
            )}

            {scheme.id === "nps" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Annuity share" hint="% of corpus">
                  <Input
                    inputMode="decimal"
                    suffix="%"
                    value={state.annuityPercent}
                    onChange={(e) =>
                      patch({ annuityPercent: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })
                    }
                  />
                </Field>
                <Field label="Annuity rate" hint="Assumed">
                  <Input
                    inputMode="decimal"
                    suffix="%"
                    value={state.annuityRate}
                    onChange={(e) =>
                      patch({ annuityRate: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })
                    }
                  />
                </Field>
              </div>
            )}
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
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="card card-lift relative col-span-2 overflow-hidden p-4 sm:p-5">
                  <span
                    aria-hidden="true"
                    className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/10 blur-2xl"
                  />
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {scheme.id === "nps" ? "Corpus at retirement" : "Maturity value"}
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-brand-600 tnum dark:text-brand-300 sm:text-[2.6rem]">
                    <CountUp value={result.maturityValue} />
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    after {scheme.id === "nps" ? (result as NpsResult).yearsToRetirement : state.years} years
                    {!isStatutory && " at the return you assumed"}
                  </p>
                </div>

                <div className="card card-lift p-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    You invest
                  </p>
                  <p className="mt-1 font-display text-lg font-extrabold text-[var(--text)] tnum xl:text-xl">
                    <CountUp value={result.invested} />
                  </p>
                </div>

                <div className="card card-lift p-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isStatutory ? "Interest earned" : "Estimated gains"}
                  </p>
                  <p className="mt-1 font-display text-lg font-extrabold text-accent-600 tnum dark:text-accent-400 xl:text-xl">
                    <CountUp value={result.gains} />
                  </p>
                </div>

                <div className="card card-lift p-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Absolute return
                  </p>
                  <p className="mt-1 font-display text-lg font-extrabold text-[var(--text)] tnum xl:text-xl">
                    {result.absoluteReturn.toFixed(1)}%
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    total gain on money in
                  </p>
                </div>

                <div className="card card-lift p-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Annualised {scheme.id === "lumpsum" || scheme.id === "fd" ? "(CAGR)" : "(XIRR)"}
                  </p>
                  <p className="mt-1 font-display text-lg font-extrabold text-[var(--text)] tnum xl:text-xl">
                    {formatPercent(result.annualisedReturn)}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {scheme.id === "lumpsum" || scheme.id === "fd"
                      ? "money held throughout"
                      : "money-weighted"}
                  </p>
                </div>
              </div>

              {nps && (
                <div className="card p-5">
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    At retirement, the corpus splits
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Tax-free lump sum", value: nps.lumpSumAtExit, tone: "text-accent-600 dark:text-accent-400" },
                      { label: "Buys an annuity", value: nps.annuityCorpus, tone: "text-brand-600 dark:text-brand-300" },
                      { label: "Estimated pension", value: nps.estimatedMonthlyPension, tone: "text-[var(--text)]", suffix: "/mo" },
                    ].map((b) => (
                      <div key={b.label} className="rounded-xl bg-[var(--bg-subtle)] p-3.5">
                        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          {b.label}
                        </p>
                        <p className={cn("mt-1 font-display text-xl font-extrabold tnum", b.tone)}>
                          {formatCurrency(b.value)}
                          {b.suffix && <span className="text-sm font-semibold">{b.suffix}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
                    The pension is an arithmetic estimate from the annuity rate you entered, not a
                    quotation. Real annuity rates at your retirement date are unknowable today.
                  </p>
                </div>
              )}

              <div className="card p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    How it builds up
                  </h3>
                  <Segmented
                    size="sm"
                    className="w-[14rem] no-print"
                    value={chartTab}
                    onChange={(v) => setChartTab(v as "split" | "growth")}
                    options={[
                      { value: "split", label: "Split" },
                      { value: "growth", label: "Growth" },
                    ]}
                  />
                </div>

                {chartTab === "split" ? (
                  <div className="animate-[fade-in_0.35s_ease]">
                    <DonutChart
                      centerLabel="Maturity value"
                      centerValue={formatCompact(result.maturityValue)}
                      segments={[
                        { label: "Invested", value: result.invested, color: "var(--color-principal)" },
                        {
                          label: isStatutory ? "Interest" : "Gains",
                          value: Math.max(0, result.gains),
                          color: "var(--color-savings)",
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <div className="animate-[fade-in_0.35s_ease]">
                    <BalanceChart series={series} />
                  </div>
                )}
              </div>

              <div className="card p-5">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={showInflation}
                    onChange={(e) => setShowInflation(e.target.checked)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span className="text-sm font-semibold text-[var(--text)]">
                    Show what it is worth in today&rsquo;s money
                  </span>
                </label>
                {showInflation && (
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                    At 6% inflation, {formatCurrency(result.maturityValue)} in {state.years} years
                    buys what{" "}
                    <strong className="text-[var(--text)]">{formatCurrency(realValue)}</strong> buys
                    today. The balance grows; purchasing power grows by less.
                  </p>
                )}
              </div>

              <div className="card flex flex-wrap items-center justify-between gap-4 p-4 no-print">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    trackEvent("print_projection", { scheme: scheme.id });
                    window.print();
                  }}
                >
                  Print / PDF
                </Button>
                <ShareBar
                  title={`${scheme.name}: ${formatCompact(result.maturityValue)} after ${state.years} years`}
                  label=""
                />
              </div>
            </>
          )}
        </section>
      </div>

      {!result.error && (
        <div className="glass fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2.5 lg:hidden no-print">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Maturity value
            </p>
            <p className="font-display text-lg font-extrabold text-brand-600 tnum dark:text-brand-300">
              {formatCurrency(result.maturityValue)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {isStatutory ? "Interest" : "Gains"}
            </p>
            <p className="font-display text-lg font-extrabold text-accent-600 tnum dark:text-accent-400">
              {formatCompact(result.gains)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export type { SchemeId };
