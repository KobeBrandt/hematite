// Runs axe-core on every HTML page, in both themes, and fails on any violation.
//
//   python3 -m http.server 8765 &        (from the repository root)
//   npm install --no-save playwright axe-core
//   node tools/check-a11y.mjs [base-url]
//
// Automated checks catch about a third of WCAG problems. Keyboard, zoom and
// screen-reader passes are still done by hand (see docs/accessibility.html).
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(join(process.cwd(), 'package.json'));
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const base = (process.argv[2] || 'http://localhost:8765').replace(/\/$/, '');
const pages = ['index.html'];
for (const dir of ['docs', 'templates']) {
  for (const f of readdirSync(dir)) if (f.endsWith('.html')) pages.push(`${dir}/${f}`);
}

const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await chromium.launch(launch);
let failures = 0;

for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ colorScheme: theme });
  for (const path of pages) {
    await page.goto(`${base}/${path}`, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: axeSource });
    const { violations } = await page.evaluate(() =>
      window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
    for (const v of violations) {
      failures++;
      console.log(`fail  ${theme.padEnd(5)} ${path}  ${v.id}: ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`        ${n.target.join(' ')}`);
    }
  }
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} violation(s)` : `all ${pages.length} pages pass in both themes`);
process.exit(failures ? 1 : 0);
