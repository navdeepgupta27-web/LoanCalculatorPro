/**
 * Computes every figure quoted in the investment guides.
 *
 *   npm run guide:investment-figures
 *
 * Nothing goes into an article unless it comes out of here.
 */
import {
  calculateRd,
  calculateSip,
  inflationAdjusted,
  sipForTarget,
} from "../lib/investment";
import { formatCurrency } from "../lib/format";

const money = (n: number) => formatCurrency(n).padStart(16);
const head = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m\n${"-".repeat(s.length)}`);

/* ---------------------------------------------------------------- */
head("GUIDE 1 — SIP vs RD: the same ₹10,000 a month");

const MONTHLY = 10_000;
const YEARS = 15;
const EQUITY = 12;
const DEPOSIT = 7;

const sip = calculateSip({ monthlyAmount: MONTHLY, years: YEARS, expectedReturn: EQUITY });
const rd = calculateRd({ monthlyDeposit: MONTHLY, years: YEARS, annualRate: DEPOSIT });

console.log(`  Both put in            ${money(sip.invested)}   over ${YEARS} years`);
console.log(`  SIP @${EQUITY}% (assumed) ${money(sip.maturityValue)}   XIRR ${sip.annualisedReturn.toFixed(2)}%`);
console.log(`  RD  @${DEPOSIT}% (contractual)${money(rd.maturityValue)}   XIRR ${rd.annualisedReturn.toFixed(2)}%`);
console.log(`  Gap                    ${money(sip.maturityValue - rd.maturityValue)}`);

// RD interest is taxable at slab; approximate a 30% bracket by taxing the gain.
const rdGainPostTax = rd.gains * 0.7;
const rdPostTax = rd.invested + rdGainPostTax;
console.log(`\n  RD after 30% tax on interest ${money(rdPostTax)}`);
console.log(`  Effective post-tax rate      ${(DEPOSIT * 0.7).toFixed(2)}%`);
console.log(`  Gap after tax                ${money(sip.maturityValue - rdPostTax)}`);

// What the SIP needs to merely match the RD.
for (const r of [7, 8, 6]) {
  const s = calculateSip({ monthlyAmount: MONTHLY, years: YEARS, expectedReturn: r });
  console.log(`  SIP at ${r}% instead        ${money(s.maturityValue)}`);
}

/* ---------------------------------------------------------------- */
head("GUIDE 2 — Absolute vs XIRR: why the big number misleads");

for (const years of [5, 15, 25]) {
  const s = calculateSip({ monthlyAmount: MONTHLY, years, expectedReturn: EQUITY });
  console.log(
    `  ${String(years).padStart(2)}y  invested ${money(s.invested)}  value ${money(s.maturityValue)}` +
      `  absolute ${s.absoluteReturn.toFixed(0).padStart(4)}%  XIRR ${s.annualisedReturn.toFixed(2)}%`,
  );
}

/* ---------------------------------------------------------------- */
head("GUIDE 3 — Step-up SIP");

const flat20 = calculateSip({ monthlyAmount: MONTHLY, years: 20, expectedReturn: EQUITY });
for (const step of [5, 10, 15]) {
  const up = calculateSip({
    monthlyAmount: MONTHLY,
    years: 20,
    expectedReturn: EQUITY,
    annualStepUpPct: step,
  });
  console.log(
    `  ${String(step).padStart(2)}% step-up  invested ${money(up.invested)}  value ${money(up.maturityValue)}` +
      `  extra vs flat ${money(up.maturityValue - flat20.maturityValue)}`,
  );
}
console.log(`  flat        invested ${money(flat20.invested)}  value ${money(flat20.maturityValue)}`);

const up10 = calculateSip({
  monthlyAmount: MONTHLY,
  years: 20,
  expectedReturn: EQUITY,
  annualStepUpPct: 10,
});
console.log(`\n  Instalment in year 1  ${money(up10.schedule[0].contribution)}`);
console.log(`  Instalment in year 10 ${money(up10.schedule[9 * 12].contribution)}`);
console.log(`  Instalment in year 20 ${money(up10.schedule[19 * 12].contribution)}`);

/* ---------------------------------------------------------------- */
head("GUIDE 4 — Inflation: the return you actually earn");

const CRORE = 1_00_00_000;
for (const yrs of [10, 20, 30]) {
  console.log(`  ${formatCurrency(CRORE)} in ${yrs}y is worth ${money(inflationAdjusted(CRORE, yrs, 6))} today (6%)`);
}

// A "safe" 7% deposit taxed at 30%, against 6% inflation.
const postTax = DEPOSIT * 0.7;
console.log(`\n  Deposit 7% -> post-tax ${postTax.toFixed(2)}%  vs 6% inflation = ${(postTax - 6).toFixed(2)}% real`);

const target = CRORE;
for (const yrs of [15, 20]) {
  const needed = sipForTarget(target, yrs, EQUITY);
  const real = inflationAdjusted(target, yrs, 6);
  console.log(
    `  ${formatCurrency(needed)}/mo for ${yrs}y @${EQUITY}% -> ${formatCurrency(target)}` +
      ` (worth ${formatCurrency(real)} today)`,
  );
}
console.log();
