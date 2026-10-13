/**
 * Computes every figure quoted in the third batch of guides.
 *
 *   npm run guide:figures-3
 *
 * Same rule as the earlier batches: nothing goes into an article unless it
 * comes out of here.
 *
 * Where a guide needs an assumption the engine cannot supply — a car's resale
 * value, a retirement spending level — the assumption is named in the output
 * and named again in the article. An assumption stated is useful; an
 * assumption presented as a finding is not.
 */
import { calculateLoan, computeEmi } from "../lib/loan";
import { calculateSip, sipForTarget } from "../lib/investment";
import { formatCurrency, formatTenure } from "../lib/format";

const money = (n: number) => formatCurrency(n).padStart(14);
const head = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m\n${"-".repeat(s.length)}`);

/* ---------------------------------------------------------------- */
head("A — The real cost of a car loan");

const CAR = { amount: 1_000_000, rate: 9.5, tenureYears: 7 };
const car7 = calculateLoan(CAR);
const car5 = calculateLoan({ ...CAR, tenureYears: 5 });
const car3 = calculateLoan({ ...CAR, tenureYears: 3 });

console.log(`  A ${formatCurrency(CAR.amount)} car loan at ${CAR.rate}%\n`);
for (const [years, r] of [[3, car3], [5, car5], [7, car7]] as const) {
  console.log(
    `  ${years} years   EMI ${money(r.emi)}   interest ${money(r.actual.totalInterest)}   total ${money(r.actual.totalPayment)}`,
  );
}
console.log(
  `\n  Stretching 3 years to 7 cuts the EMI by ${formatCurrency(car3.emi - car7.emi)}` +
    ` and adds ${formatCurrency(car7.actual.totalInterest - car3.actual.totalInterest)} of interest.`,
);

// ASSUMPTION, not a finding: a commonly cited new-car value decline. Stated as
// an assumption in the article too.
console.log(`\n  ASSUMED resale decline (not computed by any engine — an illustration):`);
let value = CAR.amount;
for (let y = 1; y <= 7; y++) {
  value *= y === 1 ? 0.8 : 0.88;
  const paid = car7.schedule.slice(0, y * 12).reduce((s, r) => s + r.emi, 0);
  const owed = car7.schedule[y * 12 - 1]?.closingBalance ?? 0;
  console.log(
    `  end of year ${y}   value ~${money(value)}   still owed ${money(owed)}   paid so far ${money(paid)}` +
      (owed > value ? "   <- owes more than it is worth" : ""),
  );
}

/* ---------------------------------------------------------------- */
head("B — The education loan moratorium");

const EDU = { amount: 2_000_000, rate: 9.5 };
const COURSE_YEARS = 4;
const REPAY_YEARS = 10;
const monthlyRate = EDU.rate / 12 / 100;

// Option 1: pay nothing during the course. Interest accrues and capitalises.
const capitalised = EDU.amount * Math.pow(1 + monthlyRate, COURSE_YEARS * 12);
const afterCapitalising = calculateLoan({
  amount: capitalised,
  rate: EDU.rate,
  tenureYears: REPAY_YEARS,
});

// Option 2: service the interest each month during the course.
const monthlyInterest = EDU.amount * monthlyRate;
const servicedDuringCourse = monthlyInterest * COURSE_YEARS * 12;
const afterServicing = calculateLoan({
  amount: EDU.amount,
  rate: EDU.rate,
  tenureYears: REPAY_YEARS,
});

console.log(`  ${formatCurrency(EDU.amount)} at ${EDU.rate}%, ${COURSE_YEARS}-year course, ${REPAY_YEARS}-year repayment\n`);
console.log(`  [pay nothing during the course]`);
console.log(`    balance when repayment starts  ${money(capitalised)}`);
console.log(`    EMI afterwards                 ${money(afterCapitalising.emi)}`);
console.log(`    total interest                 ${money(capitalised - EDU.amount + afterCapitalising.actual.totalInterest)}`);
console.log(`\n  [pay the interest monthly during the course]`);
console.log(`    monthly during course          ${money(monthlyInterest)}`);
console.log(`    paid during course             ${money(servicedDuringCourse)}`);
console.log(`    EMI afterwards                 ${money(afterServicing.emi)}`);
console.log(`    total interest                 ${money(servicedDuringCourse + afterServicing.actual.totalInterest)}`);
console.log(
  `\n  Difference in total interest     ${money(
    capitalised - EDU.amount + afterCapitalising.actual.totalInterest -
      (servicedDuringCourse + afterServicing.actual.totalInterest),
  )}`,
);
console.log(`  Difference in EMI afterwards     ${money(afterCapitalising.emi - afterServicing.emi)}`);

/* ---------------------------------------------------------------- */
head("C — A joint loan's effect on eligibility");

const i = 8.5 / 12 / 100;
const n = 20 * 12;
const principalFor = (emi: number) => (emi * (Math.pow(1 + i, n) - 1)) / (i * Math.pow(1 + i, n));

for (const [a, b] of [[90_000, 0], [90_000, 60_000], [90_000, 90_000]] as const) {
  const combined = a + b;
  const emi = combined * 0.45;
  console.log(
    `  ${formatCurrency(a).padStart(11)} + ${formatCurrency(b).padStart(11)} = ${formatCurrency(combined).padStart(11)}` +
      `   EMI at 45% FOIR ${money(emi)}   supports ${money(principalFor(emi))}`,
  );
}

/* ---------------------------------------------------------------- */
head("D — Top-up on the home loan vs a personal loan");

const NEED = 800_000;
const topUp = calculateLoan({ amount: NEED, rate: 9.25, tenureYears: 10, processingFeePct: 0.5, gstPct: 18 });
const personal = calculateLoan({ amount: NEED, rate: 14, tenureYears: 5, processingFeePct: 2, gstPct: 18 });
const personalLong = calculateLoan({ amount: NEED, rate: 14, tenureYears: 10, processingFeePct: 2, gstPct: 18 });

console.log(`  Borrowing ${formatCurrency(NEED)}\n`);
console.log(`  Top-up    9.25% / 10 yr   EMI ${money(topUp.emi)}   interest ${money(topUp.actual.totalInterest)}   total ${money(topUp.totalCost)}`);
console.log(`  Personal  14.0% /  5 yr   EMI ${money(personal.emi)}   interest ${money(personal.actual.totalInterest)}   total ${money(personal.totalCost)}`);
console.log(`  Personal  14.0% / 10 yr   EMI ${money(personalLong.emi)}   interest ${money(personalLong.actual.totalInterest)}   total ${money(personalLong.totalCost)}`);
console.log(`\n  Top-up vs personal over the same 10 years: ${formatCurrency(personalLong.totalCost - topUp.totalCost)} cheaper`);
console.log(
  `  But the 5-year personal loan costs ${formatCurrency(Math.abs(personal.totalCost - topUp.totalCost))}` +
    ` ${personal.totalCost > topUp.totalCost ? "more" : "LESS"} in total than the 10-year top-up`,
);

/* ---------------------------------------------------------------- */
head("E — What a retirement corpus has to be");

// ASSUMPTIONS, named: today's monthly spend, inflation, years to retirement,
// years in retirement, and the rate the corpus earns while drawn down.
const SPEND_TODAY = 60_000;
const INFLATION = 6;
const YEARS_TO = 25;
const WITHDRAW_RATE = 4; // a commonly used rule of thumb, not a guarantee

const spendThen = SPEND_TODAY * Math.pow(1 + INFLATION / 100, YEARS_TO);
const corpusNeeded = (spendThen * 12 * 100) / WITHDRAW_RATE;

console.log(`  ASSUMED: ${formatCurrency(SPEND_TODAY)}/month today, ${INFLATION}% inflation, retiring in ${YEARS_TO} years\n`);
console.log(`  The same lifestyle then costs   ${money(spendThen)} a month`);
console.log(`  At a ${WITHDRAW_RATE}% withdrawal rate, corpus ${money(corpusNeeded)}`);

for (const ret of [10, 12]) {
  const monthly = sipForTarget(corpusNeeded, YEARS_TO, ret);
  console.log(`\n  To reach it at an assumed ${ret}%:  ${money(monthly)} a month`);
  const check = calculateSip({ monthlyAmount: monthly, years: YEARS_TO, expectedReturn: ret });
  console.log(`    invested ${money(check.invested)}  ->  ${money(check.maturityValue)}`);
}

/* ---------------------------------------------------------------- */
head("F — Missing an instalment");

const MISS = calculateLoan(CAR);
console.log(`  On the ${formatCurrency(CAR.amount)} car loan above, EMI ${formatCurrency(MISS.emi)}:`);
console.log(`    one month's interest alone is ${formatCurrency(MISS.schedule[0]?.interest ?? 0)}`);
console.log(`    (penalties and bounce charges are lender-specific and not modelled here)`);

console.log("");
