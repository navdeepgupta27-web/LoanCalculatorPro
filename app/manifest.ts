import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loan Calculator Pro — Loan EMI & Investment Calculators",
    // Kept short: Android truncates the home-screen label at around 12
    // characters, and "Loan Calculator Pro" is already past that.
    short_name: "Loan Calc Pro",
    description: SITE.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    // Matches the light default so the PWA splash screen does not flash a
    // different colour before the page paints.
    background_color: "#f6f7fb",
    theme_color: SITE.themeColor,
    lang: "en-IN",
    dir: "ltr",
    categories: ["finance", "business", "productivity"],
    // A browser will not offer to install without a 192px and a 512px icon.
    // The maskable pair is what Android crops to the launcher's own shape; the
    // Apple touch icon is deliberately not listed here, since iOS takes it from
    // the <link> tag and has no concept of a maskable icon.
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/pwa-icon/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Long-press the installed icon to jump straight to one of these.
    shortcuts: [
      { name: "Home Loan EMI", url: "/home-loan-emi-calculator" },
      { name: "SIP Calculator", url: "/sip-calculator" },
      { name: "Compare Banks", url: "/compare-loans" },
      { name: "Interest Rates", url: "/bank-interest-rates" },
    ],
  };
}
