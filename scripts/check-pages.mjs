#!/usr/bin/env node
/**
 * Loads every page listed in the site's sitemap (from a running dev or preview server), scrolls
 * through it so lazy demos mount, and reports console errors (WebGL errors included) and uncaught
 * exceptions.
 *
 * usage: node scripts/check-pages.mjs [origin=http://127.0.0.1:5178] [width=1280] [height=800] [--webkit]
 *
 * Chromium runs the installed Google Chrome (CHROME_PATH overrides). `--webkit` runs Playwright's
 * WebKit, the engine behind Safari: the build Playwright expects, else the newest one in its cache
 * (`npx playwright install webkit` installs it). WEBKIT_PATH overrides.
 */
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium, webkit } from 'playwright-core';

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const [origin = 'http://127.0.0.1:5178', w = '1280', h = '800'] = process.argv
    .slice(2)
    .filter((a) => !a.startsWith('--'));
const useWebkit = flags.includes('--webkit');

function webkitPath() {
    if (process.env.WEBKIT_PATH) return process.env.WEBKIT_PATH;
    if (existsSync(webkit.executablePath())) return undefined;
    const cache = join(
        homedir(),
        process.platform === 'darwin' ? 'Library/Caches/ms-playwright' : '.cache/ms-playwright',
    );
    const builds = existsSync(cache) ? readdirSync(cache).filter((d) => /^webkit-\d+$/.test(d)) : [];
    const newest = builds.sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))[0];

    if (!newest) throw new Error('No WebKit build found. Run `npx playwright install webkit` first.');

    return join(cache, newest, process.platform === 'darwin' ? 'pw_run.sh' : 'minibrowser-gtk/pw_run.sh');
}

const xml = await (await fetch(`${origin}/sitemap.xml`)).text();
const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const browser = useWebkit
    ? await webkit.launch({ executablePath: webkitPath() })
    : await chromium.launch({
          executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          headless: true,
          args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'],
      });
let failed = 0;

console.log(`${useWebkit ? 'WebKit' : 'Chromium'} ${browser.version()}, ${paths.length} pages`);
for (const path of paths) {
    const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
    const errors = [];

    page.on('console', (m) => {
        if (m.type() === 'error' && !/favicon|404 \(Not Found\)/.test(m.text())) errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${origin}${path}`);
    await page.waitForTimeout(800);
    // walk down the page so every lazily mounted demo gets created (and destroyed again)
    const height = await page.evaluate(() => document.documentElement.scrollHeight);

    for (let y = 0; y < height; y += Number(h) * 0.8) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(250);
    }
    const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length);

    console.log(
        `${errors.length ? 'FAIL' : 'ok  '} ${path} (${canvases} canvas)${errors.length ? `\n     ${errors.join('\n     ')}` : ''}`,
    );
    if (errors.length) failed++;
    await page.close();
}
await browser.close();
console.log(`${paths.length - failed}/${paths.length} pages clean`);
process.exit(failed ? 1 : 0);
