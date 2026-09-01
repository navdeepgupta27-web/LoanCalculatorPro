"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import type { CoverVariant, Post } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

const COVER_VARIANTS: CoverVariant[] = ["indigo", "emerald", "amber", "rose", "sky", "violet"];

const SWATCH: Record<CoverVariant, string> = {
  indigo: "from-indigo-500 to-purple-600",
  emerald: "from-emerald-500 to-cyan-600",
  amber: "from-amber-400 to-red-500",
  rose: "from-rose-500 to-fuchsia-600",
  sky: "from-sky-400 to-indigo-600",
  violet: "from-violet-500 to-fuchsia-600",
};

const STARTER = `Open with the question the reader actually came to answer, in one or two sentences.

## The first thing that matters

Explain it plainly. Short paragraphs, concrete numbers, no jargon that has not been defined.

- A list works well for conditions or steps
- Keep each item to a single idea

## Worked example

> On a ₹50,00,000 loan at 8.5% over 20 years, the EMI is ₹43,391.

Link to the tool that proves the point: [run this in the calculator](/home-loan-emi-calculator).

## What to do about it

Close with the action. What should the reader check, ask their bank, or calculate next?
`;

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? STARTER);
  const [coverVariant, setCoverVariant] = useState<CoverVariant>(post?.cover_variant ?? "indigo");
  const [tags, setTags] = useState(post?.tags ?? "");
  const [author, setAuthor] = useState(post?.author ?? "Loan Calculator Pro");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? "");
  const [keywords, setKeywords] = useState(post?.keywords ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const effectiveSlug = slug || slugify(title);

  const onTitleChange = (value: string) => {
    setTitle(value);
    // Keep the slug in step with the title until the author edits it directly.
    if (!slugTouched) setSlug(slugify(value));
  };

  const save = async (nextStatus?: "draft" | "published") => {
    const finalStatus = nextStatus ?? status;

    if (title.trim().length < 3) {
      toast("Give the post a title first", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: post ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(post ? { id: post.id } : {}),
          title,
          slug: effectiveSlug,
          excerpt,
          content,
          coverVariant,
          tags,
          author,
          status: finalStatus,
          seoTitle,
          seoDescription,
          keywords,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        toast(json.error ?? "Could not save", "error");
        return;
      }

      setStatus(finalStatus);
      toast(
        finalStatus === "published"
          ? post
            ? "Post updated and live"
            : "Post published"
          : "Draft saved",
      );

      if (!post) {
        router.replace(`/admin/blog/${json.id}`);
      }
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!post) return;
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });
      if (!res.ok) throw new Error();
      toast("Post deleted");
      router.replace("/admin/blog");
      router.refresh();
    } catch {
      toast("Could not delete", "error");
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {/* ---------------- Main ---------------- */}
      <div className="flex flex-col gap-4">
        <div className="card p-5">
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Should you prepay your home loan or invest instead?"
              className="!text-lg font-semibold"
            />
          </Field>

          <div className="mt-4">
            <Field
              label="URL slug"
              htmlFor="slug"
              hint={`Will publish at /blog/${effectiveSlug || "…"}`}
            >
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                placeholder="prepay-home-loan-or-invest"
                className="font-mono text-sm"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field
              label="Excerpt"
              htmlFor="excerpt"
              hint="Shown on cards and used as the meta description fallback. Left blank, it is generated from the opening lines."
            >
              <Textarea
                id="excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="One or two sentences that make someone want to read it."
              />
            </Field>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="content"
              className="text-[0.78rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]"
            >
              Content — Markdown
            </label>
            <span className="text-xs text-[var(--text-muted)]">
              {content.trim().split(/\s+/).filter(Boolean).length} words ·{" "}
              {Math.max(1, Math.round(content.trim().split(/\s+/).length / 210))} min read
            </span>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[32rem] font-mono text-[0.8125rem] leading-relaxed"
            spellCheck
          />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Supports headings, lists, tables, links, blockquotes and code. Headings become anchor
            links and feed the table of contents automatically. Output is sanitised before it
            renders.
          </p>
        </div>
      </div>

      {/* ---------------- Sidebar ---------------- */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="card p-5">
          <h2 className="mb-3 font-display text-sm font-bold text-[var(--text)]">Publish</h2>

          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-subtle)] px-3 py-2">
            <span className="text-sm text-[var(--text-secondary)]">Status</span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-bold uppercase",
                status === "published"
                  ? "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
              )}
            >
              {status}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Button onClick={() => save("published")} disabled={saving} fullWidth>
              {saving ? "Saving…" : status === "published" ? "Update live post" : "Publish"}
            </Button>
            <Button variant="secondary" onClick={() => save("draft")} disabled={saving} fullWidth>
              Save as draft
            </Button>
            {post && status === "published" && (
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-center text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                View live ↗
              </a>
            )}
          </div>

          {post && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="mt-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete post"}
            </button>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-display text-sm font-bold text-[var(--text)]">Appearance</h2>
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Cover gradient
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {COVER_VARIANTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCoverVariant(v)}
                aria-label={`${v} cover`}
                className={cn(
                  "h-9 rounded-lg bg-gradient-to-br transition-all",
                  SWATCH[v],
                  coverVariant === v
                    ? "ring-2 ring-[var(--text)] ring-offset-2 ring-offset-[var(--surface)]"
                    : "opacity-60 hover:opacity-100",
                )}
              />
            ))}
          </div>

          <div className="mt-4">
            <Field label="Tags" hint="Comma separated">
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="home loan, prepayment"
                className="text-sm"
              />
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Author">
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} className="text-sm" />
            </Field>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-display text-sm font-bold text-[var(--text)]">SEO</h2>

          <Field
            label="Meta title"
            hint={`${seoTitle.length || title.length}/60 characters ideally`}
          >
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || "Falls back to the post title"}
              className="text-sm"
            />
          </Field>

          <div className="mt-3">
            <Field
              label="Meta description"
              hint={`${seoDescription.length}/155 characters ideally`}
            >
              <Textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Falls back to the excerpt."
                className="text-sm"
              />
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Keywords" hint="Comma separated">
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="home loan prepayment, part payment calculator"
                className="text-sm"
              />
            </Field>
          </div>

          {/* Rough SERP preview so the author can see the truncation. */}
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Search preview
            </p>
            <p className="mt-1.5 truncate text-[0.8125rem] text-brand-700 dark:text-brand-300">
              {(seoTitle || title || "Post title").slice(0, 60)}
            </p>
            <p className="truncate text-[0.7rem] text-accent-700 dark:text-accent-400">
              loancalculatorpro.in › blog › {effectiveSlug || "slug"}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[0.7rem] text-[var(--text-muted)]">
              {seoDescription || excerpt || "Add an excerpt or meta description."}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
