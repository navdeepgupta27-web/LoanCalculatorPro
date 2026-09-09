import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { countryHref, type Country } from "@/lib/countries";
import { loanCalculatorTitle } from "@/lib/naming";
import { schemesFor } from "@/lib/schemes";
import { loanTypesFor } from "@/lib/site";

/**
 * Shown when a calculator exists on the site but not in this market.
 *
 * The obvious alternative was notFound(), and it was the first thing tried. It
 * is wrong twice over. Practically, this page is reached most often by someone
 * reading /in/ppf-calculator who switches country — the selector keeps you on
 * the same page, which is the right behaviour, and answering that with a 404
 * punishes a reasonable action. Technically, notFound() inside a revalidating
 * route was rendering an empty shell under a 200 status, which is worse than
 * either outcome.
 *
 * So this says what happened, why, and what the reader can use instead. It
 * carries a noindex, since it is a real answer for a person and nothing a
 * search engine should hold.
 */
export function NotAvailableHere({
  country,
  title,
  reason,
}: {
  country: Country;
  title: string;
  reason: string;
}) {
  const loans = loanTypesFor(country.code).slice(0, 4);
  const schemes = schemesFor(country.code).slice(0, 4);

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="text-5xl" aria-hidden="true">
          🧭
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
          {reason}
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-sm font-bold text-[var(--text)]">
            Loan calculators in {country.name}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {loans.map((t) => (
              <li key={t.id}>
                <Link
                  href={countryHref(country, `/${t.slug}`)}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  {loanCalculatorTitle(country.code, t.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-bold text-[var(--text)]">
            Investment calculators
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {schemes.map((s) => (
              <li key={s.id}>
                <Link
                  href={countryHref(country, `/${s.slug}`)}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={countryHref(country)} size="lg">
          All {country.name} calculators
        </ButtonLink>
        <ButtonLink href={countryHref({ ...country, code: "in" })} size="lg" variant="secondary">
          Switch to India
        </ButtonLink>
      </div>
    </section>
  );
}
