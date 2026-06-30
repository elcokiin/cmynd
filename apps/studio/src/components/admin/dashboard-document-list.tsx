import type { AdminDocumentListItem } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Pagination } from "@elcokiin/ui/pagination";
import { Input } from "@elcokiin/ui/input";
import { Badge } from "@elcokiin/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@elcokiin/ui/select";
import { Link, useNavigate } from "@tanstack/react-router";
import { HourglassIcon, SearchIcon } from "lucide-react";

import { useUrlSyncedPagination } from "@/hooks/use-url-synced-pagination";
import { useSearchUrlSync } from "@/hooks/use-search-url-sync";

type DashboardDocumentListProps = {
  urlPage: number;
  status: "pending" | "published" | "all";
  search: string;
};

type DocumentRowProps = {
  document: AdminDocumentListItem;
  showStatusBadge: boolean;
};

function DocumentRow({
  document,
  showStatusBadge,
}: DocumentRowProps): React.ReactNode {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(document.submittedAt ?? document.updatedAt));

  const statusLabel =
    document.status === "published"
      ? "Published"
      : document.status === "pending"
        ? "Pending"
        : "Building";

  const statusVariant =
    document.status === "published"
      ? "default"
      : document.status === "pending"
        ? "secondary"
        : "outline";

  return (
    <Link
      key={document._id}
      to="/admin/review/$slug"
      params={{ slug: document.slug }}
      className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-muted/50 rounded px-2 -mx-2 py-1 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{document.title || "Untitled"}</p>
          {showStatusBadge && (
            <Badge variant={statusVariant} className="text-xs">
              {statusLabel}
            </Badge>
          )}
        </div>
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

export function DashboardDocumentList({
  urlPage,
  status,
  search,
}: DashboardDocumentListProps): React.ReactNode {
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 5;

  const { localSearch, setLocalSearch } = useSearchUrlSync({
    urlSearch: search,
    baseRoute: "/admin",
  });

  const pagination = useUrlSyncedPagination(
    api.documents.queries.listForAdmin,
    { status, search },
    {
      urlPage,
      pageSize: ITEMS_PER_PAGE,
    },
  );

  const documents = pagination.items;
  const isLoading = pagination.isLoading;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = (value: string | null) => {
    navigate({
      to: "/admin",
      search: (old) => ({
        ...old,
        status: (value ?? "all") as "pending" | "published" | "all",
        page: 1,
      }),
    });
  };

  // Show status badge when viewing "all" documents
  const showStatusBadge = status === "all";

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
                value={localSearch}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="py-10 text-center">
            <HourglassIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No documents found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentRow 
                key={doc._id} 
                document={doc} 
                showStatusBadge={showStatusBadge}
              />
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
