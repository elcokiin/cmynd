import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { proxyCdnImage } from "../cdn-image";

const PROD_CDN = "https://cdn.elcokiin.me/key-123";
const DEV_CDN = "https://cdn-dev.elcokiin.me/key-123";

describe("cdn-image proxy endpoint (CORS regression)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("proxies an allowlisted CDN url server-side and adds CORS headers", async () => {
    const body = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(body, {
            status: 200,
            headers: { "content-type": "image/jpeg" },
          }),
        ),
      ),
    );

    const res = await proxyCdnImage(PROD_CDN);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(await res.arrayBuffer()).toEqual(Buffer.from(body).buffer);
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      PROD_CDN,
    );
  });

  it("proxies the dev CDN allowlist as well", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("img", { status: 200 }))),
    );

    const res = await proxyCdnImage(DEV_CDN);

    expect(res.status).toBe(200);
  });

  it("rejects a non-allowlisted host to avoid open-proxy/SSRF", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await proxyCdnImage("https://evil.example.com/secret.png");

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects http:// urls", async () => {
    const res = await proxyCdnImage("http://cdn.elcokiin.me/key-123");

    expect(res.status).toBe(403);
  });

  it("rejects malformed urls", async () => {
    const res = await proxyCdnImage("not a url");

    expect(res.status).toBe(400);
  });

  it("returns 502 when the upstream request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down"))),
    );

    const res = await proxyCdnImage(PROD_CDN);

    expect(res.status).toBe(502);
  });

  it("propagates upstream non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("gone", { status: 404 }))),
    );

    const res = await proxyCdnImage(PROD_CDN);

    expect(res.status).toBe(404);
  });
});