export type RetryConfig = {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Calculate delay for next retry with exponential backoff.
 * Example: attempt 0 = 1000ms, attempt 1 = 2000ms, attempt 2 = 4000ms
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay =
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber);
  return Math.min(delay, config.maxDelayMs);
}
