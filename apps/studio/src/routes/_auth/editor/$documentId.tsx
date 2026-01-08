import type { JSONContent } from "novel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorSkeleton } from "@/components/editor/editor-skeleton";
import { useErrorHandler } from "@/hooks/use-error-handler";

import { setImageUploadFn } from "@/components/editor/image-upload";

export const Route = createFileRoute("/_auth/editor/$documentId")({
  component: EditorRoute,
  pendingComponent: EditorSkeleton,
});

function EditorRoute() {
  const { documentId } = Route.useParams();
  const navigate = useNavigate();
  const { handleErrorSilent } = useErrorHandler();

  const document = useQuery(api.documents.getForEdit, {
    documentId: documentId as Id<"documents">,
  });
  const updateContent = useMutation(api.documents.updateContent);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const getStorageUrl = useMutation(api.storage.getUrl);

  useEffect(() => {
    setImageUploadFn(async (file: File) => {
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await response.json();

      const url = await getStorageUrl({ storageId });
      if (!url) {
        throw new Error("Failed to get image URL");
      }

      return url;
    });
  }, [generateUploadUrl, getStorageUrl]);

  const handleDebouncedUpdate = useCallback(
    async (content: JSONContent) => {
      try {
        await updateContent({
          documentId: documentId as Id<"documents">,
          content,
        });
      } catch (error) {
        handleErrorSilent(error, { context: "EditorRoute.handleDebouncedUpdate" });
      }
    },
    [documentId, updateContent, handleErrorSilent],
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
      />

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <AdvancedEditor
            initialContent={document.content as JSONContent | undefined}
            onDebouncedUpdate={isEditable ? handleDebouncedUpdate : undefined}
            editable={isEditable}
            className="min-h-full"
          />
        </div>
      </div>
    </div>
  );
}
