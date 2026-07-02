import type { UploadFn } from "@elcokiin/backend/lib/types";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { useConvex, useMutation } from "convex/react";
import { useCallback } from "react";

import { compressImage } from "@/utils/compress-image";

function useConvexImageUpload(): UploadFn {
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  return useCallback(
    async (file: File) => {
      const compressionResult = await compressImage(file);

      if (!compressionResult.ok) {
        if (compressionResult.reason === "too-large") {
          throw new Error("Image too large. Maximum size is 10MB.");
        }
        throw new Error("Failed to process image. Try a different file.");
      }

      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressionResult.file.type },
        body: compressionResult.file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await response.json();

      const url = await convex.query(api.storage.getUrl, { storageId });
      if (!url) {
        throw new Error("Failed to get file URL");
      }

      return { url, storageId };
    },
    [convex, generateUploadUrl],
  );
}

export { useConvexImageUpload };
