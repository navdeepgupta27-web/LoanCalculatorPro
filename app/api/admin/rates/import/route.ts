import { NextResponse } from "next/server";

import { isResponse, requireAdminApi } from "@/lib/auth";
import { all, run } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LOAN_TYPES = new Set(["home", "car", "personal", "business", "education", "gold"]);
const CATEGORIES = new Set(["public", "private", "nbfc", "sfb", "housing"]);

const REQUIRED = ["bank", "loan_type", "min_rate"];

/**
 * Bulk rate import.
 *
 * Expected header row (order does not matter; extra columns are ignored):
 *   bank, category, loan_type, min_rate, max_rate, processing_fee,
 *   max_tenure_years, max_amount, source_url, effective_date, verified, notes
 *
 * Unknown banks are created on the fly, so a single paste can populate an
 * empty table. Rows are validated individually: one bad row is reported and
 * skipped rather than failing the whole import.
 */

/** Minimal RFC-4180 parser — handles quoted fields containing commas. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function num(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  let csv: string;
  try {
    const body = await request.json();
    csv = String(body?.csv ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!csv.trim()) {
    return NextResponse.json({ ok: false, error: "Paste some CSV first." }, { status: 400 });
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Need a header row plus at least one data row." },
      { status: 400 },
    );
  }

  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const missing = REQUIRED.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Missing required column(s): ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const col = (r: string[], name: string): string | undefined => {
    const i = header.indexOf(name);
    return i === -1 ? undefined : r[i]?.trim();
  };

  let imported = 0;
  let banksCreated = 0;
  const errors: string[] = [];

  try {
    // Cache the bank lookup so a 200-row import is not 200 extra queries.
    const existing = await all<{ id: number; slug: string }>(`SELECT id, slug FROM banks`);
    const bankBySlug = new Map(existing.map((b) => [b.slug, b.id]));

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const lineNo = i + 1;

      const bankName = col(r, "bank");
      const loanType = col(r, "loan_type")?.toLowerCase();

      if (!bankName) {
        errors.push(`Line ${lineNo}: missing bank name`);
        continue;
      }
      if (!loanType || !LOAN_TYPES.has(loanType)) {
        errors.push(`Line ${lineNo}: loan_type must be one of ${[...LOAN_TYPES].join(", ")}`);
        continue;
      }

      const slug = slugify(bankName);
      let bankId = bankBySlug.get(slug);

      if (!bankId) {
        const category = col(r, "category")?.toLowerCase();
        const result = await run(
          `INSERT INTO banks (slug, name, short_name, category) VALUES (?, ?, ?, ?)`,
          [
            slug,
            bankName,
            bankName.split(/\s+/)[0].slice(0, 12),
            category && CATEGORIES.has(category) ? category : "private",
          ],
        );
        bankId = Number(result.lastInsertRowid);
        bankBySlug.set(slug, bankId);
        banksCreated++;
      }

      const minRate = num(col(r, "min_rate"));
      const sourceUrl = col(r, "source_url") || null;
      const verifiedFlag = (col(r, "verified") ?? "").toLowerCase();
      const wantsVerified = ["1", "true", "yes", "y"].includes(verifiedFlag);

      if (minRate == null) {
        errors.push(`Line ${lineNo}: min_rate is not a number`);
        continue;
      }

      // Same rule as the single-rate editor: no source, no verified badge.
      const verified = wantsVerified && sourceUrl ? 1 : 0;
      if (wantsVerified && !sourceUrl) {
        errors.push(`Line ${lineNo}: marked verified but has no source_url — imported unverified`);
      }

      await run(
        `INSERT INTO rates
           (bank_id, loan_type, min_rate, max_rate, processing_fee, max_tenure_years,
            max_amount, source_url, effective_date, verified, notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT (bank_id, loan_type) DO UPDATE SET
           min_rate = excluded.min_rate, max_rate = excluded.max_rate,
           processing_fee = excluded.processing_fee,
           max_tenure_years = excluded.max_tenure_years,
           max_amount = excluded.max_amount, source_url = excluded.source_url,
           effective_date = excluded.effective_date, verified = excluded.verified,
           notes = excluded.notes, updated_at = datetime('now')`,
        [
          bankId,
          loanType,
          minRate,
          num(col(r, "max_rate")),
          col(r, "processing_fee") || null,
          num(col(r, "max_tenure_years")),
          num(col(r, "max_amount")),
          sourceUrl,
          col(r, "effective_date") || new Date().toISOString().slice(0, 10),
          verified,
          col(r, "notes") || null,
        ],
      );

      imported++;
    }

    return NextResponse.json({
      ok: true,
      imported,
      banksCreated,
      skipped: rows.length - 1 - imported,
      errors: errors.slice(0, 25),
    });
  } catch (err) {
    console.error("[admin/rates/import] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Import failed partway through. Check the server logs." },
      { status: 500 },
    );
  }
}
