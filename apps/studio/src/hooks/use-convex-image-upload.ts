import type { UploadFn } from "@elcokiin/backend/lib/types";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { useConvex, useMutation } from "convex/react";
import { useCallback } from "react";

/**
 * Hook that provides a Convex-based image upload function.
 * Handles generating upload URLs, uploading files, and retrieving public URLs.
 *
 * @returns Upload function that accepts a File and returns a Promise with the public URL
 */
function useConvexImageUpload(): UploadFn {
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  return useCallback(
    async (file: File): Promise<string> => {
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await response.json();

      const url = await convex.query(api.storage.getUrl, { storageId });
      if (!url) {
        throw new Error("Failed to get file URL");
      }

      return url;
    },
    [convex, generateUploadUrl],
  );
}

export { useConvexImageUpload };
