import { AppError } from "../base";
import { ErrorCode } from "../codes";

export class StorageUploadError extends AppError {
  readonly code = ErrorCode.STORAGE_UPLOAD_FAILED;
  readonly statusCode = 500;

  constructor(message = "Failed to upload file") {
    super(message);
  }
}

export class StorageUrlError extends AppError {
  readonly code = ErrorCode.STORAGE_URL_FAILED;
  readonly statusCode = 500;

  constructor(message = "Failed to get file URL") {
    super(message);
  }
}

export class StorageNotConfiguredError extends AppError {
  readonly code = ErrorCode.STORAGE_NOT_CONFIGURED;
  readonly statusCode = 500;

  constructor(message = "Storage upload function not configured") {
    super(message);
  }
}

export class StorageInvalidFileTypeError extends AppError {
  readonly code = ErrorCode.STORAGE_INVALID_FILE_TYPE;
  readonly statusCode = 400;

  constructor(fileType?: string) {
    super(
      fileType
        ? `Invalid file type: ${fileType}. Expected an image.`
        : "File is not an image"
    );
  }
}
