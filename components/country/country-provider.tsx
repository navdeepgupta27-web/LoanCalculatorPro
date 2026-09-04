"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { COUNTRY_MAP, DEFAULT_COUNTRY, countryByCode, type Country } from "@/lib/countries";
import { createFormatters, type Formatters } from "@/lib/format";

/**
 * Makes the current country available to client components.
 *
 * The country is decided by the URL segment and passed down from the country
 * layout, so it is already correct in the server-rendered HTML — no effect, no
 * flash of the wrong currency, and no request for the client to make.
 *
 * Server components do not need this. They call `createFormatters(country)`
 * directly, since they already have the route params.
 */

interface CountryContextValue {
  country: Country;
  format: Formatters;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({
  country,
  children,
}: {
  country: Country;
  children: ReactNode;
}) {
  // createFormatters caches by country code, so this is cheap; the memo exists
  // to keep the context value referentially stable across re-renders.
  const value = useMemo(
    () => ({ country, format: createFormatters(country) }),
    [country],
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

/**
 * Falls back to the default country rather than throwing.
 *
 * A calculator rendered outside a country route — in a preview, or a page that
 * has not been migrated yet — should still show numbers rather than crash the
 * tree. It will show the wrong currency, which is visible and fixable; a blank
 * screen is neither.
 */
function useCountryContext(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (ctx) return ctx;
  const country = COUNTRY_MAP[DEFAULT_COUNTRY];
  return { country, format: createFormatters(country) };
}

export function useCountry(): Country {
  return useCountryContext().country;
}

/**
 * Reads the country from the first path segment.
 *
 * For the header and footer, which are rendered by the public layout and so sit
 * *above* the country layout — they are outside the provider and cannot use
 * `useCountry()`. The URL is the source of truth anyway, so reading it directly
 * gives the same answer without making the whole layout dynamic.
 *
 * On the shared pages that carry no country prefix — the blog, the FAQ, the
 * legal pages — this falls back to the default, so navigation from those points
 * somewhere valid.
 */
export function useCountryFromPath(): Country {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  return countryByCode(segment) ?? COUNTRY_MAP[DEFAULT_COUNTRY];
}

/** Currency, number and date formatting bound to the current country. */
export function useFormat(): Formatters {
  return useCountryContext().format;
}
