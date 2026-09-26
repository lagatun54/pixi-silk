// Renders a lab page headlessly (with ?still=1&bare=1) and saves a PNG. Needs `pnpm site:dev` running.
// usage: node scripts/snap.mjs <path-or-url> <out.png> [width] [height] [dpr] [extra query]
//   e.g. node scripts/snap.mjs lab/34-sheet-watch/ .shots/s5.png 1200 900 1
import { chromium } from 'playwright-core';

const [target, out, w = '1200', h = '900', dpr = '1', extra = ''] = process.argv.slice(2);
const base = target.startsWith('http') ? target : `http://127.0.0.1:5178/${target.replace(/^\//, '')}`;
const url = `${base}${base.includes('?') ? '&' : '?'}still=1&bare=1${extra ? `&${extra}` : ''}`;
const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({
    viewport: { width: Number(w), height: Number(h) },
    deviceScaleFactor: Number(dpr),
});
const logs = [];

page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`);
});
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(url);
try {
    await page.waitForFunction(() => window.__silkReady === true, null, { timeout: 30000 });
} catch {
    logs.push('timeout waiting for __silkReady');
}
await page.screenshot({ path: out });
await browser.close();
if (logs.length) console.log(logs.join('\n'));
console.log(`saved ${out}`);
