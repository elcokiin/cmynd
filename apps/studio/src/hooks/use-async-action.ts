import { useCallback, useState } from "react";

import { useErrorHandler } from "@/hooks/use-error-handler";

export function useAsyncAction() {
  const { handleError } = useErrorHandler();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isLoading = useCallback(
    (action: string) => loadingAction === action,
    [loadingAction],
  );

  const isProcessing = loadingAction !== null;

  const execute = useCallback(
    async (
      action: string,
      fn: () => Promise<void>,
      context?: string,
    ) => {
      setLoadingAction(action);
      try {
        await fn();
      } catch (error) {
        handleError(error, { context: context ?? action });
      } finally {
        setLoadingAction(null);
      }
    },
    [handleError],
  );

  return { execute, isLoading, isProcessing };
}
