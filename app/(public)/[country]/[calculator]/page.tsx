import Link from "next/link";
import { notFound } from "next/navigation";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { LoanCalculator } from "@/components/calculator/loan-calculator";
import { FaqSection } from "@/components/sections/faq-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { faqsFor } from "@/lib/faqs";
import { createFormatters } from "@/lib/format";
import {
  breadcrumbSchema,
  faqSchema,
  pageMetadata,
  softwareApplicationSchema,
} from "@/lib/seo";
import { NotAvailableHere } from "@/components/country/not-available";
import { SchemePage } from "@/components/investment/scheme-page";
import { getSchemeRate } from "@/lib/queries";
import { INVESTMENT_KEYWORDS, schemesFor, schemeBySlug } from "@/lib/schemes";
import { countryHref, resolveCountry } from "@/lib/countries";
import { instalmentWords, loanCalculatorTitle, usesEmi } from "@/lib/naming";
import { loanTypesFor, localiseLoanType, loanTypeAvailable, loanTypeBySlug } from "@/lib/site";

/**
 * Every calculator landing page, served from the site root — so
 * /home-loan-emi-calculator and /sip-calculator rather than nested paths,
 * because a top-level keyword-exact URL is the strongest signal available for
 * these high-competition terms.
 *
 * One dynamic segment serves both families: Next.js gives static routes
 * priority over a dynamic one, so /blog and /admin are unaffected.
 *
 * `dynamicParams` stays on because this route now has two dynamic segments.
 * Turning it off would restrict the *country* to the prerendered set as well,
 * which 404s every market outside the curated seven. An unknown calculator slug
 * is still rejected — explicitly, by the notFound() below — and an unknown
 * country by the layout above.
 */
export const dynamicParams = true;

/**
 * Country-aware for the same reason as the rates route: a combination that
 * 404s must not be prerendered, or it is served as not-found content under a
 * 200 status.
 */
export function generateStaticParams({ params }: { params: { country: string } }) {
  return [
    ...loanTypesFor(params.country).map((t) => ({ calculator: t.slug })),
    ...schemesFor(params.country).map((s) => ({ calculator: s.slug })),
  ];
}

type Props = { params: Promise<{ country: string; calculator: string }> };

export async function generateMetadata({ params }: Props) {
  const { country: code, calculator } = await params;
  const country = resolveCountry(code);

  const scheme = schemeBySlug(calculator);

  if (scheme?.indiaOnly && country.code !== "in") {
    return pageMetadata({
      title: `${scheme.shortName} is not available in ${country.name}`,
      description: `${scheme.name} is an Indian government scheme. See the calculators available in ${country.name} instead.`,
      path: countryHref(country, `/${scheme.slug}`),
      noIndex: true,
    });
  }

  if (scheme) {
    // CAGR is only meaningful for a single sum held throughout; anything with
    // staggered contributions reports XIRR, so the title must not promise CAGR.
    const metric = scheme.id === "lumpsum" || scheme.id === "fd" ? "CAGR" : "XIRR";
    return pageMetadata({
      title: `${scheme.name} — Returns, Maturity Value & ${scheme.rateIsStatutory ? "Current Rate" : metric}`,
      description: `${scheme.blurb} See maturity value, absolute return and ${metric}, with risk, lock-in and taxation stated alongside the number.`,
      path: countryHref(country, `/${scheme.slug}`),
      country,
      countryPath: `/${scheme.slug}`,
      keywords: [...scheme.keywords, ...INVESTMENT_KEYWORDS],
    });
  }

  const raw = loanTypeBySlug(calculator);
  if (!raw) return {};
  const type = localiseLoanType(country.code, raw);
  const words = instalmentWords(country.code);

  // Returning {} here would inherit the root layout's metadata, which says
  // index — so the "not offered here" page was inviting itself into search.
  if (!loanTypeAvailable(country.code, type)) {
    return pageMetadata({
      title: `${type.label}s are not offered in ${country.name}`,
      description: `${type.label}s are not a retail product in ${country.name}. See the calculators available there instead.`,
      path: countryHref(country, `/${type.slug}`),
      noIndex: true,
    });
  }

  return pageMetadata({
    title: `${loanCalculatorTitle(country.code, type.label)} — Part Payment & Interest Savings`,
    description: `Calculate your ${type.label.toLowerCase()} ${words.sentence} with the reducing-balance method, model one-off and recurring part-payments, compare cutting the term against cutting the ${words.sentence}, and download a full month-by-month amortisation schedule. Free and private.`,
    path: countryHref(country, `/${type.slug}`),
    country,
    countryPath: `/${type.slug}`,
    keywords: type.keywords,
  });
}

