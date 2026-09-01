/**
 * Indian-locale number, currency and date formatting helpers.
 * Pure functions, safe on both server and client.
 */

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inr2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plain0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹12,34,567 — the default for every figure shown on screen. */
export function formatCurrency(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "—";
  return decimals > 0 ? inr2.format(value) : inr0.format(Math.round(value));
}

/** 12,34,567 without the currency symbol. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return plain0.format(Math.round(value));
}

/**
 * Compact Indian notation: ₹1.25 Cr, ₹45.5 L, ₹80 K.
 * Used on axis labels and dense stat tiles where the full figure will not fit.
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${trim(abs / 1_00_00_000)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${trim(abs / 1_00_000)} L`;
  if (abs >= 1_000) return `${sign}₹${trim(abs / 1_000)} K`;
  return `${sign}₹${Math.round(abs)}`;
}

function trim(n: number): string {
  return n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2).replace(/0$/, "");
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals).replace(/\.?0+$/, "")}%`;
}

/**
 * Interest rates, always to two decimals — 8.50% and 8.75% must line up in a
 * column, so trailing zeros are kept here unlike in formatPercent.
 */
export function formatRate(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
}

/** "3 yr 4 mo" — never "40 months", which nobody can picture. */
export function formatTenure(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "—";
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
}

/* ------------------------------------------------------------------ */
/* Number to words — Indian numbering system                           */
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

/**
 * 12500000 -> "One Crore Twenty Five Lakh".
 * Handles crore/lakh/thousand groupings and Arab (100 crore) for very large sums.
 */
export function numberToWords(value: number | string): string {
  const raw = typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : value;
  if (raw === null || raw === undefined || !Number.isFinite(raw)) return "";
  let num = Math.round(Math.abs(raw));
  if (num === 0) return "Zero";
  const sign = raw < 0 ? "Minus " : "";

  let out = "";
  if (num >= 1_00_00_00_000) {
    out += `${underThousand(Math.floor(num / 1_00_00_00_000))} Arab `;
    num %= 1_00_00_00_000;
  }
  if (num >= 1_00_00_000) {
    out += `${underThousand(Math.floor(num / 1_00_00_000))} Crore `;
    num %= 1_00_00_000;
  }
  if (num >= 1_00_000) {
    out += `${underThousand(Math.floor(num / 1_00_000))} Lakh `;
    num %= 1_00_000;
  }
  if (num >= 1_000) {
    out += `${underThousand(Math.floor(num / 1_000))} Thousand `;
    num %= 1_000;
  }
  if (num > 0) out += underThousand(num);

  return (sign + out).trim().replace(/\s+/g, " ");
}

/** "₹50 L" style shorthand for the slider tick labels. */
export function amountShorthand(value: number): string {
  return formatCompact(value);
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Month label for the Nth instalment counted from a start date. */
export function instalmentLabel(start: Date, monthOffset: number): string {
  const d = new Date(start.getFullYear(), start.getMonth() + monthOffset, 1);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function financialYearOf(start: Date, monthOffset: number): string {
  const d = new Date(start.getFullYear(), start.getMonth() + monthOffset, 1);
  // Indian FY runs April–March.
  const startYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function formatDate(input: string | number | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(input: string | number | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "3 hours ago" for the admin activity feed. */
export function timeAgo(input: string | number | Date): string {
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
  return formatDate(d);
}
