import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
  documentTypeValidator,
  documentStatusValidator,
  curationDataValidator,
  referenceValidator,
} from "../../lib/validators/documents";
import * as Documents from "../model/documents";

// =============================================================================
// QUERIES
// =============================================================================

/**
 * Get a single document by ID.
 */
export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await Documents.getById(ctx, args.documentId);
  },
});

/**
 * Get a document for editing (author only).
 */
export const getForEdit = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await Documents.getByIdForAuthor(ctx, args.documentId);
  },
});

/**
 * List all documents for the current user.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await Documents.listByAuthor(ctx);
  },
});

/**
 * List documents by status for the current user.
 */
export const listByStatus = query({
  args: {
    status: documentStatusValidator,
  },
  handler: async (ctx, args) => {
    return await Documents.listByStatus(ctx, args.status);
  },
});

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Create a new document.
 */
export const create = mutation({
  args: {
    title: v.string(),
    type: documentTypeValidator,
    content: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await Documents.create(ctx, {
      title: args.title,
      type: args.type,
      content: args.content,
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
  handler: async (ctx, args) => {
    await Documents.updateMetadata(ctx, args.documentId, {
      title: args.title,
    });
  },
});

/**
 * Update document type.
 */
export const updateType = mutation({
  args: {
    documentId: v.id("documents"),
    type: documentTypeValidator,
  },
  handler: async (ctx, args) => {
    await Documents.updateType(ctx, args.documentId, args.type);
  },
});

/**
 * Update document content (auto-save).
 */
export const updateContent = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    await Documents.updateContent(ctx, args.documentId, args.content);
  },
});

/**
 * Update document metadata.
 */
export const updateMetadata = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    coverImageId: v.optional(v.union(v.id("_storage"), v.null())),
    curation: v.optional(v.union(curationDataValidator, v.null())),
    references: v.optional(v.array(referenceValidator)),
  },
  handler: async (ctx, args) => {
    const { documentId, ...input } = args;
    await Documents.updateMetadata(ctx, documentId, input);
  },
});

/**
 * Publish a document.
 */
export const publish = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Documents.publish(ctx, args.documentId);
  },
});

/**
 * Delete a document.
 */
export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Documents.remove(ctx, args.documentId);
  },
});
