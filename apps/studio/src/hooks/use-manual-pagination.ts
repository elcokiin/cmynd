import { useQuery } from "convex/react";
import { useState, useCallback, useMemo } from "react";
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
  const [cursorMap, setCursorMap] = useState<Map<number, string | null>>(
    new Map([[1, null]]),
  );

  const cursor = cursorMap.get(currentPage) ?? null;

  const result = useQuery(query, {
    ...args,
    paginationOpts: {
      numItems: pageSize,
      cursor,
    },
  } as any) as PaginationResult<any> | undefined;

  useMemo(() => {
    if (result?.continueCursor && !cursorMap.has(currentPage + 1)) {
      setCursorMap((prev) => {
        const next = new Map(prev);
        next.set(currentPage + 1, result.continueCursor);
        return next;
      });
    }
  }, [result?.continueCursor, currentPage, cursorMap]);

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
