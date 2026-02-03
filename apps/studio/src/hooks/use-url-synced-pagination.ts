import type { FunctionReference } from "convex/server";

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useManualPagination } from "./use-manual-pagination";

type UseUrlSyncedPaginationOptions = {
  urlPage: number;
  pageSize: number;
};

/**
 * Wraps useManualPagination with URL sync logic.
 *
 * Handles bidirectional sync between URL search params and pagination state:
 * - On mount: Initializes pagination to match URL page
 * - On page change: Updates URL to match current page
 *
 * This hook is ideal for route-level pagination where:
 * - Users should be able to share paginated URLs
 * - Browser back/forward buttons should work
 * - Page state should persist across navigation
 *
 * For local-only pagination (without URL sync), use `useManualPagination` directly.
 *
 * @param query - Convex paginated query function
 * @param args - Query arguments (will be merged with paginationOpts)
 * @param options - URL sync configuration
 * @param options.urlPage - Current page from URL search params
 * @param options.pageSize - Number of items per page
 * @returns Pagination state with automatic URL sync (same API as useManualPagination)
 *
 * @example
 * ```typescript
 * function MyPage() {
 *   const { page: urlPage = 1 } = Route.useSearch();
 *
 *   const pagination = useUrlSyncedPagination(
 *     api.documents.queries.list,
 *     {},
 *     {
 *       urlPage,
 *       pageSize: 20,
 *     }
 *   );
 *
 *   return (
 *     <div>
 *       {pagination.items.map(item => <div key={item._id}>{item.name}</div>)}
 *       <Pagination
 *         currentPage={pagination.currentPage}
 *         totalPages={pagination.totalPages}
 *         onPageChange={pagination.goToPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUrlSyncedPagination<
  Query extends FunctionReference<"query", "public", any, any>,
>(
  query: Query,
  args: Record<string, any>,
  options: UseUrlSyncedPaginationOptions,
) {
  const { urlPage, pageSize } = options;
  const navigate = useNavigate();

  const pagination = useManualPagination(query, args, pageSize);

  // Effect 1: URL → Pagination State
  // Sync pagination to URL when urlPage changes (e.g., back/forward navigation)
  useEffect(() => {
    if (pagination.currentPage !== urlPage) {
      pagination.goToPage(urlPage);
    }
  }, [urlPage, pagination.currentPage, pagination.goToPage]);

  // Effect 2: Pagination State → URL
  // When user changes page via pagination controls, update URL preserving existing params
  useEffect(() => {
    if (
      !pagination.isLoading &&
      pagination.currentPage !== urlPage
    ) {
      navigate({
        search: (prev: Record<string, unknown>) => ({ ...prev, page: pagination.currentPage }),
      } as Parameters<typeof navigate>[0]);
    }
  }, [pagination.currentPage, pagination.isLoading, urlPage, navigate]);

  return pagination;
}
