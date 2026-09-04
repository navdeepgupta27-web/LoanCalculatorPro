import type { NextConfig } from "next";

import { DEFAULT_COUNTRY } from "./lib/countries";
import { SCHEMES } from "./lib/schemes";
import { LOAN_TYPES } from "./lib/site";

/**
 * Paths that used to live at the root and now sit under a country prefix.
 *
 * Listed explicitly rather than matched with a wildcard. A catch-all would also
 * swallow /api, /admin, /sitemap.xml, /robots.txt, /sw.js, /favicon.ico and the
 * generated icons — and a redirect loop on those is the kind of failure that
 * takes a site down rather than degrading it.
 *
 * The blog, FAQ and legal pages are deliberately absent: they are not
 * per-country, they stay where they are, and their URLs — the most valuable
 * ones on the site — do not move at all.
 */
const MOVED_TO_COUNTRY = [
  ...LOAN_TYPES.map((t) => t.slug),
  ...SCHEMES.map((s) => s.slug),
  "compare-loans",
  "compare-investments",
  "investment-calculators",
  "bank-interest-rates",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...MOVED_TO_COUNTRY.map((slug) => ({
        source: `/${slug}`,
        destination: `/${DEFAULT_COUNTRY}/${slug}`,
        permanent: true,
      })),
      // The per-loan-type rate pages, e.g. /bank-interest-rates/home-loan.
      {
        source: "/bank-interest-rates/:loanType",
        destination: `/${DEFAULT_COUNTRY}/bank-interest-rates/:loanType`,
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // The service worker must never be served from cache. A stale copy
        // keeps its old asset cache alive, which can pin visitors to a
        // previous deploy long after it has been replaced.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          // Lets the worker control every route, not just /.
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
