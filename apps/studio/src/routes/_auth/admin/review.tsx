import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileTextIcon, ListIcon, MessageSquareIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { MobileTabBar } from "@/components/admin/mobile-tab-bar";
import type { MobileTab } from "@/components/admin/review-page-layout";
import { PendingDocumentList } from "@/components/admin/pending-document-list";
import { DocumentPreview } from "@/components/admin/document-preview";
import { ReviewSidebar } from "@/components/admin/review-sidebar";
import { ReviewSkeleton } from "@/components/admin/review-skeleton";

type SearchParams = {
  slug?: string;
};

export const Route = createFileRoute("/_auth/admin/review")({
  component: AdminReviewPage,
  pendingComponent: ReviewSkeleton,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    slug: typeof search.slug === "string" ? search.slug : undefined,
  }),
});

function AdminReviewPage() {
  const { slug: selectedSlug } = Route.useSearch();

  const [mobileTab, setMobileTab] = useState<MobileTab>("list");

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
            disabled: !selectedSlug,
          },
          {
            id: "actions",
            label: "Actions",
            icon: MessageSquareIcon,
            disabled: !selectedSlug,
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
            <PendingDocumentList
              selectedSlug={selectedSlug}
              onSelect={() => setMobileTab("preview")}
            />

            {/* Preview */}
            <div className="flex-1 overflow-auto">
              <DocumentPreview slug={selectedSlug} />
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l p-4 overflow-auto">
              <ReviewSidebar
                slug={selectedSlug}
                onActionComplete={() => setMobileTab("list")}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1">
          <div className="flex-1 overflow-auto">
            {mobileTab === "list" && (
              <PendingDocumentList
                selectedSlug={selectedSlug}
                onSelect={() => setMobileTab("preview")}
              />
            )}
            {mobileTab === "preview" && (
              <DocumentPreview slug={selectedSlug} />
            )}
            {mobileTab === "actions" && (
              <div className="p-4">
                <ReviewSidebar
                  slug={selectedSlug}
                  onActionComplete={() => setMobileTab("list")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
