import { v } from "convex/values";

export const documentTypeValidator = v.union(
  v.literal("own"),
  v.literal("curated"),
  v.literal("inspiration"),
);

export const documentStatusValidator = v.union(
  v.literal("building"),
  v.literal("pending"),
  v.literal("published"),
);

export const curationDataValidator = v.object({
  sourceUrl: v.string(),
  sourceTitle: v.string(),
  sourceAuthor: v.optional(v.string()),
  spin: v.string(),
});

export const referenceValidator = v.object({
  url: v.string(),
  title: v.string(),
  author: v.optional(v.string()),
});

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
  submittedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),
  submissionHistory: v.optional(v.array(v.number())),
};
