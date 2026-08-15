const ALLOWED_CDN_ORIGINS = new Set([
  "https://cdn.elcokiin.me",
  "https://cdn-dev.elcokiin.me",
]);

const CACHE_CONTROL = "public, max-age=86400, immutable";

/**
 * Server-side proxy for CDN images.
 *
 * The browser cannot read `cdn.elcokiin.me` images into a canvas because the CDN
 * does not emit `Access-Control-Allow-Origin`. This endpoint fetches the image
 * server-to-server (no CORS) and returns it same-origin with permissive headers,
 * making copy/download work regardless of CDN CORS configuration.
 */
export async function proxyCdnImage(cdnUrl: string): Promise<Response> {
  let parsed: URL;
  try {
    parsed = new URL(cdnUrl);
  } catch {
    return new Response("invalid url", { status: 400 });
  }

  if (parsed.protocol !== "https:" || !ALLOWED_CDN_ORIGINS.has(parsed.origin)) {
    return new Response("forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(cdnUrl);

    if (upstream.status !== 200) {
      return new Response(await upstream.text(), {
        status: upstream.status,
        headers: { "content-type": "text/plain" },
      });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "access-control-allow-origin": "*",
        "cache-control": CACHE_CONTROL,
      },
    });
  } catch {
    return new Response("upstream error", { status: 502 });
  }
}