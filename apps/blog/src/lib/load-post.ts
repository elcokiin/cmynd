import type { BlogPost, BlogPostListItem } from "./types";
import { getPublishedDocumentBySlug, getPublicStorageUrl, listAllPublishedDocuments } from "./convex";
import { renderToHtml } from "@elcokiin/ui/editor/render";

export async function loadPost(slug: string): Promise<BlogPost | null> {
  const post = await getPublishedDocumentBySlug(slug);
  if (!post) return null;

  const coverUrl = post.coverImage?.storageId ? (await getPublicStorageUrl(post.coverImage.storageId)) ?? undefined : undefined;
  const htmlContent = renderToHtml(post.content as any);

  return { ...post, coverUrl, htmlContent };
}

export async function loadPublishedPosts(): Promise<BlogPostListItem[]> {
  const published = await listAllPublishedDocuments();

  return Promise.all(
    published.map(async (post) => ({
      ...post,
      coverUrl:
        post.coverImage?.storageId ? (await getPublicStorageUrl(post.coverImage.storageId)) ?? undefined : undefined,
    })),
  );
}
