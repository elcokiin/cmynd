import { readingTime } from "reading-time-estimator";

export function getReadingTimeMinutes(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 0;
  return Math.max(1, readingTime(normalized).minutes);
}
