/**
 * Seeds the statutory scheme rates.
 *
 *   npm run db:scheme-rates
 *
 * Every figure below was read from a government or government-broadcaster
 * source on 4 September 2026, and each row carries that source URL.
 *
 * They are seeded with verified = 0 on purpose. One search summary encountered
 * during research reported PPF at 8.2% (which is in fact the SSY and SCSS
 * rate), so these want a human confirming them against India Post or the DEA
 * notification before the site presents them as authoritative. The calculators
 * still use them as editable defaults; the public "current rates" table only
 * badges a figure once it is verified in /admin.
 *
 * Re-running is safe: rows are matched on scheme_id and updated in place,
 * but an already-verified row is never silently reverted to unverified.
 */
import { all, run } from "../lib/db";

const DEA_SMALL_SAVINGS = "https://dea.gov.in/budget-division/475";
const INDIA_POST_SAVINGS = "https://www.indiapost.gov.in/banking-services/savings";
const EPFO_RATE_NEWS = "https://ddnews.gov.in/en/epfo-retains-8-25-interest-rate-on-pf-deposits-for-2025-26/";

interface SeedRate {
  schemeId: string;
  rate: number;
  periodLabel: string;
  sourceUrl: string;
  effectiveDate: string;
  notes: string;
}

const RATES: SeedRate[] = [
  {
    schemeId: "ppf",
    rate: 7.1,
    periodLabel: "Q2 FY 2026-27 (Jul–Sep 2026)",
    sourceUrl: DEA_SMALL_SAVINGS,
    effectiveDate: "2026-07-01",
    notes:
      "Small savings rates held unchanged for the quarter beginning 1 July 2026. CONFIRM against India Post before marking verified.",
  },
  {
    schemeId: "ssy",
    rate: 8.2,
    periodLabel: "Q2 FY 2026-27 (Jul–Sep 2026)",
    sourceUrl: INDIA_POST_SAVINGS,
    effectiveDate: "2026-07-01",
    notes:
      "Sukanya Samriddhi. Unchanged for the quarter beginning 1 July 2026. CONFIRM before marking verified.",
  },
  {
    schemeId: "epf",
    rate: 8.25,
    periodLabel: "FY 2025-26",
    sourceUrl: EPFO_RATE_NEWS,
    effectiveDate: "2026-07-01",
    notes:
      "Declared by EPFO for FY 2025-26, third consecutive year at this rate. CONFIRM against the EPFO circular before marking verified.",
  },
];

async function main() {
  const existing = await all<{ scheme_id: string; verified: number }>(
    `SELECT scheme_id, verified FROM scheme_rates`,
  );
  const verifiedAlready = new Set(
    existing.filter((r) => r.verified === 1).map((r) => r.scheme_id),
  );

  for (const r of RATES) {
    if (verifiedAlready.has(r.schemeId)) {
      console.log(`  skip    ${r.schemeId.padEnd(6)} — already verified, leaving it alone`);
      continue;
    }

    await run(
      `INSERT INTO scheme_rates
         (scheme_id, rate, period_label, source_url, effective_date, verified, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
       ON CONFLICT (scheme_id) DO UPDATE SET
         rate = excluded.rate,
         period_label = excluded.period_label,
         source_url = excluded.source_url,
         effective_date = excluded.effective_date,
         notes = excluded.notes,
         updated_at = datetime('now')`,
      [r.schemeId, r.rate, r.periodLabel, r.sourceUrl, r.effectiveDate, r.notes],
    );
    console.log(`  seeded  ${r.schemeId.padEnd(6)} ${r.rate}%  ${r.periodLabel}`);
  }

  console.log(`
  Seeded UNVERIFIED on purpose.

  Open /admin/scheme-rates, check each figure against the source URL, then
  tick Verified. Until you do, the calculators use these as editable defaults
  but the public rates table will not present them as confirmed.

  NPS and the mutual-fund calculators have no statutory rate — their return is
  an assumption the user enters, never a published figure.
`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
