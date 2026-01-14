import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type {
  DocumentType,
  DocumentStatus,
} from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button, buttonVariants } from "@elcokiin/ui/button";
import { cn } from "@elcokiin/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeftIcon, SendIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useErrorHandler();

  const submitDocument = useMutation(api.documents.mutations.submit);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitDocument({ documentId });
      toast.success("Document submitted for review");
    } catch (error) {
      handleError(error, { context: "EditorHeader.handleSubmit" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {status === "pending" && (
            <span className="text-xs text-muted-foreground bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
              Pending Review
            </span>
          )}
          {!isEditable && status === "published" && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Read-only (Published)
            </span>
          )}
          {isEditable && status === "building" && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                title={
                  !title.trim()
                    ? "Document must have a title"
                    : "Submit for review"
                }
              >
                <SendIcon className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                title="Document settings"
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </>
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
