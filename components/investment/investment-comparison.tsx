"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/components/analytics/activity-tracker";
import { BalanceChart, type ChartSeries } from "@/components/charts/balance-chart";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { SliderField } from "@/components/ui/slider-field";
import { useFormat } from "@/components/country/country-provider";
import {
  calculateAnnualScheme,
  calculateFd,
  calculateLumpsum,
  calculateRd,
  calculateSip,
  inflationAdjusted,
  type InvestmentResult,
} from "@/lib/investment";
import { RISK_LABEL, SCHEMES, type SchemeConfig, type SchemeId } from "@/lib/schemes";
import { cn } from "@/lib/utils";

const PALETTE = ["#6366f1", "#10b981", "#f97316", "#ec4899", "#0ea5e9", "#a855f7"];

const RISK_TONE = {
  none: "accent",
  low: "sky",
  moderate: "amber",
  high: "rose",
} as const;

/** Schemes that take a comparable monthly or yearly contribution. */
const COMPARABLE: SchemeId[] = ["sip", "rd", "ppf", "ssy", "fd", "lumpsum"];

interface Row {
  scheme: SchemeConfig;
  result: InvestmentResult;
  colour: string;
  rateUsed: number;
}

export function InvestmentComparison({
  storedRates,
}: {
  storedRates: Record<string, number | null>;
}) {
  const { symbol, compact: formatCompact, currency: formatCurrency, percent: formatPercent } = useFormat();

  const [mode, setMode] = useState<"monthly" | "lumpsum">("monthly");
  const [monthly, setMonthly] = useState(10_000);
  const [lumpsum, setLumpsum] = useState(500_000);
  const [years, setYears] = useState(15);
  const [equityReturn, setEquityReturn] = useState(12);
  const [depositRate, setDepositRate] = useState(7);
  const [sortKey, setSortKey] = useState<"value" | "risk" | "name">("value");
  const [selected, setSelected] = useState<SchemeId[]>(["sip", "ppf", "fd", "rd"]);

  const rows: Row[] = useMemo(() => {
    // Statutory schemes use the stored government rate; deposits and
    // market-linked options use the two assumptions the visitor set above.
    const rateFor = (s: SchemeConfig): number => {
      if (s.rateIsStatutory) return storedRates[s.id] ?? s.defaultRate;
      if (s.kind === "guaranteed") return depositRate;
      return equityReturn;
    };

    const chosen = SCHEMES.filter((s) => selected.includes(s.id));

    return chosen.map((scheme, i) => {
      const rate = rateFor(scheme);
      let result: InvestmentResult;

      if (mode === "lumpsum") {
        // Every scheme gets the same single sum, so the comparison is like for like.
        result =
          scheme.id === "fd"
            ? calculateFd({ principal: lumpsum, years, annualRate: rate })
            : calculateLumpsum({
                amount: lumpsum,
                years,
                expectedReturn: rate,
                compoundingPerYear: 1,
              });
      } else {
        switch (scheme.id) {
          case "sip":
            result = calculateSip({ monthlyAmount: monthly, years, expectedReturn: rate });
            break;
          case "rd":
            result = calculateRd({ monthlyDeposit: monthly, years, annualRate: rate });
            break;
          case "ppf":
          case "ssy":
            // Annual schemes take the same money as a yearly deposit, capped
            // at the statutory ceiling — which is itself a real constraint.
            result = calculateAnnualScheme({
              yearlyContribution: Math.min(monthly * 12, scheme.maxPerYear ?? Infinity),
              contributionYears: scheme.id === "ssy" ? Math.min(15, years) : years,
              maturityYears: years,
              annualRate: rate,
            });
            break;
          case "fd":
            result = calculateFd({ principal: monthly * 12 * years, years, annualRate: rate });
            break;
          default:
            result = calculateLumpsum({
              amount: monthly * 12 * years,
              years,
              expectedReturn: rate,
              compoundingPerYear: 1,
            });
        }
      }

      return { scheme, result, colour: PALETTE[i % PALETTE.length], rateUsed: rate };
    });
  }, [selected, mode, monthly, lumpsum, years, equityReturn, depositRate, storedRates]);

  const sorted = useMemo(() => {
    const order = { none: 0, low: 1, moderate: 2, high: 3 };
    return [...rows].sort((a, b) => {
      if (sortKey === "name") return a.scheme.name.localeCompare(b.scheme.name);
      if (sortKey === "risk") return order[a.scheme.risk] - order[b.scheme.risk];
      return b.result.maturityValue - a.result.maturityValue;
    });
  }, [rows, sortKey]);

  const series: ChartSeries[] = rows
    .filter((r) => r.result.schedule.length)
    .map((r) => ({
      name: r.scheme.shortName,
      color: r.colour,
      points: r.result.schedule.map((p) => ({
        x: r.scheme.id === "ppf" || r.scheme.id === "ssy" ? p.period * 12 : p.period,
        y: p.closingBalance,
        label: p.label,
      })),
    }));

  const toggle = (id: SchemeId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    trackEvent("compare_investment_toggle", { scheme: id });
  };

  const hasMarketRisk = rows.some((r) => r.scheme.kind !== "guaranteed");

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Inputs ---------- */}
      <div className="card p-5">
        <h2 className="font-display text-base font-bold text-[var(--text)]">
          1. What are you putting in?
        </h2>

        <div className="mt-4 max-w-xs">
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as "monthly" | "lumpsum")}
            options={[
              { value: "monthly", label: "Every month" },
              { value: "lumpsum", label: "One lump sum" },
            ]}
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {mode === "monthly" ? (
            <SliderField
              label="Monthly amount"
              prefix={symbol}
              value={monthly}
              onChange={setMonthly}
              min={500}
              max={200_000}
              step={500}
              showWords
              presets={[5_000, 10_000, 25_000, 50_000]}
            />
          ) : (
            <SliderField
              label="Amount invested"
              prefix={symbol}
              value={lumpsum}
              onChange={setLumpsum}
              min={10_000}
              max={10_000_000}
              step={10_000}
              showWords
              presets={[100_000, 500_000, 1_000_000, 5_000_000]}
            />
          )}

          <SliderField
            label="Period"
            suffix="years"
            value={years}
            onChange={setYears}
            min={1}
            max={30}
            step={1}
            formatPreset={(v) => `${v}y`}
          />

          <div className="flex flex-col gap-4">
            <SliderField
              label="Assumed market return"
              suffix="% p.a."
              value={equityReturn}
              onChange={setEquityReturn}
              min={1}
              max={25}
              step={0.5}
              decimals={1}
              formatPreset={(v) => `${v}%`}
              hint="Applied to market-linked options only"
            />
            <SliderField
              label="Deposit rate"
              suffix="% p.a."
              value={depositRate}
              onChange={setDepositRate}
              min={1}
              max={12}
              step={0.1}
              decimals={2}
              formatPreset={(v) => `${v}%`}
              hint="Applied to FD and RD"
            />
          </div>
        </div>
      </div>

      {/* ---------- Scheme picker ---------- */}
      <div className="card p-5">
        <h2 className="font-display text-base font-bold text-[var(--text)]">
          2. What do you want to compare?
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCHEMES.filter((s) => COMPARABLE.includes(s.id)).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={selected.includes(s.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200",
                selected.includes(s.id)
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:-translate-y-0.5 hover:border-brand-300 hover:text-[var(--text)]",
              )}
            >
              <span>{s.emoji}</span>
              {s.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- The honest warning ---------- */}
      {hasMarketRisk && (
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-950/40">
          <h3 className="font-display text-base font-bold text-amber-900 dark:text-amber-200">
            These numbers are not equivalent
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            A guaranteed return and a projected one are different kinds of number. PPF and FD pay
            what they promise; a market-linked projection is arithmetic on an assumption you chose,
            and the actual outcome can be materially lower — including a loss. The table is sorted
            by value only because you asked it to be, and the highest figure is usually the one
            carrying the most risk. Read the risk and lock-in columns before the money column.
          </p>
        </div>
      )}

      {/* ---------- Comparison table ---------- */}
      {rows.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
            <h2 className="font-display text-base font-bold text-[var(--text)]">
              3. Side by side
            </h2>
            <Segmented
              size="sm"
              className="w-[17rem] no-print"
              value={sortKey}
              onChange={(v) => setSortKey(v as typeof sortKey)}
              options={[
                { value: "value", label: "By value" },
                { value: "risk", label: "By risk" },
                { value: "name", label: "A–Z" },
              ]}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] border-collapse text-sm">
              <thead className="bg-[var(--bg-subtle)]">
                <tr>
                  {[
                    "Scheme", "Rate used", "You invest", "Maturity value",
                    "Absolute", "Annualised", "Risk", "Lock-in", "Tax",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.scheme.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2 font-semibold text-[var(--text)]">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: r.colour }}
                        />
                        {r.scheme.emoji} {r.scheme.shortName}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[var(--text-secondary)] tnum">
                      {formatPercent(r.rateUsed)}
                      {r.scheme.rateIsStatutory && (
                        <span className="block text-[0.65rem] text-[var(--text-muted)]">
                          government-set
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[var(--text-secondary)] tnum">
                      {formatCompact(r.result.invested)}
                    </td>
                    <td className="px-3 py-3 font-display font-bold text-[var(--text)] tnum">
                      {formatCurrency(r.result.maturityValue)}
                    </td>
                    <td className="px-3 py-3 text-[var(--text-secondary)] tnum">
                      {r.result.absoluteReturn.toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-[var(--text-secondary)] tnum">
                      {formatPercent(r.result.annualisedReturn)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={RISK_TONE[r.scheme.risk]}>{RISK_LABEL[r.scheme.risk]}</Badge>
                    </td>
                    <td className="max-w-[11rem] px-3 py-3 text-[0.75rem] text-[var(--text-muted)]">
                      {r.scheme.lockIn}
                    </td>
                    <td className="max-w-[13rem] px-3 py-3 text-[0.75rem] text-[var(--text-muted)]">
                      {r.scheme.taxation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 sm:px-5">
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              We do not name a winner, because there is not one. The right choice depends on when
              you need the money, whether you can tolerate a fall in value, and your tax position —
              none of which a calculator knows.
              {rows.some((r) => r.scheme.maxPerYear) &&
                " Where a statutory ceiling applies, the contribution has been capped at it, which is itself part of the comparison."}
            </p>
          </div>
        </div>
      )}

      {series.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-bold text-[var(--text)]">
            How each one grows
          </h2>
          <BalanceChart series={series} height={300} />
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Market-linked lines are drawn as smooth curves because that is what a fixed assumed
            return produces. Real market returns are not smooth — this shape is a projection, not a
            forecast.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-base font-bold text-[var(--text)]">
            In today&rsquo;s money
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            At 6% inflation, here is what each maturity value would actually buy.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((r) => (
              <li
                key={r.scheme.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--text-secondary)]">
                  {r.scheme.emoji} {r.scheme.shortName}
                </span>
                <span className="font-semibold text-[var(--text)] tnum">
                  {formatCompact(inflationAdjusted(r.result.maturityValue, years, 6))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
