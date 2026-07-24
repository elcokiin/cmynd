import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authorValidator } from "../lib/validators/authors";
import { documentValidator } from "../lib/validators/documents";
import {
  portfolioValidator,
  skillValidator,
  projectValidator,
  experienceValidator,
} from "../lib/validators/portfolio";

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

  portfolio: defineTable(portfolioValidator),

  skills: defineTable(skillValidator)
    .index("by_category", ["category"])
    .index("by_visible", ["isVisible"])
    .index("by_category_visible", ["category", "isVisible"]),

  projects: defineTable(projectValidator)
    .index("by_slug", ["slug"])
    .index("by_visible", ["isVisible"])
    .index("by_order", ["order"]),

  experience: defineTable(experienceValidator)
    .index("by_type", ["type"])
    .index("by_order", ["order"]),
});
