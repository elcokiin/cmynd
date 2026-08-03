import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:4321",
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  },
  webServer: {
    command: "bun run dev",
    port: 4321,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
