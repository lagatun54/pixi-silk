import type { APIRoute, GetStaticPaths } from 'astro';
import { iconPng } from '@/lib/icons';

export const getStaticPaths: GetStaticPaths = () => [
    { params: { size: '192' } },
    { params: { size: '512' } },
    { params: { size: 'maskable-512' } },
];

export const GET: APIRoute = ({ params }) => {
    const maskable = params.size!.startsWith('maskable');
    const png = iconPng(maskable ? 512 : Number(params.size), maskable ? 0.14 : 0);

    return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
};
