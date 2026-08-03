const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto("http://localhost:4322", { waitUntil: "networkidle" });
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);

  const state = async (label) => {
    const info = await footer.evaluate(() => ({
      theme: document.documentElement.getAttribute("data-theme"),
      canvases: [...document.querySelectorAll("footer canvas")].map((c) => ({
        display: getComputedStyle(c).display,
        w: c.width,
        h: c.height,
      })),
      socials: document.querySelectorAll("footer a[title]").length,
    }));
    console.log(`[${label}]`, JSON.stringify(info));
  };

  await state("dark");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.waitForTimeout(1200);
  await state("light");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(1200);
  await state("dark again");

  console.log("JS errors:", errors.length ? errors : "none");
  await browser.close();
})();
