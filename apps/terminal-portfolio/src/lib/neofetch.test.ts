import { expect, test, describe } from "vitest";
import { buildNeofetch } from "./neofetch";
import type { PublicPortfolio } from "@elcokiin/backend/lib/types/portfolio";

const mockProfile: PublicPortfolio = {
  _id: "test" as any,
  name: "Diego Tenjo",
  headline: "Full-Stack Developer",
  about: "",
  philosophy: "Test philosophy",
  socialLinks: [],
  hobbies: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("neofetch", () => {
  test("should return the correct neofetch output string", () => {
    const neofetchOutput = buildNeofetch(mockProfile);
    expect(neofetchOutput).toContain("diego@dev");
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
    const neofetchOutput = buildNeofetch(mockProfile);
    const lines = neofetchOutput.split("\n");
    expect(lines.length).toBeGreaterThan(10);
    expect(neofetchOutput).toContain("/\\");
  });
});
