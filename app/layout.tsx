import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import "./globals.css";

import { ActivityTracker } from "@/components/analytics/activity-tracker";
import { themeInitScript } from "@/components/layout/theme";
import { JsonLd } from "@/components/seo/json-ld";
import { ToastProvider } from "@/components/ui/toast";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { ALL_KEYWORDS, SITE, SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Only the weights actually used, so no byte is downloaded for nothing.
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Loan EMI Calculator with Part-Payment & Bank Comparison | LoanCalc Pro",
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ALL_KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "finance",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE_URL,
    siteName: SITE.name,
    title: "Loan EMI Calculator with Part-Payment & Bank Comparison",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    site: "@loancalcpro",
    creator: "@loancalcpro",
  },
  formatDetection: { telephone: false, address: false, email: false },
  // Paste the token from Google Search Console / Bing Webmaster into .env
  // to have the verification meta tags emitted automatically.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    rating: "general",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070a16" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint so dark mode never flashes white. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
      </head>
      <body className="min-h-dvh antialiased">
        <ToastProvider>{children}</ToastProvider>

        <ActivityTracker />

        <JsonLd data={[organizationSchema(), websiteSchema()]} />

        {/*
          Google AdSense — the publisher id carried over from the original page.
          Loaded once for the whole site with afterInteractive so it never
          blocks first paint; individual units are rendered by <AdSlot />.
        */}
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`}
        />
      </body>
    </html>
  );
}
