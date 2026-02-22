import { expect, test, describe } from "vitest";
import { neofetchOutput } from "./neofetch";

describe("neofetch", () => {
  test("should return the correct neofetch output string", () => {
    expect(neofetchOutput).toContain("diegotenjo@elcokiin ~ $ neofetch");
    expect(neofetchOutput).toContain("OS: Omarchy");
    expect(neofetchOutput).toContain("Editor: Neovim");
    expect(neofetchOutput).toContain("Agent: OpenCode");
    expect(neofetchOutput).toContain("Shell: zsh");
    expect(neofetchOutput).toContain("Role: Full-Stack Developer");
    expect(neofetchOutput).toContain("Uptime: always shipping");
    expect(neofetchOutput).toContain(
      "┌──────────────────────────────────────────────────────────────────┐",
    );
    expect(neofetchOutput).toContain(
      "└──────────────────────────────────────────────────────────────────┘",
    );
    expect(typeof neofetchOutput).toBe("string");
  });

  test("should have the proper ASCII art structure", () => {
    const lines = neofetchOutput.split("\n");
    expect(lines.length).toBeGreaterThan(10);
    // Check for the Arch-style logo presence
    expect(neofetchOutput).toContain("/\\");
  });
});
