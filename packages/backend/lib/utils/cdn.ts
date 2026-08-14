/**
 * Build a permanent CDN URL for an R2 object key.
 * No expiry — the URL is stable as long as the object exists.
 *
 * @param key - The R2 object key
 * @param r2PublicDomain - The public CDN domain (e.g. "https://cdn-dev.elcokiin.me" or "https://cdn.elcokiin.me")
 */
export function getCdnUrl(key: string, r2PublicDomain: string): string {
  const base = r2PublicDomain.replace(/\/+$/, "");
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
