import { v } from "convex/values";

/**
 * Validator for DocumentType.
 */
export const documentTypeValidator = v.union(
  v.literal("own"),
  v.literal("curated"),
  v.literal("inspiration"),
);

/**
 * Validator for DocumentStatus.
 */
export const documentStatusValidator = v.union(
  v.literal("building"),
  v.literal("published"),
);

/**
 * Validator for CurationData.
 */
export const curationDataValidator = v.object({
  sourceUrl: v.string(),
  sourceTitle: v.string(),
  sourceAuthor: v.optional(v.string()),
  spin: v.string(),
});

/**
 * Validator for Reference.
 */
export const referenceValidator = v.object({
  url: v.string(),
  title: v.string(),
  author: v.optional(v.string()),
});

/**
 * Complete document validator for schema.ts.
 */
export const documentValidator = {
  title: v.string(),
  content: v.any(),
  type: documentTypeValidator,
  status: documentStatusValidator,
  authorId: v.string(),
  coverImageId: v.optional(v.id("_storage")),
  curation: v.optional(curationDataValidator),
  references: v.optional(v.array(referenceValidator)),
  createdAt: v.number(),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
};
