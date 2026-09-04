"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CURATED_COUNTRIES, resolveCountry } from "@/lib/countries";

/**
 * Picks which country's data the admin screen is editing.
 *
 * Restricted to the researched markets. Rates for a country whose lenders have
 * not been established would have nowhere to live, and offering all 206 here
 * would mostly be a way to file data under the wrong one by accident.
 *
 * The choice lives in the URL rather than in state, so a page reload, a
 * bookmark and a shared link all edit the same country.
 */
export function AdminCountrySwitch({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const change = (code: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("country", code);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Editing
      </span>
      {CURATED_COUNTRIES.map((c) => (
        <button
          key={c.code}
          type="button"
          onClick={() => change(c.code)}
          className={
            c.code === current
              ? "rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white"
              : "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
          }
        >
          {c.name} · {c.currency}
        </button>
      ))}
      <span className="ml-auto text-xs text-[var(--text-muted)]">
        {resolveCountry(current).name} data only
      </span>
    </div>
  );
}
