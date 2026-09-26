import { showcase } from './_shared/showcase';
import { budget, glucose, heartZones, stocks, weatherWeek } from './_widgets/charts';

await showcase(
    {
        title: 'Sparklines',
        subtitle:
            'Strokes coloured by value (a vertical gradient in local units), hollow markers with gradient outlines, hard gradient stops at a threshold, and a hover crosshair on the stocks card.',
        cols: 2,
        maxScale: 1.7,
    },
    () => [heartZones(), weatherWeek(), glucose(), budget(), stocks()],
);
