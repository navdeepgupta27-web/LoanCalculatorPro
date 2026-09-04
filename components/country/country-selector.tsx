"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { COUNTRIES, countryByCode, groupedCountries, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

import { useCountryFromPath } from "./country-provider";

/**
 * Switches country, keeping the visitor on the page they are already reading.
 *
 * Changing country rewrites the first path segment rather than sending anyone
 * home, so someone comparing SIP figures stays on the SIP calculator. The
 * choice is remembered in a cookie, which is only ever consulted at "/" — a
 * country URL always wins, so a shared link shows the recipient what the sender
 * saw rather than silently switching to their own country.
 */

/** Read at "/" to decide where to send someone. A year is long enough. */
const COOKIE = "lcp-country";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Regional-indicator flag, so there is no image to load or ship. */
function flag(code: string): string {
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 0x1f1a5 + c.charCodeAt(0)),
  );
}

export function CountrySelector({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useCountryFromPath();

  // A country that is not prerendered renders on demand, which can take a
  // second or two. The transition gives the click immediate feedback instead
  // of leaving the old page on screen looking frozen.
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<Country | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.currency.toLowerCase().includes(q),
    ).slice(0, 40);
  }, [query]);

  const choose = (next: Country) => {
    setOpen(false);
    setQuery("");
    setTarget(next);

    try {
      document.cookie = `${COOKIE}=${next.code}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    } catch {
      /* cookies blocked — the URL still carries the country */
    }

    const segments = pathname.split("/");
    // Swap the country segment when there is one; otherwise this is a shared
    // page like the blog, and the visitor goes to that country's calculator.
    const href = countryByCode(segments[1])
      ? [...segments.slice(0, 1), next.code, ...segments.slice(2)].join("/")
      : `/${next.code}`;

    startTransition(() => router.push(href));
  };

  const row = (c: Country) => (
    <button
      key={c.code}
      type="button"
      onClick={() => choose(c)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
        c.code === current.code
          ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]",
      )}
    >
      <span className="text-base leading-none">{flag(c.code)}</span>
      <span className="flex-1 truncate text-[0.8125rem] font-semibold">{c.name}</span>
      <span className="shrink-0 text-[0.7rem] text-[var(--text-muted)]">{c.currency}</span>
    </button>
  );

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Country: ${current.name}. Change country`}
        aria-busy={pending}
        disabled={pending}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
      >
        <span className="text-base leading-none">{flag((pending && target ? target : current).code)}</span>
        <span className="hidden sm:inline">
          {(pending && target ? target : current).currency}
        </span>
        {pending ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 20 20"
            className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[19rem] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lift)]">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country or currency"
            aria-label="Search countries"
            className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-brand-400"
          />

          <div className="max-h-[19rem] overflow-y-auto">
            {results ? (
              results.length > 0 ? (
                results.map(row)
              ) : (
                <p className="px-2.5 py-6 text-center text-sm text-[var(--text-muted)]">
                  Nothing matches “{query}”.
                </p>
              )
            ) : (
              groupedCountries().map((group) => (
                <div key={group.region} className="mb-1">
                  <p className="px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {group.region}
                  </p>
                  {group.countries.map(row)}
                </div>
              ))
            )}
          </div>

          <p className="border-t border-[var(--border)] px-2.5 pb-1 pt-2.5 text-[0.7rem] leading-relaxed text-[var(--text-muted)]">
            Every calculator works in every country. Lender rates and government
            savings schemes are only shown where we have checked them against a
            published source.
          </p>
        </div>
      )}
    </div>
  );
}
