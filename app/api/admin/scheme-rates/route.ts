import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isResponse, requireAdminApi } from "@/lib/auth";
import { run } from "@/lib/db";
import { CURATED_COUNTRIES } from "@/lib/countries";
import { SCHEME_MAP, type SchemeId } from "@/lib/schemes";

export const dynamic = "force-dynamic";

const SCHEME_IDS = ["sip", "lumpsum", "fd", "rd", "ppf", "ssy", "nps", "epf"] as const;

const UpsertSchema = z.object({
  country: z.string().refine((c) => CURATED_COUNTRIES.some((x) => x.code === c),
    "Rates can only be recorded for a market we have set up."),
  schemeId: z.enum(SCHEME_IDS),
  rate: z.union([z.number(), z.null()]).optional(),
  periodLabel: z.union([z.string().max(120), z.null()]).optional(),
  sourceUrl: z.union([z.string().max(500), z.null()]).optional(),
  effectiveDate: z.union([z.string().max(40), z.null()]).optional(),
  verified: z.boolean().optional(),
  notes: z.union([z.string().max(1000), z.null()]).optional(),
});

/**
 * The public pages that quote a scheme rate are statically generated, so an
 * edit stays invisible until revalidation unless we ask for it explicitly —
 * the same gap that made bank rate edits look like they had failed.
 */
function refreshSchemePages(country: string, schemeId: SchemeId) {
  // Paths carry the country segment since these pages moved under it; without
  // the prefix these calls would silently revalidate nothing.
  revalidatePath(`/${country}/investment-calculators`);
  revalidatePath(`/${country}/compare-investments`);
  const scheme = SCHEME_MAP[schemeId];
  if (scheme) revalidatePath(`/${country}/${scheme.slug}`);
}

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

  // Same rule as the lender rates: a figure can only be presented as confirmed
  // when there is both a rate and a page it was read from.
  if (d.verified && (d.rate == null || !d.sourceUrl)) {
    return NextResponse.json(
      {
        ok: false,
        error: "To mark a rate verified it needs both a rate and a source URL.",
      },
      { status: 400 },
    );
  }

  try {
    await run(
      `INSERT INTO scheme_rates
         (country, scheme_id, rate, period_label, source_url, effective_date, verified, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT (country, scheme_id) DO UPDATE SET
         rate           = excluded.rate,
         period_label   = excluded.period_label,
         source_url     = excluded.source_url,
         effective_date = excluded.effective_date,
         verified       = excluded.verified,
         notes          = excluded.notes,
         updated_at     = datetime('now')`,
      [
        d.country,
        d.schemeId,
        d.rate ?? null,
        d.periodLabel ?? null,
        d.sourceUrl ?? null,
        d.effectiveDate ?? null,
        d.verified ? 1 : 0,
        d.notes ?? null,
      ],
    );

    refreshSchemePages(d.country, d.schemeId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/scheme-rates] upsert failed:", err);
    return NextResponse.json({ ok: false, error: "Could not save that rate." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  const parsed = z
    .object({ country: z.string(), schemeId: z.enum(SCHEME_IDS) })
    .safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    await run(`DELETE FROM scheme_rates WHERE country = ? AND scheme_id = ?`, [
      parsed.data.country,
      parsed.data.schemeId,
    ]);
    refreshSchemePages(parsed.data.country, parsed.data.schemeId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/scheme-rates] delete failed:", err);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
