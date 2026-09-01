import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { LOAN_TYPES } from "@/lib/site";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const SUGGESTIONS = [
  { label: "EMI Calculator", href: "/" },
  { label: "Compare Bank Loans", href: "/compare-loans" },
  { label: "Bank Interest Rates", href: "/bank-interest-rates" },
  { label: "Loan Guides", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <div className="mesh-bg" aria-hidden="true" />

      <div className="relative w-full max-w-lg">
        <Logo className="justify-center" />

        <p className="mt-10 font-display text-7xl font-extrabold leading-none tracking-tight sm:text-8xl">
          <span className="gradient-text">404</span>
        </p>

        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--text)] sm:text-3xl">
          That page has been paid off
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
          The link you followed does not point at anything here. It may have moved, or it may never
          have existed.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Or pick a calculator
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {LOAN_TYPES.map((t) => (
              <Link
                key={t.id}
                href={`/${t.slug}`}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-brand-600 dark:hover:text-brand-300"
              >
                {t.emoji} {t.shortLabel}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="mt-9 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgb(79_70_229/0.5)] transition-all duration-200 hover:-translate-y-0.5"
        >
          ← Back to the calculator
        </Link>
      </div>
    </div>
  );
}
