import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { useConvex } from "convex/react";
import { useCallback } from "react";

import { compressImage } from "@/utils/compress-image";
import type { UploadFn } from "@elcokiin/backend/lib/types";

function useConvexImageUpload(): UploadFn {
  const convex = useConvex();
  const uploadFile = useUploadFile(api.r2);

  return useCallback(
    async (file: File) => {
      const compressionResult = await compressImage(file);

      if (!compressionResult.ok) {
        if (compressionResult.reason === "too-large") {
          throw new Error("Image too large. Maximum size is 10MB.");
        }
        throw new Error("Failed to process image. Try a different file.");
      }

      const key = await uploadFile(compressionResult.file);

      const url = await convex.query(api.storage.getUrl, { key });
      if (!url) {
        throw new Error("Failed to get file URL");
      }

      return { url, storageId: key };
    },
    [convex, uploadFile],
  );
}

export { useConvexImageUpload };
