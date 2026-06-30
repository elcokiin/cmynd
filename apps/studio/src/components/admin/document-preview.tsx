import type { SerializedEditorState } from "lexical";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { FileTextIcon, LinkIcon } from "lucide-react";

import { ClientOnlyEditor } from "@/components/editor/client-only-editor";
import { documentTypeConfig } from "@/components/dashboard/document-type-config";
import { ReviewPreviewSkeleton } from "./review-skeleton";

type DocumentPreviewProps = {
  slug: string | null | undefined;
};

export function DocumentPreview({
  slug,
}: DocumentPreviewProps) {
  const document = useQuery(
    api.documents.queries.getForAdminReviewBySlug,
    slug ? { slug } : "skip",
  );

  if (!slug) {
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

  if (document === undefined) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <ReviewPreviewSkeleton />
        </div>
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">Document not found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          The document you're looking for doesn't exist or has been deleted
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

        {/* Reprint Info */}
        {document.type === "reprint" && document.reprint && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Reprint Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Original Author: </span>
                {document.reprint.originalAuthor}
              </p>
              {document.reprint.originalTitle && (
                <p>
                  <span className="text-muted-foreground">Original Title: </span>
                  {document.reprint.originalTitle}
                </p>
              )}
              {document.reprint.originalDate && (
                <p>
                  <span className="text-muted-foreground">Original Date: </span>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(document.reprint.originalDate))}
                </p>
              )}
              {document.reprint.license && (
                <p>
                  <span className="text-muted-foreground">License: </span>
                  {document.reprint.license}
                </p>
              )}
              {document.reprint.translator && (
                <p>
                  <span className="text-muted-foreground">Translator: </span>
                  {document.reprint.translator}
                </p>
              )}
              {document.reprint.sourceUrl && (
                <p>
                  <span className="text-muted-foreground">Source: </span>
                  <a
                    href={document.reprint.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {document.reprint.sourceUrl}
                  </a>
                </p>
              )}
              {document.reprint.notes && (
                <p>
                  <span className="text-muted-foreground">Notes: </span>
                  {document.reprint.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Content */}
        <div className="border rounded-lg">
          <ClientOnlyEditor
            initialContent={document.content as SerializedEditorState}
            editable={false}
            variant="minimal"
            className="min-h-[300px]"
          />
        </div>

        {/* Inspirations */}
        {document.inspirations && document.inspirations.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Inspirations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {document.inspirations.map((ref, index) => (
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
