import type { APIRoute } from 'astro';
import { iconPng } from '@/lib/icons';

export const GET: APIRoute = () =>
    new Response(iconPng(180, 0.08) as BodyInit, { headers: { 'Content-Type': 'image/png' } });
