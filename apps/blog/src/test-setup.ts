import { vi } from "vitest";

Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "blob:vitest-mock"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn(),
});

if (!("ClipboardItem" in globalThis)) {
  (globalThis as any).ClipboardItem = class ClipboardItem {
    types: string[];
    constructor(public items: Record<string, Blob>) {
      this.types = Object.keys(items);
    }
    getType(type: string): Promise<Blob> {
      return Promise.resolve(this.items[type]);
    }
  };
}

Object.defineProperty(navigator, "clipboard", {
  writable: true,
  configurable: true,
  value: {
    writeText: vi.fn(() => Promise.resolve()),
    write: vi.fn(() => Promise.resolve()),
    read: vi.fn(() => Promise.resolve([])),
  },
});