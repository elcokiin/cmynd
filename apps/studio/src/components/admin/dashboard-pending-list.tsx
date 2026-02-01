import type { PendingDocumentListItem } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Pagination } from "@elcokiin/ui/pagination";
import { Input } from "@elcokiin/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { HourglassIcon, SearchIcon } from "lucide-react";

import { useUrlSyncedPagination } from "@/hooks/use-url-synced-pagination";

type DashboardPendingListProps = {
  urlPage: number;
  status: "pending" | "published" | "all";
  search: string;
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
      to="/admin/review/$slug"
      params={{ slug: document.slug }}
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
  status,
  search,
}: DashboardPendingListProps): React.ReactNode {
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 5;

  const pagination = useUrlSyncedPagination(
    api.documents.queries.listForAdmin,
    { status, search },
    {
      urlPage,
      pageSize: ITEMS_PER_PAGE,
    },
  );

  const pendingDocuments = pagination.items;
  const isLoading = pagination.isLoading;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({
      search: (old) => ({
        ...old,
        search: e.target.value,
        page: 1,
      }),
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate({
      search: (old) => ({
        ...old,
        status: e.target.value as any,
        page: 1,
      }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle>Documents</CardTitle>
          <div className="flex items-center space-x-2">
             <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <select
              className="h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : !pendingDocuments || pendingDocuments.length === 0 ? (
          <div className="py-10 text-center">
            <HourglassIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No documents found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDocuments.map((doc) => (
              <PendingDocumentRow key={doc._id} document={doc} />
            ))}
          </div>
        )}

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
