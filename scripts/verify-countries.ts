/**
 * Validates lib/countries.ts against the runtime's own ICU data.
 *
 *   npm run verify:countries
 *
 * A hand-written table of ~190 countries is exactly the kind of thing that
 * looks right and contains three typos. This checks what can be checked
 * mechanically:
 *
 *   - every country code is a real ISO 3166-1 region ICU knows;
 *   - the name matches ICU's own name for that region, or is flagged so a
 *     deliberate difference is visible rather than accidental;
 *   - every currency is a real ISO 4217 code that Intl can actually format;
 *   - no duplicate codes.
 *
 * What it cannot check is whether a country's currency is the *right* one —
 * only that the code exists. Those are noted in the file where uncertain.
 */
import { COUNTRIES, localeFor } from "../lib/countries";

let failures = 0;
let warnings = 0;

function fail(msg: string) {
  failures++;
  console.log(`  \x1b[31mFAIL\x1b[0m  ${msg}`);
}

function warn(msg: string) {
  warnings++;
  console.log(`  \x1b[33mNOTE\x1b[0m  ${msg}`);
}

const head = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m`);

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const knownCurrencies = new Set(
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("currency") : [],
);

head(`Checking ${COUNTRIES.length} countries`);

/* ---- duplicates ---- */
const seen = new Set<string>();
for (const c of COUNTRIES) {
  if (seen.has(c.code)) fail(`duplicate country code: ${c.code}`);
  seen.add(c.code);
}

/* ---- codes, names, currencies ---- */
for (const c of COUNTRIES) {
  const upper = c.code.toUpperCase();

  if (!/^[a-z]{2}$/.test(c.code)) {
    fail(`${c.code} is not a two-letter lowercase code`);
    continue;
  }

  let icuName: string | undefined;
  try {
    icuName = regionNames.of(upper);
  } catch {
    icuName = undefined;
  }

  if (!icuName || icuName === upper) {
    fail(`${c.code} (${c.name}) — ICU does not recognise this region code`);
  } else if (icuName !== c.name) {
    // Not an error: "Türkiye" vs ICU's spelling, or a deliberately shorter
    // label like "DR Congo". Surfaced so a genuine mistake cannot hide.
    warn(`${c.code}: file says "${c.name}", ICU says "${icuName}"`);
  }

  if (!/^[A-Z]{3}$/.test(c.currency)) {
    fail(`${c.code}: "${c.currency}" is not a three-letter currency code`);
    continue;
  }

  if (knownCurrencies.size > 0 && !knownCurrencies.has(c.currency)) {
    fail(`${c.code}: ${c.currency} is not a currency this runtime knows`);
    continue;
  }

  // The real test: can we actually format money for this country?
  try {
    const formatted = new Intl.NumberFormat(localeFor(c), {
      style: "currency",
      currency: c.currency,
      maximumFractionDigits: 0,
    }).format(1234567);
    if (!formatted || /NaN/.test(formatted)) {
      fail(`${c.code}: formatting produced "${formatted}"`);
    }
  } catch (error) {
    fail(`${c.code}: Intl threw — ${(error as Error).message}`);
  }
}

/* ---- a spot check that region grouping actually differs ---- */
head("Number grouping");
const samples = [
  ["in", "INR"],
  ["us", "USD"],
  ["gb", "GBP"],
  ["de", "EUR"],
  ["jp", "JPY"],
];
for (const [code, currency] of samples) {
  const out = new Intl.NumberFormat(`en-${code.toUpperCase()}`, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(1234567);
  console.log(`  ${code}  1234567 -> ${out}`);
}

const indian = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(1234567);
if (!indian.includes("12,34,567")) {
  fail(`en-IN did not produce lakh grouping — got ${indian}`);
} else {
  console.log("  \x1b[32mPASS\x1b[0m  en-IN uses lakh/crore grouping");
}

console.log(
  failures === 0
    ? `\n\x1b[32mAll ${COUNTRIES.length} countries valid.\x1b[0m${warnings ? ` ${warnings} name difference(s) noted above.` : ""}\n`
    : `\n\x1b[31m${failures} failure(s).\x1b[0m\n`,
);
process.exit(failures === 0 ? 0 : 1);
