import Link from "next/link";
import { notFound } from "next/navigation";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { CoverageNotice } from "@/components/rates/coverage-notice";
import { RatesTable } from "@/components/rates/rates-table";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getRateCoverage, getRatesForLoanType, type RateCoverage } from "@/lib/queries";
import { breadcrumbSchema, pageMetadata, rateTableSchema } from "@/lib/seo";
import { LOAN_TYPES, loanTypeByRateSlug } from "@/lib/site";
import type { RateWithBank } from "@/lib/types";

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return LOAN_TYPES.map((t) => ({ loanType: t.rateSlug }));
}

type Props = { params: Promise<{ loanType: string }> };

export async function generateMetadata({ params }: Props) {
  const { loanType } = await params;
  const type = loanTypeByRateSlug(loanType);
  if (!type) return {};

  return pageMetadata({
    title: `${type.label} Interest Rates — All Banks Compared`,
    description: `Compare ${type.label.toLowerCase()} interest rates, processing fees and maximum tenures across Indian banks, housing finance companies and NBFCs. Each rate is dated and linked to the lender's own published page.`,
    path: `/bank-interest-rates/${type.rateSlug}`,
    keywords: [
      `${type.label.toLowerCase()} interest rate`,
      `${type.label.toLowerCase()} interest rates all banks`,
      `lowest ${type.label.toLowerCase()} interest rate India`,
      `${type.label.toLowerCase()} processing fee comparison`,
      `compare ${type.label.toLowerCase()} rates`,
      ...type.keywords,
    ],
  });
}

export default async function LoanTypeRatesPage({ params }: Props) {
  const { loanType } = await params;
  const type = loanTypeByRateSlug(loanType);
  if (!type) notFound();

  let rates: RateWithBank[] = [];
  let coverage: RateCoverage = {
    total: 0,
    verified: 0,
    missing: 0,
    lenders: 0,
    lastUpdated: null,
  };

  try {
    // Every lender is listed, with or without a published rate for this type.
    [rates, coverage] = await Promise.all([
      getRatesForLoanType(type.id),
      getRateCoverage(type.id),
    ]);
  } catch {
    // Page shell still renders without the database.
  }

  return (
    <>
      <JsonLd
        data={[
          rateTableSchema(type.label, rates.length, `/bank-interest-rates/${type.rateSlug}`),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Bank Interest Rates", path: "/bank-interest-rates" },
            { name: `${type.label} Rates`, path: `/bank-interest-rates/${type.rateSlug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <Link href="/" className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/bank-interest-rates"
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  Bank Interest Rates
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">{type.label}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <span className="text-4xl">{type.emoji}</span>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                {type.label} <span className="gradient-text">interest rates</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Published starting rates, processing fees and maximum tenures for{" "}
                {type.label.toLowerCase()}s across Indian lenders. Sort by rate, filter by lender
                type, then take any row straight into the calculator.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={`/${type.slug}`}>Calculate {type.label} EMI</ButtonLink>
                <ButtonLink href="/compare-loans" variant="secondary">
                  Compare lenders
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5">
          <CoverageNotice coverage={coverage} />
        </div>
        <RatesTable rates={rates} />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="mb-4 font-display text-xl font-bold text-[var(--text)]">
          Rates for other loan types
        </h2>
        <div className="flex flex-wrap gap-2">
          {LOAN_TYPES.filter((t) => t.id !== type.id).map((t) => (
            <Link
              key={t.id}
              href={`/bank-interest-rates/${t.rateSlug}`}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
            >
              <span>{t.emoji}</span>
              {t.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
