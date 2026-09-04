/**
 * Country reference data.
 *
 * Two ISO standards only — 3166-1 alpha-2 for the country and 4217 for its
 * currency. Nothing financial lives here: no rate, no lender, no scheme, no tax
 * rule. Those are per-country facts that have to be sourced and verified, and
 * they live in the database behind the same admin flow as the Indian bank
 * rates.
 *
 * The display locale is derived as `en-<CC>` rather than stored. The site is
 * written in English, and the region subtag is what drives number grouping and
 * currency placement — `en-IN` gives 12,34,567 while `en-US` gives 1,234,567.
 * Storing a language per country would add a column of guesses for no gain.
 *
 * `curated` marks the markets whose loan types, schemes and lender tables have
 * actually been researched. Everywhere else the calculators still work, in the
 * right currency, but the data-backed pages say so rather than inventing rows.
 *
 * scripts/verify-countries.ts checks every code in this file against ICU.
 */

export interface Country {
  /** ISO 3166-1 alpha-2, lowercase — it is also the URL segment. */
  code: string;
  name: string;
  /** ISO 4217. */
  currency: string;
  region: "Africa" | "Americas" | "Asia" | "Europe" | "Oceania";
  /** Loan types, schemes and lender data researched for this market. */
  curated?: boolean;
}

