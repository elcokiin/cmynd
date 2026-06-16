import type { UploadFn } from "@elcokiin/backend/lib/types";
import type { JSONContent } from "novel";

import { ClientOnlyAdvancedEditor } from "./client-only-advanced-editor";
import { MarkdownEditor } from "./markdown-editor";

type EditorWorkspaceProps = {
  mode: "visual" | "markdown";
  content?: JSONContent;
  markdownValue: string;
  onMarkdownChange: (value: string) => void;
  onVisualUpdate?: (content: JSONContent) => void;
  onVisualDebouncedUpdate?: (content: JSONContent) => void;
  onMarkdownDebouncedUpdate?: (value: string) => void | Promise<void>;
  editable: boolean;
  uploadFn?: UploadFn | null;
  onUploadError?: (error: Error) => void;
};

export function EditorWorkspace({
  mode,
  content,
  markdownValue,
  onMarkdownChange,
  onVisualUpdate,
  onVisualDebouncedUpdate,
  onMarkdownDebouncedUpdate,
  editable,
  uploadFn,
  onUploadError,
}: EditorWorkspaceProps): React.ReactNode {
  return (
    <div className="flex-1 overflow-clip">
      <div className="max-w-4xl mx-auto">
        {mode === "visual" ? (
          <ClientOnlyAdvancedEditor
            initialContent={content}
            onUpdate={onVisualUpdate}
            onDebouncedUpdate={onVisualDebouncedUpdate}
            editable={editable}
            uploadFn={uploadFn}
            onUploadError={onUploadError}
            className="min-h-full"
          />
        ) : (
          <MarkdownEditor
            initialValue={markdownValue}
            onChange={onMarkdownChange}
            onDebouncedUpdate={onMarkdownDebouncedUpdate}
            editable={editable}
            className="min-h-full"
          />
        )}
      </div>
    </div>
  );
}
