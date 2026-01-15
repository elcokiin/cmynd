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
 * Constants for document types.
 * Use these instead of string literals for better type safety.
 */
export const DOCUMENT_TYPES = ["own", "curated", "inspiration"] as const;

/**
 * Constants for document statuses.
 * Use these instead of string literals for better type safety.
 */
export const DOCUMENT_STATUSES = ["building", "pending", "published"] as const;

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
 * Re-export projection types for frontend use.
 * These types provide optimized versions of documents for list views.
 */
export type { DocumentListItem, PendingDocumentListItem } from "../../convex/documents/projections";
