import { useCallback } from "react";
import { toast } from "sonner";
import { parseError, getUserFriendlyMessage } from "@elcokiin/errors/utils";

type ErrorHandlerOptions = {
  context?: string;
  showToast?: boolean;
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
export function useErrorHandler() {
  /**
   * Handle error with user-facing toast notification.
   * Logs full error details to console for debugging.
   */
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const { context, showToast = true } = options;
    
    const parsed = parseError(error);
    const userMessage = getUserFriendlyMessage(error);
    
    // Log full error details to console for debugging
    const logPrefix = context ? `[${context}]` : "[Error]";
    console.error(logPrefix, {
      message: parsed.message,
      code: parsed.code,
      statusCode: parsed.statusCode,
      context: parsed.context,
      error,
    });
    
    // Show user-friendly toast notification
    if (showToast) {
      toast.error(userMessage);
    }
    
    return userMessage;
  }, []);
  
  /**
   * Handle error silently (log only, no toast).
   * Useful for non-critical errors or background operations.
   */
  const handleErrorSilent = useCallback((error: unknown, context?: string) => {
    return handleError(error, { context, showToast: false });
  }, [handleError]);
  
  return {
    handleError,
    handleErrorSilent,
  };
}
