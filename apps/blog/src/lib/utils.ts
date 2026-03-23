import dayjs from "dayjs";

export function formatPublishedDate(timestamp: number): string {
  return dayjs(timestamp).format("MMM D, YYYY");
}

export function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
}
