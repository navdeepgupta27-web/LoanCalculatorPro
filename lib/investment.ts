/**
 * Investment and savings calculation engine.
 *
 * Pure functions, no I/O — the same code runs during static generation and in
 * the browser, and can be unit-tested directly. Companion to lib/loan.ts.
 *
 * Compounding conventions differ between institutions, so every function
 * documents the one it uses. Where a convention is genuinely ambiguous the
 * schedule is simulated period by period rather than using a closed form, so
 * the arithmetic can be audited row by row.
 *
 * IMPORTANT: nothing here embeds a statutory rate. PPF, Sukanya Samriddhi, NPS
 * and EPF rates are set by the government and revised quarterly; they are
 * supplied as inputs and stored (with a source and a date) in the database.
 */

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

export interface PeriodRow {
  /** 1-based period index (month or year, depending on the product). */
  period: number;
  label: string;
  openingBalance: number;
  contribution: number;
  interest: number;
  closingBalance: number;
  cumulativeContribution: number;
  cumulativeInterest: number;
}

export interface InvestmentResult {
  /** Total put in by the investor. */
  invested: number;
  /** Value at maturity. */
  maturityValue: number;
  /** maturityValue − invested. */
  gains: number;
  /** Gains as a share of the amount invested, e.g. 0.82 = 82%. */
  absoluteReturn: number;
  /** Annualised, money-weighted where contributions are staggered. */
  annualisedReturn: number;
  schedule: PeriodRow[];
  /** Set when the inputs cannot produce a valid projection. */
  error: string | null;
}

