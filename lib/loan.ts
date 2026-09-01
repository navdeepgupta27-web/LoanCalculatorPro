/**
 * Loan amortisation engine.
 *
 * Uses the reducing-balance method that every Indian lender applies:
 *
 *     EMI = P · r · (1 + r)^n / ((1 + r)^n − 1)
 *
 * where r is the monthly rate and n the number of instalments. Interest for a
 * month is charged on the opening balance; whatever is left of the instalment
 * reduces principal.
 *
 * The engine is deliberately pure — no DOM, no I/O — so it can run on the
 * server for static pages and in the browser for live recalculation, and be
 * unit-tested directly.
 */

export type PrepaymentMode = "reduceTenure" | "reduceEMI";
export type RecurringFrequency = "monthly" | "quarterly" | "yearly";

export interface Prepayment {
  /** 1-based instalment number the lump sum is paid against. */
  month: number;
  amount: number;
}

export interface RecurringPrepayment {
  amount: number;
  frequency: RecurringFrequency;
  /** 1-based instalment number of the first extra payment. */
  startMonth: number;
}

export interface LoanInput {
  amount: number;
  /** Annual nominal rate, e.g. 8.5 for 8.5% p.a. */
  rate: number;
  tenureYears: number;
  processingFeePct?: number;
  gstPct?: number;
  prepayments?: Prepayment[];
  recurring?: RecurringPrepayment | null;
  mode?: PrepaymentMode;
  /** Month of the first instalment. Defaults to next month. */
  startDate?: Date;
}

export interface ScheduleRow {
  month: number;
  label: string;
  calendarYear: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  prepayment: number;
  closingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  /** Percentage of the original principal cleared by the end of this month. */
  paidPct: number;
}

export interface YearSummary {
  year: number;
  principal: number;
  interest: number;
  prepayment: number;
  totalPaid: number;
  closingBalance: number;
  months: ScheduleRow[];
}

export interface LoanTotals {
  totalInterest: number;
  totalPayment: number;
  tenureMonths: number;
  payoffLabel: string;
}

export interface LoanResult {
  /** Scheduled instalment at the start of the loan. */
  emi: number;
  /** The instalment in force at the end (differs when mode is reduceEMI). */
  finalEmi: number;
  monthlyRate: number;
  originalTenureMonths: number;

  /** What the loan would cost with no extra payments at all. */
  baseline: LoanTotals;
  /** What it actually costs once prepayments are applied. */
  actual: LoanTotals & { totalPrepaid: number };

  processingFee: number;
  gst: number;
  feesTotal: number;
  /** Every rupee that leaves your account: instalments + prepayments + fees. */
  totalCost: number;

  /** Interest as a share of the amount borrowed, e.g. 0.98 -> 98 paise per ₹1. */
  interestToPrincipalRatio: number;

  schedule: ScheduleRow[];
  yearly: YearSummary[];

  savings: {
    interest: number;
    months: number;
    /** Instalment after a reduceEMI prepayment; equals `emi` otherwise. */
    newEmi: number;
  };

