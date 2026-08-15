import { test, expect } from "@playwright/test";

// 1x1 red PNG
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const CDN_PATTERN = /^https:\/\/cdn[\w-]*\.elcokiin\.me\//;
const CHECK_POINTS = "20 6 9 17 4 12";

test.use({
  viewport: { width: 1280, height: 900 },
  isMobile: false,
  hasTouch: false,
});

test.describe("Cover image copy/download (CORS regression)", () => {
  let directCdnRequests: string[];

  test.beforeEach(async ({ context }) => {
    directCdnRequests = [];
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:4321",
    });
    await context.route(CDN_PATTERN, async (route) => {
      directCdnRequests.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        // Deliberately NO Access-Control-Allow-Origin: the real CDN behaves this way.
        headers: {},
        body: TINY_PNG,
      });
    });
  });

  async function gotoPostWithCover(page: import("@playwright/test").Page) {
    await page.goto("/");
    const links = await page
      .locator('a[href^="/posts/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
    const unique = [...new Set(links)];

    for (const href of unique.slice(0, 8)) {
      await page.goto(href);
      const cover = page.locator(".post-cover[data-cover-url]");
      if ((await cover.count()) === 1) {
        return cover;
      }
    }
    throw new Error("No published post with a cover image found in Convex");
  }

  test("download uses the same-origin proxy and never hits the CDN directly", async ({
    page,
  }) => {
    const cover = await gotoPostWithCover(page);
    const download = page.locator("[data-download]");

    await cover.hover();
    await expect(download).toBeVisible();
    directCdnRequests.length = 0;
    await download.click();

    await expect(download.locator("svg polyline")).toHaveAttribute(
      "points",
      CHECK_POINTS,
    );
    expect(directCdnRequests).toHaveLength(0);
  });

  test("copy image uses the same-origin proxy and never hits the CDN directly", async ({
    page,
  }) => {
    const cover = await gotoPostWithCover(page);
    const copy = page.locator("[data-copy-image]");

    await cover.hover();
    await expect(copy).toBeVisible();
    directCdnRequests.length = 0;
    await copy.click();

    await expect(copy.locator("svg polyline")).toHaveAttribute(
      "points",
      CHECK_POINTS,
    );
    expect(directCdnRequests).toHaveLength(0);
  });
});