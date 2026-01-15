import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Button } from "./button";
import { cn } from "../lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
}: PaginationProps) {
  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {showFirstLast && (
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          <ChevronsLeftIcon className="h-4 w-4" />
        </PaginationButton>
      )}

      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </PaginationButton>

      {pages.map((page, index) =>
        page === "..." ? (
          <PaginationEllipsis key={`ellipsis-${index}`} />
        ) : (
          <PaginationButton
            key={page}
            onClick={() => onPageChange(page as number)}
            isActive={currentPage === page}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </PaginationButton>

      {showFirstLast && (
        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </PaginationButton>
      )}
    </nav>
  );
}

type PaginationButtonProps = ButtonPrimitive.Props & {
  isActive?: boolean;
};

function PaginationButton({
  className,
  isActive,
  ...props
}: PaginationButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="icon"
      className={cn("h-8 w-8", className)}
      {...props}
    />
  );
}

function PaginationEllipsis() {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
      <span className="sr-only">More pages</span>
    </div>
  );
}

/**
 * Generate page numbers with ellipsis for large page counts.
 * 
 * Examples:
 * - [1, 2, 3, 4, 5] (5 pages or less)
 * - [1, 2, 3, ..., 10] (at beginning)
 * - [1, ..., 5, 6, 7, ..., 10] (in middle)
 * - [1, ..., 8, 9, 10] (at end)
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): Array<number | "..."> {
  const delta = 1;
  const range: Array<number | "..."> = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      range.push(i);
    }
    return range;
  }

  range.push(1);
  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  if (start > 2) range.push("...");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push("...");
  range.push(totalPages);

  return range;
}

export { PaginationButton, PaginationEllipsis };
