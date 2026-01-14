import type { Doc, Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { cn } from "@elcokiin/ui/lib/utils";
import { FileTextIcon, HourglassIcon } from "lucide-react";

import { documentTypeConfig } from "@/components/dashboard/document-type-config";
import { ReviewListSkeleton } from "./review-skeleton";

type PendingDocument = Doc<"documents">;

type PendingDocumentListProps = {
  documents: PendingDocument[] | undefined | null;
  selectedId: Id<"documents"> | null;
  onSelect: (id: Id<"documents">) => void;
};

export function PendingDocumentList({
  documents,
  selectedId,
  onSelect,
}: PendingDocumentListProps): React.ReactNode {
  if (documents === undefined) {
    return (
      <div className="p-4">
        <h3 className="font-medium text-sm text-muted-foreground mb-4">
          Pending Review
        </h3>
        <ReviewListSkeleton />
      </div>
    );
  }

  if (documents === null) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Access denied</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-4">
        <h3 className="font-medium text-sm text-muted-foreground mb-4">
          Pending Review
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <HourglassIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No documents pending review
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-medium text-sm text-muted-foreground mb-4">
        Pending Review ({documents.length})
      </h3>
      <div className="space-y-2">
        {documents.map((doc) => (
          <PendingDocumentItem
            key={doc._id}
            document={doc}
            isSelected={selectedId === doc._id}
            onSelect={() => onSelect(doc._id)}
          />
        ))}
      </div>
    </div>
  );
}

type PendingDocumentItemProps = {
  document: PendingDocument;
  isSelected: boolean;
  onSelect: () => void;
};

function PendingDocumentItem({
  document,
  isSelected,
  onSelect,
}: PendingDocumentItemProps): React.ReactNode {
  const config = documentTypeConfig[document.type];
  const Icon = config?.icon ?? FileTextIcon;

  const submittedDate = document.submittedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(document.submittedAt))
    : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-colors",
        "hover:bg-muted/50",
        isSelected && "bg-muted border-primary",
      )}
    >
      <p className="font-medium text-sm line-clamp-1">
        {document.title || "Untitled"}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" />
          {config?.label ?? document.type}
        </span>
        {submittedDate && (
          <span className="text-xs text-muted-foreground">{submittedDate}</span>
        )}
      </div>
    </button>
  );
}
