import type { Doc } from "../_generated/dataModel";
import type { PublicAuthor } from "../../lib/types/authors";

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
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  };
}
