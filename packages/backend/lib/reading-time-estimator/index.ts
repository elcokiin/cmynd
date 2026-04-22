import { readingTime } from "reading-time-estimator";

export function getReadingTimeMinutes(text: string): number {
  return readingTime(text).minutes;
}
