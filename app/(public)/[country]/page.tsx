import Link from "next/link";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { PostCard } from "@/components/blog/post-card";
import { LoanCalculator } from "@/components/calculator/loan-calculator";
import { FaqSection } from "@/components/sections/faq-section";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { LoanTypeGrid } from "@/components/sections/loan-type-grid";
import { SchemeGrid } from "@/components/sections/scheme-grid";
import { SectionHeading } from "@/components/sections/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { GENERAL_FAQS } from "@/lib/faqs";
import { getPublishedPosts } from "@/lib/queries";
import { INVESTMENT_KEYWORDS, schemesFor } from "@/lib/schemes";
import {
  breadcrumbSchema,
  calculatorListSchema,
  faqSchema,
  pageMetadata,
  siteNavigationSchema,
  softwareApplicationSchema,
} from "@/lib/seo";
import { countryHref, resolveCountry } from "@/lib/countries";
import { instalmentWords } from "@/lib/naming";
import { CORE_KEYWORDS, INTENT_KEYWORDS, loanTypesFor } from "@/lib/site";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);
  const words = instalmentWords(country.code);

  return pageMetadata({
    title: `Loan ${words.title} & Investment Calculators — ${loanTypesFor(country.code)
      .slice(0, 2)
      .map((t) => t.label)
      .join(", ")}, ${schemesFor(country.code)[0]?.shortName ?? "SIP"}`,
    description:
      `Free calculators for both sides of your money. ${loanTypesFor(country.code).map((t) => t.label).join(", ")} payments with part-payment savings and lender comparison — plus ${schemesFor(country.code).map((s) => s.shortName).join(", ")} with CAGR, XIRR and absolute return.`,
    path: countryHref(country),
    keywords: [...CORE_KEYWORDS, ...INTENT_KEYWORDS, ...INVESTMENT_KEYWORDS],
    country,
    countryPath: "/",
  });
}

// The calculator itself is static; only the blog strip needs fresh data.
export const revalidate = 3600;

const TRUST_POINTS = [
  { icon: "🔒", label: "Runs in your browser", detail: "No data sent anywhere" },
  { icon: "🌍", label: "Local currency", detail: "Formatted the way your country writes it" },
  { icon: "⚡", label: "Instant results", detail: "No sign-up, no email" },
  { icon: "📊", label: "Full schedule", detail: "Every instalment, exportable" },
];

