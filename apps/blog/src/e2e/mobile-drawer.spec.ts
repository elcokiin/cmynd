import { test, expect } from "@playwright/test";

const OPEN = "is-open";

test.describe("Mobile drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hamburger opens the drawer", async ({ page }) => {
    const drawer = page.locator("#mobile-drawer");
    const overlay = page.locator("#mobile-drawer-overlay");

    await expect(drawer).not.toHaveClass(new RegExp(OPEN));
    await page.click("#mobile-menu-btn");

    await expect(drawer).toHaveClass(new RegExp(OPEN));
    await expect(overlay).toHaveClass(new RegExp(OPEN));
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  });

  test("close button closes the drawer", async ({ page }) => {
    const drawer = page.locator("#mobile-drawer");

    await page.click("#mobile-menu-btn");
    await expect(drawer).toHaveClass(new RegExp(OPEN));

    await page.click("#mobile-drawer-close");
    await expect(drawer).not.toHaveClass(new RegExp(OPEN));
    await expect(page.locator("body")).toHaveCSS("overflow", "visible");
  });

  test("overlay click closes the drawer", async ({ page }) => {
    const drawer = page.locator("#mobile-drawer");

    await page.click("#mobile-menu-btn");
    await expect(drawer).toHaveClass(new RegExp(OPEN));

    await page.click("#mobile-drawer-overlay", { position: { x: 10, y: 400 } });
    await expect(drawer).not.toHaveClass(new RegExp(OPEN));
  });

  test("Escape key closes the drawer", async ({ page }) => {
    const drawer = page.locator("#mobile-drawer");

    await page.click("#mobile-menu-btn");
    await expect(drawer).toHaveClass(new RegExp(OPEN));

    await page.keyboard.press("Escape");
    await expect(drawer).not.toHaveClass(new RegExp(OPEN));
  });
});

test.describe("Theme buttons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Claro button sets light theme and persists to localStorage", async ({ page }) => {
    await page.click("#mobile-menu-btn");

    await page.click("#theme-light-btn");

    const after = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(after).toBe("light");

    const stored = await page.evaluate(() => localStorage.getItem("theme"));
    expect(stored).toBe("light");

    await expect(page.locator("#theme-light-btn")).toHaveClass(/is-active/);
    await expect(page.locator("#theme-dark-btn")).not.toHaveClass(/is-active/);
  });

  test("Oscuro button sets dark theme and persists to localStorage", async ({ page }) => {
    await page.click("#mobile-menu-btn");

    await page.click("#theme-dark-btn");

    const after = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(after).toBe("dark");

    const stored = await page.evaluate(() => localStorage.getItem("theme"));
    expect(stored).toBe("dark");

    await expect(page.locator("#theme-dark-btn")).toHaveClass(/is-active/);
    await expect(page.locator("#theme-light-btn")).not.toHaveClass(/is-active/);
  });
});
