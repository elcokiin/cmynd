import type { JSONContent } from "novel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  const [syncedDocumentId, setSyncedDocumentId] = useState<string | null>(null);

  const saveContent = useCallback(
    async (content: JSONContent, markdown: string) => {
      if (!document) return;

      try {
        await updateContent({
          documentId: document._id,
          content,
          markdownSource: markdown,
        } as any);
      } catch (error) {
        handleErrorSilent(error, "EditorRoute.saveContent");
        throw error;
      }
    },
    [document, updateContent, handleErrorSilent],
  );

  const editor = useEditor({ onSave: saveContent });

  useEffect(() => {
    if (document?.isRedirect && document.currentSlug !== slug) {
      navigate({
        to: "/editor/$slug",
        params: { slug: document.currentSlug },
        replace: true,
      });
    }
  }, [document, slug, navigate]);

  useEffect(() => {
    if (!document || document === null) {
      return;
    }

    editor.syncContent(document.content as JSONContent | undefined);
    setSyncedDocumentId(document._id);
  }, [document?._id, editor.syncContent]);

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

  if (syncedDocumentId !== document._id) {
    return <EditorSkeleton />;
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
        editorMode={editor.editorMode}
        onEditorModeChange={editor.setEditorMode}
        onExportMarkdown={() => editor.handleExportMarkdown(document.slug || document.title)}
      />

      <EditorWorkspace
        mode={editor.editorMode}
        content={editor.content}
        markdownValue={editor.markdownDraft}
        onMarkdownChange={editor.setMarkdownDraft}
        onVisualUpdate={editor.handleVisualUpdate}
        onVisualDebouncedUpdate={isEditable ? editor.handleVisualDebouncedUpdate : undefined}
        onMarkdownDebouncedUpdate={isEditable ? editor.handleMarkdownDebouncedUpdate : undefined}
        editable={isEditable}
        uploadFn={isEditable ? editor.uploadFn : null}
        onUploadError={editor.handleUploadError}
      />
    </div>
  );
}
