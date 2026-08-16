import { test, expect, type Page } from "@playwright/test";

const DESKTOP = { width: 1280, height: 720 };

async function scrollToReveal(page: Page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.5));
}

type Box = { x: number; y: number; width: number; height: number };

function doOverlap(a: Box, b: Box): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

async function readBoxes(page: Page): Promise<{ button: Box; link: Box }> {
  const button = page.locator("#header-theme-toggle");
  const link = page.locator("#header-author-name");
  await expect(button).toHaveCount(1);
  await expect(link).toHaveCount(1);
  const buttonBox = await button.boundingBox();
  const linkBox = await link.boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(linkBox).not.toBeNull();
  return { button: buttonBox!, link: linkBox! };
}

async function linkOpacity(page: Page): Promise<string> {
  return page
    .locator("#header-author-name")
    .evaluate((el) => getComputedStyle(el).opacity);
}

async function linkPointerEvents(page: Page): Promise<string> {
  return page
    .locator("#header-author-name")
    .evaluate((el) => getComputedStyle(el).pointerEvents);
}

test.describe("SiteHeader - home reveal behavior (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
  });

  test("author link is hidden at the top of the home page", async ({ page }) => {
    const opacity = await linkOpacity(page);
    expect(Number(opacity)).toBeLessThan(0.05);
    expect(await linkPointerEvents(page)).toBe("none");
  });

  test("theme button fills the link's place when the link is hidden", async ({
    page,
  }) => {
    // Both button and (hidden) link are anchored to the wrap's right edge, so
    // the button alone occupies the space the link would take: no leftover gap.
    const { button, link } = await readBoxes(page);
    expect(Math.abs(button.x + button.width - (link.x + link.width))).toBeLessThan(3);
  });

  test("author link appears after scrolling down", async ({ page }) => {
    await scrollToReveal(page);
    await page.waitForTimeout(800);

    expect(Number(await linkOpacity(page))).toBeGreaterThan(0.95);
    expect(await linkPointerEvents(page)).toBe("auto");
  });

  test("theme button shifts left on scroll to make room for the link", async ({
    page,
  }) => {
    const atTop = await readBoxes(page);

    await scrollToReveal(page);
    await page.waitForTimeout(800);

    const afterScroll = await readBoxes(page);

    // Button moved left (smaller x) to free space for the link
    expect(afterScroll.button.x).toBeLessThan(atTop.button.x);
    // Link is to the right of the button with a visible gap
    expect(afterScroll.button.x + afterScroll.button.width).toBeLessThanOrEqual(
      afterScroll.link.x,
    );
    const gap = afterScroll.link.x - (afterScroll.button.x + afterScroll.button.width);
    expect(gap).toBeGreaterThanOrEqual(8);
    // Button is exactly adjacent ([button][link]): its right edge + the flex gap
    // lands precisely on the link's left edge.
    const gapPx = await page
      .locator("#header-theme-wrap")
      .evaluate((el) => parseFloat(getComputedStyle(el).gap) || 16);
    expect(
      Math.abs(afterScroll.button.x + afterScroll.button.width + gapPx - afterScroll.link.x),
    ).toBeLessThan(3);
  });

  test("no overlap after the reveal animation completes", async ({ page }) => {
    await scrollToReveal(page);
    await page.waitForTimeout(800);

    const { button, link } = await readBoxes(page);
    expect(doOverlap(button, link)).toBe(false);
    expect(link.x - (button.x + button.width)).toBeGreaterThanOrEqual(8);
  });

  test("no overlap after repeated scroll round-trips (regression for the intermittent bug)", async ({
    page,
  }) => {
    for (let i = 0; i < 3; i++) {
      await scrollToReveal(page);
      await page.waitForTimeout(700);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    }
    await scrollToReveal(page);
    await page.waitForTimeout(800);

    const { button, link } = await readBoxes(page);
    expect(doOverlap(button, link)).toBe(false);
    expect(link.x - (button.x + button.width)).toBeGreaterThanOrEqual(8);
  });

  test("wrapper keeps flex layout so elements stay vertically aligned", async ({
    page,
  }) => {
    const wrap = page.locator("#header-theme-wrap");
    expect(await wrap.evaluate((el) => getComputedStyle(el).display)).toBe(
      "flex",
    );
    expect(
      await wrap.evaluate((el) => getComputedStyle(el).alignItems),
    ).toBe("center");
  });
});

test.describe("SiteHeader - non-home pages", () => {
  test("author link is visible immediately and never overlaps the theme button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((els) =>
        [...new Set(els.map((el) => el.getAttribute("href")!))].filter(
          (h) => h !== "/",
        ),
      );
    expect(hrefs.length).toBeGreaterThan(0); // no content → cannot test, fail loudly

    await page.setViewportSize(DESKTOP);
    await page.goto(hrefs[0]);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Always visible: full opacity and clickable, even before any scroll
    expect(Number(await linkOpacity(page))).toBeGreaterThan(0.95);
    expect(await linkPointerEvents(page)).toBe("auto");

    const { button, link } = await readBoxes(page);
    expect(doOverlap(button, link)).toBe(false);
    expect(link.x - (button.x + button.width)).toBeGreaterThanOrEqual(8);
  });
});

test.describe("SiteHeader - mobile", () => {
  test("author link is hidden on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);

    await expect(page.locator("#header-author-name")).not.toBeVisible();
    await expect(page.locator("#site-header")).toBeAttached();
  });
});