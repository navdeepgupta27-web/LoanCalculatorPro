import Link from "next/link";
import { notFound } from "next/navigation";

import { AdInArticle } from "@/components/ads/ad-slot";
import { PostCard, PostCover } from "@/components/blog/post-card";
import { ShareBar } from "@/components/share/share-bar";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/queries";
import { articleSchema, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { parseTags } from "@/lib/types";
import { readingTime } from "@/lib/utils";

export const revalidate = 1800;

/** Prerender the posts that exist at build time; new ones render on first hit. */
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts(200);
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Guide not found" };

  return pageMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    keywords: parseTags(post.keywords),
    type: "article",
    publishedTime: post.published_at ?? post.created_at,
    modifiedTime: post.updated_at,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const [{ html, headings }, related] = await Promise.all([
    renderMarkdown(post.content),
    getRelatedPosts(slug, 3).catch(() => []),
  ]);

  const tags = parseTags(post.tags);
  const published = post.published_at ?? post.created_at;

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.seo_title || post.title,
            description: post.seo_description || post.excerpt || post.title,
            slug: post.slug,
            author: post.author,
            published: post.published_at,
            modified: post.updated_at,
            keywords: post.keywords ?? undefined,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <article>
        <header className="relative overflow-hidden border-b border-[var(--border)]">
          <div className="mesh-bg" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                <li>
                  <Link href="/" className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                    Guides
                  </Link>
                </li>
              </ol>
            </nav>

            {tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-extrabold text-white">
                  {post.author.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--text)]">{post.author}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    <time dateTime={published}>{formatDate(published)}</time>
                    {" · "}
                    {readingTime(post.content)} min read
                  </p>
                </div>
              </div>
              <ShareBar title={post.title} url={`/blog/${post.slug}`} label="" />
            </div>
          </div>
        </header>

        <PostCover
          variant={post.cover_variant}
          title={post.title}
          className="h-40 sm:h-56"
        />

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Table of contents, only when the post is long enough to need one. */}
          {headings.length >= 3 && (
            <nav
              aria-label="On this page"
              className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5"
            >
              <p className="mb-2.5 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                On this page
              </p>
              <ol className="flex flex-col gap-1.5">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                    <a
                      href={`#${h.id}`}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Sanitised in renderMarkdown() — see lib/markdown.ts. */}
          <div className="prose-lcp" dangerouslySetInnerHTML={{ __html: html }} />

          <AdInArticle className="mt-10" />

          <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              <strong className="text-[var(--text-secondary)]">A reminder:</strong> this article is
              general information about how loans work in India, not personalised financial advice.
              Your circumstances, tax position and the terms in your own loan agreement all change
              the right answer. For a decision of any size, talk to a qualified adviser.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
            <ShareBar title={post.title} url={`/blog/${post.slug}`} label="Share this" />
            <ButtonLink href="/blog" variant="ghost" size="sm">
              ← All guides
            </ButtonLink>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-display text-xl font-bold text-[var(--text)] sm:text-2xl">
              Keep reading
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <PostCard key={p.id} post={p} delay={i * 70} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-center text-white">
          <span aria-hidden="true" className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative font-display text-xl font-extrabold sm:text-2xl">
            Put the numbers to work
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-white/85">
            Model your own loan, add a part-payment, and see the interest saving in rupees.
          </p>
          <div className="relative mt-5">
            <ButtonLink href="/" className="bg-white text-brand-700 hover:bg-white/90 hover:text-brand-800">
              Open the EMI calculator
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
