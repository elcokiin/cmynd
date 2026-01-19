import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { ErrorCode } from "@elcokiin/errors";
import { Input } from "@elcokiin/ui/input";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { SlugDeletionConfirmDialog } from "./slug-deletion-confirm-dialog";

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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);
  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);
  
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

  // Save title to backend (with optional confirmation)
  const saveTitleToBackend = async (newTitle: string, confirmed = false) => {
    if (isControlledMode) return;

    try {
      const result = await updateTitleMutation({
        documentId: props.documentId,
        title: newTitle,
        confirmSlugDeletion: confirmed,
      });

      if (result?.slugDeleted) {
        toast.success("Title updated", {
          description: `Old URL /editor/${result.slugDeleted} will no longer work`,
        });
      }
    } catch (error: unknown) {
      // Check if error is slug deletion required
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "code" in error.data &&
        error.data.code === ErrorCode.DOCUMENT_SLUG_DELETION_REQUIRED
      ) {
        // Extract the slug from the error message
        const errorMessage =
          "message" in error.data && typeof error.data.message === "string"
            ? error.data.message
            : "";
        const slugMatch = errorMessage.match(/\/article\/([^\s]+)/);
        const slug = slugMatch ? slugMatch[1] : null;

        // Store pending title and show confirmation dialog
        setPendingTitle(newTitle);
        setSlugToDelete(slug);
        setConfirmDialogOpen(true);
      } else {
        handleErrorSilent(error, "EditableDocumentTitle.saveTitleToBackend");
      }
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
        await saveTitleToBackend(newTitle, false);
      }, 500);
    }
  };

  const handleConfirmSlugDeletion = async () => {
    if (!pendingTitle || isControlledMode) return;

    setConfirmDialogOpen(false);
    await saveTitleToBackend(pendingTitle, true);
    setPendingTitle(null);
    setSlugToDelete(null);
  };

  const handleCancelSlugDeletion = () => {
    // Revert to previous title
    const fallbackTitle = isControlledMode
      ? props.title
      : props.initialTitle || "Untitled";
    setLocalTitle(fallbackTitle);
    setConfirmDialogOpen(false);
    setPendingTitle(null);
    setSlugToDelete(null);
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
      <>
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
        {!isControlledMode && (
          <SlugDeletionConfirmDialog
            open={confirmDialogOpen}
            onConfirm={handleConfirmSlugDeletion}
            onCancel={handleCancelSlugDeletion}
            slugToDelete={slugToDelete}
          />
        )}
      </>
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
