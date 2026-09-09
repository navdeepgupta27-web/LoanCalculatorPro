/**
 * Savings and investment scheme configuration.
 *
 * Two kinds of information live here, and the distinction matters:
 *
 *  1. STRUCTURAL RULES — contribution limits, lock-in periods, tax treatment,
 *     risk character. These change rarely, by legislation, and are encoded
 *     here as configuration.
 *
 *  2. INTEREST RATES — deliberately NOT here. Small-savings rates are notified
 *     quarterly by the Department of Economic Affairs and EPF annually by
 *     EPFO. They live in the `scheme_rates` table with a source URL, an
 *     effective date and a verified flag, exactly like the bank lending rates.
 *
 * The `risk`, `guarantee` and `taxation` fields exist so the comparison table
 * can show them as first-class columns. Presenting an equity SIP's projected
 * return next to a PPF's guaranteed one without that context would be
 * misleading, so those columns are never optional.
 */

import { schemeName } from "./naming";

export type SchemeId =
  | "sip"
  | "lumpsum"
  | "fd"
  | "rd"
  | "ppf"
  | "ssy"
  | "nps"
  | "epf";

export type SchemeRisk = "none" | "low" | "moderate" | "high";
export type SchemeKind = "market" | "guaranteed" | "hybrid";

export interface SchemeConfig {
  id: SchemeId;
  slug: string;
  name: string;
  shortName: string;
  emoji: string;
  gradient: string;
  kind: SchemeKind;
  risk: SchemeRisk;
  /** Who stands behind the money, in plain words. */
  guarantee: string;
  /** Plain-language tax position. Not tax advice. */
  taxation: string;
  lockIn: string;
  liquidity: string;
  /** Contribution ceilings, where the scheme has statutory ones. */
  minPerYear?: number;
  maxPerYear?: number;
  /** Whether the return is a government-set rate or a user assumption. */
  rateIsStatutory: boolean;
  /**
   * The scheme exists only under Indian law. PPF, Sukanya Samriddhi, NPS and
   * EPF have no equivalent elsewhere — the nearest foreign products (401(k),
   * IRA, ISA, SIPP) are different instruments with different limits and tax
   * treatment, not translations. These are hidden and 404 outside India rather
   * than shown with rules that do not apply.
   */
  indiaOnly?: boolean;
  /**
   * Guarantee wording that holds in any country, used outside India.
   *
   * `guarantee` and `taxation` both describe Indian arrangements — DICGC cover,
   * India Post, LTCG thresholds, Section 80C. Displaying them to someone in
   * another country would be stating another jurisdiction's tax law as if it
   * were theirs.
   */
  guaranteeUniversal?: string;
  /** Fallback assumption used only when nothing is stored and nothing entered. */
  defaultRate: number;
  defaultYears: number;
  blurb: string;
  keywords: string[];
  /** Points a reader should weigh. Never phrased as a recommendation. */
  considerations: string[];
}

