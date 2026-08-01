/* screenshot.js — captures full-page screenshots of the Mowi homepage at
   1440px and 390px wide, for visually comparing proportions against the
   vuewer.com reference. Dev-only tool, not part of the shipped site.

   Requires the local server running first (see start-local-server.bat or
   `node serve.js`).

   Usage:
     node screenshot.js                 -> saves into ./screenshots/
     node screenshot.js <outputDir>      -> saves into a custom folder
     node screenshot.js <outputDir> <url> -> screenshot a different URL
       (e.g. to capture a reference site for comparison) */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const url = process.argv[3] || "http://localhost:8765/index.html";
const outDir = process.argv[2] || path.join(__dirname, "screenshots");
const widths = [1440, 390];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();

  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url, { waitUntil: "networkidle" });

    // The site reveals sections/cards via IntersectionObserver as they
    // scroll into view. A fullPage screenshot doesn't actually scroll the
    // real viewport, so anything below the fold would never trigger and
    // stay invisible. Walk the page in overlapping steps first so every
    // section genuinely passes through the viewport at least once.
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const step = Math.floor(900 * 0.8);
    for (let y = 0; y < scrollHeight; y += step) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(150);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const file = path.join(outDir, `homepage-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`Saved ${file}`);
    await page.close();
  }

  await browser.close();
})();
