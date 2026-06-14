import { v } from "convex/values";
import { paginatedValidator } from "./utils";

// Slug history entry for tracking old slugs (FIFO queue, max 3 entries)
export const slugHistoryEntryValidator = v.object({
  slug: v.string(),
  createdAt: v.number(),
});

// Primitives
export const documentTypeValidator = v.union(
  v.literal("own"),
  v.literal("reprint"),
  v.literal("inspiration"),
);

export const documentStatusValidator = v.union(
  v.literal("building"),
  v.literal("pending"),
  v.literal("published"),
);

export const documentContentFormatValidator = v.union(
  v.literal("rich_json"),
  v.literal("markdown_imported"),
);

export const reprintDataValidator = v.object({
  originalAuthor: v.string(),
  originalAuthorId: v.optional(v.id("authors")),
  originalTitle: v.optional(v.string()),
  originalDate: v.optional(v.number()),
  sourceUrl: v.optional(v.string()),
  license: v.optional(v.string()),
  translator: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const inspirationValidator = v.object({
  url: v.string(),
  title: v.string(),
  author: v.optional(v.string()),
});

// Schema validator - used by defineTable() in schema.ts
export const documentValidator = {
  title: v.string(),
  slug: v.string(),
  content: v.any(),
  markdownSource: v.optional(v.string()),
  contentFormat: v.optional(documentContentFormatValidator),
  description: v.optional(v.string()),
  coverImagePrompt: v.optional(v.string()),
  type: documentTypeValidator,
  status: documentStatusValidator,
  authorId: v.id("authors"),
  coverImageId: v.optional(v.id("_storage")),
  reprint: v.optional(reprintDataValidator),
  inspirations: v.optional(v.array(inspirationValidator)),
  createdAt: v.number(),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
  estimatedReadTime: v.optional(v.number()),
  isVisible: v.optional(v.boolean()),
  submittedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),
  submissionHistory: v.optional(v.array(v.number())),
  slugHistory: v.optional(v.array(slugHistoryEntryValidator)),
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
  isVisible: v.optional(v.boolean()),
});

// Minimal fields for admin review and management
export const adminDocumentListItemValidator = v.object({
  _id: v.id("documents"),
  title: v.string(),
  slug: v.string(),
  type: documentTypeValidator,
  status: documentStatusValidator,
  submittedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  isVisible: v.optional(v.boolean()),
});

export const adminPublishedDocumentListItemValidator = v.object({
  _id: v.id("documents"),
  title: v.string(),
  slug: v.string(),
  type: documentTypeValidator,
  status: v.literal("published"),
  publishedAt: v.number(),
  updatedAt: v.number(),
  isVisible: v.boolean(),
});

/**
 * @deprecated Use adminDocumentListItemValidator instead
 */
export const pendingDocumentListItemValidator = adminDocumentListItemValidator;

// Includes author info, excludes content
export const publishedDocumentListItemValidator = v.object({
  _id: v.id("documents"),
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  type: documentTypeValidator,
  coverImageId: v.optional(v.id("_storage")),
  publishedAt: v.number(),
  author: publicAuthorValidator,
});

// Paginated wrappers
export const paginatedDocumentListValidator = paginatedValidator(
  documentListItemValidator,
);

export const paginatedAdminDocumentListValidator = paginatedValidator(
  adminDocumentListItemValidator,
);

/**
 * @deprecated Use paginatedAdminDocumentListValidator instead
 */
export const paginatedPendingDocumentListValidator =
  paginatedAdminDocumentListValidator;

export const paginatedPublishedDocumentListValidator = paginatedValidator(
  publishedDocumentListItemValidator,
);

export const paginatedAdminPublishedDocumentListValidator = paginatedValidator(
  adminPublishedDocumentListItemValidator,
);
