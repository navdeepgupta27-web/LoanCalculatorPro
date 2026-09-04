import Link from "next/link";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { SectionHeading } from "@/components/sections/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { createFormatters } from "@/lib/format";
import { getSchemeRates, type SchemeRate } from "@/lib/queries";
import { RISK_LABEL, schemesFor, INVESTMENT_KEYWORDS, STATUTORY_SCHEMES } from "@/lib/schemes";
import { countryHref, resolveCountry } from "@/lib/countries";
import { breadcrumbSchema, itemListSchema, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);

  return pageMetadata({
    title: "Investment & Savings Calculators — SIP, PPF, FD, NPS & More",
    description:
      "Free calculators for SIP, lumpsum, FD, RD, PPF, Sukanya Samriddhi, NPS and EPF. See maturity value, absolute return, CAGR and XIRR — with risk, lock-in and tax treatment shown alongside every projection.",
    path: countryHref(country, "/investment-calculators"),
    keywords: [
      ...INVESTMENT_KEYWORDS,
      ...schemesFor(country.code).flatMap((s) => s.keywords.slice(0, 3)),
    ],
    country,
    countryPath: "/investment-calculators",
  });
}

export const revalidate = 3600;

const RISK_TONE = {
  none: "accent",
  low: "sky",
  moderate: "amber",
  high: "rose",
} as const;

export default async function InvestmentCalculatorsPage({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);
  const href = (path: string) => countryHref(country, path);
  const { date: formatDate } = createFormatters(country);

  let rates: SchemeRate[] = [];
  try {
    rates = await getSchemeRates(country.code);
  } catch {
    // The hub renders fine without stored rates.
  }
  const rateFor = (id: string) => rates.find((r) => r.scheme_id === id) ?? null;

  // PPF, Sukanya Samriddhi and EPF are rates set by the Indian government.
  // There is no equivalent table to show anywhere else, so the section is
  // empty outside India rather than presenting Indian rates as universal.
  const statutorySchemes = country.code === "in" ? STATUTORY_SCHEMES : [];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: countryHref(country) },
            { name: "Investment Calculators", path: countryHref(country, "/investment-calculators") },
          ]),
          itemListSchema(
            "Investment and savings calculators",
            schemesFor(country.code).map((s) => ({ name: s.name, path: countryHref(country, `/${s.slug}`) })),
          ),
        ]}
      />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="absolute inset-0 grid-pattern" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <Link href={href("/")} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">Investment Calculators</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                Investment &amp; savings <span className="gradient-text">calculators</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Eight calculators covering market-linked and government-backed options. Each one
                reports maturity value, absolute return and a properly computed CAGR or XIRR — and
                states the risk, lock-in and tax treatment next to the number, because a projection
                without those is only half an answer.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={href("/compare-investments")}>Compare side by side</ButtonLink>
                <ButtonLink href={href("/sip-calculator")} variant="secondary">
                  Start with SIP
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schemesFor(country.code).map((s, i) => {
            const rate = rateFor(s.id);
            return (
              <Reveal key={s.id} delay={i * 55}>
                <Link
                  href={href(`/${s.slug}`)}
                  className="card card-lift group relative flex h-full flex-col overflow-hidden p-5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-[0.14] blur-2xl transition-opacity duration-500 group-hover:opacity-30",
                      s.gradient,
                    )}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                        s.gradient,
                      )}
                    >
                      {s.emoji}
                    </span>
                    <Badge tone={RISK_TONE[s.risk]}>{RISK_LABEL[s.risk]}</Badge>
                  </div>

                  <h2 className="mt-3 font-display text-base font-bold text-[var(--text)]">
                    {s.name}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {s.blurb}
                  </p>

                  <dl className="mt-4 space-y-1 border-t border-[var(--border)] pt-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--text-muted)]">
                        {s.rateIsStatutory ? "Current rate" : "Return"}
                      </dt>
                      <dd className="font-semibold text-[var(--text)]">
                        {s.rateIsStatutory
                          ? rate?.rate != null
                            ? `${rate.rate}%`
                            : "not published"
                          : "you assume it"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="shrink-0 text-[var(--text-muted)]">Lock-in</dt>
                      <dd className="truncate text-right text-[var(--text-secondary)]">
                        {s.lockIn}
                      </dd>
                    </div>
                  </dl>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      {/* ---------- Published statutory rates ---------- */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Government rates"
            title="Current small-savings and provident fund rates"
            description="Set by government and revised periodically — small-savings rates each quarter, EPF each financial year. Every figure links to the source it was taken from."
          />

          <div className="card mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <thead className="bg-[var(--bg-subtle)]">
                  <tr>
                    {["Scheme", "Rate", "Period", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statutorySchemes.map((s) => {
                    const rate = rateFor(s.id);
                    const published = rate?.rate != null;
                    const confirmed = rate?.verified === 1;
                    return (
                      <tr key={s.id} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3">
                          <Link
                            href={href(`/${s.slug}`)}
                            className="font-semibold text-[var(--text)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                          >
                            {s.emoji} {s.name.replace(" Calculator", "")}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {published ? (
                            <span className="font-display text-base font-bold text-[var(--text)] tnum">
                              {rate!.rate}%
                            </span>
                          ) : (
                            <span className="text-xs italic text-[var(--text-muted)]">
                              Not published
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {rate?.period_label ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {!published ? (
                            <span className="text-xs text-[var(--text-muted)]">—</span>
                          ) : confirmed ? (
                            <Badge tone="accent">Confirmed</Badge>
                          ) : (
                            <Badge tone="amber">Awaiting confirmation</Badge>
                          )}
                          {rate?.effective_date && (
                            <span className="ml-2 text-[0.7rem] text-[var(--text-muted)]">
                              {formatDate(rate.effective_date)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {rate?.source_url && (
                            <a
                              href={rate.source_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="rounded-lg border border-[var(--border)] px-2 py-1 text-[0.7rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
                            >
                              Source ↗
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-[var(--text-muted)]">
            A rate marked <strong>awaiting confirmation</strong> has been recorded from an official
            source but not yet re-checked by us, so it is shown as a starting figure rather than an
            authority. NPS and mutual-fund returns are not listed here at all — they are
            market-linked, with no declared rate.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-secondary)]">Not advice.</strong> These are
            calculators. We are not an investment adviser, broker or distributor, we receive no
            commission from any scheme listed, and nothing here recommends one option over another —
            a guaranteed 7% and a projected 12% are not comparable without weighing the risk,
            lock-in and tax treatment shown against each. For a decision of any size, speak to a
            SEBI-registered investment adviser.
          </p>
        </div>
      </section>
    </>
  );
}
