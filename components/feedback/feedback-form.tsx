"use client";

import { useState } from "react";

import { trackEvent } from "@/components/analytics/activity-tracker";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "general", label: "General feedback" },
  { value: "bug", label: "Something is broken" },
  { value: "accuracy", label: "A number looks wrong" },
  { value: "feature", label: "Feature request" },
  { value: "rates", label: "Interest rate correction" },
  { value: "partnership", label: "Partnership / business" },
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function FeedbackForm() {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      category: String(data.get("category") ?? "general"),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      rating: rating || null,
      pageUrl: typeof window !== "undefined" ? window.location.pathname : null,
      // Honeypot: real people never fill a field they cannot see.
      website: String(data.get("website") ?? ""),
    };

    const nextErrors: Record<string, string> = {};
    if (payload.name.length < 2) nextErrors.name = "Please tell us your name.";
    if (payload.message.length < 10) nextErrors.message = "A little more detail would help.";
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      nextErrors.email = "That email address does not look right.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Something went wrong");
      }

      trackEvent("feedback_submitted", { category: payload.category, rating: payload.rating });
      setDone(true);
      form.reset();
      setRating(0);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not send — please try again", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card animate-[scale-in_0.4s_var(--ease-out-expo)] p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-100 text-3xl dark:bg-accent-950">
          ✓
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-[var(--text)]">
          Thank you — that came through
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
          Every message is read. If you left an email address and asked something that needs an
          answer, expect a reply.
        </p>
        <Button variant="secondary" className="mt-5" onClick={() => setDone(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-5 sm:p-6" noValidate>
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required error={errors.name}>
          <Input id="name" name="name" autoComplete="name" placeholder="Priya Sharma" required />
        </Field>
        <Field
          label="Email"
          htmlFor="email"
          hint="Optional — only if you would like a reply"
          error={errors.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <Field label="What is this about?" htmlFor="category">
        <Select id="category" name="category" defaultValue="general">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Subject" htmlFor="subject" hint="Optional">
        <Input id="subject" name="subject" placeholder="Part-payment result looks off" />
      </Field>

      <Field
        label="How would you rate the site?"
        hint={rating ? RATING_LABELS[rating] : "Optional"}
      >
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setRating(rating === n ? 0 : n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              className={cn(
                "text-2xl transition-all duration-150",
                (hoverRating || rating) >= n
                  ? "scale-110 text-amber-400"
                  : "text-[var(--border-strong)] hover:scale-105",
              )}
            >
              ★
            </button>
          ))}
        </div>
      </Field>

      <Field label="Your message" htmlFor="message" required error={errors.message}>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Tell us what you were trying to do, what happened, and what you expected instead. If a figure looks wrong, the loan amount, rate and tenure you used help us reproduce it."
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
          We store only what you type here, plus the page you sent it from. No tracking cookie, and
          your email is never shared or added to a mailing list.
        </p>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending…
            </>
          ) : (
            "Send feedback"
          )}
        </Button>
      </div>
    </form>
  );
}
