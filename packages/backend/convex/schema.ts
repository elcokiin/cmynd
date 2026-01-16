import { defineSchema, defineTable } from "convex/server";
import { authorValidator } from "../lib/validators/authors";
import { documentValidator } from "../lib/validators/documents";

export default defineSchema({
  authors: defineTable(authorValidator)
    .index("by_user_id", ["userId"]),

  documents: defineTable(documentValidator)
    .index("by_author", ["authorId"])
    .index("by_status", ["status", "createdAt"]),
});
