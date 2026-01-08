import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { env } from "@elcokiin/env/studio";
import { isRetryableError, calculateRetryDelay } from "@elcokiin/errors";
import type { RetryConfig } from "@elcokiin/errors";
import { useErrorHandler } from "./use-error-handler";

type RetryMutationOptions<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  "mutationFn" | "retry" | "retryDelay"
> & {
  context?: string;
  showErrorToast?: boolean;
};

/**
 * Hook for mutations with automatic retry logic for retryable errors.
 * 
 * Automatically retries network errors, timeouts, and rate limits
 * using exponential backoff. Configuration is controlled via environment variables.
 * 
 * Usage:
 * ```tsx
 * const createDocument = useRetryMutation({
 *   mutationFn: async (input: CreateInput) => {
 *     return await convexMutation(api.documents.create, input);
 *   },
 *   context: "CreateDocumentButton.handleCreate",
 *   onSuccess: () => toast.success("Document created"),
 * });
 * 
 * // In your component:
 * <button onClick={() => createDocument.mutate({ title: "New Doc" })}>
 *   Create
 * </button>
 * ```
 */
export function useRetryMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: RetryMutationOptions<TData, TError, TVariables> = {}
): UseMutationResult<TData, TError, TVariables> {
  const { handleError } = useErrorHandler();
  
  const {
    context,
    showErrorToast = true,
    onError,
    ...restOptions
  } = options;
  
  const retryConfig: RetryConfig = {
    maxRetries: env.VITE_RETRY_MAX_ATTEMPTS,
    initialDelayMs: env.VITE_RETRY_INITIAL_DELAY_MS,
    maxDelayMs: env.VITE_RETRY_MAX_DELAY_MS,
    backoffMultiplier: env.VITE_RETRY_BACKOFF_MULTIPLIER,
  };
  
  const wrappedMutationFn = useCallback(
    async (variables: TVariables): Promise<TData> => {
      return await mutationFn(variables);
    },
    [mutationFn]
  );
  
  return useMutation<TData, TError, TVariables>({
    mutationFn: wrappedMutationFn,
    retry: (failureCount, error) => {
      // Only retry if error is retryable and we haven't exceeded max attempts
      if (!isRetryableError(error)) {
        return false;
      }
      
      return failureCount < retryConfig.maxRetries;
    },
    retryDelay: (attemptIndex) => {
      const delay = calculateRetryDelay(attemptIndex, retryConfig);
      
      const logPrefix = context ? `[${context}]` : "[RetryMutation]";
      console.log(
        `${logPrefix} Retrying attempt ${attemptIndex + 1}/${retryConfig.maxRetries} after ${delay}ms`
      );
      
      return delay;
    },
    onError: (error, variables, contextData) => {
      // Handle error with user-facing message
      handleError(error, { 
        context: context ?? "useRetryMutation",
        showToast: showErrorToast,
      });
      
      // Call user's onError callback if provided
      if (onError) {
        onError(error, variables, contextData);
      }
    },
    ...restOptions,
  });
}
