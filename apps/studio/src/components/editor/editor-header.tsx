import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type {
  DocumentType,
  DocumentStatus,
} from "@elcokiin/backend/lib/types/documents";

import { buttonVariants } from "@elcokiin/ui/button";
import { cn } from "@elcokiin/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@elcokiin/ui/popover";
import {
  ArrowLeftIcon,
  MessageCircleWarningIcon,
} from "lucide-react";

import { ButtonSettings } from "./document-settings";
import { EditableDocumentTitle } from "./editable-document-title";
import { ButtonSubmit } from "./button-submit";

type EditorHeaderProps = {
  documentId: Id<"documents">;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  isEditable: boolean;
  rejectionReason?: string;
};

export function EditorHeader({
  documentId,
  title,
  type,
  status,
  isEditable,
  rejectionReason,
}: EditorHeaderProps): React.ReactNode {
  return (
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
      <div className="flex items-center gap-2 min-w-0">
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
        {rejectionReason && status === "building" && (
          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20",
              )}
            >
              <MessageCircleWarningIcon className="h-4 w-4 mr-2" />
              View Feedback
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reviewer Feedback</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {rejectionReason}
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {isEditable && status === "building" && (
          <>
            <ButtonSubmit documentId={documentId} title={title} />
            <ButtonSettings
              documentId={documentId}
              currentType={type}
            />
          </>
        )}
      </div>
    </div>
  );
}
