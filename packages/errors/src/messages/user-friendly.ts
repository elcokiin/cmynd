import { ErrorCode } from "../codes";

/**
 * User-friendly error messages for frontend display.
 * These messages are polite and suitable for end users.
 */
export const USER_FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
  // Authentication & Authorization
  [ErrorCode.UNAUTHENTICATED]: "Please sign in to continue",
  [ErrorCode.UNAUTHORIZED]: "You don't have permission to perform this action",
  [ErrorCode.ADMIN_REQUIRED]: "Admin privileges required",

  // Document Errors
  [ErrorCode.DOCUMENT_NOT_FOUND]: "Document not found",
  [ErrorCode.DOCUMENT_OWNERSHIP]: "You don't own this document",
  [ErrorCode.DOCUMENT_ALREADY_PUBLISHED]: "This document is already published",
  [ErrorCode.DOCUMENT_PENDING_REVIEW]: "This document is pending review",
  [ErrorCode.DOCUMENT_PUBLISHED]: "This document is already published",
  [ErrorCode.DOCUMENT_VALIDATION]: "Document validation failed",
  [ErrorCode.DOCUMENT_RATE_LIMIT]: "Too many document operations. Please try again later",
  [ErrorCode.DOCUMENT_INVALID_STATUS]: "Invalid document status",
  [ErrorCode.DOCUMENT_INVALID_TITLE]: "Please provide a valid title for your document",
  [ErrorCode.DOCUMENT_EMPTY]: "Your document needs either a title or some content to be saved",
  [ErrorCode.DOCUMENT_SLUG_DELETION_REQUIRED]: "Changing this title will break an existing URL. Please confirm to continue",

  // Validation Errors
  [ErrorCode.VALIDATION_ERROR]: "Some fields contain invalid data",
  [ErrorCode.INVALID_INPUT]: "Please check your input and try again",
  [ErrorCode.ZOD_VALIDATION]: "Validation failed. Please check your input",

  // Storage Errors
  [ErrorCode.STORAGE_UPLOAD_FAILED]: "File upload failed. Please try again",
  [ErrorCode.STORAGE_URL_FAILED]: "Failed to retrieve file URL",
  [ErrorCode.STORAGE_NOT_CONFIGURED]: "Storage service is not configured",
  [ErrorCode.STORAGE_INVALID_FILE_TYPE]: "This file type is not supported",

  // Configuration Errors
  [ErrorCode.CONFIG_MISSING_ENV]: "System configuration error",

  // Author Errors
  [ErrorCode.AUTHOR_NOT_FOUND]: "Author not found",
  [ErrorCode.AUTHOR_OWNERSHIP]: "You don't own this author profile",
  [ErrorCode.AUTHOR_INVALID_AVATAR_URL]: "Invalid avatar URL",

  // Catch-all
  [ErrorCode.UNKNOWN]: "An unexpected error occurred",
};
