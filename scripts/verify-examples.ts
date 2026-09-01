/**
 * Prints the figures quoted as worked examples in the marketing copy, computed
 * with the real engine. Run this whenever those numbers are edited so the page
 * never states a figure the calculator does not actually produce.
 *
 *   npm run verify:examples
 */
import { calculateLoan } from "../lib/loan";
import { formatCurrency, formatTenure } from "../lib/format";

const AMOUNT = 5_000_000;
const RATE = 8.5;
const YEARS = 20;

const base = calculateLoan({ amount: AMOUNT, rate: RATE, tenureYears: YEARS });

const withPrepay = calculateLoan({
  amount: AMOUNT,
  rate: RATE,
  tenureYears: YEARS,
  prepayments: [{ month: 24, amount: 500_000 }],
  mode: "reduceTenure",
});

console.log(`\nHome loan — ${formatCurrency(AMOUNT)} at ${RATE}% for ${YEARS} years\n`);
console.log(`  EMI                 ${formatCurrency(base.emi)}`);
console.log(`  Total interest      ${formatCurrency(base.actual.totalInterest)}`);
console.log(`  Total repayment     ${formatCurrency(base.actual.totalPayment)}`);

console.log(`\nWith a ${formatCurrency(500_000)} part-payment in month 24 (cut tenure)\n`);
console.log(`  Interest saved      ${formatCurrency(withPrepay.savings.interest)}`);
console.log(`  Time saved          ${formatTenure(withPrepay.savings.months)}`);
console.log(`  New total interest  ${formatCurrency(withPrepay.actual.totalInterest)}`);
console.log(`  Loan clears         ${withPrepay.actual.payoffLabel}\n`);

// Claims made in the FAQ and the "how EMI works" section.
const year1 = base.schedule.slice(0, 12);
const y1Interest = year1.reduce((s, r) => s + r.interest, 0);
const y1Principal = year1.reduce((s, r) => s + r.principal, 0);
const crossover = base.schedule.find((r) => r.principal > r.interest);

console.log("Composition claims\n");
console.log(
  `  Year 1 interest share  ${((y1Interest / (y1Interest + y1Principal)) * 100).toFixed(1)}%`,
);
console.log(
  `  Principal overtakes interest at month ${crossover?.month} (${crossover?.label}) ` +
    `= loan year ${crossover ? Math.ceil(crossover.month / 12) : "n/a"}\n`,
);

// Early vs late prepayment, quoted in the FAQ.
for (const month of [24, 144]) {
  const r = calculateLoan({
    amount: AMOUNT,
    rate: RATE,
    tenureYears: YEARS,
    prepayments: [{ month, amount: 500_000 }],
    mode: "reduceTenure",
  });
  console.log(
    `  ₹5L prepaid at month ${String(month).padStart(3)} saves ${formatCurrency(r.savings.interest)}`,
  );
}
console.log();
