import Link from "next/link";

import { ArticleShell } from "@/components/sections/article-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description:
    "Loan Calculator Pro provides estimates, not financial advice. What our calculations include, what they leave out, and why you must verify with your lender.",
  path: "/disclaimer",
  keywords: ["disclaimer", "not financial advice", "loan calculator accuracy"],
});

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Disclaimer", path: "/disclaimer" },
        ])}
      />

      <ArticleShell
        breadcrumb="Disclaimer"
        title="Disclaimer"
        lede="Read this before you act on any number this site produces."
        updated="1 September 2026"
      >
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-950/40">
          <p className="text-[0.9375rem] font-semibold leading-relaxed text-amber-900 dark:text-amber-200">
            Loan Calculator Pro is a calculation tool, not a financial adviser. Nothing on this site is
            investment, tax, legal or borrowing advice, and nothing here is a recommendation to take
            any particular loan from any particular lender.
          </p>
        </div>

        <div className="prose-lcp mt-8">
          <h2>Estimates, not quotations</h2>
          <p>
            Every figure produced here is an estimate derived from the numbers you enter, using the
            standard reducing-balance formulas that Indian lenders apply. It is not a quotation, an
            offer, or a commitment from anybody.
          </p>
          <p>
            Your actual EMI, total interest, fees and charges are determined by your lender and set
            out in your sanction letter and loan agreement. Where those differ from anything shown
            here, <strong>your lender&rsquo;s documents are correct and this site is not</strong>.
          </p>

          <h2>What the calculations include</h2>
          <ul>
            <li>EMI on the reducing-balance method, the standard across Indian lending;</li>
            <li>a full month-by-month principal and interest split;</li>
            <li>one-off and recurring part-payments, in both tenure-reduction and EMI-reduction modes;</li>
            <li>processing fee and GST on that fee, included in the total cost figure.</li>
          </ul>

          <h2>What they deliberately leave out</h2>
          <ul>
            <li>
              <strong>Floating-rate resets.</strong> Most Indian home loans are linked to an
              external benchmark such as the RBI repo rate. When it moves, your EMI or tenure moves.
              Calculations here assume the rate you enter holds for the full term, which it almost
              certainly will not.
            </li>
            <li>
              <strong>Prepayment and foreclosure charges.</strong> Fixed-rate and many non-housing
              loans carry penalties for early repayment. Check your agreement, then set the interest
              saving shown here against that cost.
            </li>
            <li>
              <strong>Insurance and add-ons.</strong> Loan protection insurance is frequently bundled
              into the sanctioned amount and is not modelled.
            </li>
            <li>
              <strong>Moratorium periods.</strong> Education loans and some construction-linked home
              loans defer repayment while interest accrues. Enter the post-moratorium balance for an
              accurate result.
            </li>
            <li>
              <strong>Other charges.</strong> Documentation, legal, valuation, CERSAI, stamp duty and
              late-payment fees vary too widely between lenders to estimate honestly.
            </li>
            <li>
              <strong>Tax relief.</strong> Deductions under Sections 24(b) and 80C are not applied.
              Eligibility depends on your tax regime and changes with each Finance Act.
            </li>
          </ul>

          <h2>About the interest rate tables</h2>
          <p>
            Rates are transcribed from lenders&rsquo; own published pages on the date shown against
            each row, and each row links back to that source. They are <em>published starting
            rates</em> — the best advertised rate, typically reserved for borrowers with excellent
            credit. The rate you are personally offered depends on your credit score, income,
            employer category, loan-to-value ratio and existing relationship with the lender, and is
            frequently higher.
          </p>
          <p>
            Rates change often, and a table can be out of date within days.{" "}
            <strong>Always confirm on the lender&rsquo;s own website or in writing before acting.</strong>{" "}
            If you spot a rate that has changed, <Link href="/feedback">tell us</Link> and it will
            be corrected.
          </p>

          <h2>No commercial relationships</h2>
          <p>
            {SITE.legalName} receives no commission, referral fee or other payment from any lender
            named on this site. There are no affiliate links. Table ordering is driven purely by
            rate. The site is funded solely by Google AdSense advertising, and we do not control
            which advertisers appear.
          </p>

          <h2>Get proper advice</h2>
          <p>
            A home loan is likely the largest financial commitment you will make. Use this site to
            understand the arithmetic and to ask your lender better questions — not as a substitute
            for advice from a SEBI-registered investment adviser, a qualified chartered accountant,
            or your lender&rsquo;s own relationship manager.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/privacy-policy" variant="secondary">
            Privacy Policy
          </ButtonLink>
          <ButtonLink href="/terms" variant="secondary">
            Terms of Service
          </ButtonLink>
          <ButtonLink href="/feedback" variant="secondary">
            Report an error
          </ButtonLink>
        </div>
      </ArticleShell>
    </>
  );
}
