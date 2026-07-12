import type { Id } from "../../convex/_generated/dataModel";
import type { PublicAuthor } from "./authors";

export type CoverImageData = {
  storageId?: Id<"_storage">;
  prompt?: string;
};

/**
 * Type of document content.
 * - own: Original content created from scratch
 * - reprint: Content from another author, republished with attribution
 * - inspiration: Collection of links and sources that inspired you
 */
export type DocumentType = "own" | "reprint" | "inspiration";

/**
 * Publication status of a document.
 * - building: Draft/work-in-progress state (editable)
 * - pending: Submitted for admin review (read-only, awaiting approval/rejection)
 * - published: Published state (read-only)
 */
export type DocumentStatus = "building" | "pending" | "published";

/**
 * Metadata for reprinted documents.
 * Contains information about the original author and the source.
 */
export type ReprintData = {
  originalAuthor: string;
  originalAuthorId?: Id<"authors">;
  originalTitle?: string;
  originalDate?: number;
  sourceUrl?: string;
  license?: string;
  translator?: string;
  notes?: string;
};

/**
 * A single source of inspiration.
 * Links to external content that inspired the document.
 */
export type Inspiration = {
  url?: string;
  title: string;
  author?: string;
  note?: string;
  emoji: string;
};

/**
 * Statistics for admin dashboard.
 * Provides document counts by status and total count.
 *
 * Used by:
 * - convex/documents/queries.ts: getAdminStats query
 * - apps/studio: Admin dashboard component
 */
export type DocumentStats = {
  totalDocuments: number;
  buildingCount: number;
  pendingCount: number;
  publishedCount: number;
};

/**
 * Document list item for author's document list.
 * Contains essential document metadata without content.
 */
export type DocumentListItem = {
  _id: Id<"documents">;
  title: string;
  slug: string;
  description?: string;
  type: DocumentType;
  status: DocumentStatus;
  coverImage?: CoverImageData;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  rejectionReason?: string;
  isVisible?: boolean;
};

/**
 * Admin document list item for admin review and management.
 * Contains minimal metadata for documents in admin views (all statuses).
 */
export type AdminDocumentListItem = {
  _id: Id<"documents">;
  title: string;
  slug: string;
  description?: string;
  type: DocumentType;
  status: DocumentStatus;
  coverImage?: CoverImageData;
  submittedAt?: number;
  createdAt: number;
  updatedAt: number;
  isVisible?: boolean;
};

/**
 * Admin published document list item for visibility management.
 * Contains metadata needed for toggling public visibility.
 */
export type AdminPublishedDocumentListItem = {
  _id: Id<"documents">;
  title: string;
  slug: string;
  type: DocumentType;
  status: "published";
  publishedAt: number;
  updatedAt: number;
  isVisible: boolean;
};

/**
 * @deprecated Use AdminDocumentListItem instead
 * Kept for backward compatibility during migration.
 */
export type PendingDocumentListItem = AdminDocumentListItem;

/**
 * Published document with full content and author information.
 * Used by public queries that return published documents.
 */
export type PublishedDocument = {
  _id: Id<"documents">;
  title: string;
  slug: string;
  content: unknown;
  description?: string;
  type: DocumentType;
  coverImage?: CoverImageData;
  reprint?: ReprintData;
  inspirations?: Inspiration[];
  publishedAt: number;
  estimatedReadTime?: number;
  author: PublicAuthor;
};

/**
 * Published document list item for public document listings.
 * Contains document metadata with author information but without content.
 */
export type PublishedDocumentListItem = {
  _id: Id<"documents">;
  title: string;
  slug: string;
  description?: string;
  type: DocumentType;
  coverImage?: CoverImageData;
  publishedAt: number;
  estimatedReadTime?: number;
  reprint?: ReprintData;
  author: PublicAuthor;
};
