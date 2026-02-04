import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { phraseValidator } from "../../lib/validators/authors";
import { getAuthorById } from "./helpers";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";

/**
 * Update own author profile.
 * Users can only update their own author profile (checked via userId).
 */
export const update = mutation({
  args: {
    authorId: v.id("authors"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phrases: v.optional(v.array(phraseValidator)),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwConvexError(ErrorCode.UNAUTHENTICATED);
    }

    const author = await getAuthorById(ctx, args.authorId);

    if (author.userId !== identity.subject) {
      throwConvexError(ErrorCode.AUTHOR_OWNERSHIP);
    }

    if (args.avatarUrl) {
      try {
        new URL(args.avatarUrl);
      } catch {
        throwConvexError(ErrorCode.AUTHOR_INVALID_AVATAR_URL);
      }
    }

    const updates: Partial<typeof author> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.phrases !== undefined) updates.phrases = args.phrases;

    await ctx.db.patch(args.authorId, updates);
  },
});
