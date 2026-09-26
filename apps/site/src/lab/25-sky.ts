import { showcase } from './_shared/showcase';
import { daylight, goldenHour, sunsetPills } from './_widgets/time';

await showcase(
    {
        title: 'Sky',
        subtitle:
            'Gradient pills with a glowing sun and twinkling stars, a golden-hour curve with an along-the-path gradient and a soft glow copy, a daylight bar.',
        cols: 1,
        maxScale: 2,
    },
    () => [sunsetPills(), goldenHour(), daylight()],
);
