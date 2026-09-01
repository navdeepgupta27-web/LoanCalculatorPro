import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin console and the write APIs have no business in an index.
        disallow: ["/admin", "/admin/", "/api/"],
      },
      // Let the big crawlers through explicitly, with no crawl-delay.
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
