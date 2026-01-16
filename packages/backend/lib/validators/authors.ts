import { v } from "convex/values";

/**
 * Validator for a phrase with metadata.
 * Used to store notable quotes or phrases associated with an author.
 */
export const phraseValidator = v.object({
  text: v.string(),
  source: v.optional(v.string()),
  year: v.optional(v.number()),
  context: v.optional(v.string()),
});

/**
 * Validator for author profile data.
 * Authors can be linked to Better-Auth users (userId present) or guest authors (userId absent).
 */
export const authorValidator = v.object({
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  userId: v.optional(v.string()),
  bio: v.optional(v.string()),
  phrases: v.optional(v.array(phraseValidator)),
  createdAt: v.number(),
  updatedAt: v.number(),
});
