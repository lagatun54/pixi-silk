import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE } from '@/lib/site';
import { type OgTarget, renderOg } from '@/og/render';
import { ogTargets } from '@/og/targets';

export const getStaticPaths: GetStaticPaths = async () =>
    (await ogTargets()).map((target) => ({ params: { path: target.id }, props: { target } }));

export const GET: APIRoute = async ({ props }) => {
    const png = await renderOg(props.target as OgTarget, new URL(SITE.url).host);

    return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
};