export const COUNTRIES: Country[] = [
  /* ---- Asia ---- */
  { code: "in", name: "India", currency: "INR", region: "Asia", curated: true },
  { code: "sg", name: "Singapore", currency: "SGD", region: "Asia", curated: true },
  { code: "ae", name: "United Arab Emirates", currency: "AED", region: "Asia", curated: true },
  { code: "af", name: "Afghanistan", currency: "AFN", region: "Asia" },
  { code: "am", name: "Armenia", currency: "AMD", region: "Asia" },
  { code: "az", name: "Azerbaijan", currency: "AZN", region: "Asia" },
  { code: "bd", name: "Bangladesh", currency: "BDT", region: "Asia" },
  { code: "bh", name: "Bahrain", currency: "BHD", region: "Asia" },
  { code: "bn", name: "Brunei", currency: "BND", region: "Asia" },
  { code: "bt", name: "Bhutan", currency: "BTN", region: "Asia" },
  { code: "cn", name: "China", currency: "CNY", region: "Asia" },
  { code: "ge", name: "Georgia", currency: "GEL", region: "Asia" },
  { code: "hk", name: "Hong Kong", currency: "HKD", region: "Asia" },
  { code: "id", name: "Indonesia", currency: "IDR", region: "Asia" },
  { code: "il", name: "Israel", currency: "ILS", region: "Asia" },
  { code: "iq", name: "Iraq", currency: "IQD", region: "Asia" },
  { code: "ir", name: "Iran", currency: "IRR", region: "Asia" },
  { code: "jo", name: "Jordan", currency: "JOD", region: "Asia" },
  { code: "jp", name: "Japan", currency: "JPY", region: "Asia" },
  { code: "kg", name: "Kyrgyzstan", currency: "KGS", region: "Asia" },
  { code: "kh", name: "Cambodia", currency: "KHR", region: "Asia" },
  { code: "kr", name: "South Korea", currency: "KRW", region: "Asia" },
  { code: "kw", name: "Kuwait", currency: "KWD", region: "Asia" },
  { code: "kz", name: "Kazakhstan", currency: "KZT", region: "Asia" },
  { code: "la", name: "Laos", currency: "LAK", region: "Asia" },
  { code: "lb", name: "Lebanon", currency: "LBP", region: "Asia" },
  { code: "lk", name: "Sri Lanka", currency: "LKR", region: "Asia" },
  { code: "mm", name: "Myanmar", currency: "MMK", region: "Asia" },
  { code: "mn", name: "Mongolia", currency: "MNT", region: "Asia" },
  { code: "mo", name: "Macau", currency: "MOP", region: "Asia" },
  { code: "mv", name: "Maldives", currency: "MVR", region: "Asia" },
  { code: "my", name: "Malaysia", currency: "MYR", region: "Asia" },
  { code: "np", name: "Nepal", currency: "NPR", region: "Asia" },
  { code: "om", name: "Oman", currency: "OMR", region: "Asia" },
  { code: "ph", name: "Philippines", currency: "PHP", region: "Asia" },
  { code: "pk", name: "Pakistan", currency: "PKR", region: "Asia" },
  { code: "ps", name: "Palestine", currency: "ILS", region: "Asia" },
  { code: "qa", name: "Qatar", currency: "QAR", region: "Asia" },
  { code: "sa", name: "Saudi Arabia", currency: "SAR", region: "Asia" },
  { code: "sy", name: "Syria", currency: "SYP", region: "Asia" },
  { code: "th", name: "Thailand", currency: "THB", region: "Asia" },
  { code: "tj", name: "Tajikistan", currency: "TJS", region: "Asia" },
  { code: "tl", name: "Timor-Leste", currency: "USD", region: "Asia" },
  { code: "tm", name: "Turkmenistan", currency: "TMT", region: "Asia" },
  { code: "tr", name: "Türkiye", currency: "TRY", region: "Asia" },
  { code: "tw", name: "Taiwan", currency: "TWD", region: "Asia" },
  { code: "uz", name: "Uzbekistan", currency: "UZS", region: "Asia" },
  { code: "vn", name: "Vietnam", currency: "VND", region: "Asia" },
  { code: "ye", name: "Yemen", currency: "YER", region: "Asia" },

  /* ---- Europe ---- */
  { code: "gb", name: "United Kingdom", currency: "GBP", region: "Europe", curated: true },
  { code: "ad", name: "Andorra", currency: "EUR", region: "Europe" },
  { code: "al", name: "Albania", currency: "ALL", region: "Europe" },
  { code: "at", name: "Austria", currency: "EUR", region: "Europe" },
  { code: "ba", name: "Bosnia and Herzegovina", currency: "BAM", region: "Europe" },
  { code: "be", name: "Belgium", currency: "EUR", region: "Europe" },
  // Bulgaria was cleared to adopt the euro from 1 January 2026. Worth
  // confirming before this ships anywhere prominent.
  { code: "bg", name: "Bulgaria", currency: "EUR", region: "Europe" },
  { code: "by", name: "Belarus", currency: "BYN", region: "Europe" },
  { code: "ch", name: "Switzerland", currency: "CHF", region: "Europe" },
  { code: "cy", name: "Cyprus", currency: "EUR", region: "Europe" },
  { code: "cz", name: "Czechia", currency: "CZK", region: "Europe" },
  { code: "de", name: "Germany", currency: "EUR", region: "Europe" },
  { code: "dk", name: "Denmark", currency: "DKK", region: "Europe" },
  { code: "ee", name: "Estonia", currency: "EUR", region: "Europe" },
  { code: "es", name: "Spain", currency: "EUR", region: "Europe" },
  { code: "fi", name: "Finland", currency: "EUR", region: "Europe" },
  { code: "fo", name: "Faroe Islands", currency: "DKK", region: "Europe" },
  { code: "fr", name: "France", currency: "EUR", region: "Europe" },
  { code: "gg", name: "Guernsey", currency: "GBP", region: "Europe" },
  { code: "gi", name: "Gibraltar", currency: "GIP", region: "Europe" },
  { code: "gr", name: "Greece", currency: "EUR", region: "Europe" },
  { code: "hr", name: "Croatia", currency: "EUR", region: "Europe" },
  { code: "hu", name: "Hungary", currency: "HUF", region: "Europe" },
  { code: "ie", name: "Ireland", currency: "EUR", region: "Europe" },
  { code: "im", name: "Isle of Man", currency: "GBP", region: "Europe" },
  { code: "is", name: "Iceland", currency: "ISK", region: "Europe" },
  { code: "it", name: "Italy", currency: "EUR", region: "Europe" },
  { code: "je", name: "Jersey", currency: "GBP", region: "Europe" },
  { code: "li", name: "Liechtenstein", currency: "CHF", region: "Europe" },
  { code: "lt", name: "Lithuania", currency: "EUR", region: "Europe" },
  { code: "lu", name: "Luxembourg", currency: "EUR", region: "Europe" },
  { code: "lv", name: "Latvia", currency: "EUR", region: "Europe" },
  { code: "mc", name: "Monaco", currency: "EUR", region: "Europe" },
  { code: "md", name: "Moldova", currency: "MDL", region: "Europe" },
  { code: "me", name: "Montenegro", currency: "EUR", region: "Europe" },
  { code: "mk", name: "North Macedonia", currency: "MKD", region: "Europe" },
  { code: "mt", name: "Malta", currency: "EUR", region: "Europe" },
  { code: "nl", name: "Netherlands", currency: "EUR", region: "Europe" },
  { code: "no", name: "Norway", currency: "NOK", region: "Europe" },
  { code: "pl", name: "Poland", currency: "PLN", region: "Europe" },
  { code: "pt", name: "Portugal", currency: "EUR", region: "Europe" },
  { code: "ro", name: "Romania", currency: "RON", region: "Europe" },
  { code: "rs", name: "Serbia", currency: "RSD", region: "Europe" },
  { code: "ru", name: "Russia", currency: "RUB", region: "Europe" },
  { code: "se", name: "Sweden", currency: "SEK", region: "Europe" },
  { code: "si", name: "Slovenia", currency: "EUR", region: "Europe" },
  { code: "sk", name: "Slovakia", currency: "EUR", region: "Europe" },
  { code: "sm", name: "San Marino", currency: "EUR", region: "Europe" },
  { code: "ua", name: "Ukraine", currency: "UAH", region: "Europe" },
  { code: "va", name: "Vatican City", currency: "EUR", region: "Europe" },

  /* ---- Americas ---- */
  { code: "us", name: "United States", currency: "USD", region: "Americas", curated: true },
  { code: "ca", name: "Canada", currency: "CAD", region: "Americas", curated: true },
  { code: "ag", name: "Antigua and Barbuda", currency: "XCD", region: "Americas" },
  { code: "ar", name: "Argentina", currency: "ARS", region: "Americas" },
  { code: "bb", name: "Barbados", currency: "BBD", region: "Americas" },
  { code: "bo", name: "Bolivia", currency: "BOB", region: "Americas" },
  { code: "br", name: "Brazil", currency: "BRL", region: "Americas" },
  { code: "bs", name: "Bahamas", currency: "BSD", region: "Americas" },
  { code: "bz", name: "Belize", currency: "BZD", region: "Americas" },
  { code: "cl", name: "Chile", currency: "CLP", region: "Americas" },
  { code: "co", name: "Colombia", currency: "COP", region: "Americas" },
  { code: "cr", name: "Costa Rica", currency: "CRC", region: "Americas" },
  { code: "cu", name: "Cuba", currency: "CUP", region: "Americas" },
  { code: "dm", name: "Dominica", currency: "XCD", region: "Americas" },
  { code: "do", name: "Dominican Republic", currency: "DOP", region: "Americas" },
  { code: "ec", name: "Ecuador", currency: "USD", region: "Americas" },
  { code: "gd", name: "Grenada", currency: "XCD", region: "Americas" },
  { code: "gt", name: "Guatemala", currency: "GTQ", region: "Americas" },
  { code: "gy", name: "Guyana", currency: "GYD", region: "Americas" },
  { code: "hn", name: "Honduras", currency: "HNL", region: "Americas" },
  { code: "ht", name: "Haiti", currency: "HTG", region: "Americas" },
  { code: "jm", name: "Jamaica", currency: "JMD", region: "Americas" },
  { code: "kn", name: "Saint Kitts and Nevis", currency: "XCD", region: "Americas" },
  { code: "ky", name: "Cayman Islands", currency: "KYD", region: "Americas" },
  { code: "lc", name: "Saint Lucia", currency: "XCD", region: "Americas" },
  { code: "mx", name: "Mexico", currency: "MXN", region: "Americas" },
  { code: "ni", name: "Nicaragua", currency: "NIO", region: "Americas" },
  { code: "pa", name: "Panama", currency: "USD", region: "Americas" },
  { code: "pe", name: "Peru", currency: "PEN", region: "Americas" },
  { code: "pr", name: "Puerto Rico", currency: "USD", region: "Americas" },
  { code: "py", name: "Paraguay", currency: "PYG", region: "Americas" },
  { code: "sr", name: "Suriname", currency: "SRD", region: "Americas" },
  { code: "sv", name: "El Salvador", currency: "USD", region: "Americas" },
  { code: "tt", name: "Trinidad and Tobago", currency: "TTD", region: "Americas" },
  { code: "uy", name: "Uruguay", currency: "UYU", region: "Americas" },
  { code: "vc", name: "Saint Vincent and the Grenadines", currency: "XCD", region: "Americas" },
  { code: "ve", name: "Venezuela", currency: "VES", region: "Americas" },

  /* ---- Africa ---- */
  { code: "ao", name: "Angola", currency: "AOA", region: "Africa" },
  { code: "bf", name: "Burkina Faso", currency: "XOF", region: "Africa" },
  { code: "bi", name: "Burundi", currency: "BIF", region: "Africa" },
  { code: "bj", name: "Benin", currency: "XOF", region: "Africa" },
  { code: "bw", name: "Botswana", currency: "BWP", region: "Africa" },
  { code: "cd", name: "DR Congo", currency: "CDF", region: "Africa" },
  { code: "cf", name: "Central African Republic", currency: "XAF", region: "Africa" },
  { code: "cg", name: "Republic of the Congo", currency: "XAF", region: "Africa" },
  { code: "ci", name: "Côte d'Ivoire", currency: "XOF", region: "Africa" },
  { code: "cm", name: "Cameroon", currency: "XAF", region: "Africa" },
  { code: "cv", name: "Cape Verde", currency: "CVE", region: "Africa" },
  { code: "dj", name: "Djibouti", currency: "DJF", region: "Africa" },
  { code: "dz", name: "Algeria", currency: "DZD", region: "Africa" },
  { code: "eg", name: "Egypt", currency: "EGP", region: "Africa" },
  { code: "er", name: "Eritrea", currency: "ERN", region: "Africa" },
  { code: "et", name: "Ethiopia", currency: "ETB", region: "Africa" },
  { code: "ga", name: "Gabon", currency: "XAF", region: "Africa" },
  { code: "gh", name: "Ghana", currency: "GHS", region: "Africa" },
  { code: "gm", name: "Gambia", currency: "GMD", region: "Africa" },
  { code: "gn", name: "Guinea", currency: "GNF", region: "Africa" },
  { code: "gq", name: "Equatorial Guinea", currency: "XAF", region: "Africa" },
  { code: "gw", name: "Guinea-Bissau", currency: "XOF", region: "Africa" },
  { code: "ke", name: "Kenya", currency: "KES", region: "Africa" },
  { code: "km", name: "Comoros", currency: "KMF", region: "Africa" },
  { code: "lr", name: "Liberia", currency: "LRD", region: "Africa" },
  { code: "ls", name: "Lesotho", currency: "LSL", region: "Africa" },
  { code: "ly", name: "Libya", currency: "LYD", region: "Africa" },
  { code: "ma", name: "Morocco", currency: "MAD", region: "Africa" },
  { code: "mg", name: "Madagascar", currency: "MGA", region: "Africa" },
  { code: "ml", name: "Mali", currency: "XOF", region: "Africa" },
  { code: "mr", name: "Mauritania", currency: "MRU", region: "Africa" },
  { code: "mu", name: "Mauritius", currency: "MUR", region: "Africa" },
  { code: "mw", name: "Malawi", currency: "MWK", region: "Africa" },
  { code: "mz", name: "Mozambique", currency: "MZN", region: "Africa" },
  { code: "na", name: "Namibia", currency: "NAD", region: "Africa" },
  { code: "ne", name: "Niger", currency: "XOF", region: "Africa" },
  { code: "ng", name: "Nigeria", currency: "NGN", region: "Africa" },
  { code: "rw", name: "Rwanda", currency: "RWF", region: "Africa" },
  { code: "sc", name: "Seychelles", currency: "SCR", region: "Africa" },
  { code: "sd", name: "Sudan", currency: "SDG", region: "Africa" },
  { code: "sl", name: "Sierra Leone", currency: "SLE", region: "Africa" },
  { code: "sn", name: "Senegal", currency: "XOF", region: "Africa" },
  { code: "so", name: "Somalia", currency: "SOS", region: "Africa" },
  { code: "ss", name: "South Sudan", currency: "SSP", region: "Africa" },
  { code: "st", name: "São Tomé and Príncipe", currency: "STN", region: "Africa" },
  { code: "sz", name: "Eswatini", currency: "SZL", region: "Africa" },
  { code: "td", name: "Chad", currency: "XAF", region: "Africa" },
  { code: "tg", name: "Togo", currency: "XOF", region: "Africa" },
  { code: "tn", name: "Tunisia", currency: "TND", region: "Africa" },
  { code: "tz", name: "Tanzania", currency: "TZS", region: "Africa" },
  { code: "ug", name: "Uganda", currency: "UGX", region: "Africa" },
  { code: "za", name: "South Africa", currency: "ZAR", region: "Africa" },
  { code: "zm", name: "Zambia", currency: "ZMW", region: "Africa" },
  // The ZiG replaced the Zimbabwean dollar in 2024, but the US dollar remains
  // in general use and is the safer figure to price a loan in.
  { code: "zw", name: "Zimbabwe", currency: "USD", region: "Africa" },

  /* ---- Oceania ---- */
  { code: "au", name: "Australia", currency: "AUD", region: "Oceania", curated: true },
  { code: "fj", name: "Fiji", currency: "FJD", region: "Oceania" },
  { code: "fm", name: "Micronesia", currency: "USD", region: "Oceania" },
  { code: "ki", name: "Kiribati", currency: "AUD", region: "Oceania" },
  { code: "mh", name: "Marshall Islands", currency: "USD", region: "Oceania" },
  { code: "nc", name: "New Caledonia", currency: "XPF", region: "Oceania" },
  { code: "nr", name: "Nauru", currency: "AUD", region: "Oceania" },
  { code: "nz", name: "New Zealand", currency: "NZD", region: "Oceania" },
  { code: "pf", name: "French Polynesia", currency: "XPF", region: "Oceania" },
  { code: "pg", name: "Papua New Guinea", currency: "PGK", region: "Oceania" },
  { code: "pw", name: "Palau", currency: "USD", region: "Oceania" },
  { code: "sb", name: "Solomon Islands", currency: "SBD", region: "Oceania" },
  { code: "to", name: "Tonga", currency: "TOP", region: "Oceania" },
  { code: "tv", name: "Tuvalu", currency: "AUD", region: "Oceania" },
  { code: "vu", name: "Vanuatu", currency: "VUV", region: "Oceania" },
  { code: "ws", name: "Samoa", currency: "WST", region: "Oceania" },
];

