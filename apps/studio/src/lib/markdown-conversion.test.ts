import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  downloadMarkdown,
  jsonToMarkdown,
  markdownToJson,
} from "./markdown-conversion";

describe("markdownToJson", () => {
  it("parses common markdown blocks", () => {
    const markdown = [
      "# Title",
      "",
      "Paragraph line one",
      "line two",
      "",
      "- item one",
      "- item two",
      "",
      "1. first",
      "2. second",
      "",
      "> quoted text",
      "",
      "```ts",
      "const x = 1;",
      "```",
      "",
      "---",
    ].join("\n");

    const json = markdownToJson(markdown);

    expect(json.type).toBe("doc");
    expect(json.content?.[0]?.type).toBe("heading");
    expect(json.content?.[1]?.type).toBe("paragraph");
    expect(json.content?.[2]?.type).toBe("bulletList");
    expect(json.content?.[3]?.type).toBe("orderedList");
    expect(json.content?.[4]?.type).toBe("blockquote");
    expect(json.content?.[5]?.type).toBe("codeBlock");
    expect(json.content?.[6]?.type).toBe("horizontalRule");
  });

  it("returns empty doc for blank markdown", () => {
    const json = markdownToJson("   \n\n");

    expect(json).toEqual({ type: "doc", content: [] });
  });
});

describe("jsonToMarkdown", () => {
  it("renders core nodes and marks", () => {
    const json = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Section" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Bold", marks: [{ type: "bold" }] },
            { type: "text", text: " " },
            { type: "text", text: "Code", marks: [{ type: "code" }] },
            { type: "text", text: " " },
            {
              type: "text",
              text: "Link",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
            },
          ],
        },
        {
          type: "image",
          attrs: { src: "https://img.test/a.png", alt: "alt text" },
        },
      ],
    } as any;

    const markdown = jsonToMarkdown(json);

    expect(markdown).toContain("## Section");
    expect(markdown).toContain("**Bold**");
    expect(markdown).toContain("`Code`");
    expect(markdown).toContain("[Link](https://example.com)");
    expect(markdown).toContain("![alt text](https://img.test/a.png)");
  });

  it("roundtrip keeps key structure best-effort", () => {
    const input = "# My Doc\n\n- alpha\n- beta\n\nA paragraph";

    const json = markdownToJson(input);
    const output = jsonToMarkdown(json);

    expect(output).toContain("# My Doc");
    expect(output).toContain("- alpha");
    expect(output).toContain("- beta");
    expect(output).toContain("A paragraph");
  });
});

describe("downloadMarkdown", () => {
  const createObjectUrl = vi.fn(() => "blob:test-url");
  const revokeObjectUrl = vi.fn();
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectUrl.mockClear();
    revokeObjectUrl.mockClear();

    vi.stubGlobal("URL", {
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });

    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("creates and revokes object URL with sanitized filename", () => {
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");

    downloadMarkdown("My Doc!?", "# Title");

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:test-url");

    const anchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(anchor.tagName).toBe("A");
    expect(anchor.download).toBe("my-doc.md");

    expect(removeSpy).toHaveBeenCalledTimes(1);

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
