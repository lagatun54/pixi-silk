import type { ImageMetadata } from 'astro';
import sheet1 from '@/assets/showcase/sheet-1.jpg';
import sheet2 from '@/assets/showcase/sheet-2.jpg';
import sheet3 from '@/assets/showcase/sheet-3.jpg';
import sheet4 from '@/assets/showcase/sheet-4.jpg';
import sheet5 from '@/assets/showcase/sheet-5.jpg';

export interface Sheet {
    n: number;
    title: string;
    slug: string;
    body: string;
    image: ImageMetadata;
    alt: string;
}

/** The five reference sheets: reference on the left, pixi-silk render on the right. */
export const SHEETS: Sheet[] = [
    {
        n: 1,
        title: 'Health cards',
        slug: '30-sheet-health',
        image: sheet1,
        body: 'Ten Health cards: area charts with dots and a dashed forecast, bars, candles, ranges and signal bars.',
    },
    {
        n: 2,
        title: 'Watch complications',
        slug: '31-sheet-complications',
        image: sheet2,
        body: 'Twenty complications: heart-rate zones, network, calendar, golden hour, clock with stadium ticks, mood, sleep, Tesla.',
    },
    {
        n: 3,
        title: 'Fitness & home',
        slug: '32-sheet-fitness',
        image: sheet3,
        body: 'Calendar week, hike map, sound levels, motion detection, elevation, water, run pace, boarding pass and wind.',
    },
    {
        n: 4,
        title: 'Live Activities',
        slug: '33-sheet-live-activities',
        image: sheet4,
        body: 'Black cards with continuous corners and measured soft shadows on a light sheet: flight, delivery, ISS flyover, cadence, race.',
    },
    {
        n: 5,
        title: 'Watch widgets',
        slug: '34-sheet-watch',
        image: sheet5,
        body: 'Cycling, 2FA codes, now playing, crosshair, garage door, AirPods compass, barometer and moon phases.',
    },
].map((s) => ({
    ...s,
    alt: `${s.title} reference design next to its smooth, anti-aliased pixi-silk rebuild in PixiJS v8`,
}));
