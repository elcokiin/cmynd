import { v, type Validator } from "convex/values";

// Creates paginated validator wrapper for query results
export function paginatedValidator<T>(itemValidator: Validator<T, any, any>) {
  return v.object({
    page: v.array(itemValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  });
}

// Type helper for paginated results
export type PaginatedResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

// Schema validators used by defineTable() - require migration planning
export const SCHEMA_VALIDATORS = ["documentValidator", "authorValidator"] as const;
