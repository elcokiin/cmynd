import { api } from "@elcokiin/backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import {
  CreateDocumentButton,
  DashboardSkeleton,
  DocumentCard,
  DocumentListSkeleton,
  EmptyState,
} from "@/components/dashboard";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/_auth/")({
  component: DashboardRoute,
  pendingComponent: DashboardSkeleton,
});

function DashboardRoute() {
  const documents = useQuery(api.documents.queries.list);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your documents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CreateDocumentButton />
          <UserMenu />
        </div>
      </div>

      {/* Document list */}
      {documents === undefined ? (
        <DocumentListSkeleton />
      ) : documents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onOpen={() =>
                navigate({ to: "/editor/$documentId", params: { documentId: doc._id } })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
