import type { Doc, Id } from "../../convex/_generated/dataModel";

/**
 * Phrase with metadata (notable quotes, sayings, etc.)
 */
export type Phrase = {
  text: string;
  source?: string;
  year?: number;
  context?: string;
};

/**
 * Full author record from database.
 * Authors can be linked to Better-Auth users (userId present) or guest authors (userId absent).
 */
export type Author = Doc<"authors">;

/**
 * Public author data for display (safe for external use).
 * Includes only non-sensitive fields.
 */
export type PublicAuthor = {
  _id: Id<"authors">;
  name: string;
  avatarUrl?: string;
  bio?: string;
  phrases?: Phrase[];
  createdAt: number;
  updatedAt: number;
};

/**
 * Input for creating a guest author (without user account).
 */
export type CreateGuestAuthorInput = {
  name: string;
  avatarUrl?: string;
  bio?: string;
  phrases?: Phrase[];
};
