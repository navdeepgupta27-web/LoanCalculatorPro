import { PostEditor } from "@/components/admin/post-editor";
import { PageHeading } from "@/components/admin/widgets";
import { ButtonLink } from "@/components/ui/button";

export default function NewPostPage() {
  return (
    <>
      <PageHeading
        title="New post"
        description="Write in Markdown. Save a draft while you work; publishing pushes it live and into the sitemap."
        action={
          <ButtonLink href="/admin/blog" variant="ghost">
            ← All posts
          </ButtonLink>
        }
      />
      <PostEditor />
    </>
  );
}
