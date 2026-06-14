import type { DocumentType } from "../../lib/types/documents";

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
  documentTypeValidator,
  documentContentFormatValidator,
} from "../../lib/validators/documents";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import * as Auth from "../_lib/auth";
import { getByIdForAuthor } from "./helpers";
import { getOrCreateAuthorForUser } from "../authors/helpers";
import { generateUniqueSlug } from "../../lib/utils/slug";
import {
  isValidTitle,
  extractFirstHeading,
  hasContent,
  type JSONContent,
} from "../../lib/utils/title";
import { extractFirstWords } from "../../lib/utils/text-manipulation";
import {
  slugExists,
  addToSlugHistory,
} from "./slug_helpers";
import {
  incrementStatusCount,
  decrementStatusCount,
  updateStatusCount,
} from "./stats_helpers";
import { getReadingTimeMinutes } from "../../lib/reading-time-estimator";

/**
 * Create a new document.
 * Validates title and generates a unique slug without ID suffix if possible.
 *
 * Returns { documentId, slug } instead of just documentId.
 */
export const create = mutation({
  args: {
    title: v.string(),
    type: documentTypeValidator,
    content: v.optional(v.any()),
    markdownSource: v.optional(v.string()),
    contentFormat: v.optional(documentContentFormatValidator),
  },
  handler: async (ctx, args) => {
    // Validate title
    if (!isValidTitle(args.title)) {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_TITLE,
        "Title cannot be 'Untitled' or empty",
      );
    }

    const userId = await Auth.requireAuth(ctx);
    const authorId = await getOrCreateAuthorForUser(ctx, userId);

    const now = Date.now();

    // Insert document with temporary slug
    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      slug: "temp", // Temporary slug, will be updated immediately
      type: args.type,
      status: "building",
      isVisible: true,
      authorId,
      content: args.content ?? {},
      markdownSource: args.markdownSource,
      contentFormat: args.contentFormat,
      createdAt: now,
      updatedAt: now,
    });

    // Generate unique slug (without ID suffix if possible)
    const slug = await generateUniqueSlug(
      args.title,
      documentId,
      async (checkSlug) => await slugExists(ctx, checkSlug),
    );
    await ctx.db.patch(documentId, { slug });

    // Increment building count
    await incrementStatusCount(ctx, "building");

    return { documentId, slug };
  },
});

/**
 * Update document title (auto-save).
 * If status is "building", regenerates the slug and manages slug redirects.
 *
 * Automatically maintains the last 3 slug redirects by deleting the oldest
 * when a 4th redirect is added.
 *
 * Returns { slug, slugDeleted } where slugDeleted is the old URL that was removed (if any).
 */
export const updateTitle = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate title
    if (!isValidTitle(args.title)) {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_TITLE,
        "Title cannot be 'Untitled' or empty",
      );
    }

    const document = await getByIdForAuthor(ctx, args.documentId);

    const updates: Record<string, unknown> = {
      title: args.title,
      updatedAt: Date.now(),
    };

    let slugDeleted: string | null = null;
    let newSlug: string | null = null;

    // Regenerate slug only if document is still in building status
    if (document.status === "building") {
      // Generate new unique slug
      newSlug = await generateUniqueSlug(
        args.title,
        args.documentId,
        async (checkSlug) => await slugExists(ctx, checkSlug, args.documentId),
      );

      // Only proceed with slug change if it's actually different
      if (newSlug !== document.slug) {
        // Add old slug to history (FIFO queue, max 3)
        const { newHistory, deletedSlug } = addToSlugHistory(
          document.slugHistory,
          document.slug,
        );
        slugDeleted = deletedSlug;

        // Update slug and history
        updates.slug = newSlug;
        updates.slugHistory = newHistory;
      }
    }

    await ctx.db.patch(args.documentId, updates);

    return {
      slug: newSlug ?? document.slug,
      slugDeleted,
    };
  },
});

/**
 * Update document type.
 * Only allowed for documents in "building" status.
 */
