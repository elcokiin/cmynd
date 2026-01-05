import type { Editor } from "@tiptap/react";

// Type for upload function
type UploadFn = (file: File) => Promise<string>;

// Default upload function that can be overridden
let uploadFn: UploadFn | null = null;

/**
 * Set the upload function for images.
 * This should be called with a Convex-based upload function.
 */
export function setImageUploadFn(fn: UploadFn): void {
  uploadFn = fn;
}

/**
 * Get the current upload function.
 */
export function getImageUploadFn(): UploadFn | null {
  return uploadFn;
}

/**
 * Upload an image and insert it into the editor.
 */
export async function uploadImage(file: File, editor: Editor): Promise<void> {
  if (!uploadFn) {
    console.error("Image upload function not configured");
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    console.error("File is not an image");
    return;
  }

  try {
    // Upload to Convex and get URL
    const url = await uploadFn(file);

    // Insert the image using the commands available in the editor
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: { src: url },
      })
      .run();
  } catch (error) {
    console.error("Failed to upload image:", error);
  }
}

/**
 * Handle image paste events.
 */
export function handleImagePaste(
  event: ClipboardEvent,
  editor: Editor
): boolean {
  const items = event.clipboardData?.items;
  if (!items) return false;

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        uploadImage(file, editor);
        return true;
      }
    }
  }

  return false;
}

/**
 * Handle image drop events.
 */
export function handleImageDrop(event: DragEvent, editor: Editor): boolean {
  const files = event.dataTransfer?.files;
  if (!files?.length) return false;

  for (const file of files) {
    if (file.type.startsWith("image/")) {
      event.preventDefault();
      uploadImage(file, editor);
      return true;
    }
  }

  return false;
}
