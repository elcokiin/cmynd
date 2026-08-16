import { test, expect, type Page } from "@playwright/test";

test.describe("SiteHeader - Theme button and author link overlap prevention", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("theme button and author link should not overlap on desktop", async ({
    page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for page load and animations to complete
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const themeButton = page.locator("#header-theme-toggle");
    const authorLink = page.locator("#header-author-name");

    // Both elements should be visible on desktop
    await expect(themeButton).toBeVisible();
    await expect(authorLink).toBeVisible();

    // Get bounding boxes
    const buttonBox = await themeButton.boundingBox();
    const linkBox = await authorLink.boundingBox();

    expect(buttonBox).not.toBeNull();
    expect(linkBox).not.toBeNull();

    if (buttonBox && linkBox) {
      // Check that elements don't overlap
      // Two rectangles overlap if one is not completely to the left, right, above, or below the other
      const noOverlap =
        buttonBox.x + buttonBox.width <= linkBox.x ||
        linkBox.x + linkBox.width <= buttonBox.x ||
        buttonBox.y + buttonBox.height <= linkBox.y ||
        linkBox.y + linkBox.height <= buttonBox.y;

      expect(noOverlap).toBe(true);
    }
  });

  test("theme button should be positioned to the left of author link", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const themeButton = page.locator("#header-theme-toggle");
    const authorLink = page.locator("#header-author-name");

    await expect(themeButton).toBeVisible();
    await expect(authorLink).toBeVisible();

    const buttonBox = await themeButton.boundingBox();
    const linkBox = await authorLink.boundingBox();

    expect(buttonBox).not.toBeNull();
    expect(linkBox).not.toBeNull();

    if (buttonBox && linkBox) {
      // Button should be to the left of the link (button's right edge <= link's left edge)
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(linkBox.x);
    }
  });

  test("theme button and author link should have minimum gap between them", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const themeButton = page.locator("#header-theme-toggle");
    const authorLink = page.locator("#header-author-name");

    await expect(themeButton).toBeVisible();
    await expect(authorLink).toBeVisible();

    const buttonBox = await themeButton.boundingBox();
    const linkBox = await authorLink.boundingBox();

    expect(buttonBox).not.toBeNull();
    expect(linkBox).not.toBeNull();

    if (buttonBox && linkBox) {
      // Calculate gap between button's right edge and link's left edge
      const gap = linkBox.x - (buttonBox.x + buttonBox.width);

      // Minimum gap should be at least 8px (half of the gap-4 = 16px)
      expect(gap).toBeGreaterThanOrEqual(8);
    }
  });

  test("elements should not overlap after scrolling triggers animation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState("networkidle");

    // Scroll down to trigger the reveal animation
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight * 0.15);
    });
    await page.waitForTimeout(500);

    // Scroll back up to ensure animation state is stable
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);

    const themeButton = page.locator("#header-theme-toggle");
    const authorLink = page.locator("#header-author-name");

    await expect(themeButton).toBeVisible();
    await expect(authorLink).toBeVisible();

    const buttonBox = await themeButton.boundingBox();
    const linkBox = await authorLink.boundingBox();

    expect(buttonBox).not.toBeNull();
    expect(linkBox).not.toBeNull();

    if (buttonBox && linkBox) {
      // Check no overlap after animation
      const noOverlap =
        buttonBox.x + buttonBox.width <= linkBox.x ||
        linkBox.x + linkBox.width <= buttonBox.x ||
        buttonBox.y + buttonBox.height <= linkBox.y ||
        linkBox.y + linkBox.height <= buttonBox.y;

      expect(noOverlap).toBe(true);
    }
  });

  test("header wrapper should have proper flex layout to prevent overlap", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState("networkidle");

    const themeWrap = page.locator("#header-theme-wrap");

    // Check that the wrapper has proper flex display
    const display = await themeWrap.evaluate(
      (el) => getComputedStyle(el).display
    );
    expect(display).toBe("flex");

    // Check that align-items is set for vertical alignment
    const alignItems = await themeWrap.evaluate(
      (el) => getComputedStyle(el).alignItems
    );
    expect(alignItems).toBe("center");
  });

  test("author link should have proper positioning when visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const authorLink = page.locator("#header-author-name");

    await expect(authorLink).toBeVisible();

    // Check that the link has proper positioning
    const position = await authorLink.evaluate(
      (el) => getComputedStyle(el).position
    );

    // On desktop with theme-reveal, the link should be absolutely positioned
    // but should not overlap due to proper right positioning
    expect(["absolute", "relative", "static"]).toContain(position);
  });
});

test.describe("SiteHeader - Mobile layout", () => {
  test("theme button and author link behavior on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState("networkidle");

    const themeButton = page.locator("#header-theme-toggle");
    const authorLink = page.locator("#header-author-name");

    // Author link should be hidden on mobile (has hidden sm:block class)
    await expect(authorLink).not.toBeVisible();

    // Theme button should still be visible
    await expect(themeButton).toBeVisible();
  });
});
