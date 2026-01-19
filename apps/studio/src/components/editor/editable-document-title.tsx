import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Input } from "@elcokiin/ui/input";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";

type EditableDocumentTitleProps =
  | {
      documentId: Id<"documents">;
      initialTitle: string;
      isEditable: boolean;
      // Controlled mode props (not used in this variant)
      title?: never;
      onTitleChange?: never;
    }
  | {
      // Controlled mode (for draft documents)
      title: string;
      onTitleChange: (title: string) => void;
      isEditable: boolean;
      // Server-synced props (not used in this variant)
      documentId?: never;
      initialTitle?: never;
    };

export function EditableDocumentTitle(
  props: EditableDocumentTitleProps
): React.ReactNode {
  const isControlledMode = "title" in props && props.title !== undefined;

  const [localTitle, setLocalTitle] = useState(
    isControlledMode ? props.title : props.initialTitle
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { handleErrorSilent } = useErrorHandler();

  const updateTitleMutation = useMutation(api.documents.mutations.updateTitle);

  const isEditable = props.isEditable;

  // Update local title when controlled title changes
  useEffect(() => {
    if (isControlledMode) {
      setLocalTitle(props.title);
    }
  }, [isControlledMode, isControlledMode && props.title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (titleUpdateTimeoutRef.current) {
        clearTimeout(titleUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Save title to backend
  const saveTitleToBackend = async (newTitle: string) => {
    if (isControlledMode) return;

    try {
      const result = await updateTitleMutation({
        documentId: props.documentId,
        title: newTitle,
      });

      // Show notification if an old slug was deleted
      if (result?.slugDeleted) {
        toast.info("Title updated", {
          description: `Old URL /editor/${result.slugDeleted} is no longer accessible`,
        });
      }
    } catch (error: unknown) {
      handleErrorSilent(error, "EditableDocumentTitle.saveTitleToBackend");
    }
  };

  // Handle title change with debouncing
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);

    if (isControlledMode) {
      // Controlled mode: immediately update parent state
      props.onTitleChange(newTitle);
    } else {
      // Server-synced mode: debounce and save to backend
      // Clear existing timeout
      if (titleUpdateTimeoutRef.current) {
        clearTimeout(titleUpdateTimeoutRef.current);
      }

      // Set new timeout for debounced save (500ms)
      titleUpdateTimeoutRef.current = setTimeout(async () => {
        await saveTitleToBackend(newTitle);
      }, 500);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    // If title is empty, reset to "Untitled"
    if (!localTitle.trim()) {
      setLocalTitle("Untitled");
      handleTitleChange("Untitled");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
    if (e.key === "Escape") {
      const fallbackTitle = isControlledMode
        ? props.title
        : props.initialTitle || "Untitled";
      setLocalTitle(fallbackTitle);
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
        isEditable && "cursor-text"
      )}
      disabled={!isEditable}
    >
      {localTitle || "Untitled"}
    </button>
  );
}
