import type { ReactNode } from "react";

type MobileTab = "list" | "preview" | "actions";

type ReviewPageLayoutProps = {
  mobileTab: MobileTab;
  listContent: ReactNode;
  previewContent: ReactNode;
  sidebarContent: ReactNode;
};

function ReviewPageLayout({
  mobileTab,
  listContent,
  previewContent,
  sidebarContent,
}: ReviewPageLayoutProps): ReactNode {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1">
        {/* Document List */}
        <div className="w-64 border-r overflow-auto">{listContent}</div>

        {/* Preview */}
        <div className="flex-1 overflow-auto">{previewContent}</div>

        {/* Sidebar */}
        <div className="w-80 border-l p-4 overflow-auto">{sidebarContent}</div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-auto">
        {mobileTab === "list" && listContent}
        {mobileTab === "preview" && previewContent}
        {mobileTab === "actions" && <div className="p-4">{sidebarContent}</div>}
      </div>
    </div>
  );
}

export { ReviewPageLayout };
export type { ReviewPageLayoutProps, MobileTab };
