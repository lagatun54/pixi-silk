import { SITE_URL } from './site-url.mjs';

/** Identity of the project, used by SEO tags, JSON-LD, Open Graph cards, the web manifest and llms.txt. */
export const SITE = {
    name: 'pixi-silk',
    url: SITE_URL,
    tagline: 'Smooth, anti-aliased graphics for PixiJS v8',
    description:
        'pixi-silk draws PixiJS v8 shapes as exact signed distance fields. Smooth, anti-aliased edges at any zoom and DPR, ' +
        'with squircles, gradients and glows. No MSAA.',
    /** Topics the site should rank and be cited for. */
    keywords: [
        'smooth graphics',
        'anti-aliasing',
        'antialiasing',
        'PixiJS',
        'PixiJS v8',
        'pixi.js Graphics',
        'WebGL anti-aliasing',
        'signed distance field',
        'SDF rendering',
        'analytic anti-aliasing',
        'smooth lines',
        'squircle',
        'vector graphics',
        'gradient banding',
        'OKLab gradients',
        'retina canvas',
        'MSAA alternative',
        'graphics-smooth v8',
    ],
    author: 'pixi-silk contributors',
    githubRepo: 'https://github.com/schmooky/pixi-silk',
    npm: 'https://www.npmjs.com/package/pixi-silk',
    locale: 'en_US',
    language: 'en',
    defaultImage: '/og/default.png',
    /** First publication of the site (datePublished of the docs). */
    published: '2026-09-26',
} as const;

/**
 * Search engine ownership verification, set at build time (see CONTRIBUTING.md):
 * GOOGLE_SITE_VERIFICATION, YANDEX_VERIFICATION, BING_SITE_VERIFICATION.
 */
export const VERIFICATION = {
    google: import.meta.env.GOOGLE_SITE_VERIFICATION as string | undefined,
    yandex: import.meta.env.YANDEX_VERIFICATION as string | undefined,
    bing: import.meta.env.BING_SITE_VERIFICATION as string | undefined,
};
