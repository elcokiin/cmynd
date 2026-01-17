import type { FunctionReference } from "convex/server";

import { useEffect, useRef } from "react";
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

  // Track if this is the initial mount to prevent circular updates
  const isInitialMount = useRef(true);

  // Effect 1: URL → Pagination State (on mount only)
  // When component mounts or URL changes, sync pagination to match URL
  useEffect(() => {
    if (isInitialMount.current && pagination.currentPage !== urlPage) {
      pagination.goToPage(urlPage);
      isInitialMount.current = false;
    }
  }, [urlPage, pagination.currentPage, pagination.goToPage]);

  // Effect 2: Pagination State → URL (skip on mount and during loading)
  // When user changes page, update URL to match
  useEffect(() => {
    if (
      !isInitialMount.current &&
      !pagination.isLoading &&
      pagination.currentPage !== urlPage
    ) {
      navigate({
        search: { page: pagination.currentPage } as any,
      });
    }
  }, [pagination.currentPage, pagination.isLoading, urlPage, navigate]);

  return pagination;
}
