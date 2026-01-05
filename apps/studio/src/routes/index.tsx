import { api } from "@elcokiin/backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";

import {
  CreateDocumentButton,
  DashboardSkeleton,
  DocumentCard,
  DocumentListSkeleton,
  EmptyState,
} from "@/components/dashboard";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center h-full">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </Unauthenticated>
      <AuthLoading>
        <DashboardSkeleton />
      </AuthLoading>
    </>
  );
}

function DashboardContent() {
  const documents = useQuery(api.documents.list);
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
