import type { Doc } from "../_generated/dataModel";
import type { PublicAuthor, AdminAuthor } from "../../lib/types/authors";

/**
 * Convert a full author record to public author data.
 * Excludes userId field for security.
 */
export function toPublicAuthor(author: Doc<"authors">): PublicAuthor {
  return {
    _id: author._id,
    name: author.name,
    avatarUrl: author.avatarUrl,
    bio: author.bio,
    phrases: author.phrases,
    isReprinted: author.isReprinted,
    isVerified: author.isVerified,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  };
}

/**
 * Convert a full author record to admin author data.
 * Includes userId for admin operations.
 */
export function toAdminAuthor(author: Doc<"authors">): AdminAuthor {
  return {
    _id: author._id,
    name: author.name,
    avatarUrl: author.avatarUrl,
    userId: author.userId,
    bio: author.bio,
    phrases: author.phrases,
    isReprinted: author.isReprinted,
    isVerified: author.isVerified,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  };
}
