import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Input } from "@elcokiin/ui/input";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { useErrorHandler } from "@/hooks/use-error-handler";

type EditableDocumentTitleProps = {
  documentId: Id<"documents">;
  initialTitle: string;
  isEditable: boolean;
};

export function EditableDocumentTitle({
  documentId,
  initialTitle,
  isEditable,
}: EditableDocumentTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { handleErrorSilent } = useErrorHandler();

  const updateTitleMutation = useMutation(api.documents.updateTitle);

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

  // Handle title change with debouncing
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);

    // Clear existing timeout
    if (titleUpdateTimeoutRef.current) {
      clearTimeout(titleUpdateTimeoutRef.current);
    }

    // Set new timeout for debounced save (500ms)
    titleUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateTitleMutation({
          documentId,
          title: newTitle,
        });
      } catch (error) {
        handleErrorSilent(error, "EditableDocumentTitle.handleTitleChange");
      }
    }, 500);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    // If title is empty, reset to "Untitled"
    if (!title.trim()) {
      setTitle("Untitled");
      handleTitleChange("Untitled");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
    if (e.key === "Escape") {
      setTitle(initialTitle || "Untitled");
      setIsEditingTitle(false);
    }
  };

  if (isEditingTitle) {
    return (
      <Input
        ref={titleInputRef}
        value={title}
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
      {title || "Untitled"}
    </button>
  );
}