export const updateType = mutation({
  args: {
    documentId: v.id("documents"),
    type: documentTypeValidator,
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throwConvexError(ErrorCode.DOCUMENT_PUBLISHED);
    }

    if (document.status === "pending") {
      throwConvexError(ErrorCode.DOCUMENT_PENDING_REVIEW);
    }

    await ctx.db.patch(args.documentId, {
      type: args.type as DocumentType,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update document cover image.
 * Only allowed for documents in "building" status.
 */
export const updateCoverImage = mutation({
  args: {
    documentId: v.id("documents"),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throwConvexError(ErrorCode.DOCUMENT_PUBLISHED);
    }

    if (document.status === "pending") {
      throwConvexError(ErrorCode.DOCUMENT_PENDING_REVIEW);
    }

    await ctx.db.patch(args.documentId, {
      coverImageId: args.coverImageId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update optional document settings metadata.
 * Only allowed for documents in "building" status.
 */
export const updateMetadata = mutation({
  args: {
    documentId: v.id("documents"),
    description: v.optional(v.string()),
    coverImagePrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throwConvexError(ErrorCode.DOCUMENT_PUBLISHED);
    }

    if (document.status === "pending") {
      throwConvexError(ErrorCode.DOCUMENT_PENDING_REVIEW);
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if ("description" in args) {
      updates.description = args.description;
    }

    if ("coverImagePrompt" in args) {
      updates.coverImagePrompt = args.coverImagePrompt;
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Update document content (auto-save).
 * Only allowed for documents in "building" status.
 *
 * Auto-extracts title from first heading if current title is invalid.
 * Throws error if no valid title and no content.
 */
export const updateContent = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.any(),
    markdownSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throwConvexError(ErrorCode.DOCUMENT_PUBLISHED);
    }

    if (document.status === "pending") {
      throwConvexError(ErrorCode.DOCUMENT_PENDING_REVIEW);
    }

    const updates: Record<string, unknown> = {
      content: args.content,
      markdownSource: args.markdownSource,
      updatedAt: Date.now(),
    };

    // Check if current title is invalid and content has a heading we can extract
    if (!isValidTitle(document.title)) {
      const contentHasText = hasContent(args.content as JSONContent);

      // Try to extract title from content
      const extractedTitle = extractFirstHeading(args.content as JSONContent);

      if (extractedTitle && isValidTitle(extractedTitle)) {
        // Update title and regenerate slug
        updates.title = extractedTitle;

        const newSlug = await generateUniqueSlug(
          extractedTitle,
          args.documentId,
          async (checkSlug) =>
            await slugExists(ctx, checkSlug, args.documentId),
        );

        updates.slug = newSlug;
      } else if (!contentHasText) {
        // No valid title and no content - cannot save
        throwConvexError(
          ErrorCode.DOCUMENT_EMPTY,
          "Document must have either a valid title or content to be saved",
        );
      }
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Publish a document.
 * Changes status from "building" to "published".
 * Cannot publish if document is pending review.
 */
export const publish = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throwConvexError(ErrorCode.DOCUMENT_ALREADY_PUBLISHED);
    }

    if (document.status === "pending") {
      throwConvexError(
        ErrorCode.DOCUMENT_PENDING_REVIEW,
        "Cannot publish a document that is pending review",
      );
    }

    if (!document.title || document.title.trim() === "") {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Document must have a title to be published",
      );
    }

    if (document.type === "reprint" && !document.reprint) {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Reprint documents must have reprint data",
      );
    }

    const text = document.markdownSource ?? "";
    const estimatedReadTime = getReadingTimeMinutes(text);

    let description = document.description?.trim() || "";
    if (!description && document.content) {
      description = extractFirstWords(document.content as JSONContent);
    }
    if (!description) {
      description = "Check out this post";
    }

    await ctx.db.patch(args.documentId, {
      status: "published",
      isVisible: true,
      publishedAt: Date.now(),
      estimatedReadTime,
      description,
      updatedAt: Date.now(),
    });

    // Update status counts (building -> published)
    await updateStatusCount(ctx, document.status, "published");
  },
});

/**
 * Submit a document for review.
 * Changes status from "building" to "pending".
 * Includes rate limiting: max 3 submissions per 24 hours.
 */
export const submit = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throwConvexError(ErrorCode.DOCUMENT_ALREADY_PUBLISHED);
    }

    if (document.status === "pending") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Document is already pending review",
      );
    }
    if (!document.title || document.title.trim() === "") {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Document must have a title to be submitted",
      );
    }

    if (!document.coverImageId) {
      throwConvexError(ErrorCode.DOCUMENT_COVER_REQUIRED);
    }

    // Rate limiting: check submission history
    const submissionHistory = document.submissionHistory ?? [];
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const recentSubmissions = submissionHistory.filter(
      (timestamp) => timestamp > twentyFourHoursAgo,
    );

    if (recentSubmissions.length >= 3) {
      throwConvexError(ErrorCode.DOCUMENT_RATE_LIMIT);
    }

    const updatedHistory = [...submissionHistory, now];

    await ctx.db.patch(args.documentId, {
      status: "pending",
      submittedAt: now,
      submissionHistory: updatedHistory,
      rejectionReason: undefined,
      updatedAt: now,
    });

    // Update status counts (building -> pending)
    await updateStatusCount(ctx, "building", "pending");
  },
});

