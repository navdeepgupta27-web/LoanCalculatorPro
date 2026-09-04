import { redirect } from "next/navigation";

import { preferredCountry } from "@/lib/country-server";

/**
 * The bare "/" entry point.
 *
 * Sends a visitor to their country's calculator: their saved choice if they
 * have one, otherwise the country the edge network reports, otherwise India.
 *
 * A temporary redirect rather than a permanent one, because the destination
 * genuinely depends on who is asking — a browser must not cache one visitor's
 * country and reuse it for the next person on the same machine.
 *
 * Every country version stays reachable regardless of where a crawler happens
 * to be: each page carries hreflang links to all the others, and the sitemap
 * lists them outright. That matters because Googlebot mostly crawls from the
 * United States and would otherwise only ever see /us.
 */
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const country = await preferredCountry();
  redirect(`/${country.code}`);
}
