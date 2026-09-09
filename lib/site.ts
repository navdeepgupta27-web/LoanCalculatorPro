/**
 * Central site configuration: canonical URLs, SEO keyword sets, navigation and
 * social profiles. Everything that is repeated across `<head>` tags, structured
 * data and the footer is defined exactly once here.
 */

import { instalmentWords, loanCalculatorTitle, loanName } from "./naming";
import { INVESTMENT_KEYWORDS, schemesFor } from "./schemes";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://loancalculatorpro.in";

export const SITE = {
  name: "Loan Calculator Pro",
  legalName: "Loan Calculator Pro",
  domain: "loancalculatorpro.in",
  url: SITE_URL,
  tagline: "Detailed loan EMI and investment calculators",
  description:
    "Free loan EMI and investment calculators. Home, car, personal, business, education and gold loan EMIs with part-payment modelling and bank comparison, plus SIP, lumpsum, FD, RD, PPF, Sukanya Samriddhi, NPS and EPF calculators with CAGR, XIRR and absolute return. 100% private — everything runs in your browser.",
  locale: "en_IN",
  language: "en-IN",
  country: "IN",
  currency: "INR",
  themeColor: "#4f46e5",
  email: "hello@loancalculatorpro.in",
  adsenseClient: "ca-pub-5705970236200354",
  /** Numeric half of the AdSense client id — used for ads.txt. */
  adsensePublisherId: "pub-5705970236200354",
} as const;

/* ------------------------------------------------------------------ */
/* Social profiles                                                     */
/* ------------------------------------------------------------------ */

export type SocialLink = {
  name: string;
  href: string;
  /** Key understood by <SocialIcon />. */
  icon: "x" | "facebook" | "linkedin" | "instagram" | "youtube" | "whatsapp";
};

/**
 * Update these to your real profile URLs. They are emitted into the
 * Organization JSON-LD `sameAs` array, which is how Google associates the
 * site with its social presence.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  { name: "X (Twitter)", href: "https://x.com/loancalcpro", icon: "x" },
  { name: "Facebook", href: "https://facebook.com/loancalculatorpro", icon: "facebook" },
  { name: "LinkedIn", href: "https://linkedin.com/company/loancalculatorpro", icon: "linkedin" },
  { name: "Instagram", href: "https://instagram.com/loancalculatorpro", icon: "instagram" },
  { name: "YouTube", href: "https://youtube.com/@loancalculatorpro", icon: "youtube" },
];

/* ------------------------------------------------------------------ */
/* Keywords                                                            */
/* ------------------------------------------------------------------ */

/**
 * Head terms that belong on nearly every page.
 *
 * Note the deliberate duplication of "X calculator" and "X EMI calculator" —
 * they are separate queries with separate volume, and people search the
 * shorter form at least as often.
 */
export const CORE_KEYWORDS = [
  "loan calculator",
  "EMI calculator",
  "EMI calculator India",
  "loan EMI calculator online",
  "monthly EMI calculator",
  "loan repayment calculator",
  "amortization schedule calculator",
  "amortisation schedule India",
  "reducing balance EMI calculator",
  "loan interest calculator",
  "free EMI calculator",
  "bank loan calculator India",
  // Short forms — searched at least as often as the "EMI" variants.
  "home loan calculator",
  "personal loan calculator",
  "car loan calculator",
  "housing loan calculator",
  "business loan calculator",
  "education loan calculator",
  "gold loan calculator",
];

/** Rate-lookup intent, which is a different job from calculating an EMI. */
export const RATE_KEYWORDS = [
  "interest rate on loan",
  "loan interest rate",
  "loan interest rate today",
  "current loan interest rate",
  "current interest rate India",
  "bank interest rate today",
  "latest bank interest rates",
  "interest rate comparison India",
  "which bank has lowest interest rate",
  "cheapest loan interest rate India",
];

/** Long-tail intent terms — the phrases that actually convert. */
export const INTENT_KEYWORDS = [
  "part payment calculator",
  "prepayment calculator home loan",
  "loan foreclosure calculator",
  "tenure reduction vs EMI reduction",
  "how much interest will I save by prepaying",
  "compare home loan interest rates",
  "compare bank loans side by side",
  "lowest home loan interest rate in India",
  "loan eligibility calculator",
  "processing fee and GST calculator",
  "total cost of loan calculator",
  "EMI in advance vs arrears",
  "loan calculator with extra payments",
  "loan balance schedule month wise",
];

