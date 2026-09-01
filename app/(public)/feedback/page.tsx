import Link from "next/link";

import { FeedbackForm } from "@/components/feedback/feedback-form";
import { SocialLinks } from "@/components/layout/social-icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Send Feedback",
  description:
    "Found a bug, spotted a figure that looks wrong, or want a feature added to the EMI calculator? Tell us — every message is read.",
  path: "/feedback",
  keywords: ["loan calculator feedback", "report a bug", "suggest a feature", "contact Loan Calculator Pro"],
});

const REASONS = [
  {
    icon: "🐞",
    title: "Something is broken",
    body: "A button that does nothing, a chart that will not draw, a layout that breaks on your phone. Tell us the device and browser if you can.",
  },
  {
    icon: "🔢",
    title: "A number looks wrong",
    body: "Include the loan amount, rate, tenure and any part-payment you entered, so the calculation can be reproduced exactly.",
  },
  {
    icon: "💡",
    title: "Something is missing",
    body: "Moratorium periods, step-up EMIs, a balance-transfer calculator — feature requests genuinely shape what gets built next.",
  },
  {
    icon: "🏦",
    title: "A rate is out of date",
    body: "Interest rates move constantly. If a lender's published rate has changed, send the link and it will be updated.",
  },
];

export default function FeedbackPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Feedback", path: "/feedback" },
        ])}
      />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <Link href="/" className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">Feedback</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                Tell us what would make this <span className="gradient-text">more useful</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                This calculator is shaped by what people actually ask for. Bug reports, corrections
                and feature requests all land in the same inbox, and all of them get read.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <FeedbackForm />
          </div>

          <aside className="flex flex-col gap-5">
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-[var(--text)]">
                What to include
              </h2>
              <ul className="mt-3 flex flex-col gap-4">
                {REASONS.map((r) => (
                  <li key={r.title} className="flex gap-3">
                    <span className="text-lg leading-none">{r.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{r.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                        {r.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-[var(--text)]">
                Prefer email or social?
              </h2>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-2 block text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
              >
                {SITE.email}
              </a>
              <div className="mt-4">
                <SocialLinks size="sm" />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                <strong className="text-[var(--text-secondary)]">Please note:</strong> we are not a
                lender or a broker, and we cannot help with a loan application, an existing account,
                or a dispute with your bank. For those, contact the lender directly.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
