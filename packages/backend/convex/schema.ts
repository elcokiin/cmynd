import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authorValidator } from "../lib/validators/authors";
import { documentValidator } from "../lib/validators/documents";

export default defineSchema({
  authors: defineTable(authorValidator).index("by_user_id", ["userId"]),

  documents: defineTable(documentValidator)
    .index("by_author", ["authorId"])
    .index("by_status", ["status", "createdAt"])
    .index("by_slug", ["slug"]),

  slugRedirects: defineTable({
    oldSlug: v.string(),
    documentId: v.id("documents"),
    createdAt: v.number(),
  })
    .index("by_old_slug", ["oldSlug"])
    .index("by_document_id", ["documentId"]),

  documentStats: defineTable({
    buildingCount: v.number(),
    pendingCount: v.number(),
    publishedCount: v.number(),
    updatedAt: v.number(),
  }),
});
