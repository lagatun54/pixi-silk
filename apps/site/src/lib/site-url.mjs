/**
 * Public origin of the docs site (production: https://pixi-silk.schmooky.dev). Canonical URLs,
 * the sitemap, robots.txt, Open Graph cards and llms.txt all derive from it. `SITE_URL` overrides it
 * for preview deployments.
 */
export const SITE_URL = (process.env.SITE_URL || 'https://pixi-silk.schmooky.dev').replace(/\/$/, '');
