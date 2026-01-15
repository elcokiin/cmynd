import type { JSONContent } from "novel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback } from "react";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorSkeleton } from "@/components/editor/editor-skeleton";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useErrorHandler } from "@/hooks/use-error-handler";

export const Route = createFileRoute("/_auth/editor/$documentId")({
  component: EditorRoute,
  pendingComponent: EditorSkeleton,
});

function EditorRoute() {
  const { documentId } = Route.useParams();
  const navigate = useNavigate();
  const { handleErrorSilent } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, {
    documentId: documentId as Id<"documents">,
  });
  const updateContent = useMutation(api.documents.mutations.updateContent);
  const uploadFn = useConvexImageUpload();

  const handleDebouncedUpdate = useCallback(
    async (content: JSONContent) => {
      try {
        await updateContent({
          documentId: documentId as Id<"documents">,
          content,
        });
      } catch (error) {
        handleErrorSilent(error, "EditorRoute.handleDebouncedUpdate");
      }
    },
    [documentId, updateContent, handleErrorSilent],
  );

  const handleUploadError = useCallback(
    (error: Error) => {
      handleErrorSilent(error, "EditorRoute.handleUploadError");
    },
    [handleErrorSilent],
  );

  if (document === undefined) {
    return <EditorSkeleton />;
  }

  if (document === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-2xl font-bold">Document not found</h1>
        <p className="text-muted-foreground">
          The document you're looking for doesn't exist or you don't have access
          to it.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isEditable = document.status === "building";

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <EditorHeader
        documentId={document._id}
        title={document.title}
        type={document.type}
        status={document.status}
        isEditable={isEditable}
        rejectionReason={document.rejectionReason}
      />

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <AdvancedEditor
            initialContent={document.content as JSONContent | undefined}
            onDebouncedUpdate={isEditable ? handleDebouncedUpdate : undefined}
            editable={isEditable}
            uploadFn={isEditable ? uploadFn : null}
            onUploadError={handleUploadError}
            className="min-h-full"
          />
        </div>
      </div>
    </div>
  );
}
