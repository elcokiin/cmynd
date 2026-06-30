import type { UploadFn } from "@elcokiin/backend/lib/types";
import type { SerializedEditorState } from "lexical";

import { ClientOnlyEditor } from "./client-only-editor";

type EditorWorkspaceProps = {
  initialContent?: SerializedEditorState;
  onChange?: (state: SerializedEditorState) => void;
  onSave?: (state: SerializedEditorState) => Promise<void>;
  editable: boolean;
  uploadFn?: UploadFn | null;
  onUploadError?: (error: Error) => void;
};

export function EditorWorkspace({
  initialContent,
  onChange,
  onSave,
  editable,
  uploadFn,
  onUploadError,
}: EditorWorkspaceProps): React.ReactNode {
  return (
    <div className="flex-1 overflow-clip">
      <div className="max-w-4xl mx-auto">
        <ClientOnlyEditor
          initialContent={initialContent}
          onChange={onChange}
          onSave={onSave}
          editable={editable}
          uploadFn={uploadFn}
          onUploadError={onUploadError}
          className="min-h-full"
        />
      </div>
    </div>
  );
}
