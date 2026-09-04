import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { LOAN_TYPES } from "@/lib/site";
import { SCHEMES } from "@/lib/schemes";

/**
 * Served by the service worker when a page is requested with no connection.
 *
 * Must stay free of any data fetching — it is precached at install time and
 * has to render from the bundle alone.
 */
export const dynamic = "force-static";

export const metadata = pageMetadata({
  title: "You are offline",
  description: "This page needs a connection. The calculators work without one.",
  path: "/offline",
  // Nothing here belongs in search results.
  noIndex: true,
});

const WORKS_OFFLINE = [
  ...LOAN_TYPES.slice(0, 3).map((t) => ({ label: `${t.label} EMI`, href: `/${t.slug}` })),
  ...SCHEMES.slice(0, 3).map((s) => ({ label: s.shortName, href: `/${s.slug}` })),
];

export default function OfflinePage() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="text-5xl" aria-hidden="true">
        📡
      </span>

      <h1 className="mt-6 font-display text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
        You are offline
      </h1>

      <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
        This page needs a connection — bank rates and guides are loaded from our server. The
        calculators are a different matter: they do all their arithmetic on your phone, so any one
        you have already opened still works exactly as it does online.
      </p>

      <div className="mt-8 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Try one of these
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {WORKS_OFFLINE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ButtonLink href="/" size="lg">
          Back to the calculator
        </ButtonLink>
      </div>
    </section>
  );
}
