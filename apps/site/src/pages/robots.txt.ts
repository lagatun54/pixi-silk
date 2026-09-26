import type { APIRoute } from 'astro';
import { SITE } from '@/lib/site';

/*
 * Everything is public. AI search and answer engines are listed explicitly because this project
 * wants to be found and cited. Yandex also gets Clean-param for the lab's view-only query parameters.
 */
const AI_AGENTS = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot',
    'Applebot-Extended',
    'Bingbot',
    'DuckDuckBot',
    'DuckAssistBot',
    'Amazonbot',
    'Meta-ExternalAgent',
    'MistralAI-User',
    'CCBot',
    'YandexAdditional',
    'YandexAdditionalBot',
];

export const GET: APIRoute = () => {
    const body = [
        'User-agent: *',
        'Allow: /',
        '',
        ...AI_AGENTS.flatMap((agent) => [`User-agent: ${agent}`, 'Allow: /', '']),
        'User-agent: Yandex',
        'Allow: /',
        'Clean-param: still&bare&t&compare&loupe&w /lab/',
        '',
        `Sitemap: ${SITE.url}/sitemap.xml`,
        '',
    ].join('\n');

    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
