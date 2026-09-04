import Link from "next/link";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { CoverageNotice } from "@/components/rates/coverage-notice";
import { LenderDirectory, type DirectoryRow } from "@/components/rates/lender-directory";
import { SectionHeading } from "@/components/sections/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { getLenderDirectory, getRateCoverage, type RateCoverage } from "@/lib/queries";
import { countryHref, resolveCountry } from "@/lib/countries";
import { breadcrumbSchema, pageMetadata, rateTableSchema } from "@/lib/seo";
import { HEADLINE_LENDERS, LOAN_TYPES, RATE_KEYWORDS, type LoanTypeId } from "@/lib/site";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);

  return pageMetadata({
    title: "Bank Interest Rates in India — All Loan Types Compared",
    description:
      "Current interest rates, processing fees and maximum tenures for home, car, personal, business, education and gold loans across Indian public banks, private banks, housing finance companies and NBFCs. Every rate dated and linked to the lender's own published page.",
    path: countryHref(country, "/bank-interest-rates"),
    keywords: [
      "bank interest rates India",
      "latest home loan interest rates",
      "lowest interest rate bank India",
      "personal loan interest rates comparison",
      "car loan interest rates all banks",
      "SBI HDFC ICICI loan interest rate",
      "current loan rates India",
      "bank loan processing fees comparison",
      "NBFC interest rates India",
      "housing finance company rates",
      // Bank-name intent: "SBI interest rate", "current HDFC Bank rate", …
      ...HEADLINE_LENDERS.flatMap((b) => [
        `${b} interest rate`,
        `current ${b} interest rate`,
      ]),
      ...RATE_KEYWORDS,
    ],
    country,
    countryPath: "/bank-interest-rates",
  });
}

// Rates change often, so the page is rebuilt hourly.
export const revalidate = 3600;

export default async function BankRatesPage({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);
  const href = (path: string) => countryHref(country, path);

  let lenders: DirectoryRow[] = [];
  let coverage: RateCoverage = {
    total: 0,
    verified: 0,
    missing: 0,
    lenders: 0,
    lastUpdated: null,
  };

  try {
    const [directory, cov] = await Promise.all([getLenderDirectory(), getRateCoverage()]);
    coverage = cov;
    lenders = directory.map((b) => ({
      id: b.id,
      name: b.name,
      short_name: b.short_name,
      category: b.category,
      accent: b.accent,
      publishedTypes: (b.published_types ?? "")
        .split(",")
        .filter(Boolean) as LoanTypeId[],
    }));
  } catch {
    // Render the page shell even if the database is unreachable.
  }

  return (
    <>
      <JsonLd
        data={[
          rateTableSchema("Loan", lenders.length, "/bank-interest-rates"),
          breadcrumbSchema([
            { name: "Home", path: countryHref(country) },
            { name: "Bank Interest Rates", path: countryHref(country, "/bank-interest-rates") },
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
              <li className="text-[var(--text-secondary)]">Bank Interest Rates</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                Bank <span className="gradient-text">interest rates</span> in India
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Every major Indian lender in one place — public banks, private banks, housing
                finance companies, NBFCs and small finance banks. Pick a loan type below for the
                full rate comparison, where each figure is dated and linked to the lender&rsquo;s own
                published page so you can check it before acting.
              </p>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <div className="mt-7 flex flex-wrap gap-2">
              {LOAN_TYPES.map((t) => (
                <Link
                  key={t.id}
                  href={href(`/bank-interest-rates/${t.rateSlug}`)}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
                >
                  <span>{t.emoji}</span>
                  {t.label} rates
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5">
          <CoverageNotice coverage={coverage} country={country} />
        </div>
        <LenderDirectory rows={lenders} />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="How to read this"
          title="What these numbers do and do not tell you"
        />
        <div className="prose-lcp mt-6">
          <p>
            The figures here are <strong>published starting rates</strong> — the lowest rate a
            lender advertises, usually reserved for borrowers with an excellent credit score, stable
            salaried income and a conservative loan-to-value ratio. The rate you are personally
            offered is frequently higher, and is only fixed when you have a sanction letter in hand.
          </p>
          <h2>Floating rates move</h2>
          <p>
            Most Indian home loans are linked to an external benchmark — commonly the RBI repo rate
            — so your EMI or tenure changes when that benchmark changes. A rate captured today is a
            snapshot, not a commitment. Check the effective date on each row, and confirm on the
            lender&rsquo;s site.
          </p>
          <h2>The rate is not the whole price</h2>
          <p>
            Processing fees, documentation charges, legal and valuation fees, mandatory insurance
            and prepayment penalties all add to what you pay. A lender 0.10% cheaper on rate can be
            meaningfully more expensive once a 1% processing fee is applied to a large principal.
            The{" "}
            <Link href={href("/compare-loans")}>comparison tool</Link> ranks offers on total outflow for
            exactly this reason.
          </p>
          <h2>Verify before you act</h2>
          <p>
            Every published row links to the lender&rsquo;s own rate page. We are not a lender or a
            broker, we receive no commission for any listing here, and nothing on this page is a
            recommendation to borrow from any particular institution.
          </p>
        </div>
      </section>
    </>
  );
}