  hasPrepayment: boolean;
  /** Set when the inputs cannot produce a valid schedule. */
  error: string | null;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function labelFor(start: Date, offset: number) {
  const d = new Date(start.getFullYear(), start.getMonth() + offset, 1);
  return { label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`, year: d.getFullYear() };
}

/**
 * Standard EMI. Falls back to straight-line repayment at a 0% rate, which is
 * what the closed-form expression degenerates to (and where it divides by zero).
 */
export function computeEmi(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  if (principal <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
}

/** Instalments needed to clear `balance` at a fixed EMI. Infinity if it never amortises. */
export function monthsToClear(balance: number, monthlyRate: number, emi: number): number {
  if (balance <= 0) return 0;
  if (monthlyRate <= 0) return Math.ceil(balance / emi);
  if (emi <= balance * monthlyRate) return Infinity;
  return Math.ceil(
    Math.log(emi / (emi - balance * monthlyRate)) / Math.log(1 + monthlyRate),
  );
}

function isRecurringDue(r: RecurringPrepayment, month: number): boolean {
  if (month < r.startMonth) return false;
  const delta = month - r.startMonth;
  if (r.frequency === "monthly") return true;
  if (r.frequency === "quarterly") return delta % 3 === 0;
  return delta % 12 === 0;
}

/** Default first-instalment month: the 1st of next month. */
export function defaultStartDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export function calculateLoan(input: LoanInput): LoanResult {
  const amount = Math.max(0, Number(input.amount) || 0);
  const rate = Math.max(0, Number(input.rate) || 0);
  const tenureYears = Math.max(0, Number(input.tenureYears) || 0);
  const processingFeePct = Math.max(0, Number(input.processingFeePct) || 0);
  const gstPct = Math.max(0, Number(input.gstPct) || 0);
  const mode: PrepaymentMode = input.mode === "reduceEMI" ? "reduceEMI" : "reduceTenure";
  const startDate = input.startDate ?? defaultStartDate();

  const monthlyRate = rate / 12 / 100;
  const originalTenureMonths = Math.round(tenureYears * 12);

  const processingFee = (processingFeePct / 100) * amount;
  const gst = (gstPct / 100) * processingFee;
  const feesTotal = processingFee + gst;

  const empty = (error: string | null): LoanResult => ({
    emi: 0,
    finalEmi: 0,
    monthlyRate,
    originalTenureMonths,
    baseline: { totalInterest: 0, totalPayment: 0, tenureMonths: originalTenureMonths, payoffLabel: "—" },
    actual: { totalInterest: 0, totalPayment: 0, tenureMonths: 0, payoffLabel: "—", totalPrepaid: 0 },
    processingFee,
    gst,
    feesTotal,
    totalCost: feesTotal,
    interestToPrincipalRatio: 0,
    schedule: [],
    yearly: [],
    savings: { interest: 0, months: 0, newEmi: 0 },
    hasPrepayment: false,
    error,
  });

  if (amount <= 0 || originalTenureMonths <= 0) {
    return empty(amount <= 0 ? "Enter a loan amount." : "Enter a tenure of at least one year.");
  }

  const scheduledEmi = computeEmi(amount, monthlyRate, originalTenureMonths);
  if (!Number.isFinite(scheduledEmi) || scheduledEmi <= 0) {
    return empty("These inputs do not produce a valid instalment.");
  }

  // ---- Baseline: the same loan with no extra payments. -------------------
  const baselineTotalPayment = scheduledEmi * originalTenureMonths;
  const baselineInterest = baselineTotalPayment - amount;
  const baseline: LoanTotals = {
    totalInterest: baselineInterest,
    totalPayment: baselineTotalPayment,
    tenureMonths: originalTenureMonths,
    payoffLabel: labelFor(startDate, originalTenureMonths - 1).label,
  };

  // ---- Normalise prepayments into a per-month lookup. --------------------
  const lumpByMonth = new Map<number, number>();
  for (const p of input.prepayments ?? []) {
    const m = Math.round(Number(p.month) || 0);
    const amt = Math.max(0, Number(p.amount) || 0);
    if (m >= 1 && amt > 0) lumpByMonth.set(m, (lumpByMonth.get(m) ?? 0) + amt);
  }
  const recurring =
    input.recurring && input.recurring.amount > 0
      ? {
          amount: Math.max(0, Number(input.recurring.amount) || 0),
          frequency: input.recurring.frequency,
          startMonth: Math.max(1, Math.round(Number(input.recurring.startMonth) || 1)),
        }
      : null;

  const hasPrepayment = lumpByMonth.size > 0 || !!recurring;

  // ---- Walk the schedule. ------------------------------------------------
  const schedule: ScheduleRow[] = [];
  let balance = amount;
  let currentEmi = scheduledEmi;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let totalPrepaid = 0;
  let totalInstalments = 0;

  // Without prepayments the loop can never exceed the original tenure; the cap
  // is a guard against pathological inputs (e.g. an EMI below the interest
  // accrual) rather than an expected exit.
  const maxMonths = originalTenureMonths + 1;

  for (let m = 1; m <= maxMonths && balance > 0.005; m++) {
    const opening = balance;
    const interest = opening * monthlyRate;

    let emiThisMonth = currentEmi;
    let principal = emiThisMonth - interest;

    if (principal <= 0) {
      // The instalment does not even cover the interest — the loan cannot amortise.
      return empty(
        "At this rate the instalment does not cover the monthly interest. Increase the tenure or lower the rate.",
      );
    }

    if (principal > opening) {
      // Final instalment: only collect what is actually outstanding.
      principal = opening;
      emiThisMonth = principal + interest;
    }

    balance = opening - principal;

    // Extra payments land after the instalment for the month has posted.
    let prepayment = 0;
    if (balance > 0) {
      const lump = lumpByMonth.get(m) ?? 0;
      const rec = recurring && isRecurringDue(recurring, m) ? recurring.amount : 0;
      prepayment = Math.min(balance, lump + rec);
      balance -= prepayment;
    }

    cumulativeInterest += interest;
    cumulativePrincipal += principal + prepayment;
    totalPrepaid += prepayment;
    totalInstalments += emiThisMonth;

    const { label, year } = labelFor(startDate, m - 1);
    schedule.push({
      month: m,
      label,
      calendarYear: year,
      openingBalance: opening,
      emi: emiThisMonth,
      principal,
      interest,
      prepayment,
      closingBalance: Math.max(0, balance),
      cumulativeInterest,
      cumulativePrincipal,
      paidPct: Math.min(100, (cumulativePrincipal / amount) * 100),
    });

    // In reduceEMI mode a prepayment shrinks the instalment over the months
    // that were originally left; in reduceTenure mode the EMI is untouched and
    // the loop simply terminates sooner.
    if (prepayment > 0 && mode === "reduceEMI" && balance > 0) {
      const remaining = originalTenureMonths - m;
      if (remaining > 0) currentEmi = computeEmi(balance, monthlyRate, remaining);
    }
  }

  const actualTenure = schedule.length;
  const actual = {
    totalInterest: cumulativeInterest,
    totalPayment: totalInstalments + totalPrepaid,
    tenureMonths: actualTenure,
    payoffLabel: actualTenure > 0 ? schedule[actualTenure - 1].label : "—",
    totalPrepaid,
  };

  // ---- Group by calendar year for the collapsible schedule view. ---------
  const yearly: YearSummary[] = [];
  for (const row of schedule) {
    let bucket = yearly[yearly.length - 1];
    if (!bucket || bucket.year !== row.calendarYear) {
      bucket = {
        year: row.calendarYear,
        principal: 0,
        interest: 0,
        prepayment: 0,
        totalPaid: 0,
        closingBalance: 0,
        months: [],
      };
      yearly.push(bucket);
    }
    bucket.principal += row.principal;
    bucket.interest += row.interest;
    bucket.prepayment += row.prepayment;
    bucket.totalPaid += row.emi + row.prepayment;
    bucket.closingBalance = row.closingBalance;
    bucket.months.push(row);
  }

  return {
    emi: scheduledEmi,
    finalEmi: currentEmi,
    monthlyRate,
    originalTenureMonths,
    baseline,
    actual,
    processingFee,
    gst,
    feesTotal,
    totalCost: actual.totalPayment + feesTotal,
    interestToPrincipalRatio: amount > 0 ? actual.totalInterest / amount : 0,
    schedule,
    yearly,
    savings: {
      interest: Math.max(0, baseline.totalInterest - actual.totalInterest),
      months: Math.max(0, baseline.tenureMonths - actual.tenureMonths),
      newEmi: mode === "reduceEMI" ? currentEmi : scheduledEmi,
    },
    hasPrepayment,
    error: null,
  };
}

/* ------------------------------------------------------------------ */
/* Comparison helpers                                                  */
/* ------------------------------------------------------------------ */

export interface CompareCandidate extends LoanInput {
  id: string;
  name: string;
}

export interface CompareRow {
  id: string;
  name: string;
  input: CompareCandidate;
  result: LoanResult;
  /** Rank by total cost, 1 = cheapest. */
  rank: number;
  /** Extra rupees paid versus the cheapest option. */
  costOverBest: number;
}

/**
 * Ranks candidate offers by total outflow (instalments + prepayments + fees),
 * which is the only comparison that reflects processing fees honestly.
 */
export function compareLoans(candidates: CompareCandidate[]): CompareRow[] {
  const evaluated = candidates.map((c) => ({ id: c.id, name: c.name, input: c, result: calculateLoan(c) }));
  const valid = evaluated.filter((e) => !e.result.error && e.result.emi > 0);
  const best = valid.length ? Math.min(...valid.map((e) => e.result.totalCost)) : 0;

  const ordered = [...valid].sort((a, b) => a.result.totalCost - b.result.totalCost);
  const rankById = new Map(ordered.map((e, i) => [e.id, i + 1]));

  return evaluated.map((e) => ({
    ...e,
    rank: rankById.get(e.id) ?? 0,
    costOverBest: e.result.error ? 0 : e.result.totalCost - best,
  }));
}

/* ------------------------------------------------------------------ */
/* CSV export                                                          */
/* ------------------------------------------------------------------ */

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Emits raw numbers rather than the on-screen ₹-formatted strings so the file
 * opens in Excel as numbers you can pivot, not text.
 */
export function scheduleToCsv(result: LoanResult, title = "Loan"): string {
  const lines: string[] = [];
  lines.push(`${title} - amortisation schedule (all amounts in INR)`);
  lines.push("");
  lines.push(["Scheduled EMI", Math.round(result.emi)].map(csvCell).join(","));
  lines.push(["Total interest", Math.round(result.actual.totalInterest)].map(csvCell).join(","));
  lines.push(["Total prepaid", Math.round(result.actual.totalPrepaid)].map(csvCell).join(","));
  lines.push(["Fees + GST", Math.round(result.feesTotal)].map(csvCell).join(","));
  lines.push(["Total cost", Math.round(result.totalCost)].map(csvCell).join(","));
  lines.push(["Tenure (months)", result.actual.tenureMonths].map(csvCell).join(","));
  lines.push("");
  lines.push(
    ["Month", "Period", "Opening Balance", "EMI", "Principal", "Interest", "Prepayment", "Closing Balance", "Cumulative Interest", "% Paid"]
      .map(csvCell)
      .join(","),
  );
  for (const r of result.schedule) {
    lines.push(
      [
        r.month,
        r.label,
        Math.round(r.openingBalance),
        Math.round(r.emi),
        Math.round(r.principal),
        Math.round(r.interest),
        Math.round(r.prepayment),
        Math.round(r.closingBalance),
        Math.round(r.cumulativeInterest),
        r.paidPct.toFixed(2),
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function comparisonToCsv(rows: CompareRow[]): string {
  const lines: string[] = [];
  lines.push("Loan comparison (all amounts in INR)");
  lines.push("");
  lines.push(
    ["Rank", "Lender", "Amount", "Rate %", "Tenure (yrs)", "EMI", "Total Interest", "Processing Fee", "GST", "Total Cost", "Extra vs Best"]
      .map(csvCell)
      .join(","),
  );
  for (const row of rows) {
    if (row.result.error) {
      lines.push([0, row.name, "—", "—", "—", "—", "—", "—", "—", "—", row.result.error].map(csvCell).join(","));
      continue;
    }
    lines.push(
      [
        row.rank,
        row.name,
        Math.round(row.input.amount),
        row.input.rate,
        row.input.tenureYears,
        Math.round(row.result.emi),
        Math.round(row.result.actual.totalInterest),
        Math.round(row.result.processingFee),
        Math.round(row.result.gst),
        Math.round(row.result.totalCost),
        Math.round(row.costOverBest),
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM so Excel on Windows reads the ₹ / UTF-8 content correctly.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