/**
 * The site covers two families of tool now — borrowing and investing — so the
 * sitewide keyword set has to carry both. Leaving the investment terms out
 * meant every loan page described a site that appeared to do only loans.
 */
export const ALL_KEYWORDS = [
  ...CORE_KEYWORDS,
  ...INTENT_KEYWORDS,
  ...RATE_KEYWORDS,
  ...INVESTMENT_KEYWORDS,
];

/* ------------------------------------------------------------------ */
/* Bank-name queries                                                   */
/* ------------------------------------------------------------------ */

/**
 * Lenders people search for by name. "SBI home loan interest rate" and
 * "current HDFC interest rate" are high-volume queries that nothing on the
 * site targeted until these were generated onto the rate pages.
 *
 * Names only — public facts about which institutions exist. No rate, fee or
 * product claim is made here; those live in the database and only appear once
 * verified against the lender's own page.
 */
export const HEADLINE_LENDERS = [
  "SBI",
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Bank of Baroda",
  "Punjab National Bank",
  "Canara Bank",
  "Union Bank of India",
  "LIC Housing Finance",
  "Bajaj Housing Finance",
  "IDFC FIRST Bank",
  "IndusInd Bank",
  "Federal Bank",
  "Tata Capital",
] as const;

/**
 * Builds "{bank} {loan type} interest rate" style keywords for a rate page,
 * plus the "current {bank} interest rate" phrasing people actually type.
 */
export function bankRateKeywords(loanTypeLabel: string): string[] {
  const product = loanTypeLabel.toLowerCase();
  return HEADLINE_LENDERS.flatMap((bank) => [
    `${bank} ${product} interest rate`,
    `current ${bank} ${product} rate`,
  ]);
}

/* ------------------------------------------------------------------ */
/* Loan types                                                          */
/* ------------------------------------------------------------------ */

export type LoanTypeId =
  | "home"
  | "car"
  | "personal"
  | "business"
  | "education"
  | "gold";

export type LoanTypeConfig = {
  id: LoanTypeId;
  /** URL slug used by /[calculator] landing pages. */
  slug: string;
  /** URL slug used by /bank-interest-rates/[loanType]. */
  rateSlug: string;
  label: string;
  shortLabel: string;
  emoji: string;
  /** Tailwind gradient stops for the card accent. */
  gradient: string;
  defaults: { amount: number; rate: number; tenureYears: number; procFee: number };
  ranges: {
    amount: [number, number, number]; // min, max, step
    rate: [number, number, number];
    tenure: [number, number, number];
  };
  /**
   * Markets where this product is commonly offered. Absent means everywhere.
   *
   * A loan against gold jewellery is a mainstream retail product in India and
   * the Gulf and essentially absent from retail banking in the US, UK, Canada
   * and Australia. Offering a calculator for it there would be inventing a
   * market rather than serving one.
   */
  availableIn?: string[];
  /** Short marketing blurb used on cards and meta descriptions. */
  blurb: string;
  keywords: string[];
};

