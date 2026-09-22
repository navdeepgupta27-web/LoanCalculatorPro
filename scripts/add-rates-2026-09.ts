/**
 * Rates read from lenders' own published pages on 22 September 2026.
 *
 *   npm run db:rates:sep26          (local)
 *   npm run db:rates:sep26:prod     (Turso)
 *
 * Every figure below was fetched from the URL recorded against it and is
 * reproduced exactly as that page stated it. Nothing is estimated, averaged or
 * carried over from another source. Where a page published a floor ("7.25%
 * onwards") the maximum is left null rather than invented, and where it
 * published a band both ends are recorded.
 *
 * Re-running is safe: the upsert is keyed on (bank, loan type), so a second run
 * refreshes the same rows rather than duplicating them.
 *
 * Two lenders are absent on purpose. Punjab National Bank publishes its rate
 * range only as a PDF that will not extract, and LIC Housing the same. Search
 * results quote figures for both; a search summary is not the lender's page,
 * and that is the standard this table holds itself to, so they stay empty.
 *
 * Finding these at all took searching rather than guessing: India's banks are
 * migrating to the RBI-mandated .bank.in domains and the old deep links mostly
 * 301 to a domain root, a sitemap or a 404. Bank of Baroda moved from
 * retail-loan-interest-rates to retail-loans-interest-rates, one letter.
 */
import { all, db, one, run } from "../lib/db";

interface SourcedRate {
  bankSlug: string;
  loanType: string;
  minRate: number;
  /** Null where the lender published a floor rather than a band. */
  maxRate: number | null;
  sourceUrl: string;
  /** The date the lender's page states, or the date it was read. */
  effectiveDate: string;
  notes: string;
}

const READ_ON = "2026-09-22";

const RATES: SourcedRate[] = [
  {
    bankSlug: "state-bank-of-india",
    loanType: "home",
    minRate: 7.25,
    maxRate: null,
    sourceUrl: "https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates",
    effectiveDate: "2026-04-01",
    notes: "Published as \"7.25% p.a. onwards\", effective w.e.f. 01.04.2026. No upper bound stated.",
  },
  {
    bankSlug: "state-bank-of-india",
    loanType: "car",
    minRate: 8.3,
    maxRate: null,
    sourceUrl: "https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates",
    effectiveDate: READ_ON,
    notes: "Published as \"8.30% p.a.\" for auto loans, marked T&C apply. No upper bound or date stated on the page.",
  },
  {
    bankSlug: "icici-bank",
    loanType: "home",
    minRate: 8.5,
    maxRate: 9.8,
    sourceUrl: "https://www.icici.bank.in/personal-banking/loans/home-loan/interest-rates",
    effectiveDate: READ_ON,
    notes:
      "Floating range across all slabs: 8.50% at the bottom, 9.80% at the top (self-employed, above Rs 75 lakh). Page states the rates are valid until 30 September 2026.",
  },
  {
    bankSlug: "union-bank-of-india",
    loanType: "home",
    minRate: 7.15,
    maxRate: null,
    sourceUrl: "https://www.unionbankofindia.bank.in/english/interest-rate-loan.aspx",
    effectiveDate: READ_ON,
    notes: "Published as \"from 7.15%\", conditions apply. No date stated on the page.",
  },
  {
    bankSlug: "union-bank-of-india",
    loanType: "car",
    minRate: 7.5,
    maxRate: null,
    sourceUrl: "https://www.unionbankofindia.bank.in/english/interest-rate-loan.aspx",
    effectiveDate: READ_ON,
    notes: "Published as \"from 7.50%\" for vehicle loans, conditions apply.",
  },
  {
    bankSlug: "union-bank-of-india",
    loanType: "personal",
    minRate: 8.75,
    maxRate: null,
    sourceUrl: "https://www.unionbankofindia.bank.in/english/interest-rate-loan.aspx",
    effectiveDate: READ_ON,
    notes: "Published as \"from 8.75%\", conditions apply.",
  },
  {
    bankSlug: "bank-of-baroda",
    loanType: "home",
    minRate: 7.2,
    maxRate: 8.95,
    sourceUrl:
      "https://bankofbaroda.bank.in/interest-rate-and-service-charges/retail-loans-interest-rates",
    effectiveDate: "2026-09-12",
    notes:
      "Page publishes the spread, not the rate: BRLLR - 0.70% to BRLLR + 1.05% for salaried and non-salaried, with BRLLR stated as 7.90%. 7.20-8.95% is that arithmetic, not an estimate.",
  },
  {
    bankSlug: "bank-of-baroda",
    loanType: "car",
    minRate: 7.6,
    maxRate: 11.3,
    sourceUrl:
      "https://bankofbaroda.bank.in/interest-rate-and-service-charges/retail-loans-interest-rates",
    effectiveDate: "2026-09-12",
    notes: "New car, floating. The page computes this range itself. Pre-owned is higher, at 10.65-13.40%.",
  },
  {
    bankSlug: "bank-of-baroda",
    loanType: "personal",
    minRate: 10.15,
    maxRate: 17.5,
    sourceUrl:
      "https://bankofbaroda.bank.in/interest-rate-and-service-charges/retail-loans-interest-rates",
    effectiveDate: "2026-09-12",
    notes: "Range across employment categories and CIBIL bands.",
  },
  {
    bankSlug: "bank-of-baroda",
    loanType: "education",
    minRate: 6.85,
    maxRate: null,
    sourceUrl:
      "https://bankofbaroda.bank.in/interest-rate-and-service-charges/retail-loans-interest-rates",
    effectiveDate: "2026-09-12",
    notes:
      "BRLLR - 1.05% for the premier institution tier, which is the floor. The page tiers by institution and loan size and does not state a single ceiling, so none is recorded.",
  },
  {
    bankSlug: "canara-bank",
    loanType: "home",
    minRate: 7.15,
    maxRate: 10.0,
    sourceUrl: "https://www.canarabank.bank.in/pages/interest-rate-range-on-loans",
    effectiveDate: "2025-12-12",
    notes:
      "Published rate-range disclosure, effective 12.12.2025; the page gives a mean of 8.06%. Its Repo Linked Lending Rate is shown separately as 8.00% as of 12.03.2026.",
  },
  {
    bankSlug: "canara-bank",
    loanType: "car",
    minRate: 7.45,
    maxRate: 15.0,
    sourceUrl: "https://www.canarabank.bank.in/pages/interest-rate-range-on-loans",
    effectiveDate: "2025-12-12",
    notes: "Canara Vehicle scheme. Published mean 9.09%.",
  },
  {
    bankSlug: "canara-bank",
    loanType: "personal",
    minRate: 9.7,
    maxRate: 14.7,
    sourceUrl: "https://www.canarabank.bank.in/pages/interest-rate-range-on-loans",
    effectiveDate: "2025-12-12",
    notes: "Canara Budget scheme. Published mean 11.86%.",
  },
  {
    bankSlug: "hdfc-bank",
    loanType: "home",
    minRate: 7.75,
    maxRate: 13.2,
    sourceUrl: "https://homeloans.hdfc.bank.in/checklist/home-loan-interest-rates",
    effectiveDate: READ_ON,
    notes:
      "Benchmarked to the policy repo rate, stated as 5.25%, plus 2.50% to 7.95%. The floor already matched; the ceiling is new.",
  },
  {
    bankSlug: "axis-bank",
    loanType: "home",
    minRate: 8.2,
    maxRate: null,
    sourceUrl: "https://www.axis.bank.in/loans/home-loan/interest-rates-charges",
    effectiveDate: READ_ON,
    notes:
      "Page headline reads \"starting at 8.20% p.a.\" for September 2026. This replaces an unverified 8.00% that was carrying no source.",
  },
  {
    bankSlug: "kotak-mahindra-bank",
    loanType: "home",
    minRate: 7.6,
    maxRate: null,
    sourceUrl: "https://www.kotak.bank.in/en/personal-banking/loans/home-loan/interest-rates.html",
    effectiveDate: READ_ON,
    notes:
      "Floating, linked to the repo rate at 5.25%, published as starting at 7.60%. No ceiling stated for new applicants.",
  },
];

