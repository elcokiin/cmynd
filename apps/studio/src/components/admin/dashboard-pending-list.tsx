import type { PendingDocumentListItem } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { buttonVariants } from "@elcokiin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Pagination } from "@elcokiin/ui/pagination";
import { cn } from "@elcokiin/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { FileCheckIcon, HourglassIcon } from "lucide-react";

import { useUrlSyncedPagination } from "@/hooks/use-url-synced-pagination";

type DashboardPendingListProps = {
  urlPage: number;
};

type PendingDocumentRowProps = {
  document: PendingDocumentListItem;
};

function PendingDocumentRow({
  document,
}: PendingDocumentRowProps): React.ReactNode {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(document.submittedAt ?? document.updatedAt));

  return (
    <Link
      key={document._id}
      to="/admin/review"
      search={{ doc: document._id }}
      className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-muted/50 rounded px-2 -mx-2 py-1 transition-colors"
    >
      <div className="flex-1">
        <p className="font-medium">{document.title || "Untitled"}</p>
        <p className="text-sm text-muted-foreground capitalize">
          {document.type}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>
    </Link>
  );
}

export function DashboardPendingList({
  urlPage,
}: DashboardPendingListProps): React.ReactNode {
  const ITEMS_PER_PAGE = 5;

  const pagination = useUrlSyncedPagination(
    api.documents.queries.listPendingForAdmin,
    {},
    {
      urlPage,
      pageSize: ITEMS_PER_PAGE,
    },
  );

  const pendingDocuments = pagination.items;
  const isLoading = pagination.isLoading;

  // Show empty state only on page 1
  const shouldShowEmptyState =
    pendingDocuments &&
    pendingDocuments.length === 0 &&
    pagination.currentPage === 1;

  // Don't render anything if loading or no documents
  if (isLoading || !pendingDocuments) {
    return null;
  }

  // Empty state on first page
  if (shouldShowEmptyState) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <HourglassIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No documents pending review</p>
        </CardContent>
      </Card>
    );
  }

  // No documents on other pages (shouldn't happen but handle it)
  if (pendingDocuments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pending Documents</CardTitle>
          <Link
            to="/admin/review"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2",
            )}
          >
            Review All
            <FileCheckIcon className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {pendingDocuments.map((doc) => (
            <PendingDocumentRow key={doc._id} document={doc} />
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            showFirstLast={false}
            className="pt-2 border-t"
          />
        )}
      </CardContent>
    </Card>
  );
}
