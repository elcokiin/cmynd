import type { PublishedDocument, PublishedDocumentListItem } from "@elcokiin/backend/lib/types/documents";

export type BlogPostListItem = PublishedDocumentListItem & {
  coverUrl?: string;
};

export type BlogPost = PublishedDocument & {
  coverUrl?: string;
  htmlContent: string;
};
