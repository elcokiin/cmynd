import type { DocumentType } from "../../lib/types/documents";

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
  documentTypeValidator,
  reprintDataValidator,
} from "../../lib/validators/documents";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import * as Auth from "../_lib/auth";
import {
  getByIdForAuthor,
  assertDocumentEditable,
  computePublishMetadata,
} from "./helpers";
import { getOrCreateAuthorForUser } from "../authors/helpers";
import { generateUniqueSlug } from "../../lib/utils/slug";
import {
  isValidTitle,
  extractFirstHeading,
  hasContent,
  type JSONContent,
} from "../../lib/utils/title";
import {
  slugExists,
  addToSlugHistory,
} from "./slug_helpers";
import {
  incrementStatusCount,
  decrementStatusCount,
  updateStatusCount,
} from "./stats_helpers";

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
  },
  handler: async (ctx, args) => {
    if (!isValidTitle(args.title)) {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_TITLE,
        "Title cannot be 'Untitled' or empty",
      );
    }

    const userId = await Auth.requireAuth(ctx);
    const authorId = await getOrCreateAuthorForUser(ctx, userId);

    const now = Date.now();

    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      slug: "temp",
      type: args.type,
      status: "building",
      isVisible: true,
      authorId,
      content: args.content,
      createdAt: now,
      updatedAt: now,
    });

    const slug = await generateUniqueSlug(
      args.title,
      documentId,
      async (checkSlug) => await slugExists(ctx, checkSlug),
    );
    await ctx.db.patch(documentId, { slug });

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

    if (document.status === "building") {
      newSlug = await generateUniqueSlug(
        args.title,
        args.documentId,
        async (checkSlug) => await slugExists(ctx, checkSlug, args.documentId),
      );

      if (newSlug !== document.slug) {
        const { newHistory, deletedSlug } = addToSlugHistory(
          document.slugHistory,
          document.slug,
        );
        slugDeleted = deletedSlug;

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
    assertDocumentEditable(document);

    await ctx.db.patch(args.documentId, {
      type: args.type as DocumentType,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update document cover image and prompt (atomic).
 * Only allowed for documents in "building" status.
 * Pass `coverImage: undefined` to remove the cover image entirely.
 */
export const updateCoverImage = mutation({
  args: {
    documentId: v.id("documents"),
    coverImage: v.optional(
      v.object({
        storageId: v.optional(v.id("_storage")),
        prompt: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);

    if (
      document.coverImage?.storageId &&
      args.coverImage?.storageId !== document.coverImage.storageId
    ) {
      await ctx.storage.delete(document.coverImage.storageId);
    }

    await ctx.db.patch(args.documentId, {
      coverImage: args.coverImage,
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
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if ("description" in args) {
      updates.description = args.description;
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Update document reprint metadata.
 * Only allowed for documents in "building" status.
 */
export const updateReprint = mutation({
  args: {
    documentId: v.id("documents"),
    reprint: reprintDataValidator,
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);

    await ctx.db.patch(args.documentId, {
      reprint: args.reprint,
      updatedAt: Date.now(),
    });
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
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);

    const updates: Record<string, unknown> = {
      content: args.content,
      updatedAt: Date.now(),
    };

    const oldImageIds = document.imageStorageIds ?? [];
    const newImageIds = args.imageStorageIds ?? [];
    const removedIds = oldImageIds.filter(
      (id) => !newImageIds.includes(id),
    );
    for (const storageId of removedIds) {
      await ctx.storage.delete(storageId).catch(() => {});
    }
    updates.imageStorageIds = newImageIds;

    if (!isValidTitle(document.title)) {
      const contentHasText = hasContent(args.content as JSONContent);
      const extractedTitle = extractFirstHeading(args.content as JSONContent);

      if (extractedTitle && isValidTitle(extractedTitle)) {
        updates.title = extractedTitle;

        const newSlug = await generateUniqueSlug(
          extractedTitle,
          args.documentId,
          async (checkSlug) =>
            await slugExists(ctx, checkSlug, args.documentId),
        );

        updates.slug = newSlug;
      } else if (!contentHasText) {
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

    if (document.type === "reprint" && document.reprint?.originalAuthorId) {
      const author = await ctx.db.get(document.reprint.originalAuthorId);
      if (author && !author.isVerified) {
        const isAdmin = await Auth.isAdmin(ctx);
        if (!isAdmin) {
          throwConvexError(
            ErrorCode.AUTHOR_UNVERIFIED,
            `Original author "${author.name}" must be verified before publishing`,
          );
        }
      }
    }

    const { estimatedReadTime, description } =
      computePublishMetadata(document);

    await ctx.db.patch(args.documentId, {
      status: "published",
      isVisible: true,
      publishedAt: Date.now(),
      estimatedReadTime,
      description,
      updatedAt: Date.now(),
    });

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

    if (!document.coverImage?.storageId) {
      throwConvexError(ErrorCode.DOCUMENT_COVER_REQUIRED);
    }

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

    await updateStatusCount(ctx, "building", "pending");
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

    const imageIds = document.imageStorageIds ?? [];
    for (const storageId of imageIds) {
      await ctx.storage.delete(storageId).catch(() => {});
    }
    if (document.coverImage?.storageId) {
      await ctx.storage.delete(document.coverImage.storageId).catch(() => {});
    }

    await ctx.db.delete(args.documentId);

    await decrementStatusCount(ctx, document.status);
  },
});

// Re-export domain-specific mutations
export * from "./mutations_inspirations";
export * from "./mutations_admin";
