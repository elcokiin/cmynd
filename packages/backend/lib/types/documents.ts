import type { Id } from "../../convex/_generated/dataModel";
import type { PublicAuthor } from "./authors";

/**
 * Type of document content.
 * - own: Original content created from scratch
 * - curated: Content curated from another source with personal commentary
 * - inspiration: Collection of references and inspiration
 */
export type DocumentType = "own" | "curated" | "inspiration";

/**
 * Publication status of a document.
 * - building: Draft/work-in-progress state (editable)
 * - pending: Submitted for admin review (read-only, awaiting approval/rejection)
 * - published: Published state (read-only)
 */
export type DocumentStatus = "building" | "pending" | "published";

/**
 * Metadata for curated documents.
 * Contains information about the original source and the curator's commentary.
 */
export type CurationData = {
  sourceUrl: string;
  sourceTitle: string;
  sourceAuthor?: string;
  spin: string;
};

/**
 * Reference to external content.
 * Used in inspiration documents to track sources.
 */
export type Reference = {
  url: string;
  title: string;
  author?: string;
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
  type: DocumentType;
  status: DocumentStatus;
  coverImageId?: Id<"_storage">;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  rejectionReason?: string;
};

/**
 * Pending document list item for admin review.
 * Contains minimal metadata for pending documents awaiting review.
 */
export type PendingDocumentListItem = {
  _id: Id<"documents">;
  title: string;
  slug: string;
  type: DocumentType;
  submittedAt?: number;
  createdAt: number;
  updatedAt: number;
};

/**
 * Published document with full content and author information.
 * Used by public queries that return published documents.
 */
export type PublishedDocument = {
  _id: Id<"documents">;
  title: string;
  slug: string;
  content: unknown;
  type: DocumentType;
  coverImageId?: Id<"_storage">;
  curation?: CurationData;
  references?: Reference[];
  publishedAt: number;
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
  type: DocumentType;
  coverImageId?: Id<"_storage">;
  publishedAt: number;
  author: PublicAuthor;
};

