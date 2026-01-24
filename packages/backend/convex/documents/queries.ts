import type {
  DocumentStats,
  PublishedDocument,
} from "../../lib/types/documents";

import { v } from "convex/values";
import { query } from "../_generated/server";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import * as Auth from "../_lib/auth";
import {
  getByIdForAuthor,
  paginationOptsValidator,
} from "./helpers";
import {
  toDocumentListItem,
  toPendingDocumentListItem,
  toPublicAuthor,
  toPublishedDocumentListItem,
} from "./projections";
import {
  paginatedDocumentListValidator,
  paginatedPendingDocumentListValidator,
  paginatedPublishedDocumentListValidator,
} from "../../lib/validators/documents";
import { getDocumentByOldSlug } from "./slug_helpers";
import { getDocumentStats } from "./stats_helpers";

/**
 * Get a single document by ID with author check.
 *
 * Authentication required.
 * Authors see full document (any status).
 * Non-authors only see published documents.
 *
 * @throws DocumentNotFoundError if document not found
 * @throws DocumentOwnershipError if not author and document not published
 */
export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwConvexError(ErrorCode.UNAUTHENTICATED);
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    const author = await ctx.db.get(document.authorId);
    const isAuthor = author?.userId === identity.subject;

    if (!isAuthor && document.status !== "published") {
      throwConvexError(ErrorCode.DOCUMENT_OWNERSHIP);
    }

    return document;
  },
});

/**
 * Get a published document by ID (public, no auth required).
 * Returns full document content with author information.
 * Returns null if document not found or not published.
 */
export const getPublished = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args): Promise<PublishedDocument | null> => {
    const document = await ctx.db.get(args.documentId);
    if (!document || document.status !== "published" || !document.publishedAt) {
      return null;
    }

    const author = await ctx.db.get(document.authorId);
    if (!author) {
      return null;
    }

    return {
      _id: document._id,
      title: document.title,
      slug: document.slug,
      content: document.content,
      type: document.type,
      coverImageId: document.coverImageId,
      curation: document.curation,
      references: document.references,
      publishedAt: document.publishedAt,
      author: toPublicAuthor(author),
    };
  },
});

/**
 * List published documents with pagination (public, no auth required).
 * Returns documents with author information but without content.
 */
export const listPublished = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginatedPublishedDocumentListValidator,
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .paginate(args.paginationOpts);

    // Filter documents with publishedAt
    const publishedDocs = result.page.filter((doc) => doc.publishedAt);

    // Batch fetch all unique authors in parallel (fixes N+1 query)
    const uniqueAuthorIds = [
      ...new Set(publishedDocs.map((doc) => doc.authorId)),
    ];
    const authors = await Promise.all(
      uniqueAuthorIds.map((id) => ctx.db.get(id)),
    );
    const authorMap = new Map(
      authors
        .filter((author): author is NonNullable<typeof author> => !!author)
        .map((author) => [author._id, author]),
    );

    // Map documents with their authors
    const pageWithAuthors = publishedDocs
      .map((doc) => {
        const author = authorMap.get(doc.authorId);
        if (!author) return null;
        return toPublishedDocumentListItem(doc, author);
      })
      .filter(
        (item): item is NonNullable<typeof item> => item !== null,
      );

    return {
      ...result,
      page: pageWithAuthors,
    };
  },
});

/**
 * Get a document for editing (author only).
 * Accepts either document ID or slug.
 */
export const getForEdit = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await getByIdForAuthor(ctx, args.documentId);
  },
});

/**
 * Get a document for editing by slug (author only).
 * Automatically handles slug redirects (checks old slugs if current slug not found).
 * Returns document with redirect information.
 * Returns null if document not found.
 * 
 * @throws DocumentOwnershipError if user doesn't own the document.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const { slug } = args;

    const userId = await Auth.requireAuth(ctx);
    
    // Try direct slug lookup first
    let document = await ctx.db
      .query("documents")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    let isRedirect = false;
    let currentSlug = slug;

    // If not found by current slug, check slug redirects
    if (!document) {
      const documentId = await getDocumentByOldSlug(ctx, slug);
      
      if (documentId) {
        document = await ctx.db.get(documentId);
        
        if (document) {
          isRedirect = true;
          currentSlug = document.slug;
        }
      }
    }

    // Return null for not found (graceful, expected case)
    if (!document) {
      return null;
    }

    // Throw error for unauthorized access (security event, needs logging)
    const author = await ctx.db.get(document.authorId);
    if (!author || author.userId !== userId) {
      throwConvexError(ErrorCode.DOCUMENT_OWNERSHIP);
    }

    return {
      ...document,
      isRedirect,
      currentSlug,
    };
  },
});

/**
 * List all documents for the current user with pagination.
 * Returns projected documents without content.
 *
 * @throws UnauthenticatedError if not authenticated.
 */
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginatedDocumentListValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwConvexError(ErrorCode.UNAUTHENTICATED);
    }

    const author = await ctx.db
      .query("authors")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!author) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const result = await ctx.db
      .query("documents")
      .withIndex("by_author", (q) => q.eq("authorId", author._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(toDocumentListItem),
    };
  },
});

/**
 * List all pending documents for admin review with pagination.
 * Returns projected documents with minimal fields.
 *
 * @throws AdminRequiredError if user is not an admin.
 */
export const listPendingForAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginatedPendingDocumentListValidator,
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const result = await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(toPendingDocumentListItem),
    };
  },
});

/**
 * Get a document for admin review (admin only).
 * Returns the full document content without author info (anonymous review).
 *
 * @throws AdminRequiredError if user is not an admin.
 * @throws DocumentNotFoundError if document is not found or not pending.
 */
export const getForAdminReview = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document || document.status !== "pending") {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    return {
      _id: document._id,
      title: document.title,
      slug: document.slug,
      type: document.type,
      content: document.content,
      curation: document.curation,
      references: document.references,
      coverImageId: document.coverImageId,
      submittedAt: document.submittedAt,
      createdAt: document.createdAt,
    };
  },
});

/**
 * Get a document for admin review by slug (admin only).
 * Automatically handles slug redirects (checks old slugs if current slug not found).
 * Returns the full document content without author info (anonymous review).
 * Returns null if document not found or not pending.
 *
 * @throws AdminRequiredError if user is not an admin.
 */
export const getForAdminReviewBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    // Try direct slug lookup first
    let document = await ctx.db
      .query("documents")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    // If not found by current slug, check slug redirects
    if (!document) {
      const documentId = await getDocumentByOldSlug(ctx, args.slug);
      
      if (documentId) {
        document = await ctx.db.get(documentId);
      }
    }

    // Return null for not found or non-pending documents (graceful)
    if (!document || document.status !== "pending") {
      return null;
    }

    return {
      _id: document._id,
      title: document.title,
      slug: document.slug,
      type: document.type,
      content: document.content,
      curation: document.curation,
      references: document.references,
      coverImageId: document.coverImageId,
      submittedAt: document.submittedAt,
      createdAt: document.createdAt,
    };
  },
});

/**
 * Get admin statistics (admin only).
 * Returns counts of documents by status using O(1) lookup.
 *
 * @throws AdminRequiredError if user is not an admin.
 */
export const getAdminStats = query({
  args: {},
  handler: async (ctx): Promise<DocumentStats> => {
    await Auth.requireAdmin(ctx);

    const stats = await getDocumentStats(ctx);

    return {
      totalDocuments:
        stats.buildingCount + stats.pendingCount + stats.publishedCount,
      buildingCount: stats.buildingCount,
      pendingCount: stats.pendingCount,
      publishedCount: stats.publishedCount,
    };
  },
});
