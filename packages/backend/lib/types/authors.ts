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
 * Authors can be created by users or admins.
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
  isVerified?: boolean;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Author data for admin management.
 * Includes sensitive fields like userId for admin operations.
 */
export type AdminAuthor = {
  _id: Id<"authors">;
  name: string;
  avatarUrl?: string;
  userId?: string;
  createdBy?: string;
  bio?: string;
  phrases?: Phrase[];
  isVerified?: boolean;
  createdAt: number;
  updatedAt: number;
};
