import { showcase } from './_shared/showcase';
import { fatArea, fatBars, fatPlain, fatRange, fatSignal, fatSteps, heartPills, heartRange } from './_widgets/health';

await showcase(
    {
        title: 'Health cards',
        subtitle: 'The whole reference sheet rebuilt with SilkGraphics: ten cards, every edge analytic.',
        cols: 2,
        maxScale: 1.4,
        gap: 14,
    },
    () => [
        fatArea(),
        fatArea({ empty: true }),
        fatBars(),
        fatSteps(),
        heartPills(),
        heartPills({ empty: true }),
        fatRange(),
        heartRange(),
        fatSignal(),
        fatPlain(),
    ],
);