async function main() {
  await db();
  console.log(`\nApplying ${RATES.length} sourced rate(s)\n`);

  let written = 0;
  for (const r of RATES) {
    const bank = await one<{ id: number; name: string }>(
      `SELECT id, name FROM banks WHERE country = 'in' AND slug = ?`,
      [r.bankSlug],
    );
    if (!bank) {
      console.log(`  SKIP  ${r.bankSlug} — no such lender`);
      continue;
    }

    await run(
      `INSERT INTO rates
         (bank_id, country, loan_type, min_rate, max_rate, source_url, effective_date,
          verified, notes, updated_at)
       VALUES (?, 'in', ?, ?, ?, ?, ?, 1, ?, datetime('now'))
       ON CONFLICT (bank_id, loan_type) DO UPDATE SET
         min_rate       = excluded.min_rate,
         max_rate       = excluded.max_rate,
         source_url     = excluded.source_url,
         effective_date = excluded.effective_date,
         verified       = excluded.verified,
         notes          = excluded.notes,
         updated_at     = datetime('now')`,
      [bank.id, r.loanType, r.minRate, r.maxRate, r.sourceUrl, r.effectiveDate, r.notes],
    );

    const band = r.maxRate === null ? `${r.minRate}%+` : `${r.minRate}–${r.maxRate}%`;
    console.log(`  OK    ${bank.name.padEnd(24)} ${r.loanType.padEnd(9)} ${band}`);
    written++;
  }

  const total = await all<{ loan_type: string; n: number }>(
    `SELECT loan_type, COUNT(*) AS n FROM rates
      WHERE country = 'in' AND verified = 1 AND min_rate IS NOT NULL
      GROUP BY loan_type ORDER BY n DESC`,
  );
  console.log(`\n${written} written. Published rates now:`);
  for (const t of total) console.log(`  ${t.loan_type.padEnd(10)} ${t.n}`);
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
