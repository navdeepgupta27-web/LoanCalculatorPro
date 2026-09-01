import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/queries";
import { LOAN_TYPES, SITE_URL } from "@/lib/site";

// Re-generated hourly so a newly published post appears without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/compare-loans`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/bank-interest-rates`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/feedback`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const calculatorRoutes: MetadataRoute.Sitemap = LOAN_TYPES.map((t) => ({
    url: `${SITE_URL}/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  const rateRoutes: MetadataRoute.Sitemap = LOAN_TYPES.map((t) => ({
    url: `${SITE_URL}/bank-interest-rates/${t.rateSlug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

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

  return [...staticRoutes, ...calculatorRoutes, ...rateRoutes, ...postRoutes];
}
