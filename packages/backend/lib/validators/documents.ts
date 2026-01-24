import { v } from "convex/values";
import { paginatedValidator } from "./utils";

// Primitives
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

// Schema validator - used by defineTable() in schema.ts
//Changes require database migrations
export const documentValidator = {
  title: v.string(),
  slug: v.string(),
  content: v.any(),
  type: documentTypeValidator,
  status: documentStatusValidator,
  authorId: v.id("authors"),
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

// Query return validators - API responses only, no schema impact
export const publicAuthorValidator = v.object({
  _id: v.id("authors"),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  phrases: v.optional(
    v.array(
      v.object({
        text: v.string(),
        source: v.optional(v.string()),
        year: v.optional(v.number()),
        context: v.optional(v.string()),
      }),
    ),
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Excludes 'content' field for performance
export const documentListItemValidator = v.object({
  _id: v.id("documents"),
  title: v.string(),
  slug: v.string(),
  type: documentTypeValidator,
  status: documentStatusValidator,
  coverImageId: v.optional(v.id("_storage")),
  createdAt: v.number(),
  updatedAt: v.number(),
  submittedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),
});

// Minimal fields for admin review
export const pendingDocumentListItemValidator = v.object({
  _id: v.id("documents"),
  title: v.string(),
  slug: v.string(),
  type: documentTypeValidator,
  submittedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Includes author info, excludes content
export const publishedDocumentListItemValidator = v.object({
  _id: v.id("documents"),
  title: v.string(),
  slug: v.string(),
  type: documentTypeValidator,
  coverImageId: v.optional(v.id("_storage")),
  publishedAt: v.number(),
  author: publicAuthorValidator,
});

// Paginated wrappers
export const paginatedDocumentListValidator = paginatedValidator(
  documentListItemValidator,
);

export const paginatedPendingDocumentListValidator = paginatedValidator(
  pendingDocumentListItemValidator,
);

export const paginatedPublishedDocumentListValidator = paginatedValidator(
  publishedDocumentListItemValidator,
);
