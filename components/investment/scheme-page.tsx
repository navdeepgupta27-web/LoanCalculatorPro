import Link from "next/link";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { InvestmentCalculator } from "@/components/investment/investment-calculator";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { Country } from "@/lib/countries";
import { createFormatters } from "@/lib/format";
import type { SchemeRate } from "@/lib/queries";
import { RISK_LABEL, SCHEMES, type SchemeConfig } from "@/lib/schemes";

const RISK_TONE = {
  none: "accent",
  low: "sky",
  moderate: "amber",
  high: "rose",
} as const;

/**
 * Shared layout for every savings/investment calculator page.
 *
 * The risk, guarantee, lock-in and taxation facts sit directly beneath the
 * calculator rather than in a footnote — a projected number without them is
 * the misleading part of most investment calculators.
 */
export function SchemePage({
  scheme,
  rate,
  country,
}: {
  scheme: SchemeConfig;
  rate: SchemeRate | null;
  country: Country;
}) {
  const { currency: formatCurrency, date: formatDate } = createFormatters(country);
  const others = SCHEMES.filter((s) => s.id !== scheme.id);
  const storedRate = rate?.rate ?? null;

  // `guarantee` and `taxation` describe Indian arrangements — DICGC cover,
  // India Post, LTCG thresholds, Section 80C. Outside India the guarantee falls
  // back to wording that holds anywhere, and tax treatment is stated as unknown
  // rather than asserted from another country's rules.
  const inIndia = country.code === "in";

  const facts = [
    { label: "Risk", value: RISK_LABEL[scheme.risk] },
    {
      label: "Guaranteed by",
      value: inIndia ? scheme.guarantee : (scheme.guaranteeUniversal ?? scheme.guarantee),
    },
    { label: "Lock-in", value: scheme.lockIn },
    { label: "Liquidity", value: scheme.liquidity },
    {
      label: "Tax treatment",
      value: inIndia
        ? scheme.taxation
        : `Depends on the rules in ${country.name}, which we have not documented yet. Check with a local adviser before relying on any after-tax figure.`,
    },
    ...(scheme.maxPerYear
      ? [{ label: "Yearly limit", value: `${formatCurrency(scheme.maxPerYear)} maximum` }]
      : []),
  ];

  return (
    <>
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
                  href="/investment-calculators"
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  Investment Calculators
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">{scheme.shortName}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <span className="text-4xl">{scheme.emoji}</span>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                {scheme.name.replace(" Calculator", "")}{" "}
                <span className="gradient-text">Calculator</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                {scheme.blurb}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge tone={RISK_TONE[scheme.risk]}>{RISK_LABEL[scheme.risk]}</Badge>
                <Badge tone={scheme.kind === "guaranteed" ? "accent" : "neutral"}>
                  {scheme.kind === "guaranteed"
                    ? "Guaranteed return"
                    : scheme.kind === "hybrid"
                      ? "Part market-linked"
                      : "Market-linked"}
                </Badge>
                <Badge>{scheme.lockIn}</Badge>
              </div>
            </Reveal>

            {scheme.rateIsStatutory && (
              <Reveal delay={180}>
                <div
                  className={
                    rate?.verified
                      ? "mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3"
                      : "mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40"
                  }
                >
                  {storedRate !== null ? (
                    <p
                      className={
                        rate?.verified
                          ? "text-sm text-[var(--text-secondary)]"
                          : "text-sm text-amber-800 dark:text-amber-300"
                      }
                    >
                      <strong
                        className={
                          rate?.verified ? "text-[var(--text)]" : "text-amber-900 dark:text-amber-200"
                        }
                      >
                        {storedRate}% p.a.
                      </strong>
                      {rate?.period_label ? ` for ${rate.period_label}` : ""}
                      {rate?.verified
                        ? " — confirmed against the official source."
                        : " — recorded from an official source but not yet confirmed by us. Treat it as a starting figure and check before relying on it."}{" "}
                      {rate?.source_url && (
                        <a
                          href={rate.source_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
                        >
                          Source
                        </a>
                      )}
                      {rate?.effective_date && (
                        <span className="text-[var(--text-muted)]">
                          {" "}
                          · recorded {formatDate(rate.effective_date)}
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      No published rate is stored for this scheme yet. Enter the current rate in the
                      calculator below.
                    </p>
                  )}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <InvestmentCalculator
          scheme={
            // The Indian tax and guarantee wording is stripped before the
            // config crosses to the client. Nothing rendered it outside India,
            // but it was travelling in the serialised payload of every
            // country's page and showing up in the HTML source.
            inIndia
              ? scheme
              : {
                  ...scheme,
                  taxation: "",
                  guarantee: scheme.guaranteeUniversal ?? scheme.guarantee,
                }
          }
          storedRate={storedRate}
          rateSourceUrl={rate?.source_url}
          ratePeriod={rate?.period_label}
          rateVerified={rate?.verified === 1}
        />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      {/* ---------- The facts a projection alone hides ---------- */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-[var(--text)] sm:text-2xl">
            What the number above does not tell you
          </h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] text-[var(--text-secondary)]">
            A maturity figure is only half the picture. These are the terms attached to it.
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="card p-4">
                <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {f.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-950/40">
            <h3 className="font-display text-base font-bold text-amber-900 dark:text-amber-200">
              Worth weighing before you commit
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {scheme.considerations.map((c) => (
                <li
                  key={c}
                  className="flex gap-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300"
                >
                  <span aria-hidden="true">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-4 font-display text-xl font-bold text-[var(--text)]">
          Other calculators
        </h2>
        <div className="flex flex-wrap gap-2">
          {others.map((s) => (
            <Link
              key={s.id}
              href={`/${s.slug}`}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
            >
              <span>{s.emoji}</span>
              {s.shortName}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/compare-investments">Compare these side by side</ButtonLink>
          <ButtonLink href="/investment-calculators" variant="secondary">
            All investment calculators
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-secondary)]">Please note:</strong> this is a
            calculator, not financial advice, and we are not an adviser, broker or distributor. The
            figures are arithmetic on the inputs you supply.{" "}
            {scheme.rateIsStatutory
              ? "Government-set rates are revised periodically, so a long projection at today's rate is illustrative rather than a forecast."
              : "The return you enter is an assumption; past performance does not predict future returns and no market investment guarantees a result."}{" "}
            Taxation depends on your own circumstances and on rules that change. For a decision of
            any size, speak to a SEBI-registered investment adviser or a qualified chartered
            accountant.
          </p>
        </div>
      </section>
    </>
  );
}
