import { ConvexAppError } from "../base";
import { ErrorCode } from "../codes";

export class DocumentNotFoundError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_NOT_FOUND;
  readonly statusCode = 404;

  constructor(documentId?: string) {
    super(
      documentId ? `Document ${documentId} not found` : "Document not found"
    );
  }
}

export class DocumentOwnershipError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_OWNERSHIP;
  readonly statusCode = 403;

  constructor() {
    super("You don't own this document");
  }
}

export class DocumentAlreadyPublishedError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_ALREADY_PUBLISHED;
  readonly statusCode = 400;

  constructor() {
    super("Document is already published");
  }
}

export class DocumentPendingReviewError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_PENDING_REVIEW;
  readonly statusCode = 400;

  constructor() {
    super("Cannot edit a document that is pending review");
  }
}

export class DocumentPublishedError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_PUBLISHED;
  readonly statusCode = 400;

  constructor() {
    super("Cannot edit a published document");
  }
}

export class DocumentValidationError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_VALIDATION;
  readonly statusCode = 400;
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

export class DocumentRateLimitError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_RATE_LIMIT;
  readonly statusCode = 429;

  constructor() {
    super(
      "Rate limit exceeded: You can only submit a document 3 times per 24 hours"
    );
  }
}

export class DocumentInvalidStatusError extends ConvexAppError {
  readonly code = ErrorCode.DOCUMENT_INVALID_STATUS;
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
