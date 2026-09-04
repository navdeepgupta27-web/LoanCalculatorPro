/**
 * Number, currency and date formatting.
 *
 * Everything is built per country by `createFormatters()`. The site started
 * India-only with `en-IN` and the rupee hardcoded in a dozen places; those
 * choices now come from the country, so the same calculator renders ₹12,34,567
 * for a visitor in India and $1,234,567 for one in the United States without
 * any component knowing which.
 *
 * The named exports at the bottom are bound to India and exist so that call
 * sites can migrate one at a time rather than in a single sweep. New code
 * should take formatters from `useFormat()` (client) or `createFormatters()`
 * (server) instead.
 *
 * Pure functions throughout — safe on both server and client.
 */

import {
  COUNTRY_MAP,
  DEFAULT_COUNTRY,
  localeFor,
  resolveCountry,
  type Country,
} from "./countries";

/**
 * Where "lakh" and "crore" are the natural units.
 *
 * ICU already applies the grouping for en-IN, but the compact shorthand and
 * the number-to-words conversion are ours, so they need to be told. This is
 * deliberately a short list of places where the convention is genuinely in
 * everyday use, not every country in the region.
 */
const SOUTH_ASIAN_SCALE = new Set(["in", "pk", "bd", "np", "lk", "bt"]);

export interface Formatters {
  country: Country;
  locale: string;
  /** The currency symbol alone, e.g. "₹" or "$". */
  symbol: string;
  /** Full amount with the currency symbol. */
  currency(value: number, decimals?: number): string;
  /** Grouped number, no symbol. */
  number(value: number): string;
  /** Axis and tile shorthand: ₹45.5 L, $250K, £1.2m. */
  compact(value: number): string;
  /** Amount spelled out, in the scale the country actually uses. */
  words(value: number | string): string;
  percent(value: number, decimals?: number): string;
  rate(value: number): string;
  tenure(months: number): string;
  date(input: string | number | Date): string;
  dateTime(input: string | number | Date): string;
  timeAgo(input: string | number | Date): string;
  instalmentLabel(start: Date, monthOffset: number): string;
  /** Groups the schedule by year — a tax year where one clearly applies. */
  yearLabel(start: Date, monthOffset: number): string;
}

