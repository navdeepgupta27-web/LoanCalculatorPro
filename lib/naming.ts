/**
 * What each market calls the things this site calculates.
 *
 * Naming only. Nothing here is a rate, a limit, a fee or a rule — those are
 * per-country facts that have to be sourced, and they live in the database.
 * These are the words a borrower in that country would actually use, and
 * getting them wrong is what makes a site read as foreign: an American looking
 * for a mortgage does not search for a "home loan EMI", and telling them their
 * "EMI" is $2,400 is close to meaningless.
 *
 * Every entry is a convention rather than a claim, so where a market genuinely
 * uses the same word as India it simply falls through to the default.
 */

import type { LoanTypeId } from "./site";
import type { SchemeId } from "./schemes";

/* ------------------------------------------------------------------ */
/* The monthly payment                                                 */
/* ------------------------------------------------------------------ */

export interface InstalmentWords {
  /** Column headings and stat tiles: "EMI", "Monthly Payment". */
  abbr: string;
  /** Title case, for headings: "EMI Calculator", "Mortgage Calculator". */
  title: string;
  /** Mid-sentence: "your EMI", "your monthly payment". */
  sentence: string;
  /** Bare noun, for "Monthly {noun}": "EMI", "Payment", "Repayment". */
  noun: string;
}

const EMI: InstalmentWords = { abbr: "EMI", title: "EMI", sentence: "EMI", noun: "EMI" };

const PAYMENT: InstalmentWords = {
  abbr: "Monthly Payment",
  title: "Monthly Payment",
  sentence: "monthly payment",
  noun: "Payment",
};

const REPAYMENT: InstalmentWords = {
  abbr: "Monthly Repayment",
  title: "Monthly Repayment",
  sentence: "monthly repayment",
  noun: "Repayment",
};

/**
 * "EMI" is a South Asian term. Elsewhere the same number is a monthly payment
 * or, in Commonwealth usage, a monthly repayment.
 */
const INSTALMENT_BY_COUNTRY: Record<string, InstalmentWords> = {
  in: EMI, pk: EMI, bd: EMI, np: EMI, lk: EMI, bt: EMI,
  gb: REPAYMENT, au: REPAYMENT, nz: REPAYMENT, ie: REPAYMENT, sg: REPAYMENT, za: REPAYMENT,
};

export function instalmentWords(countryCode: string): InstalmentWords {
  return INSTALMENT_BY_COUNTRY[countryCode] ?? PAYMENT;
}

/** True where "EMI" is the everyday word, so the abbreviation needs no gloss. */
export function usesEmi(countryCode: string): boolean {
  return INSTALMENT_BY_COUNTRY[countryCode] === EMI;
}

/**
 * What to call a loan calculator page in this market.
 *
 * India stacks the instalment word into the name — "Home Loan EMI Calculator"
 * is how people search. Everywhere else the same construction produces
 * "Mortgage Monthly Payment Calculator", which nobody says and nobody types;
 * the product name alone is both the natural phrase and the query with the
 * volume. The instalment word still does its work in the body copy.
 */
export function loanCalculatorTitle(countryCode: string, productLabel: string): string {
  return usesEmi(countryCode)
    ? `${productLabel} EMI Calculator`
    : `${productLabel} Calculator`;
}

/* ------------------------------------------------------------------ */
/* Loan products                                                       */
/* ------------------------------------------------------------------ */

interface Name {
  label: string;
  short?: string;
}

/**
 * Overrides per market. A product missing from a country's entry keeps the
 * default name, which is the right answer surprisingly often — "personal loan"
 * and "business loan" are the same words nearly everywhere.
 */
const LOAN_NAMES: Record<string, Partial<Record<LoanTypeId, Name>>> = {
  us: {
    home: { label: "Mortgage", short: "Mortgage" },
    car: { label: "Auto Loan", short: "Auto" },
    education: { label: "Student Loan", short: "Student" },
  },
  ca: {
    home: { label: "Mortgage", short: "Mortgage" },
    car: { label: "Auto Loan", short: "Auto" },
    education: { label: "Student Loan", short: "Student" },
  },
  gb: {
    home: { label: "Mortgage", short: "Mortgage" },
    car: { label: "Car Finance", short: "Car" },
    education: { label: "Student Loan", short: "Student" },
  },
  au: {
    // Australia says "home loan" rather than "mortgage" in everyday use.
    car: { label: "Car Loan", short: "Car" },
    education: { label: "Student Loan", short: "Student" },
  },
  sg: {},
  ae: {},
};

export function loanName(countryCode: string, id: LoanTypeId, fallback: Name): Name {
  const override = LOAN_NAMES[countryCode]?.[id];
  return {
    label: override?.label ?? fallback.label,
    short: override?.short ?? fallback.short ?? override?.label ?? fallback.label,
  };
}

/* ------------------------------------------------------------------ */
/* Savings products                                                    */
/* ------------------------------------------------------------------ */

/**
 * The same instrument under its local name.
 *
 * A fixed deposit is a CD in the United States, a GIC in Canada, a fixed rate
 * bond in the UK and a term deposit in Australia. The arithmetic is identical,
 * which is exactly why one calculator can serve them all — but only if it uses
 * the name the reader knows.
 *
 * SIP is an Indian mutual-fund term. The mechanism elsewhere is the same
 * thing under a plainer description, so it gets one.
 */
const SCHEME_NAMES: Record<string, Partial<Record<SchemeId, Name>>> = {
  us: {
    fd: { label: "Certificate of Deposit", short: "CD" },
    rd: { label: "Regular Savings Plan", short: "Savings Plan" },
    sip: { label: "Recurring Investment", short: "Recurring" },
    lumpsum: { label: "Lump Sum", short: "Lump Sum" },
  },
  ca: {
    fd: { label: "GIC", short: "GIC" },
    rd: { label: "Regular Savings Plan", short: "Savings Plan" },
    sip: { label: "Recurring Investment", short: "Recurring" },
    lumpsum: { label: "Lump Sum", short: "Lump Sum" },
  },
  gb: {
    fd: { label: "Fixed Rate Bond", short: "Fixed Bond" },
    rd: { label: "Regular Saver", short: "Regular Saver" },
    sip: { label: "Regular Investment", short: "Regular" },
    lumpsum: { label: "Lump Sum", short: "Lump Sum" },
  },
  au: {
    fd: { label: "Term Deposit", short: "Term Deposit" },
    rd: { label: "Regular Savings Plan", short: "Savings Plan" },
    sip: { label: "Regular Investment", short: "Regular" },
    lumpsum: { label: "Lump Sum", short: "Lump Sum" },
  },
  // Singapore and the UAE both use "fixed deposit" and understand SIP, so the
  // Indian names carry over unchanged.
  sg: {},
  ae: {},
};

export function schemeName(countryCode: string, id: SchemeId, fallback: Name): Name {
  const override = SCHEME_NAMES[countryCode]?.[id];
  return {
    label: override?.label ?? fallback.label,
    short: override?.short ?? fallback.short ?? override?.label ?? fallback.label,
  };
}
