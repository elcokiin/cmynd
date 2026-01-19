import type { Doc } from "../_generated/dataModel";
import type {
  DocumentListItem,
  PendingDocumentListItem,
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
    coverImageId: doc.coverImageId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    submittedAt: doc.submittedAt,
    rejectionReason: doc.rejectionReason,
  };
}

/**
 * Project document to pending list item (for admin review list).
 * Contains minimal metadata for pending documents awaiting review.
 */
export function toPendingDocumentListItem(
  doc: Doc<"documents">,
): PendingDocumentListItem {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    type: doc.type,
    submittedAt: doc.submittedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

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
    type: doc.type,
    coverImageId: doc.coverImageId,
    publishedAt: doc.publishedAt!,
    author: toPublicAuthor(author),
  };
}
