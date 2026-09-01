/**
 * Central site configuration: canonical URLs, SEO keyword sets, navigation and
 * social profiles. Everything that is repeated across `<head>` tags, structured
 * data and the footer is defined exactly once here.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://loancalculatorpro.in";

export const SITE = {
  name: "LoanCalc Pro",
  legalName: "LoanCalc Pro",
  domain: "loancalculatorpro.in",
  url: SITE_URL,
  tagline: "India's most detailed EMI & loan comparison calculator",
  description:
    "Free advanced EMI calculator for home, car, personal, business, education and gold loans. Model part-payments, compare banks side by side, and download a full amortisation schedule. 100% private — everything runs in your browser.",
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

/** Head terms that belong on nearly every page. */
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

export const ALL_KEYWORDS = [...CORE_KEYWORDS, ...INTENT_KEYWORDS];

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
      "Personal loans carry the widest rate spread of any product in India. Compare offers properly — including the processing fee — before you sign.",
    keywords: [
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
      "education loan EMI calculator",
      "student loan calculator India",
      "abroad education loan calculator",
      "education loan interest rates",
      "education loan moratorium",
    ],
  },
  {
    id: "gold",
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

export function loanTypeBySlug(slug: string): LoanTypeConfig | undefined {
  return LOAN_TYPES.find((t) => t.slug === slug);
}

export function loanTypeByRateSlug(slug: string): LoanTypeConfig | undefined {
  return LOAN_TYPES.find((t) => t.rateSlug === slug);
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const PRIMARY_NAV = [
  { label: "Calculator", href: "/" },
  { label: "Compare Banks", href: "/compare-loans" },
  { label: "Interest Rates", href: "/bank-interest-rates" },
  { label: "Guides", href: "/blog" },
  { label: "FAQ", href: "/faq" },
] as const;

export const LEGAL_NAV = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const;