export interface CashFlow {
  /** Negative for money paid in, positive for money received. */
  amount: number;
  date: Date;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthLabel(start: Date, offset: number): string {
  const d = new Date(start.getFullYear(), start.getMonth() + offset, 1);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function emptyResult(error: string): InvestmentResult {
  return {
    invested: 0,
    maturityValue: 0,
    gains: 0,
    absoluteReturn: 0,
    annualisedReturn: 0,
    schedule: [],
    error,
  };
}

/* ------------------------------------------------------------------ */
/* Return metrics                                                      */
/* ------------------------------------------------------------------ */

/**
 * Compound annual growth rate. Only meaningful for a single lump sum held for
 * the whole period — for staggered contributions use XIRR instead, which is
 * why the SIP functions report an XIRR-derived figure.
 */
export function cagr(beginValue: number, endValue: number, years: number): number {
  if (beginValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / beginValue, 1 / years) - 1) * 100;
}

/** Total gain as a percentage of the amount invested. */
export function absoluteReturn(invested: number, finalValue: number): number {
  if (invested <= 0) return 0;
  return ((finalValue - invested) / invested) * 100;
}

/** Net present value of dated cash flows at an annual rate. */
function npv(rate: number, flows: CashFlow[]): number {
  const t0 = flows[0].date.getTime();
  const DAY = 86_400_000;
  return flows.reduce((sum, f) => {
    const years = (f.date.getTime() - t0) / DAY / 365;
    return sum + f.amount / Math.pow(1 + rate, years);
  }, 0);
}

/**
 * Extended internal rate of return for irregularly dated cash flows — the
 * correct measure when money goes in at different times, as with a SIP.
 *
 * Newton-Raphson converges quickly for well-behaved flows; bisection is the
 * fallback because Newton can diverge when the derivative is near zero, which
 * happens with short or lopsided series.
 *
 * Returns a percentage, or null when no rate satisfies the flows.
 */
export function xirr(flows: CashFlow[], guess = 0.1): number | null {
  if (flows.length < 2) return null;

  const sorted = [...flows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const hasIn = sorted.some((f) => f.amount < 0);
  const hasOut = sorted.some((f) => f.amount > 0);
  // Without both a payment and a receipt there is no rate to solve for.
  if (!hasIn || !hasOut) return null;

  // --- Newton-Raphson ---
  let rate = guess;
  for (let i = 0; i < 60; i++) {
    const f = npv(rate, sorted);
    if (Math.abs(f) < 1e-7) return rate * 100;

    const step = 1e-6;
    const derivative = (npv(rate + step, sorted) - f) / step;
    if (!Number.isFinite(derivative) || Math.abs(derivative) < 1e-12) break;

    const next = rate - f / derivative;
    if (!Number.isFinite(next) || next <= -0.9999) break;
    if (Math.abs(next - rate) < 1e-9) return next * 100;
    rate = next;
  }

  // --- Bisection fallback over a wide bracket ---
  let low = -0.9999;
  let high = 10;
  let fLow = npv(low, sorted);
  if (!Number.isFinite(fLow)) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const fMid = npv(mid, sorted);
    if (!Number.isFinite(fMid)) return null;
    if (Math.abs(fMid) < 1e-7) return mid * 100;
    if (fLow * fMid < 0) {
      high = mid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* SIP — systematic investment plan                                    */
/* ------------------------------------------------------------------ */

export interface SipInput {
  monthlyAmount: number;
  years: number;
  /** Expected annual return, e.g. 12 for 12% p.a. Not a guarantee. */
  expectedReturn: number;
  /** Annual increase in the instalment, e.g. 10 for a 10% step-up. */
  annualStepUpPct?: number;
  startDate?: Date;
}

/**
 * Monthly compounding with the instalment invested at the START of each month
 * (annuity-due) — the convention every major Indian SIP calculator uses.
 *
 * The annualised figure is an XIRR, not a CAGR: contributions are staggered,
 * so money invested in the final year has not compounded for the full term and
 * a CAGR would overstate the return.
 */
export function calculateSip(input: SipInput): InvestmentResult {
  const monthly = Math.max(0, Number(input.monthlyAmount) || 0);
  const years = Math.max(0, Number(input.years) || 0);
  const annualReturn = Number(input.expectedReturn) || 0;
  const stepUp = Math.max(0, Number(input.annualStepUpPct) || 0);
  const start = input.startDate ?? new Date();

  if (monthly <= 0) return emptyResult("Enter a monthly investment amount.");
  if (years <= 0) return emptyResult("Enter an investment period of at least one year.");

  const months = Math.round(years * 12);
  const monthlyRate = annualReturn / 12 / 100;

  const schedule: PeriodRow[] = [];
  const flows: CashFlow[] = [];

  let balance = 0;
  let invested = 0;
  let cumulativeInterest = 0;
  let instalment = monthly;

  for (let m = 1; m <= months; m++) {
    // Step the instalment up on each anniversary.
    if (stepUp > 0 && m > 1 && (m - 1) % 12 === 0) {
      instalment = instalment * (1 + stepUp / 100);
    }

    const opening = balance;
    // Contribution first, then growth — annuity-due.
    const afterContribution = opening + instalment;
    const growth = afterContribution * monthlyRate;
    balance = afterContribution + growth;

    invested += instalment;
    cumulativeInterest += growth;

    flows.push({
      amount: -instalment,
      date: new Date(start.getFullYear(), start.getMonth() + (m - 1), start.getDate()),
    });

    schedule.push({
      period: m,
      label: monthLabel(start, m - 1),
      openingBalance: opening,
      contribution: instalment,
      interest: growth,
      closingBalance: balance,
      cumulativeContribution: invested,
      cumulativeInterest,
    });
  }

  flows.push({
    amount: balance,
    date: new Date(start.getFullYear(), start.getMonth() + months, start.getDate()),
  });

  const rate = xirr(flows);

  return {
    invested,
    maturityValue: balance,
    gains: balance - invested,
    absoluteReturn: absoluteReturn(invested, balance),
    annualisedReturn: rate ?? annualReturn,
    schedule,
    error: null,
  };
}

/* ------------------------------------------------------------------ */
/* Lumpsum                                                             */
/* ------------------------------------------------------------------ */

export interface LumpsumInput {
  amount: number;
  years: number;
  expectedReturn: number;
  /** Compounding periods per year. 1 = annual, 4 = quarterly, 12 = monthly. */
  compoundingPerYear?: number;
  startDate?: Date;
}

/** Single investment held to maturity. Annualised return here is a true CAGR. */
export function calculateLumpsum(input: LumpsumInput): InvestmentResult {
  const amount = Math.max(0, Number(input.amount) || 0);
  const years = Math.max(0, Number(input.years) || 0);
  const annualReturn = Number(input.expectedReturn) || 0;
  const n = Math.max(1, Math.round(Number(input.compoundingPerYear) || 1));
  const start = input.startDate ?? new Date();

  if (amount <= 0) return emptyResult("Enter an amount to invest.");
  if (years <= 0) return emptyResult("Enter a period of at least one year.");

  const periodRate = annualReturn / 100 / n;
  const totalPeriods = Math.round(years * n);

  const schedule: PeriodRow[] = [];
  let balance = amount;
  let cumulativeInterest = 0;

  for (let p = 1; p <= totalPeriods; p++) {
    const opening = balance;
    const growth = opening * periodRate;
    balance = opening + growth;
    cumulativeInterest += growth;

    schedule.push({
      period: p,
      label: monthLabel(start, Math.round(((p - 1) * 12) / n)),
      openingBalance: opening,
      contribution: p === 1 ? amount : 0,
      interest: growth,
      closingBalance: balance,
      cumulativeContribution: amount,
      cumulativeInterest,
    });
  }

  return {
    invested: amount,
    maturityValue: balance,
    gains: balance - amount,
    absoluteReturn: absoluteReturn(amount, balance),
    annualisedReturn: cagr(amount, balance, years),
    schedule,
    error: null,
  };
}

/* ------------------------------------------------------------------ */
/* Fixed deposit                                                       */
/* ------------------------------------------------------------------ */

export interface FdInput {
  principal: number;
  years: number;
  annualRate: number;
  /** Indian banks compound FDs quarterly by default. */
  compoundingPerYear?: number;
  startDate?: Date;
}

/**
 * Cumulative (reinvestment) fixed deposit. Quarterly compounding is the Indian
 * banking default; pass 1, 2 or 12 for annual, half-yearly or monthly.
 *
 * Does not model TDS or your income-tax liability — FD interest is taxable as
 * income at your slab rate, so the figure here is pre-tax.
 */
export function calculateFd(input: FdInput): InvestmentResult {
  return calculateLumpsum({
    amount: input.principal,
    years: input.years,
    expectedReturn: input.annualRate,
    compoundingPerYear: input.compoundingPerYear ?? 4,
    startDate: input.startDate,
  });
}

/* ------------------------------------------------------------------ */
/* Recurring deposit                                                   */
/* ------------------------------------------------------------------ */

export interface RdInput {
  monthlyDeposit: number;
  years: number;
  annualRate: number;
  startDate?: Date;
}

/**
 * Recurring deposit, simulated month by month.
 *
 * Convention: interest accrues monthly on the running balance and is
 * capitalised every quarter — which is how Indian banks and India Post
 * actually operate an RD. Simulating rather than using the closed-form
 * maturity formula keeps every row auditable, and closed forms in circulation
 * disagree with each other on exactly this point.
 */
export function calculateRd(input: RdInput): InvestmentResult {
  const monthly = Math.max(0, Number(input.monthlyDeposit) || 0);
  const years = Math.max(0, Number(input.years) || 0);
  const annualRate = Number(input.annualRate) || 0;
  const start = input.startDate ?? new Date();

  if (monthly <= 0) return emptyResult("Enter a monthly deposit amount.");
  if (years <= 0) return emptyResult("Enter a period of at least one year.");

  const months = Math.round(years * 12);
  const monthlyRate = annualRate / 12 / 100;

  const schedule: PeriodRow[] = [];
  const flows: CashFlow[] = [];

  let balance = 0;
  let accrued = 0;
  let invested = 0;
  let cumulativeInterest = 0;

  for (let m = 1; m <= months; m++) {
    const opening = balance;
    balance += monthly;
    invested += monthly;

    // Accrue on the balance including this month's deposit.
    const monthInterest = balance * monthlyRate;
    accrued += monthInterest;
    cumulativeInterest += monthInterest;

    // Capitalise at each quarter end, and always in the final month.
    let credited = 0;
    if (m % 3 === 0 || m === months) {
      credited = accrued;
      balance += credited;
      accrued = 0;
    }

    flows.push({
      amount: -monthly,
      date: new Date(start.getFullYear(), start.getMonth() + (m - 1), start.getDate()),
    });

    schedule.push({
      period: m,
      label: monthLabel(start, m - 1),
      openingBalance: opening,
      contribution: monthly,
      interest: monthInterest,
      closingBalance: balance,
      cumulativeContribution: invested,
      cumulativeInterest,
    });
  }

  flows.push({
    amount: balance,
    date: new Date(start.getFullYear(), start.getMonth() + months, start.getDate()),
  });

  return {
    invested,
    maturityValue: balance,
    gains: balance - invested,
    absoluteReturn: absoluteReturn(invested, balance),
    annualisedReturn: xirr(flows) ?? annualRate,
    schedule,
    error: null,
  };
}

/* ------------------------------------------------------------------ */
/* Annual-contribution schemes (PPF, Sukanya Samriddhi)                */
/* ------------------------------------------------------------------ */

export interface AnnualSchemeInput {
  /** Amount deposited each year. */
  yearlyContribution: number;
  /** Years in which deposits are actually made. */
  contributionYears: number;
  /** Total years until maturity — may exceed contributionYears (e.g. SSY). */
  maturityYears: number;
  /** Statutory rate, supplied by the caller. Never hardcoded here. */
  annualRate: number;
  startYear?: number;
}

/**
 * Schemes that take an annual deposit and compound annually — PPF and Sukanya
 * Samriddhi both work this way.
 *
 * Deposits are treated as made at the start of the year, which is also the
 * best practice for PPF (deposit before the 5th of April to earn a full year
 * of interest). After `contributionYears` the balance keeps compounding until
 * maturity with no further deposits, which is how SSY behaves between year 15
 * and year 21.
 *
 * Contribution ceilings and lock-in rules are policy, not arithmetic, and are
 * enforced by the caller from the scheme configuration.
 */
export function calculateAnnualScheme(input: AnnualSchemeInput): InvestmentResult {
  const yearly = Math.max(0, Number(input.yearlyContribution) || 0);
  const contributionYears = Math.max(0, Math.round(Number(input.contributionYears) || 0));
  const maturityYears = Math.max(
    contributionYears,
    Math.round(Number(input.maturityYears) || 0),
  );
  const rate = Number(input.annualRate) || 0;
  const startYear = input.startYear ?? new Date().getFullYear();

  if (yearly <= 0) return emptyResult("Enter a yearly deposit amount.");
  if (maturityYears <= 0) return emptyResult("Enter a maturity period of at least one year.");

  const schedule: PeriodRow[] = [];
  const flows: CashFlow[] = [];

  let balance = 0;
  let invested = 0;
  let cumulativeInterest = 0;

  for (let y = 1; y <= maturityYears; y++) {
    const opening = balance;
    const contribution = y <= contributionYears ? yearly : 0;

    const afterContribution = opening + contribution;
    const interest = afterContribution * (rate / 100);
    balance = afterContribution + interest;

    invested += contribution;
    cumulativeInterest += interest;

    if (contribution > 0) {
      flows.push({ amount: -contribution, date: new Date(startYear + y - 1, 3, 1) });
    }

    schedule.push({
      period: y,
      label: `Year ${y} (${startYear + y - 1}–${String((startYear + y) % 100).padStart(2, "0")})`,
      openingBalance: opening,
      contribution,
      interest,
      closingBalance: balance,
      cumulativeContribution: invested,
      cumulativeInterest,
    });
  }

  flows.push({ amount: balance, date: new Date(startYear + maturityYears - 1, 3, 1) });

  return {
    invested,
    maturityValue: balance,
    gains: balance - invested,
    absoluteReturn: absoluteReturn(invested, balance),
    annualisedReturn: xirr(flows) ?? rate,
    schedule,
    error: null,
  };
}

/* ------------------------------------------------------------------ */
/* NPS                                                                 */
/* ------------------------------------------------------------------ */

export interface NpsInput {
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number;
  expectedReturn: number;
  /** Share of the corpus that must buy an annuity, as a percentage. */
  annuityPercent: number;
  /** Expected annuity rate, used to estimate the monthly pension. */
  annuityRate: number;
}

export interface NpsResult extends InvestmentResult {
  /** Portion taken as a tax-free lump sum at exit. */
  lumpSumAtExit: number;
  /** Portion compulsorily used to buy an annuity. */
  annuityCorpus: number;
  /** Indicative monthly pension from that annuity. */
  estimatedMonthlyPension: number;
  yearsToRetirement: number;
}

/**
 * National Pension System accumulation, projected as a monthly SIP.
 *
 * The split between lump sum and annuity, and the annuity rate, are inputs —
 * the statutory minimum annuitisation and prevailing annuity rates both change,
 * so nothing is assumed here. The pension figure is a simple perpetuity
 * estimate and not a quotation from any annuity provider.
 */
export function calculateNps(input: NpsInput): NpsResult {
  const currentAge = Math.max(0, Number(input.currentAge) || 0);
  const retirementAge = Math.max(0, Number(input.retirementAge) || 0);
  const years = retirementAge - currentAge;

  if (years <= 0) {
    return {
      ...emptyResult("Retirement age must be greater than your current age."),
      lumpSumAtExit: 0,
      annuityCorpus: 0,
      estimatedMonthlyPension: 0,
      yearsToRetirement: 0,
    };
  }

  const base = calculateSip({
    monthlyAmount: input.monthlyContribution,
    years,
    expectedReturn: input.expectedReturn,
  });

  if (base.error) {
    return {
      ...base,
      lumpSumAtExit: 0,
      annuityCorpus: 0,
      estimatedMonthlyPension: 0,
      yearsToRetirement: years,
    };
  }

  const annuityPct = Math.min(100, Math.max(0, Number(input.annuityPercent) || 0));
  const annuityCorpus = base.maturityValue * (annuityPct / 100);
  const lumpSumAtExit = base.maturityValue - annuityCorpus;
  const estimatedMonthlyPension = (annuityCorpus * (Number(input.annuityRate) || 0)) / 100 / 12;

  return {
    ...base,
    lumpSumAtExit,
    annuityCorpus,
    estimatedMonthlyPension,
    yearsToRetirement: years,
  };
}

/* ------------------------------------------------------------------ */
/* Goal planning                                                       */
/* ------------------------------------------------------------------ */

/** Monthly SIP needed to reach a target, at an assumed return. */
export function sipForTarget(target: number, years: number, expectedReturn: number): number {
  if (target <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  const i = expectedReturn / 12 / 100;
  if (i <= 0) return target / n;
  // Annuity-due future value solved for the instalment.
  return target / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
}

/** What a sum today is worth after inflation. */
export function inflationAdjusted(amount: number, years: number, inflationPct: number): number {
  if (years <= 0) return amount;
  return amount / Math.pow(1 + inflationPct / 100, years);
}