export const SCHEMES: SchemeConfig[] = [
  {
    id: "sip",
    slug: "sip-calculator",
    name: "SIP Calculator",
    shortName: "SIP",
    emoji: "📈",
    gradient: "from-indigo-500 to-violet-500",
    kind: "market",
    risk: "high",
    guarantee: "None — returns depend entirely on market performance",
    guaranteeUniversal: "None — returns depend entirely on market performance",
    taxation: "Equity: 12.5% LTCG above ₹1.25 lakh a year after 12 months. Debt: taxed at your slab rate.",
    lockIn: "None, except ELSS funds (3 years)",
    liquidity: "High — redeemable on any business day",
    rateIsStatutory: false,
    defaultRate: 12,
    defaultYears: 10,
    blurb:
      "Project what a monthly mutual fund investment could grow to, with an optional annual step-up. The return you enter is an assumption, not a promise — markets deliver neither smoothly nor reliably.",
    keywords: [
      "SIP calculator",
      "SIP calculator online",
      "mutual fund SIP calculator",
      "systematic investment plan calculator",
      "step up SIP calculator",
      "SIP return calculator",
      "monthly SIP calculator India",
    ],
    considerations: [
      "The return you enter is an assumption. Past performance does not predict future returns, and no fund guarantees anything.",
      "Real returns are never smooth — a 12% average can mean −20% one year and +35% the next. Sequence matters if you need the money on a fixed date.",
      "Expense ratios, exit loads and taxes all reduce what you actually receive; this projection is before costs and tax.",
    ],
  },
  {
    id: "lumpsum",
    slug: "lumpsum-calculator",
    name: "Lumpsum Calculator",
    shortName: "Lumpsum",
    emoji: "💰",
    gradient: "from-sky-500 to-cyan-500",
    kind: "market",
    risk: "high",
    guarantee: "None — returns depend entirely on market performance",
    guaranteeUniversal: "None — returns depend entirely on market performance",
    taxation: "Equity: 12.5% LTCG above ₹1.25 lakh a year after 12 months. Debt: taxed at your slab rate.",
    lockIn: "None, except ELSS funds (3 years)",
    liquidity: "High — redeemable on any business day",
    rateIsStatutory: false,
    defaultRate: 12,
    defaultYears: 10,
    blurb:
      "What a single investment could become if held for the full term, with the true CAGR on the money. Useful for a bonus, a maturing deposit or an inheritance.",
    keywords: [
      "lumpsum calculator",
      "lump sum investment calculator",
      "mutual fund lumpsum calculator",
      "one time investment calculator",
      "CAGR calculator",
      "lumpsum return calculator India",
    ],
    considerations: [
      "A lump sum carries timing risk a SIP does not: invest everything the day before a correction and you carry that loss for years.",
      "The CAGR shown is a smoothed average. No investment actually grows at a constant rate.",
    ],
  },
  {
    id: "fd",
    slug: "fd-calculator",
    name: "FD Calculator",
    shortName: "FD",
    emoji: "🏦",
    gradient: "from-emerald-500 to-teal-500",
    kind: "guaranteed",
    risk: "none",
    guarantee: "Contractual rate from the bank; deposits insured by DICGC up to ₹5 lakh per bank per depositor",
    guaranteeUniversal: "Contractual rate agreed with the bank. Whether deposits are insured, and up to what limit, depends on your country's scheme.",
    taxation: "Interest taxed at your income-tax slab rate. TDS applies above the annual threshold.",
    lockIn: "Until maturity — premature withdrawal usually carries a rate penalty",
    liquidity: "Moderate — breakable, at a cost",
    rateIsStatutory: false,
    defaultRate: 7,
    defaultYears: 5,
    blurb:
      "Maturity value of a cumulative fixed deposit, compounded quarterly by default. The rate is fixed the day you open it and does not move.",
    keywords: [
      "FD calculator",
      "fixed deposit calculator",
      "FD maturity calculator",
      "FD interest calculator India",
      "bank FD calculator",
      "fixed deposit return calculator",
    ],
    considerations: [
      "Interest is taxable at your slab rate, so a 7% FD returns roughly 4.9% after tax in the 30% bracket.",
      "If inflation runs above your post-tax return, the deposit loses purchasing power despite the balance rising.",
      "DICGC insurance covers ₹5 lakh per bank per depositor — spread larger sums across banks.",
    ],
  },
  {
    id: "rd",
    slug: "rd-calculator",
    name: "RD Calculator",
    shortName: "RD",
    emoji: "🗓️",
    gradient: "from-teal-500 to-emerald-600",
    kind: "guaranteed",
    risk: "none",
    guarantee: "Contractual rate from the bank or India Post; bank deposits insured by DICGC up to ₹5 lakh",
    guaranteeUniversal: "Contractual rate agreed with the bank. Whether deposits are insured, and up to what limit, depends on your country's scheme.",
    taxation: "Interest taxed at your income-tax slab rate. TDS applies above the annual threshold.",
    lockIn: "Until maturity — premature closure carries a penalty",
    liquidity: "Moderate",
    rateIsStatutory: false,
    defaultRate: 7,
    defaultYears: 5,
    blurb:
      "A fixed monthly deposit at a guaranteed rate. Interest accrues monthly and is capitalised each quarter, which is how banks and India Post actually run an RD.",
    keywords: [
      "RD calculator",
      "recurring deposit calculator",
      "RD maturity calculator",
      "post office RD calculator",
      "monthly deposit calculator India",
    ],
    considerations: [
      "Missing an instalment usually attracts a penalty and can affect the maturity value.",
      "Like an FD, the interest is fully taxable at your slab rate.",
    ],
  },
  {
    id: "ppf",
    indiaOnly: true,
    slug: "ppf-calculator",
    name: "PPF Calculator",
    shortName: "PPF",
    emoji: "🛡️",
    gradient: "from-amber-500 to-orange-500",
    kind: "guaranteed",
    risk: "none",
    guarantee: "Sovereign — backed by the Government of India",
    taxation: "EEE: deposits qualify under Section 80C, and both the interest and the maturity amount are tax-free.",
    lockIn: "15 years, extendable in blocks of 5 years",
    liquidity: "Low — partial withdrawal allowed from year 7, loans from year 3",
    minPerYear: 500,
    maxPerYear: 150_000,
    rateIsStatutory: true,
    defaultRate: 7.1,
    defaultYears: 15,
    blurb:
      "Public Provident Fund maturity, compounded annually. The rate is set by the government and revised each quarter, so a 15-year projection assumes today's rate holds throughout — it will not.",
    keywords: [
      "PPF calculator",
      "PPF maturity calculator",
      "public provident fund calculator",
      "PPF interest rate",
      "current PPF interest rate",
      "PPF calculator 15 years",
      "PPF return calculator India",
    ],
    considerations: [
      "The statutory rate is revised quarterly. A 15-year projection at today's rate is illustrative, not a forecast.",
      "Deposit before the 5th of the month — interest is calculated on the lowest balance between the 5th and month end.",
      "The ₹1.5 lakh annual ceiling is shared across all your PPF accounts, and 80C is shared with other eligible deductions.",
    ],
  },
  {
    id: "ssy",
    indiaOnly: true,
    slug: "sukanya-samriddhi-calculator",
    name: "Sukanya Samriddhi Calculator",
    shortName: "SSY",
    emoji: "🌸",
    gradient: "from-rose-500 to-pink-500",
    kind: "guaranteed",
    risk: "none",
    guarantee: "Sovereign — backed by the Government of India",
    taxation: "EEE: deposits qualify under Section 80C, and both the interest and the maturity amount are tax-free.",
    lockIn: "Matures 21 years from opening; deposits are made only for the first 15 years",
    liquidity: "Very low — partial withdrawal permitted for higher education after the girl turns 18",
    minPerYear: 250,
    maxPerYear: 150_000,
    rateIsStatutory: true,
    defaultRate: 8.2,
    defaultYears: 21,
    blurb:
      "Sukanya Samriddhi Yojana, for a girl child under 10. Deposits run for 15 years, then the balance keeps compounding untouched until it matures at year 21.",
    keywords: [
      "Sukanya Samriddhi calculator",
      "SSY calculator",
      "Sukanya Samriddhi Yojana calculator",
      "sukanya samriddhi interest rate",
      "SSY maturity calculator",
      "girl child savings scheme calculator",
    ],
    considerations: [
      "The account can only be opened for a girl child below 10, and one family may open at most two accounts.",
      "The six years between the final deposit and maturity are where a large share of the corpus is built — the compounding continues with no further contribution.",
      "The rate is revised quarterly, so a 21-year projection at today's rate is illustrative.",
    ],
  },
  {
    id: "nps",
    indiaOnly: true,
    slug: "nps-calculator",
    name: "NPS Calculator",
    shortName: "NPS",
    emoji: "🧓",
    gradient: "from-violet-500 to-purple-600",
    kind: "hybrid",
    risk: "moderate",
    guarantee: "None on the corpus — returns depend on your chosen equity/debt allocation",
    taxation: "Deductions under 80CCD(1B) over and above 80C. At exit the lump sum is tax-free; the annuity income is taxed as income.",
    lockIn: "Until age 60, with limited exceptions",
    liquidity: "Very low",
    rateIsStatutory: false,
    defaultRate: 10,
    defaultYears: 30,
    blurb:
      "National Pension System corpus at retirement, split between the lump sum you take and the annuity you must buy. The pension figure is an estimate, not a quotation from any annuity provider.",
    keywords: [
      "NPS calculator",
      "national pension system calculator",
      "NPS pension calculator",
      "NPS maturity calculator",
      "retirement corpus calculator India",
      "NPS annuity calculator",
    ],
    considerations: [
      "NPS returns are market-linked and vary by the scheme and allocation you pick; there is no declared rate.",
      "A minimum share of the corpus must be used to buy an annuity, and the pension it produces depends on annuity rates at that future date — which nobody can predict.",
      "The annuity income is taxable as income in the year you receive it.",
    ],
  },
  {
    id: "epf",
    indiaOnly: true,
    slug: "epf-calculator",
    name: "EPF Calculator",
    shortName: "EPF",
    emoji: "💼",
    gradient: "from-blue-500 to-indigo-600",
    kind: "guaranteed",
    risk: "none",
    guarantee: "Rate declared annually by EPFO with government approval",
    taxation: "EEE, subject to conditions. Interest on employee contributions above ₹2.5 lakh a year is taxable.",
    lockIn: "Until retirement, with permitted withdrawals for housing, medical needs and unemployment",
    liquidity: "Low",
    rateIsStatutory: true,
    defaultRate: 8.25,
    defaultYears: 30,
    blurb:
      "Employees' Provident Fund balance at retirement from your and your employer's monthly contributions. The rate is declared by EPFO each financial year.",
    keywords: [
      "EPF calculator",
      "PF calculator",
      "employee provident fund calculator",
      "EPF interest rate",
      "EPF maturity calculator",
      "provident fund calculator India",
    ],
    considerations: [
      "The rate is declared annually and has moved over time; a 30-year projection at today's rate is illustrative.",
      "Only part of the employer's 12% goes to EPF — a portion is directed to the pension scheme (EPS), which this projection does not model.",
    ],
  },
];

