import "server-only";

import { cookies, headers } from "next/headers";

import { COUNTRY_MAP, DEFAULT_COUNTRY, countryByCode, type Country } from "./countries";

/**
 * Works out which country a visitor should land on.
 *
 * Only used for the bare "/" entry point. Once someone is on a country URL that
 * segment is the single source of truth — this is never consulted again, so a
 * shared or bookmarked link always shows what the sender saw.
 *
 * Order matters: an explicit choice from the selector beats a guess from an IP
 * address, which beats the default.
 */

export const COUNTRY_COOKIE = "lcp-country";

/** Set by Vercel's edge network. Absent locally and on other hosts. */
const GEO_HEADERS = ["x-vercel-ip-country", "cf-ipcountry", "x-country-code"];

export async function preferredCountry(): Promise<Country> {
  const store = await cookies();
  const chosen = countryByCode(store.get(COUNTRY_COOKIE)?.value);
  if (chosen) return chosen;

  const head = await headers();
  for (const name of GEO_HEADERS) {
    const detected = countryByCode(head.get(name));
    if (detected) return detected;
  }

  return COUNTRY_MAP[DEFAULT_COUNTRY];
}

/** The geo guess alone, for telling someone we think they are somewhere else. */
export async function detectedCountry(): Promise<Country | undefined> {
  const head = await headers();
  for (const name of GEO_HEADERS) {
    const detected = countryByCode(head.get(name));
    if (detected) return detected;
  }
  return undefined;
}
