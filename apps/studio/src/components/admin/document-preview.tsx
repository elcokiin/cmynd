import type { JSONContent } from "novel";
import type { DocumentType, CurationData, Reference } from "@elcokiin/backend/lib/types/documents";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { FileTextIcon, LinkIcon } from "lucide-react";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { documentTypeConfig } from "@/components/dashboard/document-type-config";
import { ReviewPreviewSkeleton } from "./review-skeleton";

type ReviewDocument = {
  _id: Id<"documents">;
  title: string;
  type: DocumentType;
  content: JSONContent;
  curation?: CurationData;
  references?: Reference[];
  coverImageId?: Id<"_storage">;
  submittedAt?: number;
  createdAt: number;
};

type DocumentPreviewProps = {
  document: ReviewDocument | undefined | null;
  isLoading: boolean;
};

export function DocumentPreview({ document, isLoading }: DocumentPreviewProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <ReviewPreviewSkeleton />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">No document selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a document from the list to preview its content
        </p>
      </div>
    );
  }

  const config = documentTypeConfig[document.type];
  const Icon = config?.icon ?? FileTextIcon;

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="max-w-3xl mx-auto">
        {/* Document Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
              <Icon className="h-3 w-3" />
              {config?.label ?? document.type}
            </span>
            {document.submittedAt && (
              <span className="text-xs text-muted-foreground">
                Submitted{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(document.submittedAt))}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold">{document.title || "Untitled"}</h1>
        </div>

        {/* Curation Info */}
        {document.type === "curated" && document.curation && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Title: </span>
                {document.curation.sourceTitle}
              </p>
              {document.curation.sourceAuthor && (
                <p>
                  <span className="text-muted-foreground">Author: </span>
                  {document.curation.sourceAuthor}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">URL: </span>
                <a
                  href={document.curation.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {document.curation.sourceUrl}
                </a>
              </p>
              <p>
                <span className="text-muted-foreground">Spin: </span>
                {document.curation.spin}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Document Content */}
        <div className="border rounded-lg">
          <AdvancedEditor
            initialContent={document.content as JSONContent}
            editable={false}
            className="min-h-[300px]"
          />
        </div>

        {/* References */}
        {document.references && document.references.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">References</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {document.references.map((ref, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <LinkIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {ref.title}
                      </a>
                      {ref.author && (
                        <span className="text-muted-foreground">
                          {" "}
                          by {ref.author}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
