import { AppError } from "../base";
import { ErrorCode } from "../codes";

export class ConfigurationError extends AppError {
  readonly code = ErrorCode.CONFIG_MISSING_ENV;
  readonly statusCode = 500;

  constructor(message = "Application configuration error") {
    super(message, false); // Not operational - requires developer intervention
  }
}
