import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { formatDate } from "@/lib/format";
import { parseTags, type CoverVariant, type Post } from "@/lib/types";
import { cn, readingTime } from "@/lib/utils";

const COVER_GRADIENTS: Record<CoverVariant, string> = {
  indigo: "from-indigo-500 via-violet-500 to-purple-600",
  emerald: "from-emerald-500 via-teal-500 to-cyan-600",
  amber: "from-amber-400 via-orange-500 to-red-500",
  rose: "from-rose-500 via-pink-500 to-fuchsia-600",
  sky: "from-sky-400 via-blue-500 to-indigo-600",
  violet: "from-violet-500 via-purple-500 to-fuchsia-600",
};

/**
 * Cover art, generated rather than uploaded.
 *
 * Each post gets a deterministic gradient plus a geometric motif, so the blog
 * index looks composed from day one without anyone sourcing stock photography
 * — and there are no image bytes to download.
 */
export function PostCover({
  variant = "indigo",
  title,
  className,
  compact,
}: {
  variant?: CoverVariant;
  title: string;
  className?: string;
  compact?: boolean;
}) {
  const initial = title.trim().charAt(0).toUpperCase() || "L";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        COVER_GRADIENTS[variant] ?? COVER_GRADIENTS.indigo,
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <circle cx="60" cy="40" r="70" fill="white" opacity="0.16" />
        <circle cx="330" cy="170" r="90" fill="white" opacity="0.12" />
        <path d="M0 160 Q100 110 200 145 T400 120 V200 H0 Z" fill="white" opacity="0.14" />
      </svg>
      <span
        className={cn(
          "relative font-display font-extrabold text-white/85 drop-shadow-sm",
          compact ? "text-3xl" : "text-5xl",
        )}
      >
        {initial}
      </span>
    </div>
  );
}

export function PostCard({ post, delay = 0 }: { post: Post; delay?: number }) {
  const tags = parseTags(post.tags);

  return (
    <Reveal delay={delay} className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="card card-lift group flex h-full flex-col overflow-hidden"
      >
        <PostCover
          variant={post.cover_variant}
          title={post.title}
          className="h-36 shrink-0 transition-transform duration-500 group-hover:scale-[1.03]"
          compact
        />

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <time dateTime={post.published_at ?? post.created_at}>
              {formatDate(post.published_at ?? post.created_at)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{readingTime(post.content)} min read</span>
          </div>

          <h3 className="font-display text-[1.0625rem] font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              {post.excerpt}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Reveal>
  );
}
