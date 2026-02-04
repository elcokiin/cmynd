import { v, type Validator } from "convex/values";

// Creates paginated validator wrapper for query results
// Supports Convex v1.31+ pagination fields (pageStatus, splitCursor)
export function paginatedValidator<T>(itemValidator: Validator<T, any, any>) {
  return v.object({
    page: v.array(itemValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
    // Convex v1.31+ fields for split pagination
    pageStatus: v.optional(
      v.union(
        v.literal("SplitRecommended"),
        v.literal("SplitRequired"),
        v.null(),
      ),
    ),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  });
}

// Type helper for paginated results
export type PaginatedResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
  pageStatus?: "SplitRecommended" | "SplitRequired" | null;
  splitCursor?: string | null;
};
