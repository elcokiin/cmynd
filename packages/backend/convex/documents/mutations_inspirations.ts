import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { inspirationValidator } from "../../lib/validators/documents";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import {
  getByIdForAuthor,
  assertDocumentEditable,
  assertNotReprint,
  deriveDocumentTypeFromInspirations,
} from "./helpers";

/**
 * Update document inspirations (full replacement).
 * Only allowed for documents in "building" status.
 * Reprint documents cannot have inspirations.
 */
export const updateInspirations = mutation({
  args: {
    documentId: v.id("documents"),
    inspirations: v.array(inspirationValidator),
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);
    assertNotReprint(document);

    const updates: Record<string, unknown> = {
      inspirations: args.inspirations,
      updatedAt: Date.now(),
    };

    const newType = deriveDocumentTypeFromInspirations(
      document.type,
      args.inspirations.length,
    );
    if (newType) {
      updates.type = newType;
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Add a single inspiration to a document.
 * Only allowed for documents in "building" status.
 * Reprint documents cannot have inspirations.
 */
export const addInspiration = mutation({
  args: {
    documentId: v.id("documents"),
    inspiration: inspirationValidator,
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);
    assertNotReprint(document);

    const newInspirations = [...(document.inspirations ?? []), args.inspiration];

    const updates: Record<string, unknown> = {
      inspirations: newInspirations,
      updatedAt: Date.now(),
    };

    const newType = deriveDocumentTypeFromInspirations(
      document.type,
      newInspirations.length,
    );
    if (newType) {
      updates.type = newType;
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Remove a single inspiration by index.
 * Only allowed for documents in "building" status.
 */
export const removeInspiration = mutation({
  args: {
    documentId: v.id("documents"),
    index: v.number(),
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);

    const currentInspirations = document.inspirations ?? [];
    if (args.index < 0 || args.index >= currentInspirations.length) {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Invalid inspiration index",
      );
    }

    const newInspirations = currentInspirations.filter(
      (_, i) => i !== args.index,
    );

    const updates: Record<string, unknown> = {
      inspirations: newInspirations,
      updatedAt: Date.now(),
    };

    const newType = deriveDocumentTypeFromInspirations(
      document.type,
      newInspirations.length,
    );
    if (newType) {
      updates.type = newType;
    }

    await ctx.db.patch(args.documentId, updates);
  },
});

/**
 * Update a single inspiration by index.
 * Only allowed for documents in "building" status.
 * Does not change document type (count stays the same).
 */
export const updateInspiration = mutation({
  args: {
    documentId: v.id("documents"),
    index: v.number(),
    inspiration: inspirationValidator,
  },
  handler: async (ctx, args) => {
    const document = await getByIdForAuthor(ctx, args.documentId);
    assertDocumentEditable(document);

    const currentInspirations = document.inspirations ?? [];
    if (args.index < 0 || args.index >= currentInspirations.length) {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Invalid inspiration index",
      );
    }

    const newInspirations = currentInspirations.map((insp, i) =>
      i === args.index ? args.inspiration : insp,
    );

    await ctx.db.patch(args.documentId, {
      inspirations: newInspirations,
      updatedAt: Date.now(),
    });
  },
});
