import type { APIRoute } from 'astro';
import { icoFromPngs, iconPng } from '@/lib/icons';

export const GET: APIRoute = () => {
    const ico = icoFromPngs([16, 32, 48].map((size) => ({ size, data: iconPng(size) })));

    return new Response(ico as BodyInit, { headers: { 'Content-Type': 'image/x-icon' } });
};
