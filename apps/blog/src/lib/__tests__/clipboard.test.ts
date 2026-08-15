import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { copyImage, downloadImage } from "../clipboard";

const CDN_URL = "https://cdn.elcokiin.me/c0d74463-f09e-44fc-9b88-d0ee4df071e7";

function pngBlob(): Blob {
  return new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" });
}

function fetchResponse(blob: Blob, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    blob: () => Promise.resolve(blob),
  } as unknown as Response;
}

function jpegBlob(): Blob {
  return new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
}

function mockCanvas(blob: Blob) {
  const getContext = vi.fn(
    () =>
      ({
        drawImage: vi.fn(),
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      }) as unknown as CanvasRenderingContext2D,
  );
  const toBlob = vi.fn((cb: (b: Blob | null) => void) => cb(blob));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(getContext);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(toBlob);
  const bitmap = { width: 16, height: 16, close: vi.fn() };
  vi.stubGlobal("createImageBitmap", vi.fn(() => Promise.resolve(bitmap)));
  return { getContext, toBlob };
}

describe("clipboard helpers (CORS regression)", () => {
  const write = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      configurable: true,
      value: { writeText: vi.fn(() => Promise.resolve()), write, read: vi.fn() },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("copyImage fetches the same-origin proxy, never the raw CDN URL", async () => {
    mockCanvas(pngBlob());
    const fetchMock = vi.fn<(_input: string) => Promise<Response>>(() =>
      Promise.resolve(fetchResponse(jpegBlob())),
    );
    vi.stubGlobal("fetch", fetchMock);

    const ok = await copyImage(CDN_URL);

    expect(ok).toBe(true);
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(typeof calledUrl).toBe("string");
    expect(String(calledUrl)).toContain("/api/cdn-image?url=");
    expect(String(calledUrl)).toContain(encodeURIComponent(CDN_URL));
    expect(String(calledUrl)).not.toContain("cdn.elcokiin.me/c0d74463");
    expect(write).toHaveBeenCalledOnce();
  });

  it("downloadImage fetches through the proxy and triggers a same-origin download", async () => {
    const fetchMock = vi.fn<(_input: string) => Promise<Response>>(() =>
      Promise.resolve(fetchResponse(jpegBlob())),
    );
    vi.stubGlobal("fetch", fetchMock);
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(() => {
      const el = originalCreateElement("a");
      Object.defineProperty(el, "click", { value: click });
      return el;
    });

    const ok = await downloadImage(CDN_URL);

    expect(ok).toBe(true);
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(String(calledUrl)).toContain("/api/cdn-image?url=");
    expect(String(calledUrl)).not.toContain("cdn.elcokiin.me/c0d74463");
    expect(click).toHaveBeenCalledOnce();
  });

  it("copyImage returns false when the proxy endpoint fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(fetchResponse(new Blob([], { type: "text/plain" }), 502)),
      ),
    );

    const ok = await copyImage(CDN_URL);

    expect(ok).toBe(false);
    expect(write).not.toHaveBeenCalled();
  });

  it("copyImage returns false when there is no clipboard API", async () => {
    mockCanvas(pngBlob());
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(fetchResponse(jpegBlob()))),
    );
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(globalThis, "ClipboardItem", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const ok = await copyImage(CDN_URL);

    expect(ok).toBe(false);
  });
});