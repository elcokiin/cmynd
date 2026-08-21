import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Input } from "@elcokiin/ui/input";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";

const UNTITLED = "Untitled";

type EditableDocumentTitleProps = {
  documentId: Id<"documents">;
  initialTitle: string;
  isEditable: boolean;
  // Tracking-only side channel so owners (e.g. the draft lifecycle hook)
  // can observe the current title without taking over persistence.
  onTitleChange?: (title: string) => void;
};

export function EditableDocumentTitle({
  documentId,
  initialTitle,
  isEditable,
  onTitleChange,
}: EditableDocumentTitleProps): React.ReactNode {
  const [localTitle, setLocalTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const { handleErrorSilent } = useErrorHandler();

  // Tracks the last persisted title. The blur/escape comparison uses this
  // instead of the `initialTitle` prop so a stale or re-supplied prop never
  // blocks an updateTitle auto-save that should still happen.
  const committedTitleRef = useRef(initialTitle.trim() || UNTITLED);

  const updateTitleMutation = useMutation(api.documents.mutations.updateTitle);

  // Focus and select the input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const saveTitleToBackend = async (newTitle: string): Promise<boolean> => {
    try {
      const result = await updateTitleMutation({
        documentId,
        title: newTitle,
      });

      // Only advance the persisted baseline once the server confirms, so a
      // failed rename is retried on the next blur instead of forgotten.
      committedTitleRef.current = newTitle;

      // Show notification if an old slug was deleted
      if (result?.slugDeleted) {
        toast.info("Title updated", {
          description: `Old URL /editor/${result.slugDeleted} is no longer accessible`,
        });
      }

      return true;
    } catch (error: unknown) {
      handleErrorSilent(error, "EditableDocumentTitle.saveTitleToBackend");
      return false;
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);

    const trimmed = localTitle.trim();

    if (!trimmed) {
      // The backend rejects empty/"Untitled" titles (DOCUMENT_INVALID_TITLE),
      // so persisting one would fail silently and leave the UI disagreeing
      // with the server. Revert to the last persisted title instead.
      setLocalTitle(committedTitleRef.current);
      return;
    }

    if (trimmed !== committedTitleRef.current) {
      await saveTitleToBackend(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
    if (e.key === "Escape") {
      setLocalTitle(committedTitleRef.current);
      setIsEditingTitle(false);
    }
  };

  if (isEditingTitle) {
    return (
      <Input
        ref={titleInputRef}
        value={localTitle}
        onChange={(e) => handleTitleChange(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleKeyDown}
        className="text-lg font-semibold h-8 px-2 -ml-2"
        placeholder="Untitled"
        disabled={!isEditable}
        maxLength={100}
      />
    );
  }

  return (
    <button
      onClick={() => isEditable && setIsEditingTitle(true)}
      className={cn(
        "text-lg font-semibold truncate max-w-md text-left px-2 -ml-2 rounded hover:bg-muted transition-colors",
        isEditable && "cursor-text",
      )}
      disabled={!isEditable}
    >
      {localTitle || "Untitled"}
    </button>
  );
}