export default async function HomePage({ params }: Props) {
  const { country: code } = await params;
  const country = resolveCountry(code);
  const href = (path: string) => countryHref(country, path);
  const inIndia = country.code === "in";
  const words = instalmentWords(country.code);

  let posts = [] as Awaited<ReturnType<typeof getPublishedPosts>>;
  try {
    posts = await getPublishedPosts(3, 0, country.code);
  } catch {
    // The homepage must render even if the database is unreachable.
  }

  return (
    <>
      <JsonLd
        data={[
          softwareApplicationSchema(),
          calculatorListSchema(country.code),
          siteNavigationSchema(country.code),
          faqSchema(GENERAL_FAQS),
          breadcrumbSchema([{ name: "Home", path: countryHref(country) }]),
        ]}
      />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="absolute inset-0 grid-pattern" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl">
                Know exactly what your <span className="gradient-text">loan really costs</span>
              </h1>
            </Reveal>

            <Reveal delay={80}>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Calculate your {words.sentence}, then find out what a part-payment actually saves you — in
                rupees and in years. Compare lenders on total cost rather than headline rate, and
                take away a full month-by-month schedule. Then do the same for the money you are
                saving, with{" "}
                <Link
                  href={href("/investment-calculators")}
                  className="font-semibold text-brand-600 underline decoration-brand-400/40 underline-offset-4 transition-colors hover:text-brand-500 dark:text-brand-300"
                >
                  SIP, PPF, FD and six more calculators
                </Link>
                .
              </p>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href="#calculator" size="lg">
                  Start calculating
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 4v12m0 0-5-5m5 5 5-5" />
                  </svg>
                </ButtonLink>
                <ButtonLink href={href("/investment-calculators")} size="lg" variant="secondary">
                  Investment calculators
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                {TRUST_POINTS.map((t) => (
                  <li
                    key={t.label}
                    className="card flex flex-col items-center gap-1 px-3 py-3.5 text-center"
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-[0.8125rem] font-bold text-[var(--text)]">{t.label}</span>
                    <span className="text-[0.7rem] text-[var(--text-muted)]">{t.detail}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Calculator ---------------- */}
      <section id="calculator" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8">
        <LoanCalculator loanType="home" />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdLeaderboard />
      </div>

      {/* ---------------- Why this calculator ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Loan Calculator Pro"
          title="Built for the questions other calculators ignore"
          description="Most loan calculators stop at the monthly instalment. The decisions that actually save money — when to prepay, what the bank should do with it, and which lender is genuinely cheaper — need more than that."
        />
        <div className="mt-10">
          <FeatureGrid />
        </div>
      </section>

      {/* ---------------- Loan types ---------------- */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Loan calculators"
            title="A calculator tuned to your loan"
            description="Each one starts with sensible defaults for that product — realistic amounts, rate bands and maximum tenures — so you are not fighting the sliders before you begin."
          />
          <div className="mt-10">
            <LoanTypeGrid country={country} />
          </div>
        </div>
      </section>

      {/* ---------------- Investment calculators ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Investment calculators"
          title="And eight more for the money you are putting away"
          description="SIP, lumpsum, FD, RD, PPF, Sukanya Samriddhi, NPS and EPF — each showing maturity value, what you actually contributed, absolute return, CAGR and XIRR, with risk, lock-in and tax treatment stated on the same screen."
        />
        <div className="mt-10">
          <SchemeGrid country={country} />
        </div>

        <Reveal delay={120}>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-6 sm:flex-row sm:text-left">
            <div>
              <h3 className="font-display text-lg font-bold text-[var(--text)]">
                Not sure which one suits your horizon?
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                Put the same amount and the same number of years through every scheme at once and
                read them side by side — including the risk you are taking and the lock-in you are
                accepting. We do not name a winner; that depends on facts only you know.
              </p>
            </div>
            <ButtonLink href={href("/compare-investments")} variant="outline" className="shrink-0">
              Compare investments
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ---------------- How the instalment works ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="The maths"
              title={`How your ${words.sentence} is actually calculated`}
              description="Lenders use the reducing-balance method. Interest each month is charged only on what you still owe, so the interest share of every instalment falls as the balance drops."
            />

            <Reveal delay={100}>
              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
                <p className="text-center font-mono text-base font-semibold text-[var(--text)] sm:text-lg">
                  {words.abbr} = P × r × (1+r)<sup>n</sup> ÷ ((1+r)<sup>n</sup> − 1)
                </p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  {[
                    ["P", "Principal borrowed"],
                    ["r", "Monthly rate (annual ÷ 12 ÷ 100)"],
                    ["n", "Number of instalments"],
                  ].map(([sym, meaning]) => (
                    <div key={sym} className="flex items-start gap-2">
                      <dt className="font-mono font-bold text-brand-600 dark:text-brand-300">{sym}</dt>
                      <dd className="text-[var(--text-secondary)]">{meaning}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
                The consequence is the part most borrowers miss: on a 20-year loan at 8.5%,{" "}
                <strong className="text-[var(--text)]">81% of your first year&rsquo;s payments</strong>{" "}
                are interest, and principal does not overtake interest within a single instalment until
                month 143. That is why a lump sum in year two is worth roughly three and a half
                times the same amount in year twelve — and why the year-by-year chart above is worth
                a look before you decide when to prepay.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="card overflow-hidden">
              <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)] px-5 py-3">
                <p className="font-display text-sm font-bold text-[var(--text)]">
                  {inIndia
                    ? "Where a ₹50,00,000 home loan at 8.5% for 20 years goes"
                    : "Where a 20-year home loan at 8.5% goes"}
                </p>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {(inIndia
                  ? [
                      { label: "You borrow", value: "₹50,00,000", tone: "text-[var(--color-principal)]" },
                      { label: "You repay in interest", value: "₹54,13,879", tone: "text-[var(--color-interest)]" },
                      { label: `Monthly ${words.abbr}`, value: "₹43,391", tone: "text-[var(--text)]" },
                      { label: "Total repayment", value: "₹1,04,13,879", tone: "text-[var(--text)]" },
                    ]
                  : [
                      { label: "Interest as a share of what you repay", value: "52%", tone: "text-[var(--color-interest)]" },
                      { label: "Interest in your first year's payments", value: "81%", tone: "text-[var(--color-interest)]" },
                      { label: "Principal overtakes interest at", value: "month 143", tone: "text-[var(--text)]" },
                      { label: "Total repaid, as a multiple of the loan", value: "2.08×", tone: "text-[var(--text)]" },
                    ]
                ).map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                    <span className={`font-display text-base font-bold tnum ${row.tone}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-accent-50 px-5 py-4 dark:bg-accent-950/30">
                <p className="text-sm text-accent-900 dark:text-accent-200">
                  {inIndia ? (
                    <>
                      Add a single <strong>₹5,00,000</strong> part-payment in month 24 and cut the
                      tenure: you finish <strong>3 years 9 months early</strong> and avoid{" "}
                      <strong>₹14,57,301</strong> in interest.
                    </>
                  ) : (
                    <>
                      Put a lump sum of a tenth of the loan in at month 24 and cut the tenure: you
                      finish <strong>3 years 9 months early</strong> and cut the interest bill by{" "}
                      <strong>about 27%</strong>.
                    </>
                  )}
                </p>
                <p className="mt-2 text-xs text-accent-800/80 dark:text-accent-300/80">
                  Figures produced by this calculator on the inputs shown — change them above to
                  model your own loan.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Rates + compare CTA ---------------- */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="card card-lift relative h-full overflow-hidden p-6 sm:p-8">
                <span
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-brand-500/25 to-brand-500/0 blur-2xl"
                />
                <span className="text-3xl">🏦</span>
                <h3 className="mt-3 font-display text-xl font-bold text-[var(--text)] sm:text-2xl">
                  Bank interest rates, all in one table
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
                  Current rate bands, processing fees and maximum tenures across public banks,
                  private banks, housing finance companies and NBFCs — each row dated and linked to
                  the lender&rsquo;s own published page, so you can verify before you act.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {loanTypesFor(country.code).slice(0, 4).map((t) => (
                    <Link
                      key={t.id}
                      href={href(`/bank-interest-rates/${t.rateSlug}`)}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      {t.label} rates
                    </Link>
                  ))}
                </div>
                <div className="mt-6">
                  <ButtonLink href={href("/bank-interest-rates")} variant="outline">
                    See all lenders
                  </ButtonLink>
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="card card-lift relative h-full overflow-hidden p-6 sm:p-8">
                <span
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-accent-500/25 to-accent-500/0 blur-2xl"
                />
                <span className="text-3xl">⚖️</span>
                <h3 className="mt-3 font-display text-xl font-bold text-[var(--text)] sm:text-2xl">
                  Compare four lenders at once
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
                  Enter each offer with its own amount, rate, tenure, processing fee and prepayment
                  plan. The comparison ranks them by total money out of your pocket and shows
                  exactly how much extra the runner-up costs you.
                </p>
                <ul className="mt-5 flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
                  {[
                    "Ranked by total cost, not headline rate",
                    "Processing fee and GST included in the ranking",
                    `Side-by-side ${words.sentence}, interest and payoff date`,
                    "Export the whole comparison to CSV",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m4 10.5 4 4 8-9" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <ButtonLink href={href("/compare-loans")} variant="outline">
                    Open the comparison tool
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Blog ---------------- */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              align="left"
              eyebrow="Guides"
              title="Borrowing and investing, explained plainly"
              description="Practical writing on prepayment, refinancing, reading a loan agreement, and choosing between SIP, PPF and fixed deposits — no jargon, no product pitches."
            />
            <ButtonLink href="/blog" variant="ghost" className="shrink-0">
              All guides →
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} delay={i * 70} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- FAQ ---------------- */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <FaqSection
            faqs={GENERAL_FAQS}
            description={`The questions we get asked most about ${words.sentence}s, part-payments and comparing lenders.`}
          />
        </div>
      </section>

      {/* ---------------- Feedback CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-12 text-center text-white sm:px-12">
            <span
              aria-hidden="true"
              className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl"
            />
            <h2 className="relative font-display text-2xl font-extrabold sm:text-3xl">
              Something missing, or a number that looks wrong?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/85">
              This calculator is built from what people actually ask for. Tell us what would make it
              more useful — every message is read.
            </p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink
                href="/feedback"
                size="lg"
                className="bg-white text-brand-700 shadow-lg hover:bg-white/90 hover:text-brand-800"
              >
                Send feedback
              </ButtonLink>
              <ButtonLink
                href="/blog"
                size="lg"
                variant="ghost"
                className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Read the guides
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
