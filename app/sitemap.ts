import type { MetadataRoute } from "next";

import { getPublishedPosts, publishedRateCounts } from "@/lib/queries";
import { LIVE_COUNTRIES } from "@/lib/countries";
import { schemesFor } from "@/lib/schemes";
import { loanTypesFor, SITE_URL } from "@/lib/site";

// Re-generated hourly so a newly published post appears without a redeploy.
export const revalidate = 3600;

/** Keep in step with the threshold on the rate page itself. */
const MIN_RATES_TO_INDEX = 3;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // How many published lenders each market has per loan type, so the rate
  // pages that are too thin to index are also left out of the sitemap.
  const ratesByType = new Map<string, number>();
  try {
    const counts = await publishedRateCounts();
    for (const row of counts) ratesByType.set(`${row.country}:${row.loan_type}`, row.n);
  } catch (err) {
    console.error("[sitemap] could not count rates:", err);
  }

  // Shared pages, one copy for the whole site.
  //
  // The bare root is deliberately absent: it redirects to the visitor's market
  // rather than serving content, and a sitemap listing a redirect earns a
  // "Page with redirect" in Search Console instead of an indexed page. The
  // destination it sends people to is listed on its own below.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/feedback`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  /**
   * Per-country pages, listed only for the researched markets.
   *
   * Every country resolves and works, but 206 near-identical copies of each
   * calculator differing only in currency is thin-content duplication. Those
   * pages carry a noindex, so listing them here would be asking Google to
   * crawl what it has been told to ignore.
   */
  const countryRoutes: MetadataRoute.Sitemap = LIVE_COUNTRIES.flatMap((c) => [
    { url: `${SITE_URL}/${c.code}`, lastModified: now, changeFrequency: "daily" as const, priority: 1 },
    ...loanTypesFor(c.code).map((t) => ({
      url: `${SITE_URL}/${c.code}/${t.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.95,
    })),
    ...schemesFor(c.code).map((s) => ({
      url: `${SITE_URL}/${c.code}/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    // Only the rate pages carrying enough published lenders to be a real
    // comparison. The rest are noindex, and listing a page in the sitemap that
    // the page itself asks not to be indexed is a contradiction Search Console
    // reports back as an error.
    ...loanTypesFor(c.code)
      .filter((t) => (ratesByType.get(`${c.code}:${t.id}`) ?? 0) >= MIN_RATES_TO_INDEX)
      .map((t) => ({
        url: `${SITE_URL}/${c.code}/bank-interest-rates/${t.rateSlug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      })),
    ...["compare-loans", "compare-investments", "investment-calculators", "bank-interest-rates"].map(
      (path) => ({
        url: `${SITE_URL}/${c.code}/${path}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }),
    ),
  ]);

  // A database hiccup must not take the whole sitemap down — the static routes
  // are still worth serving.
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts(500);
    postRoutes = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.published_at ?? now),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] could not load posts:", err);
  }

  return [...staticRoutes, ...countryRoutes, ...postRoutes];
}
