import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CountryProvider } from "@/components/country/country-provider";
import { COUNTRIES, countryByCode } from "@/lib/countries";

/**
 * Validates the country segment and puts it in context for everything below.
 *
 * The segment is the only source of truth for which country a page is showing.
 * Cookies and IP geolocation decide only where a visitor without a country in
 * the URL gets sent; once they are on /gb, that is what they see, whoever they
 * are and wherever they open it. A shared link therefore always shows the
 * sender what the recipient saw.
 */

export function generateStaticParams() {
  // Only the researched markets are prerendered. The rest render on demand and
  // are then cached — 206 countries prebuilt would be a long build for pages
  // almost nobody asks for.
  return COUNTRIES.filter((c) => c.curated).map((c) => ({ country: c.code }));
}

export default async function CountryLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ country: string }>;
}) {
  const { country: code } = await params;
  const country = countryByCode(code);

  // An unknown segment is a 404, not a silent fallback to India — otherwise
  // every typo and every stale URL would quietly render a page that looks
  // legitimate and reports the wrong currency.
  if (!country) notFound();

  return <CountryProvider country={country}>{children}</CountryProvider>;
}
