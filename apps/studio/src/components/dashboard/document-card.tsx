import type { Doc } from "@elcokiin/backend/convex/_generated/dataModel";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@elcokiin/ui/card";

import { formatDate } from "@/lib/format";
import { DocumentCardMenu } from "./document-card-menu";
import { documentTypeConfig } from "./document-type-config";

type DocumentCardProps = {
  document: Doc<"documents">;
  onOpen: () => void;
};

export function DocumentCard({ document, onOpen }: DocumentCardProps) {
  const config = documentTypeConfig[document.type];
  const Icon = config.icon;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {document.status === "published" && (
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                Published
              </span>
            )}
            {document.status === "pending" && (
              <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                Pending Review
              </span>
            )}
          </div>

          <DocumentCardMenu document={document} onEdit={onOpen} />
        </div>

        <CardTitle
          className="text-lg cursor-pointer hover:text-primary transition-colors line-clamp-2"
          onClick={onOpen}
        >
          {document.title || "Untitled"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Updated {formatDate(document.updatedAt)}
        </CardDescription>
        {document.rejectionReason && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
            <span className="font-medium">Rejected: </span>
            {document.rejectionReason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
