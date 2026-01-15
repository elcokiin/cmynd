import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { useState } from "react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Pagination } from "@elcokiin/ui/pagination";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { FileTextIcon, ListIcon, MessageSquareIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { MobileTabBar } from "@/components/admin/mobile-tab-bar";
import type { MobileTab } from "@/components/admin/review-page-layout";
import { PendingDocumentList } from "@/components/admin/pending-document-list";
import { DocumentPreview } from "@/components/admin/document-preview";
import { ReviewSidebar } from "@/components/admin/review-sidebar";
import { ReviewSkeleton } from "@/components/admin/review-skeleton";
import { useManualPagination } from "@/hooks/use-manual-pagination";

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

function AdminReviewPage() {
  const { doc: selectedDocId } = Route.useSearch();
  const navigate = useNavigate();

  const [mobileTab, setMobileTab] = useState<MobileTab>("list");

  const {
    items: pendingDocuments,
    isLoading: isLoadingDocuments,
    currentPage,
    totalPages,
    goToPage,
  } = useManualPagination(
    api.documents.queries.listPendingForAdmin,
    {},
    20 // Page size
  );

  const selectedDocument = useQuery(
    api.documents.queries.getForAdminReview,
    selectedDocId ? { documentId: selectedDocId as Id<"documents"> } : "skip"
  );

  const isLoadingDocument =
    selectedDocId !== undefined && selectedDocument === undefined;

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

  function handleTabChange(tabId: string): void {
    setMobileTab(tabId as MobileTab);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PageHeader
        title="Review Documents"
        backTo="/admin/dashboard"
        breadcrumbs={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Review" },
        ]}
      />

      {/* Mobile Tab Bar */}
      <MobileTabBar
        tabs={[
          {
            id: "list",
            label: "Pending",
            icon: ListIcon,
          },
          {
            id: "preview",
            label: "Preview",
            icon: FileTextIcon,
            disabled: !selectedDocId,
          },
          {
            id: "actions",
            label: "Actions",
            icon: MessageSquareIcon,
            disabled: !selectedDocId,
          },
        ]}
        activeTab={mobileTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col flex-1">
          <div className="flex flex-1 overflow-hidden">
            {/* Document List */}
            <div className="w-64 border-r flex flex-col">
              <div className="flex-1 overflow-auto">
                <PendingDocumentList
                  documents={pendingDocuments}
                  selectedId={selectedDocId as Id<"documents"> | null}
                  onSelect={handleSelectDocument}
                  isLoading={isLoadingDocuments}
                />
              </div>
              {totalPages > 1 && (
                <div className="border-t p-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    showFirstLast={false}
                  />
                </div>
              )}
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
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1">
          <div className="flex-1 overflow-auto">
            {mobileTab === "list" && (
              <PendingDocumentList
                documents={pendingDocuments}
                selectedId={selectedDocId as Id<"documents"> | null}
                onSelect={handleSelectDocument}
                isLoading={isLoadingDocuments}
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

          {/* Mobile Pagination */}
          {mobileTab === "list" && totalPages > 1 && (
            <div className="border-t p-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                showFirstLast={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
