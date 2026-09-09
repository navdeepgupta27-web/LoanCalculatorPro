"use client";

import Link from "next/link";

import { useCountryFromPath } from "@/components/country/country-provider";
import { countryHref } from "@/lib/countries";
import { loanCalculatorTitle } from "@/lib/naming";
import { schemesFor } from "@/lib/schemes";
import { LEGAL_NAV, loanTypesFor, SITE } from "@/lib/site";

import { Logo } from "./logo";
import { SocialLinks } from "./social-icons";

/** `perCountry` entries sit under the country prefix; the rest are shared. */
const TOOLS = [
  { label: "EMI Calculator", href: "/", perCountry: true },
  { label: "Compare Bank Loans", href: "/compare-loans", perCountry: true },
  { label: "Compare Investments", href: "/compare-investments", perCountry: true },
  { label: "Bank Interest Rates", href: "/bank-interest-rates", perCountry: true },
  { label: "Money Guides", href: "/blog", perCountry: false },
  { label: "FAQ", href: "/faq", perCountry: false },
];

/** Small tricolour flag — drawn inline so it renders identically everywhere. */
function IndiaFlag() {
  return (
    <svg viewBox="0 0 21 14" className="h-3.5 w-5 rounded-[2px] shadow-sm" aria-hidden="true">
      <rect width="21" height="14" fill="#fff" />
      <rect width="21" height="4.667" fill="#FF9933" />
      <rect y="9.333" width="21" height="4.667" fill="#138808" />
      <circle cx="10.5" cy="7" r="1.85" fill="none" stroke="#000080" strokeWidth="0.5" />
      <circle cx="10.5" cy="7" r="0.4" fill="#000080" />
    </svg>
  );
}

export function Footer() {
  const country = useCountryFromPath();
  const href = (path: string) => countryHref(country, path);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-[var(--border)] bg-[var(--surface)] no-print">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              {SITE.tagline}. Fourteen calculators for both sides of your money — EMIs,
              part-payments and lender comparison on the borrowing side; SIP, PPF, FD, NPS and the
              rest on the saving side. Free, and every calculation runs in your own browser.
            </p>

            <div className="mt-5">
              <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Follow us
              </p>
              <SocialLinks />
            </div>
          </div>

          <nav aria-label="Loan calculators">
            <h2 className="mb-3 font-display text-sm font-bold text-[var(--text)]">
              Loan Calculators
            </h2>
            <ul className="flex flex-col gap-2">
              {loanTypesFor(country.code).map((t) => (
                <li key={t.id}>
                  <Link
                    href={href(`/${t.slug}`)}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                  >
                    {loanCalculatorTitle(country.code, t.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Investment calculators">
            <h2 className="mb-3 font-display text-sm font-bold text-[var(--text)]">
              Investment Calculators
            </h2>
            <ul className="flex flex-col gap-2">
              {schemesFor(country.code).map((s) => (
                <li key={s.id}>
                  <Link
                    href={href(`/${s.slug}`)}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Tools">
            <h2 className="mb-3 font-display text-sm font-bold text-[var(--text)]">Tools &amp; Data</h2>
            <ul className="flex flex-col gap-2">
              {TOOLS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.perCountry ? href(t.href) : t.href}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="mb-3 font-display text-sm font-bold text-[var(--text)]">Company</h2>
            <ul className="flex flex-col gap-2">
              {LEGAL_NAV.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/feedback"
                  className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
                >
                  Send Feedback
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-secondary)]">Disclaimer:</strong> Loan Calculator Pro is a
            calculation tool, not a lender, broker or financial adviser, and nothing here is
            investment or borrowing advice. Figures are estimates based on the values you enter and
            the standard reducing-balance method; your lender&rsquo;s sanction letter is the only
            authoritative statement of your EMI, interest and charges. Interest rates shown on the
            rates pages are collected from lenders&rsquo; published pages, change frequently, and
            must be confirmed with the lender before you act on them.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <p className="text-center text-xs text-[var(--text-muted)] sm:text-left">
            © {year} {SITE.name}. All rights reserved.{" "}
            <span className="hidden sm:inline">·</span>{" "}
            <a
              href={`https://${SITE.domain}`}
              className="transition-colors hover:text-brand-600 dark:hover:text-brand-300"
            >
              {SITE.domain}
            </a>
          </p>

          <p className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
            Made with <span className="text-red-500">♥</span> in India
            <IndiaFlag />
          </p>
        </div>
      </div>
    </footer>
  );
}
