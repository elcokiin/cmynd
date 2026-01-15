import type { Editor } from "@tiptap/react";
import type { UploadFn } from "@elcokiin/backend/lib/types/storage";

import { getUserFriendlyMessage, parseError } from "@elcokiin/errors";
import {
  StorageNotConfiguredError,
  StorageInvalidFileTypeError,
  StorageUploadError,
} from "@elcokiin/errors/frontend";

/**
 * Upload an image and insert it into the editor.
 *
 * @param uploadFn - The upload function to use
 * @param file - The file to upload
 * @param editor - The TipTap editor instance
 * @param onError - Optional callback for error handling
 */
export async function uploadImage(
  uploadFn: UploadFn | null,
  file: File,
  editor: Editor,
  onError?: (error: Error) => void
): Promise<void> {
  if (!uploadFn) {
    const error = new StorageNotConfiguredError();
    onError?.(error);
    console.error(error.message);
    return;
  }

  if (!file.type.startsWith("image/")) {
    const error = new StorageInvalidFileTypeError(file.type);
    onError?.(error);
    console.error(error.message);
    return;
  }

  try {
    const url = await uploadFn(file);

    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: { src: url },
      })
      .run();
  } catch (error) {
    const parsedError = parseError(error);
    const message = getUserFriendlyMessage(parsedError);
    const uploadError = new StorageUploadError(message);

    onError?.(uploadError);
    console.error("[image-upload.uploadImage]", message, {
      code: parsedError.code,
      error: parsedError,
    });
  }
}

/**
 * Handle image paste events.
 *
 * @param event - The clipboard event
 * @param editor - The TipTap editor instance
 * @param uploadFn - The upload function to use
 * @param onError - Optional callback for error handling
 */
export function handleImagePaste(
  event: ClipboardEvent,
  editor: Editor,
  uploadFn: UploadFn | null,
  onError?: (error: Error) => void
): boolean {
  const items = event.clipboardData?.items;
  if (!items) return false;

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        uploadImage(uploadFn, file, editor, onError);
        return true;
      }
    }
  }

  return false;
}

/**
 * Handle image drop events.
 *
 * @param event - The drag event
 * @param editor - The TipTap editor instance
 * @param uploadFn - The upload function to use
 * @param onError - Optional callback for error handling
 */
export function handleImageDrop(
  event: DragEvent,
  editor: Editor,
  uploadFn: UploadFn | null,
  onError?: (error: Error) => void
): boolean {
  const files = event.dataTransfer?.files;
  if (!files?.length) return false;

  for (const file of files) {
    if (file.type.startsWith("image/")) {
      event.preventDefault();
      uploadImage(uploadFn, file, editor, onError);
      return true;
    }
  }

  return false;
}
