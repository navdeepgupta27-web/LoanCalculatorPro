import type { Metadata } from "next";

import { CURATED_COUNTRIES, DEFAULT_COUNTRY, type Country } from "./countries";
import { SCHEMES } from "./schemes";
import { ALL_KEYWORDS, LOAN_TYPES, SITE, SITE_URL, SOCIAL_LINKS } from "./site";

/* ------------------------------------------------------------------ */
/* Metadata builder                                                    */
/* ------------------------------------------------------------------ */

interface PageMetaInput {
  title: string;
  description: string;
  /** Path only, e.g. "/compare-loans". Used for the canonical URL. */
  path: string;
  keywords?: string[];
  /** Route that supplies the social preview image. Defaults to the site OG image. */
  ogImage?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  /**
   * For a page that exists once per country. Pass the country and the path
   * WITHOUT its country prefix, e.g. "/sip-calculator". The prefix is added,
   * hreflang links to every researched market are emitted, and pages for
   * countries whose data has not been researched are kept out of the index.
   */
  country?: Country;
  /** Path without the country prefix, used to build the hreflang set. */
  countryPath?: string;
}

/**
 * Builds a complete, canonical-correct metadata object. Every public page goes
 * through here so no page can accidentally ship without a canonical URL or an
 * OG image — the two things that most often break rich results.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  ogImage,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
  country,
  countryPath,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const image = ogImage ?? `${SITE_URL}/opengraph-image`;
  const fullTitle = path === "/" ? title : `${title} | ${SITE.name}`;

  /**
   * One page per country means 206 near-identical pages differing only in
   * currency, which is textbook thin-content duplication. The researched
   * markets are indexed and cross-linked with hreflang; everywhere else the
   * page still works for whoever asked, but is kept out of search.
   */
  const languages =
    country && countryPath
      ? Object.fromEntries([
          ...CURATED_COUNTRIES.map((c) => [
            `en-${c.code.toUpperCase()}`,
            `${SITE_URL}/${c.code}${countryPath}`,
          ]),
          ["x-default", `${SITE_URL}/${DEFAULT_COUNTRY}${countryPath}`],
        ])
      : undefined;

  const keepOut = noIndex || (country !== undefined && !country.curated);

  /**
   * The keyword sets were written for an India-only site: they name Indian
   * lenders, use lakh and crore, and append "India" to head terms. Emitting
   * them on a US or UK page targets the wrong market and reads as keyword
   * stuffing, so they are filtered out everywhere except India.
   *
   * A filter rather than a second hand-maintained list, because the terms that
   * travel — "EMI calculator", "SIP calculator", "compare loans" — are the
   * majority, and duplicating them would leave two lists to drift apart.
   */
  const INDIA_SPECIFIC =
    /\bindia(n)?\b|\blakh\b|\bcrore\b|\bRBI\b|\bNBFC\b|\bGST\b|\bSBI\b|HDFC|ICICI|Axis Bank|Kotak|Punjab National|Bank of Baroda|Canara|IndusInd|IDFC|Bajaj|LIC |Tata Capital|Federal Bank|Union Bank|EPFO|Sukanya|PPF|NPS|EPF\b/i;

  const pool = Array.from(new Set([...keywords, ...ALL_KEYWORDS]));
  const scopedKeywords =
    country && country.code !== "in" ? pool.filter((k) => !INDIA_SPECIFIC.test(k)) : pool;

  return {
    title,
    description,
    keywords: scopedKeywords.slice(0, 60),
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    robots: keepOut
      ? { index: false, follow: true, nocache: true }
      : {
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
      type,
      url,
      siteName: SITE.name,
      title: fullTitle,
      description,
      locale: SITE.locale,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@loancalcpro",
    },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data (JSON-LD)                                           */
/* ------------------------------------------------------------------ */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon`,
      width: 512,
      height: 512,
    },
    description: SITE.description,
    email: SITE.email,
    foundingLocation: { "@type": "Place", name: "India" },
    areaServed: { "@type": "Country", name: "India" },
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE.name,
    // Google picks the name shown above a search result from this, og:site_name
    // and the title, and prefers a short one. Offering the shorter form here
    // makes "Loan Calc Pro" available instead of the bare domain.
    alternateName: ["Loan Calc Pro", SITE.domain],
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Describes the calculator itself as a free web application.
 * Deliberately carries no aggregateRating — Google treats self-declared review
 * counts on your own product as a spam signal, and inventing one would be a
 * fabricated statistic.
 */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#webapp`,
    name: "Loan Calculator Pro — Loan EMI & Investment Calculators",
    url: SITE_URL,
    applicationCategory: "FinanceApplication",
    applicationSubCategory: "Loan and investment calculator",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "EMI calculation on the reducing-balance method",
      "One-time and recurring part-payment modelling",
      "Reduce-tenure vs reduce-EMI comparison",
      "Side-by-side comparison of up to four lenders",
      "Processing fee and GST in the total cost",
      "Month-by-month and year-by-year amortisation schedule",
      "CSV export and printable schedule",
      "SIP, lumpsum, FD and RD maturity projections",
      "PPF, Sukanya Samriddhi, NPS and EPF calculators",
      "Absolute return, CAGR and XIRR on every projection",
      "Side-by-side investment comparison with risk, lock-in and tax treatment",
    ],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  slug: string;
  author: string;
  published: string | null;
  modified: string;
  keywords?: string;
}) {
  const url = `${SITE_URL}/blog/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    headline: input.title.slice(0, 110),
    description: input.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: input.published ?? input.modified,
    dateModified: input.modified,
    author: { "@type": "Organization", name: input.author, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: `${SITE_URL}/blog/${input.slug}/opengraph-image`,
    inLanguage: SITE.language,
    ...(input.keywords ? { keywords: input.keywords } : {}),
  };
}

/** Marks the rates page as a curated dataset, which helps it surface in Search. */
export function rateTableSchema(loanTypeLabel: string, count: number, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${loanTypeLabel} interest rates in India`,
    description: `Interest rate, processing fee and maximum tenure for ${count} lenders offering ${loanTypeLabel.toLowerCase()}s in India, each row linked to the lender's own published rate page.`,
    url: `${SITE_URL}${path}`,
    creator: { "@id": `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
    license: `${SITE_URL}/terms`,
    spatialCoverage: { "@type": "Place", name: "India" },
  };
}

export function itemListSchema(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Every calculator on the site, in one ItemList on the homepage.
 *
 * This deliberately covers both families. Listing only the loan calculators
 * described a site that appears to do half of what it does, and gave a search
 * engine nothing to associate the homepage with "SIP calculator" or
 * "PPF calculator".
 */
export function calculatorListSchema() {
  return itemListSchema("Loan and investment calculators", [
    ...LOAN_TYPES.map((t) => ({
      name: `${t.label} EMI Calculator`,
      path: `/${t.slug}`,
    })),
    ...SCHEMES.map((s) => ({ name: s.name, path: `/${s.slug}` })),
  ]);
}

/**
 * The site's main destinations as SiteNavigationElement.
 *
 * Sitelinks are chosen algorithmically and cannot be requested, but the choice
 * is made from a site's own navigation and internal linking. This states that
 * structure explicitly rather than leaving it to be inferred from the markup.
 */
export function siteNavigationSchema() {
  const entries = [
    { name: "Home Loan Calculator", path: "/home-loan-emi-calculator" },
    { name: "Personal Loan Calculator", path: "/personal-loan-emi-calculator" },
    { name: "SIP Calculator", path: "/sip-calculator" },
    { name: "PPF Calculator", path: "/ppf-calculator" },
    { name: "FD Calculator", path: "/fd-calculator" },
    { name: "Investment Calculators", path: "/investment-calculators" },
    { name: "Compare Bank Loans", path: "/compare-loans" },
    { name: "Compare Investments", path: "/compare-investments" },
    { name: "Bank Interest Rates", path: "/bank-interest-rates" },
    { name: "Money Guides", path: "/blog" },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/#sitenav`,
    name: `${SITE.name} navigation`,
    itemListElement: entries.map((e, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: e.name,
      url: `${SITE_URL}${e.path}`,
    })),
  };
}
