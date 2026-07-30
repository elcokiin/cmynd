import { paginationResultValidator } from "convex/server";
import type { Validator, Value } from "convex/values";

export function paginatedValidator<T extends Value>(
  itemValidator: Validator<T, "required", string>,
) {
  return paginationResultValidator(itemValidator);
}

// Type helper for paginated results
export type PaginatedResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
  pageStatus?: "SplitRecommended" | "SplitRequired" | null;
  splitCursor?: string | null;
};
