import type { APIRoute } from 'astro';
import { SITE } from '@/lib/site';

export const GET: APIRoute = () =>
    new Response(
        JSON.stringify(
            {
                name: `${SITE.name}: ${SITE.tagline}`,
                short_name: SITE.name,
                description: SITE.description,
                start_url: '/',
                scope: '/',
                display: 'standalone',
                background_color: '#09090b',
                theme_color: '#09090b',
                lang: SITE.language,
                categories: ['developer', 'education', 'graphics'],
                icons: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            null,
            2,
        ),
        { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
    );
