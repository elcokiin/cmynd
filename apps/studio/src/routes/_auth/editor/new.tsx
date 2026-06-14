import { Button } from "@elcokiin/ui/button";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { ButtonSubmit } from "@/components/editor/button-submit";
import { ButtonSettings } from "@/components/editor/document-settings";
import { EditableDocumentTitle } from "@/components/editor/editable-document-title";
import { EditorModeToggle } from "@/components/editor/editor-mode-toggle";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { useNewDocument } from "@/hooks/use-new-document";

export const Route = createFileRoute("/_auth/editor/new")({
  component: NewDocumentRoute,
});

function NewDocumentRoute() {
  const navigate = useNavigate();
  const {
    title,
    handleTitleChange,
    content,
    editorMode,
    setEditorMode,
    markdownDraft,
    setMarkdownDraft,
    documentIdRef,
    handleVisualUpdate,
    handleVisualDebouncedUpdate,
    handleMarkdownDebouncedUpdate,
    uploadFn,
    handleUploadError,
    handleExportMarkdown,
  } = useNewDocument();

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/" })}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>

            <EditableDocumentTitle
              title={title}
              onTitleChange={handleTitleChange}
              isEditable={true}
            />
            <EditorModeToggle mode={editorMode} onModeChange={setEditorMode} />
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleExportMarkdown(title)}>
              Export .md
            </Button>
            <ButtonSubmit documentId={documentIdRef.current} title={title} />
            <ButtonSettings documentId={documentIdRef.current} />
          </div>
        </div>
      </div>

      <EditorWorkspace
        mode={editorMode}
        content={content}
        markdownValue={markdownDraft}
        onMarkdownChange={setMarkdownDraft}
        onVisualUpdate={handleVisualUpdate}
        onVisualDebouncedUpdate={handleVisualDebouncedUpdate}
        onMarkdownDebouncedUpdate={handleMarkdownDebouncedUpdate}
        editable={true}
        uploadFn={uploadFn}
        onUploadError={handleUploadError}
      />
    </div>
  );
}