/**
 * Approve a document (admin only).
 * Changes status from "pending" to "published".
 */
export const approve = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "pending") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only pending documents can be approved",
      );
    }

    const text = document.markdownSource ?? "";
    const estimatedReadTime = getReadingTimeMinutes(text);

    let description = document.description?.trim() || "";
    if (!description && document.content) {
      description = extractFirstWords(document.content as JSONContent);
    }
    if (!description) {
      description = "Check out this post";
    }

    await ctx.db.patch(args.documentId, {
      status: "published",
      isVisible: true,
      publishedAt: Date.now(),
      estimatedReadTime,
      description,
      updatedAt: Date.now(),
    });

    // Update status counts (pending -> published)
    await updateStatusCount(ctx, "pending", "published");
  },
});

/**
 * Reject a document (admin only).
 * Changes status from "pending" back to "building" with a rejection reason.
 */
export const reject = mutation({
  args: {
    documentId: v.id("documents"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "pending") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only pending documents can be rejected",
      );
    }

    if (!args.reason || args.reason.trim() === "") {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Rejection reason is required",
      );
    }

    await ctx.db.patch(args.documentId, {
      status: "building",
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });

    // Update status counts (pending -> building)
    await updateStatusCount(ctx, "pending", "building");
  },
});

/**
 * Delete a document.
 * slugHistory is embedded in the document and deleted automatically.
 * Soft delete is not implemented; this is a hard delete.
 */
export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    // Delete the document (slugHistory is embedded and deleted automatically)
    await ctx.db.delete(args.documentId);

    // Decrement the status count
    await decrementStatusCount(ctx, document.status);
  },
});

/**
 * Move a published document back to pending (admin only).
 * Changes status from "published" to "pending".
 */
export const moveBackToPending = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "published") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only published documents can be moved back to pending",
      );
    }

    await ctx.db.patch(args.documentId, {
      status: "pending",
      publishedAt: undefined,
      updatedAt: Date.now(),
    });

    // Update status counts (published -> pending)
    await updateStatusCount(ctx, "published", "pending");
  },
});

/**
 * Set visibility for a published document (admin only).
 * Keeps status as "published" and controls whether it is shown publicly.
 */
export const setPublishedVisibility = mutation({
  args: {
    documentId: v.id("documents"),
    isVisible: v.boolean(),
  },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "published") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only published documents can have visibility changed",
      );
    }

    await ctx.db.patch(args.documentId, {
      isVisible: args.isVisible,
      updatedAt: Date.now(),
    });
  },
});
