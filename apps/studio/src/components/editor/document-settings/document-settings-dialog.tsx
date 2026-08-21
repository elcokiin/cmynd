import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Dialog, DialogContent } from "@elcokiin/ui/dialog";
import { useQuery } from "convex/react";
import { useState } from "react";

import { CoverSection } from "./cover-section";
import { DescriptionSection } from "./description-section";
import { InspirationsSection } from "./inspirations-section";
import { ReprintSection } from "./reprint-section";
import { SettingsSidebar, type NavigationSection } from "./settings-sidebar";

type DocumentSettingsDialogProps = {
  documentId: Id<"documents">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentSettingsDialog({
  documentId,
  open,
  onOpenChange,
}: DocumentSettingsDialogProps) {
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("cover");

  const document = useQuery(
    api.documents.queries.getForEdit,
    open ? { documentId } : "skip",
  );
  const isReprint = document?.type === "reprint";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-4xl p-0 gap-0 h-[76vh]">
        <div className="flex h-full overflow-hidden">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            disabledSections={isReprint ? ["inspirations"] : []}
          />
          <div className="flex-1 p-6 overflow-y-auto min-h-0 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:hover:bg-primary/70">
            {/* Only mount sections while the dialog is open so we don't keep
                live document subscriptions alive for every card on the
                dashboard. Mounting them always caused stale/deleted docs to
                re-throw On every table change (see Fix A). */}
            {open && activeSection === "cover" && (
              <CoverSection documentId={documentId} />
            )}
            {open && activeSection === "description" && (
              <DescriptionSection documentId={documentId} />
            )}
            {open && activeSection === "reprint" && (
              <ReprintSection documentId={documentId} />
            )}
            {open && activeSection === "inspirations" && (
              <InspirationsSection
                documentId={documentId}
                onNavigateToReprint={() => setActiveSection("reprint")}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
