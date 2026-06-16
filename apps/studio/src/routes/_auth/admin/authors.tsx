import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserIcon, CheckIcon, SearchIcon, PlusIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";

import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Badge } from "@elcokiin/ui/badge";
import { Pagination } from "@elcokiin/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@elcokiin/ui/select";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { CreateAuthorDialog } from "@/components/authors/create-author-dialog";
import { useUrlSyncedPagination } from "@/hooks/use-url-synced-pagination";
import { useSearchUrlSync } from "@/hooks/use-search-url-sync";

type AuthorsSearch = {
  page?: number;
  search?: string;
  status?: "all" | "verified" | "unverified";
};

export const Route = createFileRoute("/_auth/admin/authors")({
  component: AdminAuthorsPage,
  validateSearch: (search: Record<string, unknown>): AuthorsSearch => {
    return {
      page: Number(search.page) || 1,
      search: (search.search as string) || "",
      status:
        (search.status as "all" | "verified" | "unverified") || "unverified",
    };
  },
});

function AdminAuthorsPage() {
  const {
    page: urlPage = 1,
    search: urlSearch = "",
    status: urlStatus = "unverified",
  } = Route.useSearch();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { localSearch, setLocalSearch } = useSearchUrlSync({
    urlSearch,
    baseRoute: "/admin/authors",
  });

  const verifiedFilter =
    urlStatus === "all" ? undefined : urlStatus === "verified";

  const pagination = useUrlSyncedPagination(
    api.authors.queries.listForAdmin,
    { verified: verifiedFilter, search: urlSearch || undefined },
    { urlPage, pageSize: 10 },
  );

  const authors = pagination.items;
  const isLoading = pagination.isLoading;

  const approveMutation = useMutation(api.authors.mutations.approve);
  const unverifyMutation = useMutation(api.authors.mutations.unverify);

  const handleApproveAuthor = async (authorId: Id<"authors">) => {
    try {
      await approveMutation({ authorId });
    } catch (error) {
      handleError(error, { context: "AdminAuthorsPage.handleApproveAuthor" });
    }
  };

  const handleUnverifyAuthor = async (authorId: Id<"authors">) => {
    try {
      await unverifyMutation({ authorId });
    } catch (error) {
      handleError(error, { context: "AdminAuthorsPage.handleUnverifyAuthor" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Author Management</h2>
        <p className="text-muted-foreground">
          Manage reprinted authors and verification status
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Authors</CardTitle>
            <div className="flex items-center gap-4">
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Create Author
              </Button>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search authors..."
                  className="w-[200px] pl-8"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
              <Select
                value={urlStatus}
                onValueChange={(value) =>
                  navigate({
                    to: "/admin/authors",
                    search: (old) => ({
                      ...old,
                      status: value as "all" | "verified" | "unverified",
                      page: 1,
                    }),
                  })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectList>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectList>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading authors...</p>
            </div>
          ) : !authors || authors.length === 0 ? (
            <div className="py-10 text-center">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No authors found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {authors.map((author) => (
                <div
                  key={author._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {author.avatarUrl ? (
                        <img
                          src={author.avatarUrl}
                          alt={author.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{author.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {author.isVerified ? (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-yellow-600 border-yellow-600"
                          >
                            Unverified
                          </Badge>
                        )}
                        {author.userId && (
                          <Badge variant="outline" className="text-xs">
                            Has Account
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(author.createdAt).toLocaleDateString()}
                    </p>
                    {author.isVerified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnverifyAuthor(author._id)}
                        className="mt-2"
                      >
                        <UserIcon className="h-4 w-4 mr-1" />
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleApproveAuthor(author._id)}
                        className="mt-2"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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

      <CreateAuthorDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
