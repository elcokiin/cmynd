import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { DocumentType } from "@elcokiin/backend/lib/types/documents";

import { Button } from "@elcokiin/ui/button";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";

import { DocumentSettingsDialog } from "./document-settings-dialog";

type ButtonSettingsProps = {
  documentId: Id<"documents"> | null;
  currentType?: DocumentType;
  onExportMarkdown?: () => void;
};

export function ButtonSettings({
  documentId,
  onExportMarkdown,
}: ButtonSettingsProps): React.ReactNode {
  const [open, setOpen] = useState(false);

  const isDisabled = !documentId;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        title={isDisabled ? "Save document first" : "Document settings"}
      >
        <SettingsIcon className="h-4 w-4" />
      </Button>
      {documentId && (
        <DocumentSettingsDialog
          documentId={documentId}
          onExportMarkdown={onExportMarkdown}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
