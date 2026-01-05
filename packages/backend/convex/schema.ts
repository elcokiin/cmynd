import { defineSchema, defineTable } from "convex/server";
import { documentValidator } from "./schemas/documents";

export default defineSchema({
  documents: defineTable(documentValidator)
    .index("by_author", ["authorId"])
    .index("by_author_and_status", ["authorId", "status"])
    .index("by_status", ["status", "createdAt"]),
});