export const SCHEME_MAP: Record<SchemeId, SchemeConfig> = Object.fromEntries(
  SCHEMES.map((s) => [s.id, s]),
) as Record<SchemeId, SchemeConfig>;

export function schemeBySlug(slug: string): SchemeConfig | undefined {
  return SCHEMES.find((s) => s.slug === slug);
}

/** Schemes whose rate is government-set and therefore worth publishing. */
export const STATUTORY_SCHEMES = SCHEMES.filter((s) => s.rateIsStatutory);

/** Slugs that only resolve under /in. */
export const INDIA_ONLY_SLUGS = new Set(SCHEMES.filter((s) => s.indiaOnly).map((s) => s.slug));

/**
 * The schemes offered in a country.
 *
 * Outside India the four Indian statutory schemes are dropped entirely. What
 * remains — SIP, lumpsum, FD and RD — are ordinary financial products that
 * exist everywhere and whose arithmetic is identical; only the currency and the
 * tax commentary differ, and the tax commentary is withheld rather than guessed.
 */
export function schemesFor(countryCode: string): SchemeConfig[] {
  const available = countryCode === "in" ? SCHEMES : SCHEMES.filter((s) => !s.indiaOnly);
  return available.map((s) => localiseScheme(countryCode, s));
}

/**
 * The same instrument under the name this market uses.
 *
 * A fixed deposit is a CD in the United States and a GIC in Canada; the
 * arithmetic is identical, which is why one calculator serves all three, but
 * only the local name makes it findable. The slug stays put — it is a URL.
 */
export function localiseScheme(countryCode: string, scheme: SchemeConfig): SchemeConfig {
  // `name` carries a " Calculator" suffix; the overrides are product names, so
  // the suffix is stripped for the lookup and put back afterwards.
  const base = scheme.name.replace(/ Calculator$/, "");
  const { label, short } = schemeName(countryCode, scheme.id, {
    label: base,
    short: scheme.shortName,
  });
  if (label === base && short === scheme.shortName) return scheme;
  return { ...scheme, name: `${label} Calculator`, shortName: short ?? scheme.shortName };
}

export const RISK_LABEL: Record<SchemeRisk, string> = {
  none: "No market risk",
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

/** Keyword set for the investment hub and comparison pages. */
export const INVESTMENT_KEYWORDS = [
  "investment calculator",
  "investment calculator India",
  "SIP vs FD",
  "PPF vs SIP",
  "compare investment options India",
  "best investment plan calculator",
  "savings scheme calculator",
  "CAGR calculator",
  "XIRR calculator",
  "absolute return calculator",
  "goal planning calculator",
  "retirement corpus calculator",
  "wealth calculator India",
  "small savings scheme interest rates",
];
