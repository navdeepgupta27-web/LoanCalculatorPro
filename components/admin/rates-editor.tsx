"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { LOAN_TYPES, type LoanTypeId } from "@/lib/site";
import type { Bank, RateWithBank } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Draft {
  minRate: string;
  maxRate: string;
  processingFee: string;
  maxTenureYears: string;
  sourceUrl: string;
  effectiveDate: string;
  verified: boolean;
}

const CSV_TEMPLATE = `bank,category,loan_type,min_rate,max_rate,processing_fee,max_tenure_years,source_url,effective_date,verified
State Bank of India,public,home,8.50,9.65,0.35% of loan amount,30,https://sbi.co.in/web/interest-rates,2026-09-01,yes
HDFC Bank,private,home,8.75,9.95,Up to 1%,30,https://www.hdfc.com/housing-loans/home-loan-interest-rate,2026-09-01,yes`;

function draftFrom(rate: RateWithBank | undefined): Draft {
  return {
    minRate: rate?.min_rate != null ? String(rate.min_rate) : "",
    maxRate: rate?.max_rate != null ? String(rate.max_rate) : "",
    processingFee: rate?.processing_fee ?? "",
    maxTenureYears: rate?.max_tenure_years != null ? String(rate.max_tenure_years) : "",
    sourceUrl: rate?.source_url ?? "",
    effectiveDate: rate?.effective_date ?? new Date().toISOString().slice(0, 10),
    verified: rate?.verified === 1,
  };
}

