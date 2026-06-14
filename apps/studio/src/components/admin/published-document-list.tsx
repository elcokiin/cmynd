import type { AdminPublishedDocumentListItem } from "@elcokiin/backend/lib/types/documents";

import { useState } from "react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Pagination } from "@elcokiin/ui/pagination";
import { Input } from "@elcokiin/ui/input";
import { Button } from "@elcokiin/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { EyeIcon, EyeOffIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { useUrlSyncedPagination } from "@/hooks/use-url-synced-pagination";
import { useSearchUrlSync } from "@/hooks/use-search-url-sync";

type PublishedDocumentListProps = {
  urlPage: number;
  search: string;
};

type PublishedDocumentRowProps = {
  document: AdminPublishedDocumentListItem;
  onToggleVisibility: (documentId: AdminPublishedDocumentListItem["_id"], nextVisible: boolean) => Promise<void>;
  onOpenReview: (slug: string) => void;
  isToggling: boolean;
};

function PublishedDocumentRow({
  document,
  onToggleVisibility,
  onOpenReview,
  isToggling,
}: PublishedDocumentRowProps): React.ReactNode {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(document.publishedAt));

  const nextVisible = !document.isVisible;

  return (
    <div
      className="flex cursor-pointer flex-col gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between"
      role="button"
      tabIndex={0}
      onClick={() => onOpenReview(document.slug)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenReview(document.slug);
        }
      }}
      aria-label={`Open review for ${document.title || "Untitled"}`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium">{document.title || "Untitled"}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="capitalize">{document.type}</span>
          <span>Published {formattedDate}</span>
          <span className="truncate">/{document.slug}</span>
        </div>
      </div>

      <Button
        type="button"
        variant={document.isVisible ? "outline" : "default"}
        disabled={isToggling}
        onClick={(event) => {
          event.stopPropagation();
          onToggleVisibility(document._id, nextVisible);
        }}
        className="shrink-0"
      >
        {document.isVisible ? (
          <EyeOffIcon className="mr-2 h-4 w-4" />
        ) : (
          <EyeIcon className="mr-2 h-4 w-4" />
        )}
        {document.isVisible ? "Hide" : "Make Visible"}
      </Button>
    </div>
  );
}

export function PublishedDocumentList({
  urlPage,
  search,
}: PublishedDocumentListProps): React.ReactNode {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const setPublishedVisibility = useMutation(
    api.documents.mutations.setPublishedVisibility,
  );
  const ITEMS_PER_PAGE = 10;
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { localSearch, setLocalSearch, debouncedSearch } = useSearchUrlSync({
    urlSearch: search,
    baseRoute: "/admin/published",
  });

  const pagination = useUrlSyncedPagination(
    api.documents.queries.listPublishedForAdmin,
    { search: debouncedSearch },
    {
      urlPage,
      pageSize: ITEMS_PER_PAGE,
    },
  );

  const documents = pagination.items;
  const isLoading = pagination.isLoading;

  async function handleToggleVisibility(
    documentId: AdminPublishedDocumentListItem["_id"],
    nextVisible: boolean,
  ): Promise<void> {
    setTogglingId(documentId);
    try {
      await setPublishedVisibility({ documentId, isVisible: nextVisible });
      toast.success(nextVisible ? "Document is now visible" : "Document is now hidden");
    } catch (error) {
      handleError(error, { context: "PublishedDocumentList.handleToggleVisibility" });
    } finally {
      setTogglingId(null);
    }
  }

  function handleOpenReview(slug: string): void {
    navigate({
      to: "/admin/review/$slug",
      params: { slug },
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Published Documents</CardTitle>
          <div className="relative w-full md:w-[260px]">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search published..."
              className="pl-8"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">Loading published documents...</div>
        ) : !documents || documents.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No published documents found</div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <PublishedDocumentRow
                key={doc._id}
                document={doc}
                onToggleVisibility={handleToggleVisibility}
                onOpenReview={handleOpenReview}
                isToggling={togglingId === doc._id}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            showFirstLast={false}
            className="border-t pt-2"
          />
        )}
      </CardContent>
    </Card>
  );
}
