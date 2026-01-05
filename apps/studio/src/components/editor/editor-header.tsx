import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type {
  DocumentType,
  DocumentStatus,
} from "@elcokiin/backend/lib/types/documents";

import { Button, buttonVariants } from "@elcokiin/ui/button";
import { cn } from "@elcokiin/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";

import { DocumentSettingsDialog } from "./document-settings-dialog";
import { EditableDocumentTitle } from "./editable-document-title";

type EditorHeaderProps = {
  documentId: Id<"documents">;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  isEditable: boolean;
};

export function EditorHeader({
  documentId,
  title,
  type,
  status,
  isEditable,
}: EditorHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div className="flex flex-col flex-1 min-w-0">
            <EditableDocumentTitle
              documentId={documentId}
              initialTitle={title}
              isEditable={isEditable}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {status} · {type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditable && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Read-only (Published)
            </span>
          )}
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              title="Document settings"
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Settings dialog */}
      <DocumentSettingsDialog
        documentId={documentId}
        currentType={type}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  );
}
