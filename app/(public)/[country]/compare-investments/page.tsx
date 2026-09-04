import Link from "next/link";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { InvestmentComparison } from "@/components/investment/investment-comparison";
import { FaqSection } from "@/components/sections/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { getSchemeRates } from "@/lib/queries";
import { INVESTMENT_KEYWORDS, schemesFor } from "@/lib/schemes";
import { countryHref, resolveCountry } from "@/lib/countries";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);

  return pageMetadata({
    title: "Compare Investments — SIP vs PPF vs FD vs RD Side by Side",
    description:
      "Put SIP, PPF, Sukanya Samriddhi, FD, RD and lumpsum side by side on the same contribution and period. Maturity value, absolute return and XIRR shown alongside risk, lock-in and tax treatment — so you can judge, rather than be told.",
    path: countryHref(country, "/compare-investments"),
    keywords: [
      "compare investments India",
      "SIP vs FD",
      "PPF vs SIP",
      "SIP vs PPF vs FD",
      "FD vs RD comparison",
      "best investment option India comparison",
      "where to invest my money India",
      "guaranteed vs market linked returns",
      ...INVESTMENT_KEYWORDS,
    ],
    country,
    countryPath: "/compare-investments",
  });
}

export const revalidate = 3600;

const COMPARE_FAQS = [
  {
    question: "Which of these gives the best return?",
    answer:
      "On almost any long horizon, a market-linked projection at a 12% assumption will show the largest number — but that is a consequence of the assumption you entered, not evidence of a better product. PPF and FD pay what they promise; equity may deliver more, less, or a loss, and it can do so precisely when you need the money. The tool deliberately does not name a winner, because the comparison depends on when you need the funds, whether you can tolerate a fall in value, and your tax position — none of which a calculator knows.",
  },
  {
    question: "Why is my PPF contribution capped in the comparison?",
    answer:
      "PPF and Sukanya Samriddhi both carry a statutory ceiling of ₹1.5 lakh a year. If your chosen monthly amount would exceed that, the calculator caps it — and that constraint is part of the honest comparison. A scheme you cannot put enough money into is not directly comparable with one that has no ceiling, however attractive its rate.",
  },
  {
    question: "What is the difference between absolute return and XIRR?",
    answer:
      "Absolute return is the total gain as a percentage of what you put in — simple, but it ignores time entirely, so 100% over three years and 100% over thirty look identical. XIRR is the annualised, money-weighted rate that accounts for each contribution being invested for a different length of time. For staggered contributions like a SIP or RD, XIRR is the meaningful figure. For a single lump sum held throughout, CAGR and XIRR are the same thing.",
  },
  {
    question: "Do these projections account for tax and charges?",
    answer:
      "No. The maturity values are pre-tax and before costs. That matters a great deal to the comparison: PPF and Sukanya Samriddhi are EEE, so the maturity amount is tax-free, whereas FD and RD interest is taxed at your slab rate — a 7% FD returns roughly 4.9% after tax in the 30% bracket. Mutual funds also carry expense ratios and capital gains tax. The tax column in the table states each position; the arithmetic does not apply it.",
  },
  {
    question: "Is inflation taken into account?",
    answer:
      "Not in the main figures, but there is an 'in today's money' section that discounts each maturity value at 6% a year. It is worth looking at: a balance that grows fivefold over twenty years has not increased your purchasing power fivefold, and a return below inflation loses you money in real terms even as the balance rises.",
  },
];

export default async function CompareInvestmentsPage({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);
  const href = (path: string) => countryHref(country, path);

  let storedRates: Record<string, number | null> = {};
  try {
    const rates = await getSchemeRates();
    storedRates = Object.fromEntries(rates.map((r) => [r.scheme_id, r.rate]));
  } catch {
    // Falls back to each scheme's default rate.
  }

  return (
    <>
      <JsonLd
        data={[
          faqSchema(COMPARE_FAQS),
          breadcrumbSchema([
            { name: "Home", path: countryHref(country) },
            { name: "Investment Calculators", path: countryHref(country, "/investment-calculators") },
            { name: "Compare Investments", path: countryHref(country, "/compare-investments") },
          ]),
        ]}
      />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <Link href={href("/")} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={href("/investment-calculators")}
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  Investment Calculators
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">Compare</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                Compare investments <span className="gradient-text">honestly</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                The same contribution, over the same period, across SIP, PPF, Sukanya Samriddhi, FD,
                RD and a lumpsum. Maturity value and returns sit next to risk, lock-in and tax
                treatment — because a bigger number attached to more risk is not automatically the
                better answer, and we will not pretend otherwise by declaring a winner.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <InvestmentComparison storedRates={storedRates} />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FaqSection
          faqs={COMPARE_FAQS}
          eyebrow="Comparing investments"
          title="How to read this comparison"
          description="The questions worth asking before you act on any of these numbers."
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="mb-4 font-display text-xl font-bold text-[var(--text)]">
          Work through one in detail
        </h2>
        <div className="flex flex-wrap gap-2">
          {schemesFor(country.code).map((s) => (
            <Link
              key={s.id}
              href={href(`/${s.slug}`)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
            >
              <span>{s.emoji}</span>
              {s.shortName}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
