/**
 * Shared storage and upload types.
 */

/**
 * Function signature for uploading files and returning a URL.
 * Used by components that need to upload images or other files.
 *
 * @param file - The file to upload
 * @returns Promise resolving to the public URL of the uploaded file
 */
export type UploadFn = (file: File) => Promise<string>;

/**
 * Metadata for stored files.
 * Useful for tracking uploaded file information.
 */
export type StorageMetadata = {
  storageId: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: number;
};
