#!/usr/bin/env node
/**
 * Tells IndexNow-enabled search engines (Bing, which also feeds ChatGPT search and Copilot, Yandex,
 * Seznam, Naver) that pages changed. Run after a deploy:
 *
 *   pnpm --filter @pixi-silk/site indexnow             # every URL in the live sitemap
 *   pnpm --filter @pixi-silk/site indexnow /docs/shapes/ /faq/
 */
import { INDEXNOW_KEY } from '../src/lib/indexnow-key.mjs';
import { SITE_URL } from '../src/lib/site-url.mjs';

const host = new URL(SITE_URL).host;
const args = process.argv.slice(2);
let urls;

if (args.length) urls = args.map((p) => new URL(p, SITE_URL).toString());
else {
    const sitemap = await (await fetch(`${SITE_URL}/sitemap.xml`)).text();

    urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000),
    }),
});

console.log(`indexnow: ${urls.length} URLs submitted, HTTP ${res.status} ${res.statusText}`);
if (res.status >= 400) process.exit(1);
