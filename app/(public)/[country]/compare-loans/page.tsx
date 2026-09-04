import Link from "next/link";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { LoanComparison, type RateOption } from "@/components/compare/loan-comparison";
import { FaqSection } from "@/components/sections/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { GENERAL_FAQS } from "@/lib/faqs";
import { getVerifiedRates } from "@/lib/queries";
import { countryHref, resolveCountry } from "@/lib/countries";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import type { LoanTypeId } from "@/lib/site";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);

  return pageMetadata({
    title: "Compare Bank Loans Side by Side — EMI, Fees & Total Cost",
    description:
      "Compare up to four loan offers at once. Enter each lender's rate, tenure and processing fee and see them ranked by total cost — not headline rate — with EMI, total interest, GST and payoff date side by side.",
    path: countryHref(country, "/compare-loans"),
    keywords: [
      "compare bank loans",
      "loan comparison calculator",
      "compare home loan interest rates",
      "compare EMI between banks",
      "best bank for home loan India",
      "loan comparison India side by side",
      "which bank has lowest interest rate",
      "total cost of loan comparison",
      "processing fee comparison banks",
    ],
    country,
    countryPath: "/compare-loans",
  });
}

export const revalidate = 1800;

const COMPARE_FAQS = [
  {
    question: "Why rank by total cost instead of interest rate?",
    answer:
      "Because the headline rate is only part of the price. A lender advertising 8.40% with a 1% processing fee can easily cost more than one at 8.55% with a flat ₹10,000 fee, particularly on a shorter tenure where the fee is spread over fewer years. Total cost — every instalment plus fees plus GST — is the number that leaves your account, so that is what the ranking uses.",
  },
  {
    question: "Should I compare using the same tenure for every lender?",
    answer:
      "Usually yes, because a longer tenure always lowers the EMI while raising the total cost, and mixing tenures makes the EMI column meaningless. Each card has its own tenure field for the case where a lender genuinely will not offer the term you want — but if you change one, read the total cost row rather than the EMI row.",
  },
  {
    question: "Does this include the interest rate I will personally be offered?",
    answer:
      "No. The rates you can prefill are the published starting rates from each lender's own page. What you are actually offered depends on your credit score, income, loan-to-value ratio, employer category and existing relationship with the bank — and is frequently higher than the advertised floor. Use the prefill as a starting point, then replace it with the rate in your own sanction letter or quote.",
  },
  ...GENERAL_FAQS.slice(3, 6),
];

export default async function CompareLoansPage({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);
  const href = (path: string) => countryHref(country, path);

  let rateOptions: RateOption[] = [];
  try {
    const rates = await getVerifiedRates();
    rateOptions = rates.map((r) => ({
      bankName: r.bank_name,
      loanType: r.loan_type as LoanTypeId,
      minRate: Number(r.min_rate),
      processingFeePct: null,
      maxTenureYears: r.max_tenure_years,
    }));
  } catch {
    // Prefill is a convenience — the tool works fully without it.
  }

  return (
    <>
      <JsonLd
        data={[
          faqSchema(COMPARE_FAQS),
          breadcrumbSchema([
            { name: "Home", path: countryHref(country) },
            { name: "Compare Loans", path: countryHref(country, "/compare-loans") },
          ]),
        ]}
      />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <Link href={href("/")} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">Compare Loans</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                Compare lenders on what you <span className="gradient-text">actually pay</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Put up to four offers side by side. Every option is costed on the same loan amount,
                with processing fee and GST folded in, and ranked by total outflow — so the cheapest
                headline rate does not automatically win.
              </p>
            </Reveal>
            {rateOptions.length > 0 && (
              <Reveal delay={140}>
                <p className="mt-3 text-sm font-medium text-accent-700 dark:text-accent-400">
                  ✓ {rateOptions.length} published lender rates available to prefill
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LoanComparison rateOptions={rateOptions} />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FaqSection
          faqs={COMPARE_FAQS}
          eyebrow="Comparing loans"
          title="How to read a loan comparison"
          description="The traps that make a cheap-looking loan expensive."
        />
      </section>
    </>
  );
}
