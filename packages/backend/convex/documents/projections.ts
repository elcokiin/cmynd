import type { Doc } from "../_generated/dataModel";
import type {
  DocumentListItem,
  AdminDocumentListItem,
  AdminPublishedDocumentListItem,
  PublishedDocumentListItem,
} from "../../lib/types/documents";
import type { PublicAuthor } from "../../lib/types/authors";

/**
 * Convert a full author record to public author data.
 */
export function toPublicAuthor(author: Doc<"authors">): PublicAuthor {
  return {
    _id: author._id,
    name: author.name,
    avatarUrl: author.avatarUrl,
    bio: author.bio,
    phrases: author.phrases,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  };
}

/**
 * Project document to list item (for author's own document list).
 * Excludes 'content' field for performance.
 */
export function toDocumentListItem(doc: Doc<"documents">): DocumentListItem {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    type: doc.type,
    status: doc.status,
    coverImage: doc.coverImage,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    submittedAt: doc.submittedAt,
    rejectionReason: doc.rejectionReason,
    isVisible: doc.isVisible,
  };
}

/**
 * Project document to admin list item (for admin review and management).
 * Contains minimal metadata for all document statuses.
 */
export function toAdminDocumentListItem(
  doc: Doc<"documents">,
): AdminDocumentListItem {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    type: doc.type,
    status: doc.status,
    submittedAt: doc.submittedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isVisible: doc.isVisible,
  };
}

/**
 * Project published document to admin list item for visibility management.
 */
export function toAdminPublishedDocumentListItem(
  doc: Doc<"documents">,
): AdminPublishedDocumentListItem {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    type: doc.type,
    status: "published",
    publishedAt: doc.publishedAt!,
    updatedAt: doc.updatedAt,
    isVisible: doc.isVisible ?? true,
  };
}

/**
 * @deprecated Use toAdminDocumentListItem instead
 */
export const toPendingDocumentListItem = toAdminDocumentListItem;

/**
 * Project document and author to published document list item.
 * Used for public document listings with author information.
 */
export function toPublishedDocumentListItem(
  doc: Doc<"documents">,
  author: Doc<"authors">,
): PublishedDocumentListItem {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    type: doc.type,
    coverImage: doc.coverImage,
    publishedAt: doc.publishedAt!,
    estimatedReadTime: doc.estimatedReadTime,
    reprint: doc.reprint,
    author: toPublicAuthor(author),
  };
}
