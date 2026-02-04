import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileTextIcon, MessageSquareIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";

import { MobileTabBar } from "@/components/admin/mobile-tab-bar";
import type { MobileTab } from "@/components/admin/review-page-layout";
import { DocumentPreview } from "@/components/admin/document-preview";
import { ReviewSidebar } from "@/components/admin/review-sidebar";
import { ReviewSkeleton } from "@/components/admin/review-skeleton";

export const Route = createFileRoute("/_auth/admin/review_/$slug")({
  component: AdminReviewPage,
  pendingComponent: ReviewSkeleton,
});

function AdminReviewPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [mobileTab, setMobileTab] = useState<MobileTab>("preview");

  const document = useQuery(api.documents.queries.getForAdminReviewBySlug, {
    slug,
  });

  // Redirect to current slug if accessed via old slug
  useEffect(() => {
    if (document?.isRedirect && document.currentSlug !== slug) {
      navigate({
        to: "/admin/review/$slug",
        params: { slug: document.currentSlug },
        replace: true,
      });
    }
  }, [document, slug, navigate]);

  function handleTabChange(tabId: string): void {
    setMobileTab(tabId as MobileTab);
  }

  function handleActionComplete(): void {
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Tab Bar */}
      <MobileTabBar
        tabs={[
          {
            id: "preview",
            label: "Preview",
            icon: FileTextIcon,
          },
          {
            id: "actions",
            label: "Actions",
            icon: MessageSquareIcon,
          },
        ]}
        activeTab={mobileTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div className="flex-1 flex overflow-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col flex-1">
          <div className="flex flex-1 overflow-hidden">
            {/* Preview */}
            <div className="flex-1 overflow-clip">
              <DocumentPreview slug={slug} />
            </div>

            {/* Sidebar */}
            <div className="sticky w-80 border-l p-4 overflow-auto">
              <ReviewSidebar
                slug={slug}
                onActionComplete={handleActionComplete}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1">
          <div className="flex-1 overflow-auto">
            {mobileTab === "preview" && <DocumentPreview slug={slug} />}
            {mobileTab === "actions" && (
              <div className="p-4">
                <ReviewSidebar
                  slug={slug}
                  onActionComplete={handleActionComplete}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
