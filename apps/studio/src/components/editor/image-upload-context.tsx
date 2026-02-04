import type { UploadFn } from "@elcokiin/backend/lib/types";

import { createContext, useContext } from "react";

type ImageUploadContextValue = {
  uploadFn: UploadFn | null;
  onError?: (error: Error) => void;
};

const ImageUploadContext = createContext<ImageUploadContextValue>({
  uploadFn: null,
  onError: undefined,
});

type ImageUploadProviderProps = {
  uploadFn: UploadFn | null;
  onError?: (error: Error) => void;
  children: React.ReactNode;
};

function ImageUploadProvider({
  uploadFn,
  onError,
  children,
}: ImageUploadProviderProps): React.ReactNode {
  return (
    <ImageUploadContext.Provider value={{ uploadFn, onError }}>
      {children}
    </ImageUploadContext.Provider>
  );
}

function useImageUpload(): ImageUploadContextValue {
  return useContext(ImageUploadContext);
}

export { ImageUploadProvider, useImageUpload };
