import type { SerializedEditorState } from "lexical";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback } from "react";

import { EditorHeader } from "@/components/editor/editor-header";
import { EditorSkeleton } from "@/components/editor/editor-skeleton";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { useEditor } from "@/hooks/use-editor";
import { useErrorHandler } from "@/hooks/use-error-handler";

export const Route = createFileRoute("/_auth/editor/$slug")({
  component: EditorRoute,
  pendingComponent: EditorSkeleton,
});

function EditorRoute() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { handleErrorSilent } = useErrorHandler();

  const document = useQuery(api.documents.queries.getBySlug, {
    slug,
  });
  const updateContent = useMutation(api.documents.mutations.updateContent);

  const editor = useEditor();

  const saveContent = useCallback(
    async (content: SerializedEditorState) => {
      if (!document) return;

      try {
        await updateContent({
          documentId: document._id,
          content,
        });
      } catch (error) {
        handleErrorSilent(error, "EditorRoute.saveContent");
        throw error;
      }
    },
    [document, updateContent, handleErrorSilent],
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
      <EditorHeader
        documentId={document._id}
        title={document.title}
        type={document.type}
        status={document.status}
        isEditable={isEditable}
        rejectionReason={document.rejectionReason}
      />

      <EditorWorkspace
        initialContent={document.content as SerializedEditorState}
        onChange={(state) => { editor.contentRef.current = state; }}
        onDebouncedUpdate={isEditable ? saveContent : undefined}
        editable={isEditable}
        uploadFn={isEditable ? editor.uploadFn : null}
        onUploadError={editor.handleUploadError}
      />
    </div>
  );
}
