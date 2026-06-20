import type { BlogPost, BlogPostListItem } from "./types";
import { getPublishedDocumentBySlug, getPublicStorageUrl, listAllPublishedDocuments } from "./convex";
import { renderRichContent } from "./tiptap-render";

export async function loadPost(slug: string): Promise<BlogPost | null> {
  const post = await getPublishedDocumentBySlug(slug);
  if (!post) return null;

  const coverUrl = post.coverImage?.storageId ? (await getPublicStorageUrl(post.coverImage.storageId)) ?? undefined : undefined;
  const htmlContent = renderRichContent(post.content);

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