export const LOAN_TYPES: LoanTypeConfig[] = [
  {
    id: "home",
    slug: "home-loan-emi-calculator",
    rateSlug: "home-loan",
    label: "Home Loan",
    shortLabel: "Home",
    emoji: "🏠",
    gradient: "from-indigo-500 to-violet-500",
    defaults: { amount: 5000000, rate: 8.5, tenureYears: 20, procFee: 0.5 },
    ranges: { amount: [100000, 100000000, 50000], rate: [5, 20, 0.05], tenure: [1, 30, 1] },
    blurb:
      "Work out the EMI on a housing loan, see exactly how much of every instalment is interest, and find out what a single part-payment does to your 20-year tenure.",
    keywords: [
      "home loan calculator",
      "home loan interest rate",
      "home loan EMI calculator",
      "housing loan calculator",
      "home loan calculator India",
      "home loan prepayment calculator",
      "home loan part payment calculator",
      "home loan amortization schedule",
      "home loan interest rate comparison",
      "SBI home loan EMI calculator",
      "HDFC home loan EMI calculator",
      "home loan eligibility",
    ],
  },
  {
    id: "car",
    slug: "car-loan-emi-calculator",
    rateSlug: "car-loan",
    label: "Car Loan",
    shortLabel: "Car",
    emoji: "🚗",
    gradient: "from-sky-500 to-cyan-500",
    defaults: { amount: 1000000, rate: 9.2, tenureYears: 7, procFee: 1 },
    ranges: { amount: [50000, 20000000, 10000], rate: [5, 24, 0.05], tenure: [1, 8, 1] },
    blurb:
      "Price up a new or used car loan, including processing fee and GST, and see the true on-road cost of financing rather than just the sticker EMI.",
    keywords: [
      "car loan calculator",
      "car loan interest rate",
      "car loan EMI calculator",
      "auto loan calculator India",
      "used car loan EMI calculator",
      "vehicle loan calculator",
      "car loan interest rate comparison",
      "two wheeler loan EMI calculator",
    ],
  },
  {
    id: "personal",
    slug: "personal-loan-emi-calculator",
    rateSlug: "personal-loan",
    label: "Personal Loan",
    shortLabel: "Personal",
    emoji: "👤",
    gradient: "from-fuchsia-500 to-pink-500",
    defaults: { amount: 500000, rate: 12.5, tenureYears: 5, procFee: 2 },
    ranges: { amount: [10000, 5000000, 5000], rate: [8, 36, 0.05], tenure: [1, 7, 1] },
    blurb:
      "Personal loans carry the widest rate spread of any retail product. Compare offers properly — including the processing fee — before you sign.",
    keywords: [
      "personal loan calculator",
      "personal loan interest rate",
      "personal loan EMI calculator",
      "personal loan interest calculator",
      "instant personal loan calculator",
      "personal loan comparison India",
      "personal loan foreclosure charges",
    ],
  },
  {
    id: "business",
    slug: "business-loan-emi-calculator",
    rateSlug: "business-loan",
    label: "Business Loan",
    shortLabel: "Business",
    emoji: "💼",
    gradient: "from-amber-500 to-orange-500",
    defaults: { amount: 2500000, rate: 14, tenureYears: 5, procFee: 2 },
    ranges: { amount: [50000, 100000000, 25000], rate: [8, 30, 0.05], tenure: [1, 15, 1] },
    blurb:
      "Model working-capital and term-loan repayments, then check the cash-flow impact of clearing the balance early with a lump sum.",
    keywords: [
      "business loan calculator",
      "business loan interest rate",
      "business loan EMI calculator",
      "MSME loan calculator",
      "working capital loan calculator",
      "term loan EMI calculator India",
      "SME loan interest rates",
    ],
  },
  {
    id: "education",
    slug: "education-loan-emi-calculator",
    rateSlug: "education-loan",
    label: "Education Loan",
    shortLabel: "Education",
    emoji: "🎓",
    gradient: "from-emerald-500 to-teal-500",
    defaults: { amount: 2000000, rate: 10.5, tenureYears: 10, procFee: 1 },
    ranges: { amount: [50000, 20000000, 25000], rate: [6, 20, 0.05], tenure: [1, 15, 1] },
    blurb:
      "Plan study-loan repayments from the first salary onward and see how much a modest yearly prepayment shortens the term.",
    keywords: [
      "education loan calculator",
      "education loan interest rate",
      "education loan EMI calculator",
      "student loan calculator India",
      "abroad education loan calculator",
      "education loan interest rates",
      "education loan moratorium",
    ],
  },
  {
    id: "gold",
    availableIn: ["in", "ae"],
    slug: "gold-loan-emi-calculator",
    rateSlug: "gold-loan",
    label: "Gold Loan",
    shortLabel: "Gold",
    emoji: "🥇",
    gradient: "from-yellow-500 to-amber-600",
    defaults: { amount: 300000, rate: 11, tenureYears: 2, procFee: 1 },
    ranges: { amount: [10000, 5000000, 5000], rate: [7, 30, 0.05], tenure: [1, 5, 1] },
    blurb:
      "Short-tenure gold loans move fast. Check the instalment and the total interest before you pledge.",
    keywords: [
      "gold loan calculator",
      "gold loan EMI calculator",
      "gold loan interest rate",
      "gold loan per gram calculator",
      "gold loan comparison India",
    ],
  },
];

export const LOAN_TYPE_MAP: Record<LoanTypeId, LoanTypeConfig> = Object.fromEntries(
  LOAN_TYPES.map((t) => [t.id, t]),
) as Record<LoanTypeId, LoanTypeConfig>;

