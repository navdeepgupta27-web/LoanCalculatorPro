import { formatDate } from "@/lib/format";
import type { RateCoverage } from "@/lib/queries";

/**
 * States plainly how much of the table has actually been checked.
 *
 * Publishing unverified interest rates on a finance site is a real liability,
 * so rows nobody has confirmed are never dressed up as data — the gap is
 * declared here instead.
 */
export function CoverageNotice({ coverage }: { coverage: RateCoverage }) {
  if (coverage.total === 0) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          No rates published yet
        </p>
        <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
          The lender list has not been populated. Add rates from the admin console at{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900/50">
            /admin/rates
          </code>
          .
        </p>
      </div>
    );
  }

  if (coverage.verified === 0) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Rates not yet published
        </p>
        <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          {coverage.total} lenders are listed, but none has a rate confirmed against its own
          published page yet. Figures are deliberately left blank rather than filled with estimates
          — add and verify them in the admin console before launch.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-sm">
      <span className="flex items-center gap-2 font-semibold text-accent-700 dark:text-accent-400">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m4 10.5 4 4 8-9" />
        </svg>
        {coverage.verified} of {coverage.total} rates verified against the lender&rsquo;s own page
      </span>
      {coverage.missing > 0 && (
        <span className="text-[var(--text-muted)]">
          {coverage.missing} awaiting confirmation
        </span>
      )}
      {coverage.lastUpdated && (
        <span className="text-[var(--text-muted)]">
          Last updated {formatDate(coverage.lastUpdated)}
        </span>
      )}
    </div>
  );
}
