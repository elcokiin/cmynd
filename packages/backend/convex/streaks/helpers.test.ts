import { describe, expect, it } from "vitest";

import { countWords, getLocalDay } from "./helpers";

describe("getLocalDay", () => {
  it("formats a timestamp as local YYYY-MM-DD", () => {
    const date = new Date(2026, 0, 5, 12, 0, 0);
    expect(getLocalDay(date.getTime())).toBe("2026-01-05");
  });

  it("zero-pads month and day", () => {
    const date = new Date(2026, 10, 3, 8, 0, 0);
    expect(getLocalDay(date.getTime())).toBe("2026-11-03");
  });
});

describe("countWords", () => {
  it("returns 0 for empty or null content", () => {
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
    expect(countWords({})).toBe(0);
  });

  it("counts words in a Lexical editor state", () => {
    const content = {
      root: {
        children: [
          {
            type: "paragraph",
            children: [
              { type: "text", text: "Hello world" },
              { type: "text", text: " again" },
            ],
          },
          {
            type: "paragraph",
            children: [{ type: "text", text: "Second paragraph." }],
          },
        ],
      },
    };
    expect(countWords(content)).toBe(5);
  });

  it("counts words in a TipTap-style tree", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "one two three" }],
        },
      ],
    };
    expect(countWords(content)).toBe(3);
  });

  it("collapses repeated whitespace", () => {
    expect(countWords({ text: "a   b\n\n  c\t" })).toBe(3);
  });
});