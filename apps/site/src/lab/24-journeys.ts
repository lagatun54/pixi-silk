import { showcase } from './_shared/showcase';
import { delivery, flight, pickup, raceTrack, train } from './_widgets/travel';

await showcase(
    {
        title: 'Journeys',
        subtitle:
            'Progress pills with gradients, glyphs built from triangles inside a transform, a Catmull-Rom race track as one closed stroke, and a route with a van moving by arc length.',
        cols: 2,
        maxScale: 1.8,
    },
    () => [flight(), train(), delivery(), pickup(), raceTrack()],
);
