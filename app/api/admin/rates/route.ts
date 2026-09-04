import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isResponse, requireAdminApi } from "@/lib/auth";
import { one, run } from "@/lib/db";
import { CURATED_COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { LOAN_TYPE_MAP, type LoanTypeId } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * The public rate pages are statically generated with a one-hour revalidate, so
 * without this an edit sits invisible until the window expires. Called after
 * every write so a rate you just published shows up immediately.
 */
function refreshRatePages(country: string, loanType?: LoanTypeId) {
  // Every path carries the country segment now that these pages live under it.
  revalidatePath(`/${country}/bank-interest-rates`);
  // The comparison tool prefills from verified rates.
  revalidatePath(`/${country}/compare-loans`);

  if (loanType) {
    revalidatePath(`/${country}/bank-interest-rates/${LOAN_TYPE_MAP[loanType].rateSlug}`);
  } else {
    for (const type of Object.values(LOAN_TYPE_MAP)) {
      revalidatePath(`/${country}/bank-interest-rates/${type.rateSlug}`);
    }
  }
}

const nullableNumber = z.union([z.number(), z.null()]).optional();
const nullableString = z.union([z.string().max(500), z.null()]).optional();

const UpsertSchema = z.object({
  country: z.string().refine((c) => CURATED_COUNTRIES.some((x) => x.code === c),
    "Rates can only be recorded for a market we have set up."),
  bankId: z.number().int().positive(),
  loanType: z.enum(["home", "car", "personal", "business", "education", "gold"]),
  minRate: nullableNumber,
  maxRate: nullableNumber,
  processingFee: nullableString,
  maxTenureYears: nullableNumber,
  maxAmount: nullableNumber,
  sourceUrl: nullableString,
  effectiveDate: nullableString,
  verified: z.boolean().optional(),
  notes: nullableString,
});

export async function PUT(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  const parsed = UpsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const d = parsed.data;

  // A rate cannot be marked verified without both a figure and a source to
  // check it against — that pairing is the whole point of the flag.
  const verified = d.verified && d.minRate != null && !!d.sourceUrl ? 1 : 0;

  if (d.verified && !verified) {
    return NextResponse.json(
      {
        ok: false,
        error: "To mark a rate verified it needs both a minimum rate and a source URL.",
      },
      { status: 400 },
    );
  }

  try {
    await run(
      `INSERT INTO rates
         (bank_id, country, loan_type, min_rate, max_rate, processing_fee, max_tenure_years,
          max_amount, source_url, effective_date, verified, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT (bank_id, loan_type) DO UPDATE SET
         min_rate         = excluded.min_rate,
         max_rate         = excluded.max_rate,
         processing_fee   = excluded.processing_fee,
         max_tenure_years = excluded.max_tenure_years,
         max_amount       = excluded.max_amount,
         source_url       = excluded.source_url,
         effective_date   = excluded.effective_date,
         verified         = excluded.verified,
         notes            = excluded.notes,
         updated_at       = datetime('now')`,
      [
        d.bankId,
        d.country,
        d.loanType,
        d.minRate ?? null,
        d.maxRate ?? null,
        d.processingFee ?? null,
        d.maxTenureYears ?? null,
        d.maxAmount ?? null,
        d.sourceUrl ?? null,
        d.effectiveDate ?? null,
        verified,
        d.notes ?? null,
      ],
    );

    refreshRatePages(d.country, d.loanType);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/rates] upsert failed:", err);
    return NextResponse.json({ ok: false, error: "Could not save that rate." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  const parsed = z
    .object({ id: z.number().int().positive() })
    .safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const row = await one<{ country: string }>(`SELECT country FROM rates WHERE id = ?`, [
      parsed.data.id,
    ]);
    await run(`DELETE FROM rates WHERE id = ?`, [parsed.data.id]);
    refreshRatePages(row?.country ?? DEFAULT_COUNTRY);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/rates] delete failed:", err);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