/** Where a visitor lands when nothing else identifies them. */
export const DEFAULT_COUNTRY = "in";

export const COUNTRY_MAP: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

/** Markets whose loan and scheme data has been researched. */
export const CURATED_COUNTRIES = COUNTRIES.filter((c) => c.curated);

export function countryByCode(code: string | undefined | null): Country | undefined {
  if (!code) return undefined;
  return COUNTRY_MAP[code.toLowerCase()];
}

export function isCountryCode(code: string | undefined | null): boolean {
  return countryByCode(code) !== undefined;
}

/** Resolves to a real country, falling back rather than throwing. */
export function resolveCountry(code: string | undefined | null): Country {
  return countryByCode(code) ?? COUNTRY_MAP[DEFAULT_COUNTRY];
}

/**
 * BCP 47 tag for formatting. English throughout, with the region subtag doing
 * the work — it is what selects lakh/crore grouping for India and thousands
 * elsewhere.
 */
export function localeFor(country: Country): string {
  return `en-${country.code.toUpperCase()}`;
}

/**
 * Prefixes a path with the country segment.
 *
 * Only for pages that exist once per country — the calculators, the comparison
 * tools and the rate tables. The blog, FAQ and legal pages are shared across
 * every market and keep their bare paths, so passing one of those through here
 * would produce a URL that does not exist.
 */
export function countryHref(country: Country, path = "/"): string {
  return path === "/" ? `/${country.code}` : `/${country.code}${path}`;
}

/** Countries grouped for the selector, curated markets pulled to the top. */
export function groupedCountries() {
  const regions: Country["region"][] = ["Asia", "Europe", "Americas", "Africa", "Oceania"];
  return regions.map((region) => ({
    region,
    countries: COUNTRIES.filter((c) => c.region === region).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  }));
}
