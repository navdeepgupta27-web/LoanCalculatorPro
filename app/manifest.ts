import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loan Calculator Pro — EMI & Loan Comparison Calculator",
    short_name: "Loan Calculator Pro",
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    // Matches the dark default so the PWA splash screen does not flash white.
    background_color: "#070a16",
    theme_color: SITE.themeColor,
    lang: "en-IN",
    dir: "ltr",
    categories: ["finance", "business", "productivity"],
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Home Loan EMI", url: "/home-loan-emi-calculator" },
      { name: "Compare Banks", url: "/compare-loans" },
      { name: "Interest Rates", url: "/bank-interest-rates" },
    ],
  };
}