/**
 * The loan products offered in a country.
 *
 * Everything except gold is universal — the reducing-balance arithmetic and the
 * product itself both travel. Only availability is filtered here; the naming
 * ("home loan" vs "mortgage") is still Indian everywhere and is worth
 * localising separately.
 */
export function loanTypesFor(countryCode: string): LoanTypeConfig[] {
  return LOAN_TYPES.filter((t) => !t.availableIn || t.availableIn.includes(countryCode)).map((t) =>
    localiseLoanType(countryCode, t),
  );
}

/**
 * Returns the config under this market's name for the product.
 *
 * Applied here rather than at each call site so that everything downstream —
 * the header, the footer, the grids, the page titles — reads `label` and gets
 * the local word without knowing localisation exists. A US visitor sees
 * "Mortgage" where an Indian one sees "Home Loan", from the same component.
 *
 * Slug and rateSlug are deliberately untouched: they are URLs, already indexed,
 * and renaming them is a separate decision from renaming the product.
 */
export function localiseLoanType(countryCode: string, type: LoanTypeConfig): LoanTypeConfig {
  const { label, short } = loanName(countryCode, type.id, {
    label: type.label,
    short: type.shortLabel,
  });
  if (label === type.label && short === type.shortLabel) return type;
  return { ...type, label, shortLabel: short ?? type.shortLabel };
}

export function loanTypeAvailable(countryCode: string, type: LoanTypeConfig): boolean {
  return !type.availableIn || type.availableIn.includes(countryCode);
}

export function loanTypeBySlug(slug: string): LoanTypeConfig | undefined {
  return LOAN_TYPES.find((t) => t.slug === slug);
}

export function loanTypeByRateSlug(slug: string): LoanTypeConfig | undefined {
  return LOAN_TYPES.find((t) => t.rateSlug === slug);
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  emoji: string;
  caption: string;
}

export interface NavMenu {
  label: string;
  /** The hub page. The trigger is a real link, not a dead dropdown handle. */
  href: string;
  items: NavItem[];
  /** Extra destination pinned under the list. */
  footerLink: { label: string; href: string };
}

/**
 * The two header dropdowns.
 *
 * Every calculator is reachable from the header on every page, with its own
 * name as the anchor text. That sitewide repetition is what tells a search
 * engine these are the site's main destinations — before this, the eight
 * investment calculators were linked from one nav item and their own hub, and
 * nothing else on the site pointed at them.
 */
/**
 * Built per country rather than once at module load, so the menu carries the
 * local product names and the local word for a monthly payment — "Mortgage
 * Calculator" in the United States, "Home Loan EMI Calculator" in India — and
 * omits products that market does not offer.
 */
export function navMenus(countryCode: string): NavMenu[] {
  const words = instalmentWords(countryCode);

  return [
    {
      label: "Loan Calculators",
      href: "/",
      items: loanTypesFor(countryCode).map((t) => ({
        label: loanCalculatorTitle(countryCode, t.label),
        shortLabel: t.shortLabel,
        href: `/${t.slug}`,
        emoji: t.emoji,
        caption: `${words.sentence} calculator`,
      })),
      footerLink: { label: "Compare bank loans", href: "/compare-loans" },
    },
    {
      label: "Investment Calculators",
      href: "/investment-calculators",
      items: schemesFor(countryCode).map((s) => ({
        label: s.name,
        shortLabel: s.shortName,
        href: `/${s.slug}`,
        emoji: s.emoji,
        caption: s.rateIsStatutory ? "Government scheme" : "Projection tool",
      })),
      footerLink: { label: "Compare investments", href: "/compare-investments" },
    },
  ];
}

/**
 * Flat header items, shown after the two dropdowns.
 *
 * `perCountry` marks the ones that live under a country prefix. The guides and
 * the FAQ are shared across every market and keep their bare paths — those are
 * also the site's most valuable indexed URLs, and duplicating them per country
 * would be thin content competing with itself.
 */
export const PRIMARY_NAV = [
  { label: "Interest Rates", href: "/bank-interest-rates", perCountry: true },
  { label: "Compare Banks", href: "/compare-loans", perCountry: true },
  { label: "Guides", href: "/blog", perCountry: false },
  { label: "FAQ", href: "/faq", perCountry: false },
] as const;

export const LEGAL_NAV = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const;
