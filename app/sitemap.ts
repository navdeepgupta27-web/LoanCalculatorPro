import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/queries";
import { CURATED_COUNTRIES } from "@/lib/countries";
import { SCHEMES } from "@/lib/schemes";
import { LOAN_TYPES, SITE_URL } from "@/lib/site";

// Re-generated hourly so a newly published post appears without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Shared pages, one copy for the whole site.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
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
  const countryRoutes: MetadataRoute.Sitemap = CURATED_COUNTRIES.flatMap((c) => [
    { url: `${SITE_URL}/${c.code}`, lastModified: now, changeFrequency: "daily" as const, priority: 1 },
    ...LOAN_TYPES.map((t) => ({
      url: `${SITE_URL}/${c.code}/${t.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.95,
    })),
    ...SCHEMES.map((s) => ({
      url: `${SITE_URL}/${c.code}/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...LOAN_TYPES.map((t) => ({
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
