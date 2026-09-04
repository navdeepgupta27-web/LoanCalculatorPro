/**
 * Checks the investment engine against independently-derived closed forms.
 *
 *   npm run verify:investment
 *
 * Every assertion is computed two ways: once by lib/investment.ts (which
 * simulates period by period) and once by a textbook formula written inline
 * here. If a convention drifts, these stop agreeing.
 */
import {
  absoluteReturn,
  cagr,
  calculateAnnualScheme,
  calculateFd,
  calculateLumpsum,
  calculateNps,
  calculateRd,
  calculateSip,
  sipForTarget,
  xirr,
} from "../lib/investment";
import { formatCurrency } from "../lib/format";

let failures = 0;

function check(name: string, actual: number, expected: number, tolerance = 0.02) {
  const diff = Math.abs(actual - expected);
  const rel = expected !== 0 ? diff / Math.abs(expected) : diff;
  const ok = rel <= tolerance / 100 || diff < 1;
  if (!ok) failures++;
  console.log(
    `  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name.padEnd(46)}` +
      `got ${actual.toFixed(2).padStart(16)}   expected ${expected.toFixed(2).padStart(16)}`,
  );
}

const head = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m`);

/* ---------------------------------------------------------------- */
head("SIP — annuity-due closed form");
{
  const P = 10_000, years = 10, r = 12;
  const n = years * 12, i = r / 12 / 100;
  // FV = P × [((1+i)^n − 1) / i] × (1+i)
  const expected = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const got = calculateSip({ monthlyAmount: P, years, expectedReturn: r });

  check("SIP 10k/mo, 10y @12% maturity", got.maturityValue, expected);
  check("SIP invested total", got.invested, P * n, 0);
  console.log(
    `        invested ${formatCurrency(got.invested)}  ->  ${formatCurrency(got.maturityValue)}` +
      `   XIRR ${got.annualisedReturn.toFixed(2)}%  absolute ${got.absoluteReturn.toFixed(1)}%`,
  );
  // Monthly compounding at a 12% nominal rate gives an effective ~12.68%.
  check("SIP XIRR ≈ effective annual rate", got.annualisedReturn, (Math.pow(1 + i, 12) - 1) * 100, 1.5);
}

/* ---------------------------------------------------------------- */
head("Step-up SIP");
{
  const got = calculateSip({ monthlyAmount: 10_000, years: 10, expectedReturn: 12, annualStepUpPct: 10 });
  const flat = calculateSip({ monthlyAmount: 10_000, years: 10, expectedReturn: 12 });
  const ok = got.maturityValue > flat.maturityValue && got.invested > flat.invested;
  if (!ok) failures++;
  console.log(`  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  step-up exceeds flat SIP`);
  console.log(
    `        flat ${formatCurrency(flat.maturityValue)}   step-up ${formatCurrency(got.maturityValue)}`,
  );
  // The 12th instalment is the first at the stepped-up rate.
  check("instalment 13 is 10% higher", got.schedule[12].contribution, 11_000, 0.001);
}

/* ---------------------------------------------------------------- */
head("Lumpsum / FD — compound interest closed form");
{
  const P = 1_00_000, years = 5, r = 7;
  const annual = calculateLumpsum({ amount: P, years, expectedReturn: r, compoundingPerYear: 1 });
  check("lumpsum annual compounding", annual.maturityValue, P * Math.pow(1 + r / 100, years));
  check("CAGR round-trips", annual.annualisedReturn, r, 0.5);

  const fd = calculateFd({ principal: P, years, annualRate: r });
  check("FD quarterly compounding", fd.maturityValue, P * Math.pow(1 + r / 400, 4 * years));

  const ok = fd.maturityValue > annual.maturityValue;
  if (!ok) failures++;
  console.log(`  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  quarterly beats annual compounding`);
}

/* ---------------------------------------------------------------- */
head("RD — simulated, sanity bounds");
{
  const R = 5_000, years = 5, r = 7;
  const got = calculateRd({ monthlyDeposit: R, years, annualRate: r });
  const n = years * 12;

  check("RD invested total", got.invested, R * n, 0);

  // Must sit between no interest at all and every rupee earning the full term.
  const floor = R * n;
  const ceiling = R * n * Math.pow(1 + r / 100, years);
  const ok = got.maturityValue > floor && got.maturityValue < ceiling;
  if (!ok) failures++;
  console.log(
    `  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  RD maturity within bounds` +
      `  (${formatCurrency(floor)} < ${formatCurrency(got.maturityValue)} < ${formatCurrency(ceiling)})`,
  );
  check("RD XIRR close to nominal rate", got.annualisedReturn, r, 12);
}

/* ---------------------------------------------------------------- */
head("Annual schemes — PPF/SSY shape (rate supplied, never assumed)");
{
  // 7.1 is passed in purely as a test input, not asserted as the statutory rate.
  const RATE = 7.1;
  const ppf = calculateAnnualScheme({
    yearlyContribution: 1_50_000,
    contributionYears: 15,
    maturityYears: 15,
    annualRate: RATE,
  });
  // Annuity-due, annual compounding.
  const i = RATE / 100;
  const expected = 1_50_000 * ((Math.pow(1 + i, 15) - 1) / i) * (1 + i);
  check("PPF 15y annuity-due closed form", ppf.maturityValue, expected);
  check("PPF invested", ppf.invested, 1_50_000 * 15, 0);

  // SSY: 15 years of deposits, then 6 years of pure compounding.
  const ssy = calculateAnnualScheme({
    yearlyContribution: 1_50_000,
    contributionYears: 15,
    maturityYears: 21,
    annualRate: RATE,
  });
  check("SSY invested equals 15 deposits only", ssy.invested, 1_50_000 * 15, 0);
  check("SSY = PPF corpus compounded 6 more years", ssy.maturityValue, expected * Math.pow(1 + i, 6));
  check("SSY has no deposit in year 16", ssy.schedule[15].contribution, 0, 0);
}

/* ---------------------------------------------------------------- */
head("NPS — split and pension");
{
  const nps = calculateNps({
    monthlyContribution: 10_000,
    currentAge: 30,
    retirementAge: 60,
    expectedReturn: 10,
    annuityPercent: 40,
    annuityRate: 6,
  });
  check("years to retirement", nps.yearsToRetirement, 30, 0);
  check("annuity corpus is 40%", nps.annuityCorpus, nps.maturityValue * 0.4);
  check("lump sum is the remaining 60%", nps.lumpSumAtExit, nps.maturityValue * 0.6);
  check("pension = corpus × 6% ÷ 12", nps.estimatedMonthlyPension, (nps.annuityCorpus * 0.06) / 12);
  console.log(
    `        corpus ${formatCurrency(nps.maturityValue)}   pension ${formatCurrency(nps.estimatedMonthlyPension)}/mo`,
  );
}

/* ---------------------------------------------------------------- */
head("XIRR — against a known series");
{
  // Simple doubling over exactly one year must be 100%.
  const r = xirr([
    { amount: -1000, date: new Date(2020, 0, 1) },
    { amount: 2000, date: new Date(2021, 0, 1) },
  ]);
  check("double in 1 year = 100%", r ?? 0, 100, 0.5);

  // Flat: no gain, no loss.
  const flat = xirr([
    { amount: -1000, date: new Date(2020, 0, 1) },
    { amount: 1000, date: new Date(2021, 0, 1) },
  ]);
  check("no gain = 0%", flat ?? -999, 0, 1);

  // A loss must return a negative rate.
  const loss = xirr([
    { amount: -1000, date: new Date(2020, 0, 1) },
    { amount: 800, date: new Date(2021, 0, 1) },
  ]);
  const ok = (loss ?? 0) < 0;
  if (!ok) failures++;
  console.log(`  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  loss yields a negative XIRR (${(loss ?? 0).toFixed(2)}%)`);

  // Degenerate input must not throw or invent an answer.
  const none = xirr([{ amount: -100, date: new Date() }]);
  const ok2 = none === null;
  if (!ok2) failures++;
  console.log(`  ${ok2 ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  single cash flow returns null`);
}

/* ---------------------------------------------------------------- */
head("Goal planning — round trip");
{
  const target = 1_00_00_000, years = 15, r = 12;
  const needed = sipForTarget(target, years, r);
  const got = calculateSip({ monthlyAmount: needed, years, expectedReturn: r });
  check("sipForTarget reaches the target", got.maturityValue, target, 0.1);
  console.log(`        ${formatCurrency(needed)}/mo for ${years}y @${r}% -> ${formatCurrency(got.maturityValue)}`);
}

/* ---------------------------------------------------------------- */
head("Edge cases");
{
  check("zero-rate SIP is just the deposits", calculateSip({ monthlyAmount: 1000, years: 2, expectedReturn: 0 }).maturityValue, 24_000, 0.001);
  check("absoluteReturn 100k -> 150k", absoluteReturn(100_000, 150_000), 50);
  check("cagr 100 -> 200 over 1y", cagr(100, 200, 1), 100);

  const bad = calculateSip({ monthlyAmount: 0, years: 5, expectedReturn: 12 });
  const ok = bad.error !== null;
  if (!ok) failures++;
  console.log(`  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  zero amount returns an error, not NaN`);
}

console.log(
  failures === 0
    ? "\n\x1b[32mAll checks passed.\x1b[0m\n"
    : `\n\x1b[31m${failures} check(s) failed.\x1b[0m\n`,
);
process.exit(failures === 0 ? 0 : 1);
