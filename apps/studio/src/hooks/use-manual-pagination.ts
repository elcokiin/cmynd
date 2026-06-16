import { useQuery } from "convex/react";
import { useState, useCallback, useEffect } from "react";
import type { FunctionReference } from "convex/server";
import type { PaginationResult } from "convex/server";

/**
 * Custom hook for numeric pagination (page 1, 2, 3...) with Convex paginated queries.
 *
 * Unlike usePaginatedQuery which provides "Load More" functionality, this hook:
 * - Allows jumping to specific page numbers
 * - Tracks cursors for each page in a Map
 * - Provides next/previous page navigation
 * - Estimates total pages based on pagination status
 *
 * @param query - Convex paginated query function
 * @param args - Additional query arguments (will be merged with paginationOpts)
 * @param pageSize - Number of items per page
 * @returns Pagination state and navigation functions
 */
export function useManualPagination<
  Query extends FunctionReference<"query", "public", any, any>,
>(query: Query, args: Record<string, any> = {}, pageSize: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorMap, setCursorMap] = useState<Map<string, string | null>>(
    new Map(),
  );

  const argsKey = JSON.stringify(args);

  // Reset pagination when query arguments change (e.g., status or search filter)
  // Cursors are tied to specific query parameters and become invalid when they change.
  useEffect(() => {
    setCurrentPage(1);
    setCursorMap(new Map());
  }, [argsKey]);

  const cursorKey = `${argsKey}:${currentPage}`;
  const cursor = cursorMap.get(cursorKey) ?? null;

  const result = useQuery(query, {
    ...args,
    paginationOpts: {
      numItems: pageSize,
      cursor,
    },
  } as any) as PaginationResult<any> | undefined;

  // Store cursor for next page when a new cursor is received
  useEffect(() => {
    if (result?.continueCursor) {
      const nextKey = `${argsKey}:${currentPage + 1}`;
      if (!cursorMap.has(nextKey)) {
        setCursorMap((prev) => {
          const next = new Map(prev);
          next.set(nextKey, result.continueCursor);
          return next;
        });
      }
    }
  }, [result?.continueCursor, currentPage, argsKey, cursorMap]);

  const isLoading = result === undefined;
  const hasNextPage = result?.isDone === false;
  const hasPreviousPage = currentPage > 1;
  const totalPages = hasNextPage ? currentPage + 1 : currentPage;

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  return {
    // Data
    items: result?.page ?? [],
    isLoading,

    // Pagination state
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    pageSize,

    // Navigation
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
  };
}
