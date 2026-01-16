import type { Id } from "../_generated/dataModel";
import type { DocumentType } from "../../lib/types/documents";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { documentTypeValidator } from "../../lib/validators/documents";
import * as Auth from "../_lib/auth";
import {
  getByIdForAuthor,
  updateMetadata as updateMetadataHelper,
} from "./helpers";
import { getOrCreateAuthorForUser } from "../authors/helpers";
import {
  DocumentNotFoundError,
  DocumentAlreadyPublishedError,
  DocumentPendingReviewError,
  DocumentPublishedError,
  DocumentValidationError,
  DocumentRateLimitError,
  DocumentInvalidStatusError,
} from "@elcokiin/errors/backend";

/**
 * Create a new document.
 */
export const create = mutation({
  args: {
    title: v.string(),
    type: documentTypeValidator,
    content: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<Id<"documents">> => {
    const userId = await Auth.requireAuth(ctx);
    const authorId = await getOrCreateAuthorForUser(ctx, userId);

    const now = Date.now();
    return await ctx.db.insert("documents", {
      title: args.title,
      type: args.type,
      status: "building",
      authorId,
      content: args.content ?? {},
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update document title (auto-save).
 */
export const updateTitle = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await updateMetadataHelper(ctx, args.documentId, {
      title: args.title,
    });
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
  handler: async (ctx, args): Promise<void> => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throw new DocumentPublishedError();
    }

    if (document.status === "pending") {
      throw new DocumentPendingReviewError();
    }

    await ctx.db.patch(args.documentId, {
      type: args.type as DocumentType,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update document content (auto-save).
 * Only allowed for documents in "building" status.
 */
export const updateContent = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.any(),
  },
  handler: async (ctx, args): Promise<void> => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throw new DocumentPublishedError();
    }

    if (document.status === "pending") {
      throw new DocumentPendingReviewError();
    }

    await ctx.db.patch(args.documentId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Publish a document.
 * Changes status from "building" to "published".
 */
export const publish = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args): Promise<void> => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throw new DocumentAlreadyPublishedError();
    }

    if (!document.title || document.title.trim() === "") {
      throw new DocumentValidationError(
        "Document must have a title to be published",
      );
    }

    if (document.type === "curated" && !document.curation) {
      throw new DocumentValidationError(
        "Curated documents must have curation data",
      );
    }

    await ctx.db.patch(args.documentId, {
      status: "published",
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Submit a document for review.
 * Changes status from "building" to "pending".
 * Includes rate limiting: max 3 submissions per 24 hours.
 */
export const submit = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args): Promise<void> => {
    const document = await getByIdForAuthor(ctx, args.documentId);

    if (document.status === "published") {
      throw new DocumentAlreadyPublishedError();
    }

    if (document.status === "pending") {
      throw new DocumentInvalidStatusError(
        "Document is already pending review",
      );
    }

    if (!document.title || document.title.trim() === "") {
      throw new DocumentValidationError(
        "Document must have a title to be submitted",
      );
    }

    if (document.type === "curated" && !document.curation) {
      throw new DocumentValidationError(
        "Curated documents must have curation data",
      );
    }

    // Rate limiting: check submission history
    const submissionHistory = document.submissionHistory ?? [];
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const recentSubmissions = submissionHistory.filter(
      (timestamp) => timestamp > twentyFourHoursAgo,
    );

    if (recentSubmissions.length >= 3) {
      throw new DocumentRateLimitError();
    }

    const updatedHistory = [...submissionHistory, now];

    await ctx.db.patch(args.documentId, {
      status: "pending",
      submittedAt: now,
      submissionHistory: updatedHistory,
      rejectionReason: undefined,
      updatedAt: now,
    });
  },
});

/**
 * Approve a document (admin only).
 * Changes status from "pending" to "published".
 */
export const approve = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new DocumentNotFoundError();
    }

    if (document.status !== "pending") {
      throw new DocumentInvalidStatusError(
        "Only pending documents can be approved",
      );
    }

    await ctx.db.patch(args.documentId, {
      status: "published",
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
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
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new DocumentNotFoundError();
    }

    if (document.status !== "pending") {
      throw new DocumentInvalidStatusError(
        "Only pending documents can be rejected",
      );
    }

    if (!args.reason || args.reason.trim() === "") {
      throw new DocumentValidationError("Rejection reason is required");
    }

    await ctx.db.patch(args.documentId, {
      status: "building",
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a document.
 * Soft delete is not implemented; this is a hard delete.
 */
export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args): Promise<void> => {
    await getByIdForAuthor(ctx, args.documentId);
    await ctx.db.delete(args.documentId);
  },
});
