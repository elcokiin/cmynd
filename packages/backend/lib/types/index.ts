export type UploadResult = { url: string; storageId: string };

/**
 * Function signature for uploading files and returning a URL + storageId.
 * The storageId is an opaque identifier for later cleanup of the uploaded file.
 *
 * @param file - The file to upload
 * @returns Promise resolving to the upload result with url and storageId
 */
export type UploadFn = (file: File) => Promise<UploadResult>;
