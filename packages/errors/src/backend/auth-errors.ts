import { ConvexAppError } from "../base";
import { ErrorCode } from "../codes";

export class UnauthenticatedError extends ConvexAppError {
  readonly code = ErrorCode.UNAUTHENTICATED;
  readonly statusCode = 401;

  constructor(message = "Not authenticated") {
    super(message);
  }
}

export class UnauthorizedError extends ConvexAppError {
  readonly code = ErrorCode.UNAUTHORIZED;
  readonly statusCode = 403;

  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class AdminRequiredError extends ConvexAppError {
  readonly code = ErrorCode.ADMIN_REQUIRED;
  readonly statusCode = 403;

  constructor() {
    super("Admin access required");
  }
}