export default async function CalculatorPage({ params }: Props) {
  const { country: code, calculator } = await params;
  const country = resolveCountry(code);
  const href = (path: string) => countryHref(country, path);
  // Page-level figures need the country's formatter too — importing the
  // India-bound helper here is what put "₹1.0 L – ₹10.0 Cr" on every market's
  // amount-range line while the calculator beside it showed dollars.
  const { compact: formatCompact } = createFormatters(country);

  const scheme = schemeBySlug(calculator);

  // PPF, Sukanya Samriddhi, NPS and EPF are Indian statutory schemes with no
  // equivalent elsewhere. Rather than a calculator governed by rules that do
  // not apply to the reader, or a bare 404, this explains the gap — it is
  // reached most often by switching country while reading one of them.
  if (scheme?.indiaOnly && country.code !== "in") {
    return (
      <NotAvailableHere
        country={country}
        title={`${scheme.shortName} is an Indian scheme`}
        reason={`${scheme.name.replace(" Calculator", "")} is created by Indian law and is only open to residents there, so there is nothing meaningful to calculate for ${country.name}. Its closest counterparts elsewhere are different products with their own limits and tax treatment.`}
      />
    );
  }

  if (scheme) {
    const rate = await getSchemeRate(country.code, scheme.id).catch(() => null);
    return (
      <>
        <JsonLd
          data={[
            softwareApplicationSchema(),
            breadcrumbSchema([
              { name: "Home", path: countryHref(country) },
              { name: "Investment Calculators", path: countryHref(country, "/investment-calculators") },
              { name: scheme.name, path: countryHref(country, `/${scheme.slug}`) },
            ]),
          ]}
        />
        <SchemePage scheme={scheme} rate={rate} country={country} />
      </>
    );
  }

  const raw = loanTypeBySlug(calculator);
  if (!raw) notFound();
  const type = localiseLoanType(country.code, raw);
  const words = instalmentWords(country.code);

  if (!loanTypeAvailable(country.code, type)) {
    return (
      <NotAvailableHere
        country={country}
        title={`${type.label}s are not offered in ${country.name}`}
        reason={`A loan against gold jewellery is a mainstream retail product in India and the Gulf, and is not something high-street lenders in ${country.name} offer. Rather than show a calculator for a loan you cannot take out there, here is what is available.`}
      />
    );
  }

  const faqs = faqsFor(type.id);
  // Only products this market actually offers — the others 404.
  const others = loanTypesFor(country.code).filter((t) => t.id !== type.id);

  return (
    <>
      <JsonLd
        data={[
          softwareApplicationSchema(),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: countryHref(country) },
            { name: loanCalculatorTitle(country.code, type.label), path: countryHref(country, `/${type.slug}`) },
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
              <li className="text-[var(--text-secondary)]">
                {loanCalculatorTitle(country.code, type.label)}
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-4xl">{type.emoji}</span>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                {type.label} <span className="gradient-text">{usesEmi(country.code) ? "EMI Calculator" : "Calculator"}</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                {type.blurb}
              </p>
            </Reveal>
            <Reveal delay={150}>
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                {[
                  ["Amount range", `${formatCompact(type.ranges.amount[0])} – ${formatCompact(type.ranges.amount[1])}`],
                  ["Tenure", `up to ${type.ranges.tenure[1]} years`],
                  ["Method", "Reducing balance"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {label}
                    </dt>
                    <dd className="font-display text-sm font-bold text-[var(--text)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LoanCalculator loanType={type.id} showTypeSelector={false} />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal>
              <div className="card h-full p-5">
                <h2 className="font-display text-base font-bold text-[var(--text)]">
                  Check the going rate first
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Before you settle on a rate in the calculator, see what lenders are actually
                  publishing for {type.label.toLowerCase()}s right now.
                </p>
                <ButtonLink
                  href={href(`/bank-interest-rates/${type.rateSlug}`)}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  {type.label} rates
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="card h-full p-5">
                <h2 className="font-display text-base font-bold text-[var(--text)]">
                  Weighing up two offers?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Put both in the comparison tool. It ranks by total money out of pocket, so a low
                  rate hiding a large processing fee has nowhere to hide.
                </p>
                <ButtonLink href={href("/compare-loans")} variant="outline" size="sm" className="mt-4">
                  Compare lenders
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="card h-full p-5">
                <h2 className="font-display text-base font-bold text-[var(--text)]">
                  Other calculators
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {others.map((t) => (
                    <Link
                      key={t.id}
                      href={`/${t.slug}`}
                      className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      {t.emoji} {t.shortLabel}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FaqSection
          faqs={faqs}
          eyebrow={type.label}
          title={`${type.label} questions, answered`}
          description={`What people ask most about ${type.label.toLowerCase()}s, prepayment and total cost.`}
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          title="A note on accuracy"
          description={`${country.code === "in" ? "This calculator applies the standard reducing-balance formula that Indian lenders use, and includes processing fee and GST in the total cost." : "This calculator applies the standard reducing-balance formula, and includes any processing fee you enter in the total cost."} It does not model late-payment penalties, insurance bundled into the loan, foreclosure charges, or any moratorium period. Your lender's offer letter is the authoritative statement of your ${words.sentence} and charges — treat these figures as a well-informed estimate for planning, not a quotation.`}
        />
      </section>
    </>
  );
}
