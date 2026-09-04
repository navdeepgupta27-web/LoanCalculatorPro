/**
 * Computes every figure quoted in the published guides.
 *
 *   npm run guide:figures
 *
 * Nothing goes into an article unless it comes out of here. Re-run after any
 * change to lib/loan.ts to confirm the copy still matches the engine.
 */
import { calculateLoan, computeEmi } from "../lib/loan";
import { formatCurrency, formatTenure } from "../lib/format";

const money = (n: number) => formatCurrency(n).padStart(14);
const head = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m\n${"-".repeat(s.length)}`);

/* ---------------------------------------------------------------- */
head("GUIDE 1 — Cut the tenure or cut the EMI?");

const BASE = { amount: 5_000_000, rate: 8.5, tenureYears: 20 };
const PREPAY = [{ month: 24, amount: 500_000 }];

const baseline = calculateLoan(BASE);
const cutTenure = calculateLoan({ ...BASE, prepayments: PREPAY, mode: "reduceTenure" });
const cutEmi = calculateLoan({ ...BASE, prepayments: PREPAY, mode: "reduceEMI" });

console.log(`  Loan ${money(BASE.amount)} at ${BASE.rate}% for ${BASE.tenureYears} years`);
console.log(`  EMI                        ${money(baseline.emi)}`);
console.log(`  Interest with no prepay    ${money(baseline.actual.totalInterest)}`);
console.log(`\n  A ${formatCurrency(500_000)} prepayment in month 24:`);
console.log(`  [cut tenure] interest      ${money(cutTenure.actual.totalInterest)}`);
console.log(`  [cut tenure] saved         ${money(cutTenure.savings.interest)}  (${formatTenure(cutTenure.savings.months)} earlier)`);
console.log(`  [cut EMI]    interest      ${money(cutEmi.actual.totalInterest)}`);
console.log(`  [cut EMI]    saved         ${money(cutEmi.savings.interest)}`);
console.log(`  [cut EMI]    new EMI       ${money(cutEmi.savings.newEmi)}  (was ${formatCurrency(baseline.emi)})`);
console.log(`  DIFFERENCE between modes   ${money(cutTenure.savings.interest - cutEmi.savings.interest)}`);
console.log(`  Monthly relief from cutEMI ${money(baseline.emi - cutEmi.savings.newEmi)}`);

/* ---------------------------------------------------------------- */
head("GUIDE 2 — What a balance transfer really saves");

const OLD_RATE = 9.25;
const NEW_RATE = 8.5;
const SWITCH_AFTER = 36;

const original = calculateLoan({ ...BASE, rate: OLD_RATE });
const atSwitch = original.schedule[SWITCH_AFTER - 1];
const remainingMonths = original.originalTenureMonths - SWITCH_AFTER;
const outstanding = atSwitch.closingBalance;

// Interest still to pay if you stay put.
const interestIfStay = original.actual.totalInterest - atSwitch.cumulativeInterest;

// Same balance, same remaining term, at the lower rate.
const transferred = calculateLoan({
  amount: outstanding,
  rate: NEW_RATE,
  tenureYears: remainingMonths / 12,
});
const interestIfMove = transferred.actual.totalInterest;

// Typical switching cost: 0.5% processing on the transferred balance, plus a
// nominal legal/valuation charge. Both are inputs, not claims about a lender.
const switchFeePct = 0.5;
const switchFee = (switchFeePct / 100) * outstanding;
const switchGst = switchFee * 0.18;
const otherCharges = 10_000;
const totalSwitchCost = switchFee + switchGst + otherCharges;

console.log(`  ${formatCurrency(BASE.amount)} at ${OLD_RATE}% for 20 years`);
console.log(`  EMI                        ${money(original.emi)}`);
console.log(`  Outstanding after 3 yrs    ${money(outstanding)}`);
console.log(`  Interest left if you stay  ${money(interestIfStay)}`);
console.log(`\n  Transfer to ${NEW_RATE}% for the remaining ${formatTenure(remainingMonths)}:`);
console.log(`  New EMI                    ${money(transferred.emi)}  (saves ${formatCurrency(original.emi - transferred.emi)}/mo)`);
console.log(`  Interest if you move       ${money(interestIfMove)}`);
console.log(`  Gross interest saved       ${money(interestIfStay - interestIfMove)}`);
console.log(`  Switching cost (${switchFeePct}% + GST + ${formatCurrency(otherCharges)})  ${money(totalSwitchCost)}`);
console.log(`  NET saving                 ${money(interestIfStay - interestIfMove - totalSwitchCost)}`);

/* ---------------------------------------------------------------- */
head("GUIDE 3 — What a small rate difference costs");

for (const delta of [0.25, 0.5, 1.0]) {
  const worse = calculateLoan({ ...BASE, rate: BASE.rate + delta });
  console.log(
    `  +${delta.toFixed(2)}%  EMI ${money(worse.emi)}  (+${formatCurrency(worse.emi - baseline.emi)}/mo)` +
      `   extra interest ${money(worse.actual.totalInterest - baseline.actual.totalInterest)}`,
  );
}

/* ---------------------------------------------------------------- */
head("GUIDE 4 — When the cheaper rate is the dearer loan");

// Lender A: lower rate, percentage fee. Lender B: higher rate, flat fee.
const A = { rate: 8.4, feePct: 1.0 };
const B = { rate: 8.55, flatFee: 10_000 };

for (const years of [20, 5]) {
  const a = calculateLoan({ ...BASE, tenureYears: years, rate: A.rate, processingFeePct: A.feePct, gstPct: 18 });
  const bFee = B.flatFee;
  const b = calculateLoan({ ...BASE, tenureYears: years, rate: B.rate });
  const bTotal = b.actual.totalPayment + bFee + bFee * 0.18;

  console.log(`  Over ${years} years on ${formatCurrency(BASE.amount)}:`);
  console.log(`    A @ ${A.rate}% + ${A.feePct}% fee   total ${money(a.totalCost)}  (fee+GST ${formatCurrency(a.feesTotal)})`);
  console.log(`    B @ ${B.rate}% + ${formatCurrency(bFee)} fee  total ${money(bTotal)}  (fee+GST ${formatCurrency(bFee * 1.18)})`);
  console.log(`    ${bTotal < a.totalCost ? "B" : "A"} is cheaper by ${formatCurrency(Math.abs(a.totalCost - bTotal))}\n`);
}

/* ---------------------------------------------------------------- */
head("Sanity check — computeEmi matches calculateLoan");
console.log(`  computeEmi   ${money(computeEmi(5_000_000, 8.5 / 12 / 100, 240))}`);
console.log(`  calculateLoan${money(baseline.emi)}`);
console.log();