/* ------------------------------------------------------------------ */
/* Number to words                                                     */
/* ------------------------------------------------------------------ */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function underThousand(n: number): string {
  let out = "";
  if (n >= 100) {
    out += `${ONES[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    out += `${TENS[Math.floor(n / 10)]} `;
    n %= 10;
  }
  if (n > 0) out += `${ONES[n]} `;
  return out.trim();
}

/** Descending scale steps, applied largest first. */
type Scale = [value: number, label: string][];

const SOUTH_ASIAN_UNITS: Scale = [
  [1_00_00_00_000, "Arab"],
  [1_00_00_000, "Crore"],
  [1_00_000, "Lakh"],
  [1_000, "Thousand"],
];

const WESTERN_UNITS: Scale = [
  [1_000_000_000_000, "Trillion"],
  [1_000_000_000, "Billion"],
  [1_000_000, "Million"],
  [1_000, "Thousand"],
];

function toWords(value: number | string, units: Scale): string {
  const raw = typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : value;
  if (raw === null || raw === undefined || !Number.isFinite(raw)) return "";

  let num = Math.round(Math.abs(raw));
  if (num === 0) return "Zero";
  const sign = raw < 0 ? "Minus " : "";

  let out = "";
  for (const [size, label] of units) {
    if (num >= size) {
      out += `${underThousand(Math.floor(num / size))} ${label} `;
      num %= size;
    }
  }
  if (num > 0) out += underThousand(num);

  return (sign + out).trim().replace(/\s+/g, " ");
}

/* ------------------------------------------------------------------ */
/* Factory                                                             */
/* ------------------------------------------------------------------ */

const cache = new Map<string, Formatters>();

function trim(n: number): string {
  return n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2).replace(/0$/, "");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function createFormatters(input: Country | string): Formatters {
  const country = typeof input === "string" ? resolveCountry(input) : input;
  const hit = cache.get(country.code);
  if (hit) return hit;

  const locale = localeFor(country);
  const currencyCode = country.currency;
  const southAsian = SOUTH_ASIAN_SCALE.has(country.code);

  const money0 = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  });
  const money2 = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const compactMoney = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const symbol =
    money0.formatToParts(0).find((p) => p.type === "currency")?.value ?? currencyCode;

  const formatters: Formatters = {
    country,
    locale,
    symbol,

    currency(value, decimals = 0) {
      if (!Number.isFinite(value)) return "—";
      return decimals > 0 ? money2.format(value) : money0.format(Math.round(value));
    },

    number(value) {
      if (!Number.isFinite(value)) return "—";
      return plain.format(Math.round(value));
    },

    compact(value) {
      if (!Number.isFinite(value)) return "—";
      const abs = Math.abs(value);
      const sign = value < 0 ? "-" : "";

      // Kept hand-rolled for the lakh/crore scale: ICU renders 12.5 crore as
      // "₹12.5Cr" but 1250 crore as "₹1.25KCr", which is not a thing anyone
      // writes. Everywhere else ICU's compact notation is exactly right and is
      // already localised — "$250K", "£250k", "¥250万" — so it is used as is.
      if (southAsian) {
        if (abs >= 1_00_00_000) return `${sign}${symbol}${trim(abs / 1_00_00_000)} Cr`;
        if (abs >= 1_00_000) return `${sign}${symbol}${trim(abs / 1_00_000)} L`;
        if (abs >= 1_000) return `${sign}${symbol}${trim(abs / 1_000)} K`;
        return `${sign}${symbol}${Math.round(abs)}`;
      }

      return compactMoney.format(value);
    },

    words(value) {
      return toWords(value, southAsian ? SOUTH_ASIAN_UNITS : WESTERN_UNITS);
    },

    percent(value, decimals = 2) {
      if (!Number.isFinite(value)) return "—";
      return `${value.toFixed(decimals).replace(/\.?0+$/, "")}%`;
    },

    rate(value) {
      if (!Number.isFinite(value)) return "—";
      return `${value.toFixed(2)}%`;
    },

    tenure(months) {
      if (!Number.isFinite(months) || months <= 0) return "—";
      const y = Math.floor(months / 12);
      const m = Math.round(months % 12);
      if (y === 0) return `${m} mo`;
      if (m === 0) return `${y} yr`;
      return `${y} yr ${m} mo`;
    },

    date(input) {
      const d = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    },

    dateTime(input) {
      const d = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    timeAgo(input) {
      const d = input instanceof Date ? input : new Date(input);
      const secs = Math.floor((Date.now() - d.getTime()) / 1000);
      if (!Number.isFinite(secs)) return "—";
      if (secs < 60) return "just now";
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days}d ago`;
      return formatters.date(d);
    },

    instalmentLabel(start, monthOffset) {
      const d = new Date(start.getFullYear(), start.getMonth() + monthOffset, 1);
      return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    },

    yearLabel(start, monthOffset) {
      const d = new Date(start.getFullYear(), start.getMonth() + monthOffset, 1);
      // India's financial year runs April to March, and the schedule has always
      // been grouped that way. Elsewhere a tax year either matches the calendar
      // or is close enough that inventing a split would mislead more than it
      // helps, so those group by calendar year.
      if (country.code === "in") {
        const startYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
        return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
      }
      return String(d.getFullYear());
    },
  };

  cache.set(country.code, formatters);
  return formatters;
}

/* ------------------------------------------------------------------ */
/* India-bound exports                                                 */
/* ------------------------------------------------------------------ */

/**
 * The original API, still pointing at India.
 *
 * These keep every existing call site working while pages are migrated to
 * country-aware formatters one at a time. A component still importing these is
 * one that has not been migrated yet — it will show rupees to everyone.
 */
const india = createFormatters(COUNTRY_MAP[DEFAULT_COUNTRY]);

export const formatCurrency = india.currency;
export const formatNumber = india.number;
export const formatCompact = india.compact;
export const numberToWords = india.words;
export const formatPercent = india.percent;
export const formatRate = india.rate;
export const formatTenure = india.tenure;
export const formatDate = india.date;
export const formatDateTime = india.dateTime;
export const timeAgo = india.timeAgo;
export const instalmentLabel = india.instalmentLabel;
export const financialYearOf = india.yearLabel;

/** "₹50 L" style shorthand for slider tick labels. */
export const amountShorthand = india.compact;
