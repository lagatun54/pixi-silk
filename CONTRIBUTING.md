# Contributing to pixi-silk

Thanks for helping! The repo is a pnpm workspace:

| path | what |
|---|---|
| `packages/pixi-silk` | the library (published to npm): TypeScript built by tsdown into ESM, one file per module |
| `apps/site` | docs site: Astro + React islands, MDX guides with live demos, TypeDoc API pages, lab |
| `scripts` | release helpers and the screenshot / measurement tools |

## Setup

```bash
pnpm install
pnpm site:dev          # docs + lab at http://localhost:5178
pnpm --filter pixi-silk test
```

## Before you open a PR

```bash
pnpm lint && pnpm typecheck && pnpm --filter pixi-silk test && pnpm site:build
```

- [Biome](https://biomejs.dev) does all linting and formatting (config in `biome.json`). `pnpm lint` checks lint
  rules, formatting and import order. `pnpm lint:fix` applies the safe fixes and formats. A pre-commit hook checks
  the staged files and CI runs `biome ci`. Biome lints `.astro` files but does not format their templates.
  Install the Biome editor extension (recommended in `.vscode/extensions.json`) to format on save.
- Text follows the writing style below. `pnpm lint:prose` checks it.
- The library build (`pnpm build`, tsdown) also runs publint and Are the Types Wrong, and `pnpm size` bundles
  typical imports of it to check what an app pays and that unused modules tree-shake away.
- Rendering changes: check Safari too. `node scripts/check-pages.mjs http://127.0.0.1:5178 1280 800 --webkit`
  loads every page in WebKit and reports WebGL and console errors.
- Library changes need a changeset: `pnpm changeset` (patch = fix, minor = feature, major = breaking).
- Commit messages follow Conventional Commits, for example `feat(gradient): add stop easing` or
  `fix(shader): clamp coverage`. commitlint checks them.
- Public API changes: update the JSDoc (the API reference is generated from it) and the matching guide in
  `apps/site/src/content/docs`. Every public export needs JSDoc, or the docs build fails.
- Code samples in the docs are type-checked against the library source by `pnpm typecheck`. Mark a
  deliberate sketch with ` ```ts nocheck `.
- New visual behaviour: add or extend a demo in `apps/site/src/demos` so the docs show it live.

## Writing style

Docs, FAQ answers, UI text, JSDoc and changesets use plain, short English.

- Short sentences with one idea each. Aim for 8 to 20 words. `lint:prose` fails at 33.
- Lead with the fact or the answer, then the reason. Use "you" and the active voice.
- No hype or filler: seamless, robust, powerful, simply, just, easily, very, of course. <!-- prose-ignore -->
- ASCII punctuation only. No em or en dashes, ellipsis characters, middle dots, bullets, curly quotes,
  arrows or the multiplication sign. Write a period, a comma, "to" or `1200x900` instead.
- No semicolons in docs prose, and at most one colon per sentence.
- Bold only the one term a reader scans for. Keep numbers, API names and code exact.

`scripts/check-prose.mjs` enforces the mechanical rules. The lab's reference-sheet widgets
(`apps/site/src/lab/_sheets`, `_widgets`) reproduce design text as it is and are not checked.
Add `prose-ignore` to a line that must keep a symbol.

## Releasing

Releases run from `.github/workflows/npm-publish.yml` with changesets and npm trusted publishing. The
job stays off until the repository variable `NPM_RELEASE` is `true`. To turn it on:

1. Publish the first version by hand: `pnpm build`, then `npm publish --access public` in `packages/pixi-silk`.
2. On npmjs.com, add a trusted publisher for the package: GitHub Actions, `schmooky/pixi-silk`, workflow
   `npm-publish.yml`, environment `npm-publish`.
3. Set the repository variable `NPM_RELEASE` to `true`.

After that, merged changesets open a "Version Packages" PR, and merging it publishes to npm.

## Deploying the docs site

The site is static and served at https://pixi-silk.schmooky.dev from Timeweb Cloud App Platform,
built from the root `Dockerfile` (static Astro build served by nginx, config in `deploy/nginx.conf`):

1. In App Platform, create an app from the GitHub repository, branch `main`, with auto-deploy on.
2. Framework: **Dockerfile** (repository root). The container listens on port **8080**. The health
   check path is `/healthz`. No environment variables are needed.
3. Attach the domain `pixi-silk.schmooky.dev` (DNS record to the app, as shown in the panel) and
   enable the free SSL certificate.

Build settings are Docker build arguments with defaults in the `Dockerfile`:

- `SITE_URL`: the production origin.
- `GOOGLE_SITE_VERIFICATION`, `YANDEX_VERIFICATION`, `BING_SITE_VERIFICATION`: search console
  ownership meta tags.
- `NODE_IMAGE`, `NGINX_IMAGE`: the base images.

App Platform environment variables reach only the running container, not the build. So change a
default in the `Dockerfile` itself. Verification codes are public anyway, since every page's `<head>`
shows them. If the builder cannot pull from Docker Hub, switch the base images to Timeweb's mirror:
`dockerhub.timeweb.cloud/library/node:24-slim` and `dockerhub.timeweb.cloud/library/nginx:1.27-alpine`.

The nginx config serves precompressed `.gz` files and caches hashed assets for a year. It redirects
`/docs/x` and `/docs/x/index.html` to `/docs/x/`, so each page has one URL. It serves `llms.txt` and
the `/docs/<page>.md` Markdown twins as text, and answers `/healthz`. For Apache hosting, use
`apps/site/public/.htaccess` instead.

Try the production image locally:

```bash
docker build -t pixi-silk-site . && docker run --rm -p 8080:8080 pixi-silk-site
```

### After a deploy

- Verify ownership in Google Search Console, Yandex Webmaster and Bing Webmaster Tools. A DNS TXT
  record needs no deploy. The meta tag build arguments above work too, and so does a verification
  file in `apps/site/public/`. Bing can import the site from Google Search Console. Then submit
  `https://pixi-silk.schmooky.dev/sitemap.xml` in each.
- Submit changed URLs to IndexNow (Bing, Yandex, Seznam, Naver). `pnpm --filter @pixi-silk/site indexnow`
  sends the whole sitemap. To send some pages, pass their paths:
  `pnpm --filter @pixi-silk/site indexnow /docs/shapes/`.

### SEO checks

`pnpm --filter @pixi-silk/site check:seo` audits the built site. It checks for one `<h1>` per page,
title and description length and uniqueness, canonical URLs and Open Graph images. It also checks
JSON-LD, image alt text and sizes, internal links, and sitemap and `llms.txt` coverage. CI runs it on
every PR.
