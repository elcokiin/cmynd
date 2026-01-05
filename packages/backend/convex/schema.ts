import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.any(), // Tiptap JSON content
    type: v.union(
      v.literal("own"),
      v.literal("curated"),
      v.literal("inspiration"),
    ),
    status: v.union(v.literal("building"), v.literal("published")),
    authorId: v.string(),

    coverImageId: v.optional(v.id("_storage")),

    curation: v.optional(
      v.object({
        sourceUrl: v.string(),
        sourceTitle: v.string(),
        sourceAuthor: v.optional(v.string()),
        spin: v.string(),
      }),
    ),

    references: v.optional(
      v.array(
        v.object({
          url: v.string(),
          title: v.string(),
          author: v.optional(v.string()),
        }),
      ),
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_author", ["authorId"])
    .index("by_author_and_status", ["authorId", "status"])
    .index("by_status", ["status", "createdAt"]),
});
