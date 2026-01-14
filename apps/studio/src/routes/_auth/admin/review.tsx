import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { useState } from "react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { buttonVariants } from "@elcokiin/ui/button";
import { cn } from "@elcokiin/ui/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
  ArrowLeftIcon,
  FileTextIcon,
  ListIcon,
  MessageSquareIcon,
} from "lucide-react";

import { PendingDocumentList } from "@/components/admin/pending-document-list";
import { DocumentPreview } from "@/components/admin/document-preview";
import { ReviewSidebar } from "@/components/admin/review-sidebar";
import { ReviewSkeleton } from "@/components/admin/review-skeleton";

type SearchParams = {
  doc?: string;
};

export const Route = createFileRoute("/_auth/admin/review")({
  component: AdminReviewPage,
  pendingComponent: ReviewSkeleton,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    doc: typeof search.doc === "string" ? search.doc : undefined,
  }),
});

type MobileTab = "list" | "preview" | "actions";

function AdminReviewPage() {
  const { doc: selectedDocId } = Route.useSearch();
  const navigate = useNavigate();

  const [mobileTab, setMobileTab] = useState<MobileTab>("list");

  const pendingDocuments = useQuery(api.documents.queries.listPendingForAdmin);
  const selectedDocument = useQuery(
    api.documents.queries.getForAdminReview,
    selectedDocId ? { documentId: selectedDocId as Id<"documents"> } : "skip",
  );

  const isLoadingDocument = selectedDocId !== undefined && selectedDocument === undefined;

  function handleSelectDocument(id: Id<"documents">): void {
    navigate({
      to: "/admin/review",
      search: { doc: id },
      replace: true,
    });
    setMobileTab("preview");
  }

  function handleActionComplete(): void {
    navigate({
      to: "/admin/review",
      search: {},
      replace: true,
    });
    setMobileTab("list");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold">Review Documents</h1>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden border-b flex">
        <MobileTabButton
          active={mobileTab === "list"}
          onClick={() => setMobileTab("list")}
          icon={ListIcon}
          label="Pending"
          badge={pendingDocuments?.length}
        />
        <MobileTabButton
          active={mobileTab === "preview"}
          onClick={() => setMobileTab("preview")}
          icon={FileTextIcon}
          label="Preview"
          disabled={!selectedDocId}
        />
        <MobileTabButton
          active={mobileTab === "actions"}
          onClick={() => setMobileTab("actions")}
          icon={MessageSquareIcon}
          label="Actions"
          disabled={!selectedDocId}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1">
          {/* Document List */}
          <div className="w-64 border-r overflow-auto">
            <PendingDocumentList
              documents={pendingDocuments}
              selectedId={selectedDocId as Id<"documents"> | null}
              onSelect={handleSelectDocument}
            />
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto">
            <DocumentPreview
              document={selectedDocument}
              isLoading={isLoadingDocument}
            />
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l p-4 overflow-auto">
            <ReviewSidebar
              documentId={selectedDocId as Id<"documents"> | null}
              documentTitle={selectedDocument?.title ?? null}
              onActionComplete={handleActionComplete}
              isLoading={isLoadingDocument}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-auto">
          {mobileTab === "list" && (
            <PendingDocumentList
              documents={pendingDocuments}
              selectedId={selectedDocId as Id<"documents"> | null}
              onSelect={handleSelectDocument}
            />
          )}
          {mobileTab === "preview" && (
            <DocumentPreview
              document={selectedDocument}
              isLoading={isLoadingDocument}
            />
          )}
          {mobileTab === "actions" && (
            <div className="p-4">
              <ReviewSidebar
                documentId={selectedDocId as Id<"documents"> | null}
                documentTitle={selectedDocument?.title ?? null}
                onActionComplete={handleActionComplete}
                isLoading={isLoadingDocument}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type MobileTabButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: typeof ListIcon;
  label: string;
  badge?: number;
  disabled?: boolean;
};

function MobileTabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
  disabled,
}: MobileTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors",
        active && "border-b-2 border-primary text-primary",
        !active && "text-muted-foreground hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
