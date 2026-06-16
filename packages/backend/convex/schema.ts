import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authorValidator } from "../lib/validators/authors";
import { documentValidator } from "../lib/validators/documents";

export default defineSchema({
  authors: defineTable(authorValidator)
    .index("by_user_id", ["userId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["isVerified"],
    }),

  documents: defineTable(documentValidator)
    .index("by_author", ["authorId"])
    .index("by_status", ["status", "createdAt"])
    .index("by_slug", ["slug"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status"],
    }),

  documentStats: defineTable({
    buildingCount: v.number(),
    pendingCount: v.number(),
    publishedCount: v.number(),
    updatedAt: v.number(),
  }),
});
