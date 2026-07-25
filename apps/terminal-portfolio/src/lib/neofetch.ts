import type { PublicPortfolio } from "@elcokiin/backend/lib/types/portfolio";

export function buildNeofetch(profile: PublicPortfolio): string {
  const username = profile.name.split(" ")[0]?.toLowerCase() ?? "portfolio";
  const role = profile.headline ?? "Developer";
  return ` ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │         /\\           ${username}@dev${" ".repeat(Math.max(0, 20 - username.length - 4))}
 │        /  \\          ${"─".repeat(username.length + 4)}${" ".repeat(Math.max(0, 20 - username.length - 4))}
 │       /\\   \\        OS: Omarchy                                  │
 │      /      \\        Editor: Neovim                              │
 │     /   ,,   \\       Agent: OpenCode                             │
 │    /   |  |  -\\      Shell: zsh                                  │
 │   /_-''    ''-_\\     Role: ${role}${" ".repeat(Math.max(0, 20 - role.length))}
 │                      Uptime: always shipping${" ".repeat(Math.max(0, 24 - 23))}
 │                                                                  │
 └──────────────────────────────────────────────────────────────────┘`;
}