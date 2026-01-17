import { useCallback } from "react";
import { toast } from "sonner";
import { parseError, getUserFriendlyMessage } from "@elcokiin/errors";

type ErrorHandlerOptions = {
  context?: string;
  showToast?: boolean;
};

type ErrorHandlerReturn = {
  handleError: (error: unknown, options?: ErrorHandlerOptions) => string;
  handleErrorSilent: (error: unknown, context?: string) => string;
};

/**
 * Hook for consistent error handling across the application.
 *
 * Usage:
 * ```tsx
 * const { handleError, handleErrorSilent } = useErrorHandler();
 *
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, { context: "ComponentName.methodName" });
 * }
 * ```
 */
export function useErrorHandler(): ErrorHandlerReturn {
  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const { context, showToast = true } = options;

      const parsed = parseError(error);
      const userMessage = getUserFriendlyMessage(error);

      const logPrefix = context ? `[${context}]` : "[Error]";
      console.error(logPrefix, {
        message: parsed.message,
        code: parsed.code,
        error,
      });

      if (showToast) {
        toast.error(userMessage);
      }

      return userMessage;
    },
    [],
  );

  const handleErrorSilent = useCallback(
    (error: unknown, context?: string) => {
      return handleError(error, { context, showToast: false });
    },
    [handleError],
  );

  return {
    handleError,
    handleErrorSilent,
  };
}