export function RatesEditor({
  banks,
  rates,
  country,
}: {
  banks: Bank[];
  rates: RateWithBank[];
  country: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [loanType, setLoanType] = useState<LoanTypeId>("home");
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [importing, setImporting] = useState(false);

  const ratesForType = useMemo(() => {
    const map = new Map<number, RateWithBank>();
    for (const r of rates) {
      if (r.loan_type === loanType) map.set(r.bank_id, r);
    }
    return map;
  }, [rates, loanType]);

  const verifiedCount = banks.filter((b) => ratesForType.get(b.id)?.verified === 1).length;

  const getDraft = (bankId: number): Draft => drafts[bankId] ?? draftFrom(ratesForType.get(bankId));

  const setDraft = (bankId: number, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [bankId]: { ...getDraft(bankId), ...patch } }));

  const save = async (bank: Bank) => {
    const d = getDraft(bank.id);
    setSavingId(bank.id);

    try {
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          country,
          bankId: bank.id,
          loanType,
          minRate: d.minRate ? Number(d.minRate) : null,
          maxRate: d.maxRate ? Number(d.maxRate) : null,
          processingFee: d.processingFee || null,
          maxTenureYears: d.maxTenureYears ? Number(d.maxTenureYears) : null,
          maxAmount: null,
          sourceUrl: d.sourceUrl || null,
          effectiveDate: d.effectiveDate || null,
          verified: d.verified,
          notes: null,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        toast(json.error ?? "Could not save", "error");
        return;
      }

      toast(`${bank.short_name} saved`);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[bank.id];
        return next;
      });
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setSavingId(null);
    }
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/rates/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csv, country }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        toast(json.error ?? "Import failed", "error");
        return;
      }

      toast(
        `Imported ${json.imported} rate${json.imported === 1 ? "" : "s"}` +
          (json.banksCreated ? `, created ${json.banksCreated} bank(s)` : ""),
      );
      if (json.errors?.length) {
        console.warn("[rates import] row issues:", json.errors);
        toast(`${json.errors.length} row(s) had issues — see the browser console`, "info");
      }
      setCsv("");
      setImportOpen(false);
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {LOAN_TYPES.map((t) => {
          const count = rates.filter((r) => r.loan_type === t.id && r.verified === 1).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setLoanType(t.id);
                setDrafts({});
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
                loanType === t.id
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-400",
              )}
            >
              <span>{t.emoji}</span>
              {t.shortLabel}
              <span
                className={cn(
                  "rounded px-1 text-[0.65rem] font-bold",
                  count > 0
                    ? "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300"
                    : "bg-[var(--bg-subtle)] text-[var(--text-muted)]",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}

        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          onClick={() => setImportOpen((v) => !v)}
        >
          {importOpen ? "Close import" : "Bulk import CSV"}
        </Button>
      </div>

      {importOpen && (
        <div className="card p-5">
          <h2 className="font-display text-sm font-bold text-[var(--text)]">Bulk import</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Paste CSV with a header row. Banks that do not exist yet are created automatically. A
            row can only be marked <code>verified</code> if it also carries a{" "}
            <code>source_url</code>.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => setCsv(CSV_TEMPLATE)}>
              Load example
            </Button>
            <span className="self-center text-xs text-[var(--text-muted)]">
              Columns: bank, category, loan_type, min_rate, max_rate, processing_fee,
              max_tenure_years, max_amount, source_url, effective_date, verified, notes
            </span>
          </div>

          <Textarea
            className="mt-3 min-h-40 font-mono text-xs"
            placeholder="bank,category,loan_type,min_rate,…"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            spellCheck={false}
          />

          <div className="mt-3 flex gap-2">
            <Button onClick={runImport} disabled={importing || !csv.trim()}>
              {importing ? "Importing…" : "Import rates"}
            </Button>
            <Button variant="ghost" onClick={() => setCsv("")}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text)]">
            {verifiedCount} of {banks.length}
          </strong>{" "}
          lenders have a verified rate for this loan type. Rows without one show as &ldquo;Not
          published&rdquo; on the public site — no figure is ever invented to fill a gap.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] border-collapse text-sm">
            <thead className="bg-[var(--bg-subtle)]">
              <tr>
                {["Lender", "Min %", "Max %", "Processing fee", "Max yrs", "Source URL", "As of", "Verified", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {banks.map((bank) => {
                const d = getDraft(bank.id);
                const dirty = drafts[bank.id] !== undefined;
                const existing = ratesForType.get(bank.id);

                return (
                  <tr
                    key={bank.id}
                    className={cn(
                      "border-t border-[var(--border)]",
                      dirty && "bg-amber-50/60 dark:bg-amber-950/20",
                      existing?.verified === 1 && !dirty && "bg-accent-50/40 dark:bg-accent-950/15",
                    )}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[0.65rem] font-extrabold text-white"
                          style={{ background: bank.accent }}
                        >
                          {bank.short_name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="whitespace-nowrap font-semibold text-[var(--text)]">
                          {bank.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className="!w-20 !py-1 text-sm"
                        inputMode="decimal"
                        value={d.minRate}
                        onChange={(e) => setDraft(bank.id, { minRate: e.target.value })}
                        placeholder="8.50"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className="!w-20 !py-1 text-sm"
                        inputMode="decimal"
                        value={d.maxRate}
                        onChange={(e) => setDraft(bank.id, { maxRate: e.target.value })}
                        placeholder="9.65"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className="!w-40 !py-1 text-sm"
                        value={d.processingFee}
                        onChange={(e) => setDraft(bank.id, { processingFee: e.target.value })}
                        placeholder="0.35% of loan"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className="!w-16 !py-1 text-sm"
                        inputMode="numeric"
                        value={d.maxTenureYears}
                        onChange={(e) => setDraft(bank.id, { maxTenureYears: e.target.value })}
                        placeholder="30"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className="!w-56 !py-1 text-sm"
                        type="url"
                        value={d.sourceUrl}
                        onChange={(e) => setDraft(bank.id, { sourceUrl: e.target.value })}
                        placeholder="https://bank.com/rates"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className="!w-36 !py-1 text-sm"
                        type="date"
                        value={d.effectiveDate}
                        onChange={(e) => setDraft(bank.id, { effectiveDate: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-accent-600"
                        checked={d.verified}
                        onChange={(e) => setDraft(bank.id, { verified: e.target.checked })}
                        aria-label={`Mark ${bank.name} rate verified`}
                        title={
                          d.minRate && d.sourceUrl
                            ? "Confirmed against the lender's own page"
                            : "Needs both a rate and a source URL"
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant={dirty ? "primary" : "secondary"}
                        disabled={savingId === bank.id || !dirty}
                        onClick={() => save(bank)}
                      >
                        {savingId === bank.id ? "…" : "Save"}
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {banks.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    No lenders yet. Run <code>npm run db:seed</code>, or use the CSV import above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
