"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { Feedback, FeedbackStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<FeedbackStatus, "rose" | "sky" | "accent" | "neutral"> = {
  new: "rose",
  read: "sky",
  actioned: "accent",
  archived: "neutral",
};

const NEXT_STATUS: { value: FeedbackStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "actioned", label: "Actioned" },
  { value: "archived", label: "Archived" },
];

export function FeedbackList({ items }: { items: Feedback[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const patch = async (id: number, payload: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      toast("Could not save that change", "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete the message from ${name}? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast("Message deleted");
      startTransition(() => router.refresh());
    } catch {
      toast("Could not delete that message", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <span className="text-3xl">📭</span>
        <p className="mt-3 font-display text-base font-bold text-[var(--text)]">
          Nothing here yet
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Messages sent through the feedback form will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", pending && "opacity-70 transition-opacity")}>
      {items.map((f) => {
        const isOpen = expanded === f.id;
        const busy = busyId === f.id;

        return (
          <article
            key={f.id}
            className={cn(
              "card overflow-hidden transition-all duration-200",
              f.status === "new" && "border-l-4 border-l-red-500",
            )}
          >
            <button
              type="button"
              onClick={() => {
                setExpanded(isOpen ? null : f.id);
                // Opening an unread message marks it read, like any inbox.
                if (!isOpen && f.status === "new") void patch(f.id, { status: "read" });
              }}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left sm:px-5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
                {f.name.charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text)]">{f.name}</span>
                  {f.rating && (
                    <span className="text-xs text-amber-500" title={`${f.rating} out of 5`}>
                      {"★".repeat(f.rating)}
                      <span className="text-[var(--border-strong)]">{"★".repeat(5 - f.rating)}</span>
                    </span>
                  )}
                  <Badge tone={STATUS_TONE[f.status]}>{f.status}</Badge>
                  <Badge>{f.category}</Badge>
                  <span className="ml-auto shrink-0 text-xs text-[var(--text-muted)]">
                    {timeAgo(f.created_at)}
                  </span>
                </div>

                {f.subject && (
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {f.subject}
                  </p>
                )}
                <p
                  className={cn(
                    "mt-1 text-sm text-[var(--text-secondary)]",
                    !isOpen && "line-clamp-2",
                  )}
                >
                  {f.message}
                </p>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-4 sm:px-5">
                <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                  <div className="flex gap-2">
                    <dt className="font-semibold text-[var(--text-muted)]">Received</dt>
                    <dd className="text-[var(--text-secondary)]">{formatDateTime(f.created_at)}</dd>
                  </div>
                  {f.email && (
                    <div className="flex gap-2">
                      <dt className="font-semibold text-[var(--text-muted)]">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${f.email}?subject=${encodeURIComponent(
                            `Re: ${f.subject || "your feedback on Loan Calculator Pro"}`,
                          )}`}
                          className="font-medium text-brand-600 hover:underline dark:text-brand-300"
                        >
                          {f.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {f.page_url && (
                    <div className="flex gap-2">
                      <dt className="font-semibold text-[var(--text-muted)]">Sent from</dt>
                      <dd className="text-[var(--text-secondary)]">{f.page_url}</dd>
                    </div>
                  )}
                  {f.user_agent && (
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-[var(--text-muted)]">Browser</dt>
                      <dd className="truncate text-[var(--text-secondary)]" title={f.user_agent}>
                        {f.user_agent}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4">
                  <label
                    htmlFor={`note-${f.id}`}
                    className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    Private note
                  </label>
                  <Textarea
                    id={`note-${f.id}`}
                    rows={2}
                    className="mt-1 text-sm"
                    placeholder="Only you can see this."
                    defaultValue={f.admin_note ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [f.id]: e.target.value }))}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {NEXT_STATUS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        disabled={busy}
                        onClick={() => patch(f.id, { status: s.value })}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
                          f.status === s.value
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-400",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy || notes[f.id] === undefined}
                    onClick={() => {
                      void patch(f.id, { adminNote: notes[f.id] ?? "" });
                      toast("Note saved");
                    }}
                  >
                    Save note
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busy}
                    className="ml-auto"
                    onClick={() => remove(f.id, f.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
