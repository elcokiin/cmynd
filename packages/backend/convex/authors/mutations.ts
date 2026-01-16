import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { phraseValidator } from "../../lib/validators/authors";
import { createGuestAuthor, getAuthorById } from "./helpers";
import { DocumentOwnershipError } from "@elcokiin/errors/backend";
import type { Id } from "../_generated/dataModel";

/**
 * Create a guest author (without user account).
 * Any authenticated user can create guest authors.
 */
export const createGuest = mutation({
  args: {
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phrases: v.optional(v.array(phraseValidator)),
  },
  handler: async (ctx, args): Promise<Id<"authors">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await createGuestAuthor(ctx, args);
  },
});

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
      throw new Error("Not authenticated");
    }

    const author = await getAuthorById(ctx, args.authorId);

    if (author.userId !== identity.subject) {
      throw new DocumentOwnershipError();
    }

    if (args.avatarUrl) {
      try {
        new URL(args.avatarUrl);
      } catch {
        throw new Error("Invalid avatar URL format");
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
