import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isResponse, requireAdminApi } from "@/lib/auth";
import { one, run } from "@/lib/db";
import { autoExcerpt } from "@/lib/markdown";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PostSchema = z.object({
  title: z.string().trim().min(3, "Give the post a title.").max(200),
  slug: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1, "The post has no content.").max(200_000),
  coverVariant: z.enum(["indigo", "emerald", "amber", "rose", "sky", "violet"]).default("indigo"),
  tags: z.string().trim().max(300).optional(),
  author: z.string().trim().max(120).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(400).optional(),
  keywords: z.string().trim().max(500).optional(),
});

/** Appends -2, -3 … until the slug is free. */
async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let candidate = base;
  for (let n = 2; n < 100; n++) {
    const existing = await one<{ id: number }>(`SELECT id FROM posts WHERE slug = ?`, [candidate]);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

/** Publishing changes what the public pages and the sitemap contain. */
function refreshPublicPages(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  const parsed = PostSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post." },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const slug = await uniqueSlug(slugify(d.slug || d.title));

  try {
    const result = await run(
      `INSERT INTO posts
         (slug, title, excerpt, content, cover_variant, tags, author, status,
          seo_title, seo_description, keywords, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        d.title,
        d.excerpt || autoExcerpt(d.content),
        d.content,
        d.coverVariant,
        d.tags || null,
        d.author || "LoanCalc Pro",
        d.status,
        d.seoTitle || null,
        d.seoDescription || null,
        d.keywords || null,
        d.status === "published" ? new Date().toISOString() : null,
      ],
    );

    refreshPublicPages(slug);
    return NextResponse.json({ ok: true, id: Number(result.lastInsertRowid), slug });
  } catch (err) {
    console.error("[admin/posts] create failed:", err);
    return NextResponse.json({ ok: false, error: "Could not save the post." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdminApi();
  if (isResponse(session)) return session;

  const parsed = PostSchema.extend({ id: z.number().int().positive() }).safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post." },
      { status: 400 },
    );
  }

  const d = parsed.data;

  try {
    const existing = await one<{ slug: string; status: string; published_at: string | null }>(
      `SELECT slug, status, published_at FROM posts WHERE id = ?`,
      [d.id],
    );
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
    }

    const slug = await uniqueSlug(slugify(d.slug || d.title), d.id);

    // Stamp published_at the first time a post goes live, and never reset it
    // afterwards — a re-publish should not look like a brand new article.
    const publishedAt =
      d.status === "published" ? existing.published_at ?? new Date().toISOString() : null;

    await run(
      `UPDATE posts SET
         slug = ?, title = ?, excerpt = ?, content = ?, cover_variant = ?, tags = ?,
         author = ?, status = ?, seo_title = ?, seo_description = ?, keywords = ?,
         published_at = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        slug,
        d.title,
        d.excerpt || autoExcerpt(d.content),
        d.content,
        d.coverVariant,
        d.tags || null,
        d.author || "LoanCalc Pro",
        d.status,
        d.seoTitle || null,
        d.seoDescription || null,
        d.keywords || null,
        publishedAt,
        d.id,
      ],
    );

    refreshPublicPages(slug);
    if (existing.slug !== slug) revalidatePath(`/blog/${existing.slug}`);

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("[admin/posts] update failed:", err);
    return NextResponse.json({ ok: false, error: "Could not save the post." }, { status: 500 });
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
    const existing = await one<{ slug: string }>(`SELECT slug FROM posts WHERE id = ?`, [
      parsed.data.id,
    ]);
    await run(`DELETE FROM posts WHERE id = ?`, [parsed.data.id]);
    if (existing) refreshPublicPages(existing.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/posts] delete failed:", err);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
