import { v } from "convex/values";
import { paginatedValidator } from "./utils";

// Primitives
export const phraseValidator = v.object({
  text: v.string(),
  source: v.optional(v.string()),
  year: v.optional(v.number()),
  context: v.optional(v.string()),
});

// Schema validator - used by defineTable() in schema.ts
export const authorValidator = v.object({
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  userId: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  bio: v.optional(v.string()),
  phrases: v.optional(v.array(phraseValidator)),
  isVerified: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Query return validators - API responses only, no schema impact
// Excludes userId field for security
export const publicAuthorValidator = v.object({
  _id: v.id("authors"),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  phrases: v.optional(v.array(phraseValidator)),
  isVerified: v.optional(v.boolean()),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Paginated wrappers
export const paginatedAuthorsValidator = paginatedValidator(
  publicAuthorValidator,
);

// Admin author validator
export const adminAuthorValidator = v.object({
  _id: v.id("authors"),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  userId: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  bio: v.optional(v.string()),
  phrases: v.optional(v.array(phraseValidator)),
  isVerified: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const paginatedAdminAuthorsValidator = paginatedValidator(
  adminAuthorValidator,
);

// Create reprinted author args
export const createReprintedAuthorValidator = v.object({
  name: v.string(),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
});
