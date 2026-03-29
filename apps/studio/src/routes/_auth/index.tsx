import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePaginatedQuery } from "convex/react";
import { useCallback } from "react";

import {
  CreateDocumentButton,
  DashboardSkeleton,
  DocumentCard,
  DocumentListSkeleton,
  EmptyState,
} from "@/components/dashboard";

export const Route = createFileRoute("/_auth/")({
  component: DashboardRoute,
  pendingComponent: DashboardSkeleton,
});

function DashboardRoute() {
  const navigate = useNavigate();

  const { results, status, loadMore } = usePaginatedQuery(
    api.documents.queries.list,
    {},
    { initialNumItems: 20 },
  );

  const isLoading = results === undefined;
  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  // Memoized navigation handler to prevent function recreation on each render
  const handleOpenDocument = useCallback(
    (slug: string) => {
      navigate({ to: "/editor/$slug", params: { slug } });
    },
    [navigate],
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your documents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CreateDocumentButton />
        </div>
      </div>

      {isLoading ? (
        <DocumentListSkeleton />
      ) : results.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {results.map((doc) => (
              <div key={doc._id} className="mb-4 break-inside-avoid">
                <DocumentCard
                  document={doc}
                  onOpen={() => handleOpenDocument(doc.slug)}
                />
              </div>
            ))}
          </div>

          {(canLoadMore || isLoadingMore) && (
            <div className="mt-8 flex flex-col items-center gap-4">
              {isLoadingMore && <DocumentListSkeleton count={3} />}
              {canLoadMore && (
                <Button
                  variant="outline"
                  onClick={() => loadMore(10)}
                  disabled={isLoadingMore}
                  className="w-full md:w-auto min-w-[200px]"
                >
                  Show More
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
