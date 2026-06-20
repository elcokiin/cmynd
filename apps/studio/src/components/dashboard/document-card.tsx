import type { DocumentListItem } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { memo } from "react";

import { formatDate } from "@/lib/format";
import { DocumentCardMenu } from "./document-card-menu";
import { documentTypeConfig } from "./document-type-config";

type DocumentCardProps = {
  document: DocumentListItem;
  onOpen: () => void;
};

function StatusBadge({ status, hasRejection }: { status: DocumentListItem["status"]; hasRejection?: boolean }) {
  if (status === "published") {
    return (
      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
        Published
      </span>
    );
  }
  
  if (status === "pending") {
    return (
      <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
        Pending
      </span>
    );
  }
  
  if (hasRejection) {
    return (
      <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
        Feedback
      </span>
    );
  }
  
  return null;
}

/**
 * Document card with cover image variant
 */
function DocumentCardWithCover({
  document,
  coverUrl,
  onOpen,
}: {
  document: DocumentListItem;
  coverUrl: string;
  onOpen: () => void;
}) {
  const config = documentTypeConfig[document.type];
  const Icon = config.icon;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer"
      onClick={onOpen}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <img
          src={coverUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        {/* Menu positioned on image */}
        <div 
          className="absolute top-2 right-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <DocumentCardMenu document={document} />
        </div>
        
        {/* Title overlaid on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white line-clamp-2 drop-shadow-sm">
            {document.title || "Untitled"}
          </h3>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between p-3 border-t bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <span>{formatDate(document.updatedAt)}</span>
        </div>
        <StatusBadge status={document.status} hasRejection={!!document.rejectionReason} />
      </div>
    </article>
  );
}

/**
 * Document card without cover image (fallback)
 */
function DocumentCardWithoutCover({
  document,
  onOpen,
}: {
  document: DocumentListItem;
  onOpen: () => void;
}) {
  const config = documentTypeConfig[document.type];
  const Icon = config.icon;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer"
      onClick={onOpen}
    >
      {/* Decorative Header Pattern */}
      <div className="relative h-24 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-4 left-4 h-12 w-12 rounded-full bg-primary/10" />
          <div className="absolute top-8 left-12 h-8 w-8 rounded-full bg-primary/5" />
          <div className="absolute top-2 right-8 h-16 w-16 rounded-full bg-primary/5" />
        </div>
        
        {/* Document Type Icon */}
        <div className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        {/* Menu */}
        <div 
          className="absolute top-2 right-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <DocumentCardMenu document={document} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {document.title || "Untitled"}
        </h3>
        
        <div className="mt-auto flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {formatDate(document.updatedAt)}
          </span>
          <StatusBadge status={document.status} hasRejection={!!document.rejectionReason} />
        </div>
      </div>
    </article>
  );
}

/**
 * Main document card component that handles both variants
 */
export const DocumentCard = memo(function DocumentCard({
  document,
  onOpen,
}: DocumentCardProps): React.ReactNode {
  // Only fetch cover URL if document has a cover image
  const coverUrl = useQuery(
    api.storage.getUrl,
    document.coverImage?.storageId ? { storageId: document.coverImage.storageId } : "skip"
  );

  // Show with-cover variant if we have a cover image URL
  if (coverUrl) {
    return (
      <DocumentCardWithCover
        document={document}
        coverUrl={coverUrl}
        onOpen={onOpen}
      />
    );
  }

  // Fallback to without-cover variant
  return (
    <DocumentCardWithoutCover
      document={document}
      onOpen={onOpen}
    />
  );
});
