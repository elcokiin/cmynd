import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { Dialog, DialogContent } from "@elcokiin/ui/dialog";
import { useState } from "react";

import { CoverSection } from "./cover-section";
import { ExportSection } from "./export-section";
import { InspirationsSection } from "./inspirations-section";
import { ReprintSection } from "./reprint-section";
import { SettingsSidebar, type NavigationSection } from "./settings-sidebar";

type DocumentSettingsDialogProps = {
  documentId: Id<"documents">;
  onExportMarkdown?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentSettingsDialog({
  documentId,
  onExportMarkdown,
  open,
  onOpenChange,
}: DocumentSettingsDialogProps) {
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("cover");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-4xl p-0 gap-0 h-[76vh]">
        <div className="flex h-full overflow-hidden">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            showExport={!!onExportMarkdown}
          />
          <div className="flex-1 p-6 overflow-y-auto min-h-0 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:hover:bg-primary/70">
            {activeSection === "cover" && (
              <CoverSection documentId={documentId} />
            )}
            {activeSection === "reprint" && (
              <ReprintSection documentId={documentId} />
            )}
            {activeSection === "inspirations" && <InspirationsSection />}
            {activeSection === "export" && onExportMarkdown && (
              <ExportSection onExportMarkdown={onExportMarkdown} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
