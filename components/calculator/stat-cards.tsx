"use client";

import type { ReactNode } from "react";

import { CountUp } from "@/components/ui/count-up";
import { useCountry, useFormat } from "@/components/country/country-provider";
import { instalmentWords } from "@/lib/naming";
import type { LoanResult } from "@/lib/loan";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: number;
  caption?: ReactNode;
  tone?: "brand" | "interest" | "neutral" | "accent";
  format?: "currency" | "compact";
  hero?: boolean;
}

const TONE_VALUE: Record<NonNullable<StatProps["tone"]>, string> = {
  brand: "text-brand-600 dark:text-brand-300",
  interest: "text-[var(--color-interest)]",
  accent: "text-accent-600 dark:text-accent-400",
  neutral: "text-[var(--text)]",
};

function Stat({ label, value, caption, tone = "neutral", format = "currency", hero }: StatProps) {
  return (
    <div
      className={cn(
        "card card-lift relative overflow-hidden p-4",
        // The EMI is the headline figure — full width on phones, half on wide.
        hero && "col-span-2 sm:p-5",
      )}
    >
      {hero && (
        <span
          aria-hidden="true"
          className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/10 blur-2xl"
        />
      )}
      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p
        className={cn(
          // A full rupee figure runs to 12 characters (₹1,04,13,879), so the
          // non-hero cards only step up to the larger size once the grid is
          // wide enough to hold one.
          "mt-1 font-display font-extrabold tracking-tight tnum",
          TONE_VALUE[tone],
          hero ? "text-3xl sm:text-[2.6rem]" : "text-lg xl:text-xl",
        )}
      >
        <CountUp value={value} format={format} />
      </p>
      {caption && <p className="mt-1 text-xs text-[var(--text-muted)]">{caption}</p>}
    </div>
  );
}

export function StatCards({ result }: { result: LoanResult }) {
  const { tenure: formatTenure, symbol } = useFormat();
  const words = instalmentWords(useCountry().code);

  const { emi, actual, feesTotal, totalCost, interestToPrincipalRatio } = result;

  return (
    // Two columns until there is genuinely room for four — at tablet widths a
    // quarter-width card cannot hold a full crore figure.
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Stat
        label={`Monthly ${words.noun}`}
        value={emi}
        tone="brand"
        hero
        caption={
          <>
            for <strong className="text-[var(--text-secondary)]">{formatTenure(actual.tenureMonths)}</strong> ·
            last instalment {actual.payoffLabel}
          </>
        }
      />
      <Stat
        label="Total Interest"
        value={actual.totalInterest}
        tone="interest"
        caption={`${symbol}${interestToPrincipalRatio.toFixed(2)} interest per ${symbol}1 borrowed`}
      />
      <Stat
        label="Fees + tax"
        value={feesTotal}
        caption="Deducted upfront by the lender"
      />
      <Stat
        label="Total Repayment"
        value={actual.totalPayment}
        caption="Principal + interest over the full term"
      />
      <Stat
        label="Total Cost of Loan"
        value={totalCost}
        tone="neutral"
        caption="Everything you pay, fees included"
      />
    </div>
  );
}
