import { notFound } from "next/navigation";

import { PostEditor } from "@/components/admin/post-editor";
import { PageHeading } from "@/components/admin/widgets";
import { ButtonLink } from "@/components/ui/button";
import { one } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import type { Post } from "@/lib/types";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const post = await one<Post>(`SELECT * FROM posts WHERE id = ?`, [numericId]).catch(() => null);
  if (!post) notFound();

  return (
    <>
      <PageHeading
        title="Edit post"
        description={`${formatNumber(post.views)} read${post.views === 1 ? "" : "s"} · last updated ${post.updated_at}`}
        action={
          <ButtonLink href="/admin/blog" variant="ghost">
            ← All posts
          </ButtonLink>
        }
      />
      <PostEditor post={post} />
    </>
  );
}
