/**
 * Computes every figure quoted in the second batch of guides.
 *
 *   npm run guide:figures-2
 *
 * Same rule as the first batch: nothing goes into an article unless it comes
 * out of here. Re-run after any change to lib/loan.ts or lib/investment.ts to
 * confirm the published copy still matches the engine.
 */
import { calculateLoan, computeEmi } from "../lib/loan";
import { calculateSip, xirr } from "../lib/investment";
import { formatCurrency, formatTenure } from "../lib/format";

const money = (n: number) => formatCurrency(n).padStart(14);
const head = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m\n${"-".repeat(s.length)}`);

/* ---------------------------------------------------------------- */
head("A — Prepay the loan or invest the surplus?");

const LOAN = { amount: 5_000_000, rate: 8.5, tenureYears: 20 };
const SURPLUS = 10_000; // a month

const plain = calculateLoan(LOAN);
const withExtra = calculateLoan({
  ...LOAN,
  recurring: { amount: SURPLUS, frequency: "monthly", startMonth: 1 },
  mode: "reduceTenure",
});

console.log(`  Loan ${money(LOAN.amount)} at ${LOAN.rate}% for ${LOAN.tenureYears} years`);
console.log(`  EMI                           ${money(plain.emi)}`);
console.log(`  Interest, no extra payment    ${money(plain.actual.totalInterest)}`);
console.log(`\n  Paying an extra ${formatCurrency(SURPLUS)} every month:`);
console.log(`  Interest                      ${money(withExtra.actual.totalInterest)}`);
console.log(`  Interest saved                ${money(withExtra.savings.interest)}`);
console.log(`  Finishes earlier by           ${formatTenure(withExtra.savings.months)}`);
console.log(`  Months actually paid          ${withExtra.actual.tenureMonths}`);

// The same surplus invested instead, for the full original term.
const invested = calculateSip({
  monthlyAmount: SURPLUS,
  years: LOAN.tenureYears,
  expectedReturn: 12,
});
console.log(`\n  The same ${formatCurrency(SURPLUS)}/month invested at an assumed 12% for 20 years:`);
console.log(`  Invested                      ${money(invested.invested)}`);
console.log(`  Projected value               ${money(invested.maturityValue)}`);
console.log(`  Gain                          ${money(invested.gains)}`);
console.log(
  `\n  Guaranteed saving ${formatCurrency(withExtra.savings.interest)} vs assumed gain ${formatCurrency(invested.gains)}`,
);

/* ---------------------------------------------------------------- */
head("B — What a credit score is worth, in rupees");

const SCORE_BANDS = [8.5, 8.75, 9.25, 9.8];
const base = calculateLoan({ ...LOAN, rate: SCORE_BANDS[0] });
console.log(`  ${formatCurrency(LOAN.amount)} over ${LOAN.tenureYears} years\n`);
for (const rate of SCORE_BANDS) {
  const r = calculateLoan({ ...LOAN, rate });
  const extraEmi = r.emi - base.emi;
  const extraInterest = r.actual.totalInterest - base.actual.totalInterest;
  console.log(
    `  ${String(rate).padStart(5)}%   EMI ${money(r.emi)}   interest ${money(r.actual.totalInterest)}` +
      (rate === SCORE_BANDS[0]
        ? ""
        : `   +${formatCurrency(extraEmi)}/mo, +${formatCurrency(extraInterest)} total`),
  );
}

/* ---------------------------------------------------------------- */
head("C — How much loan can an income carry?");

// FOIR: the share of monthly income a lender will let instalments consume.
for (const income of [75_000, 125_000, 200_000]) {
  console.log(`\n  Monthly income ${formatCurrency(income)}`);
  for (const foir of [0.4, 0.5]) {
    const affordableEmi = income * foir;
    // Invert the EMI formula to find the principal that instalment supports.
    const i = 8.5 / 12 / 100;
    const n = 20 * 12;
    const principal = (affordableEmi * (Math.pow(1 + i, n) - 1)) / (i * Math.pow(1 + i, n));
    console.log(
      `    at ${foir * 100}% FOIR  EMI ${money(affordableEmi)}  supports about ${money(principal)}`,
    );
  }
}

/* ---------------------------------------------------------------- */
head("D — What a repo rate move does to a running loan");

const AFTER_3Y = 36;
for (const move of [0.25, 0.5]) {
  const before = calculateLoan(LOAN);
  const outstanding = before.schedule[AFTER_3Y - 1]?.closingBalance ?? 0;
  const remainingMonths = before.originalTenureMonths - AFTER_3Y;
  const newEmi = computeEmi(outstanding, (LOAN.rate + move) / 12 / 100, remainingMonths);
  console.log(
    `  +${move}%  outstanding after 3 yr ${money(outstanding)}  EMI ${money(before.emi)} -> ${money(newEmi)}  (+${formatCurrency(newEmi - before.emi)}/mo)`,
  );
}

/* ---------------------------------------------------------------- */
head("E — The fee that does not show in the rate");

const feeA = calculateLoan({ ...LOAN, rate: 8.4, processingFeePct: 1, gstPct: 18 });
const feeB = calculateLoan({ ...LOAN, rate: 8.5, processingFeePct: 0.25, gstPct: 18 });
console.log(`  Offer A  8.40% + 1.00% fee    total cost ${money(feeA.totalCost)}  fees ${money(feeA.feesTotal)}`);
console.log(`  Offer B  8.50% + 0.25% fee    total cost ${money(feeB.totalCost)}  fees ${money(feeB.feesTotal)}`);
console.log(`  Cheaper: ${feeA.totalCost < feeB.totalCost ? "A" : "B"} by ${formatCurrency(Math.abs(feeA.totalCost - feeB.totalCost))}`);

// Same comparison over a short tenure, where the fee weighs much more.
const shortA = calculateLoan({ amount: 500_000, rate: 11, tenureYears: 3, processingFeePct: 2, gstPct: 18 });
const shortB = calculateLoan({ amount: 500_000, rate: 11.5, tenureYears: 3, processingFeePct: 0.5, gstPct: 18 });
console.log(`\n  ${formatCurrency(500_000)} personal loan over 3 years:`);
console.log(`  A  11.0% + 2.00% fee          total cost ${money(shortA.totalCost)}`);
console.log(`  B  11.5% + 0.50% fee          total cost ${money(shortB.totalCost)}`);
console.log(`  Cheaper: ${shortA.totalCost < shortB.totalCost ? "A" : "B"} by ${formatCurrency(Math.abs(shortA.totalCost - shortB.totalCost))}`);

/* ---------------------------------------------------------------- */
head("F — An emergency fund's opportunity cost");

const MONTHLY_SPEND = 60_000;
for (const months of [3, 6]) {
  const fund = MONTHLY_SPEND * months;
  console.log(`  ${months} months of ${formatCurrency(MONTHLY_SPEND)} = ${money(fund)}`);
}
const six = MONTHLY_SPEND * 6;
const atSavings = six * Math.pow(1 + 0.035, 5);
const atEquity = six * Math.pow(1 + 0.12, 5);
console.log(`\n  ${formatCurrency(six)} over 5 years:`);
console.log(`    in a 3.5% savings account   ${money(atSavings)}`);
console.log(`    at an assumed 12%           ${money(atEquity)}`);
console.log(`    difference                  ${money(atEquity - atSavings)}`);

console.log("");
