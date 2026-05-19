import type { JSONContent } from "novel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EditorHeader } from "@/components/editor/editor-header";
import { EditorSkeleton } from "@/components/editor/editor-skeleton";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { useEditorAutosave } from "@/hooks/use-editor-autosave";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useEditorWorkspaceState } from "@/hooks/use-editor-workspace-state";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { downloadMarkdown } from "@/lib/markdown-conversion";

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
  const uploadFn = useConvexImageUpload();
  const {
    editorMode,
    setEditorMode,
    markdownDraft,
    setMarkdownDraft,
    setMarkdownFromContent,
    applyMarkdown,
    getExportMarkdown,
  } = useEditorWorkspaceState();
  const [content, setContent] = useState<JSONContent | undefined>(undefined);
  const contentRef = useRef<JSONContent | undefined>(undefined);
  const [syncedDocumentId, setSyncedDocumentId] = useState<string | null>(null);

  // Redirect to current slug if accessed via old slug
  useEffect(() => {
    if (document?.isRedirect && document.currentSlug !== slug) {
      navigate({
        to: "/editor/$slug",
        params: { slug: document.currentSlug },
        replace: true,
      });
    }
  }, [document, slug, navigate]);

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

  const {
    syncContent,
    handleVisualUpdate,
    handleVisualDebouncedUpdate,
    handleMarkdownDebouncedUpdate,
  } = useEditorAutosave({
    setContent,
    contentRef,
    setMarkdownFromContent,
    applyMarkdown,
    onVisualDebouncedSave: saveContent,
    onMarkdownDebouncedSave: saveContent,
  });

  useEffect(() => {
    if (!document || document === null) {
      return;
    }

    syncContent(document.content as JSONContent | undefined);
    setSyncedDocumentId(document._id);
  }, [document?._id, syncContent]);

  const handleExportMarkdown = useCallback(() => {
    if (!document || document === null) {
      return;
    }

    const markdown = getExportMarkdown(contentRef.current);

    downloadMarkdown(document.slug || document.title || "document", markdown);
  }, [document, getExportMarkdown]);

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

  if (syncedDocumentId !== document._id) {
    return <EditorSkeleton />;
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
        editorMode={editorMode}
        onEditorModeChange={setEditorMode}
        onExportMarkdown={handleExportMarkdown}
      />

      {/* Editor area */}
      <EditorWorkspace
        mode={editorMode}
        content={content}
        markdownValue={markdownDraft}
        onMarkdownChange={setMarkdownDraft}
        onVisualUpdate={handleVisualUpdate}
        onVisualDebouncedUpdate={isEditable ? handleVisualDebouncedUpdate : undefined}
        onMarkdownDebouncedUpdate={isEditable ? handleMarkdownDebouncedUpdate : undefined}
        editable={isEditable}
        uploadFn={isEditable ? uploadFn : null}
        onUploadError={handleUploadError}
      />
    </div>
  );
}
