import type { APIRoute } from "astro";

import { proxyCdnImage } from "../../lib/cdn-image";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const cdnUrl = url.searchParams.get("url");
  if (!cdnUrl) {
    return new Response("missing url", { status: 400 });
  }
  return proxyCdnImage(cdnUrl);
};