const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:4321';
const POST_SLUG = 'readme';

function luminance(r, g, b) {
  const [rs, gs, bs] = [r/255, g/255, b/255].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const r1 = parseInt(hex1.slice(1,3), 16);
  const g1 = parseInt(hex1.slice(3,5), 16);
  const b1 = parseInt(hex1.slice(5,7), 16);
  const r2 = parseInt(hex2.slice(1,3), 16);
  const g2 = parseInt(hex2.slice(3,5), 16);
  const b2 = parseInt(hex2.slice(5,7), 16);
  const l1 = luminance(r1, g1, b1);
  const l2 = luminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(rgb) {
  const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!m) return rgb;
  const r = parseInt(m[1]).toString(16).padStart(2, '0');
  const g = parseInt(m[2]).toString(16).padStart(2, '0');
  const b = parseInt(m[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const mode of ['dark', 'light']) {
    console.log(`\n========== ${mode.toUpperCase()} MODE ==========`);
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/posts/${POST_SLUG}/`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    if (mode === 'light') {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.waitForTimeout(500);
    }

    const checks = await page.evaluate(() => {
      const results = [];
      // Get body bg
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      
      // Check article title h1
      const h1 = document.querySelector('.post-article > h1');
      if (h1) results.push({ element: 'article h1', color: getComputedStyle(h1).color, bg: bodyBg });

      // Check all text elements in content
      const contentDiv = document.querySelector('[set\\:html]') || document.querySelector('div.prose > div > div:last-child');
      if (contentDiv) {
        const textEls = contentDiv.querySelectorAll('p, li, h2, h3, h4, blockquote, a, strong, code');
        textEls.forEach(el => {
          const tag = el.tagName.toLowerCase();
          const text = (el.textContent || '').trim().substring(0, 40);
          const computed = getComputedStyle(el);
          results.push({
            element: `${tag}: "${text}..."`,
            color: computed.color,
            bg: computed.backgroundColor
          });
        });
      }

      // Check meta text
      const meta = document.querySelector('.post-card-meta');
      if (meta) results.push({ element: 'post meta', color: getComputedStyle(meta).color, bg: bodyBg });

      return results;
    });

    // Check each element's contrast
    const bodyBgHex = checks.length > 0 ? rgbToHex(checks[0].bg) : '#000000';
    console.log(`Body background: ${bodyBgHex}`);

    for (const check of checks) {
      const colorHex = rgbToHex(check.color);
      const bgHex = check.bg !== 'rgba(0, 0, 0, 0)' ? rgbToHex(check.bg) : bodyBgHex;
      const ratio = contrastRatio(colorHex, bgHex);
      const passAA = ratio >= 4.5;
      const passAAA = ratio >= 7;
      const status = passAAA ? '✅ AAA' : passAA ? '✅ AA' : '❌ FAIL';
      if (!passAA || check.element.includes('meta')) {
        console.log(`${status} ${ratio.toFixed(1)}:1 | ${check.element}`);
        console.log(`  color: ${colorHex} on bg: ${bgHex}`);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nDone - FAIL entries need contrast improvement');
})();
