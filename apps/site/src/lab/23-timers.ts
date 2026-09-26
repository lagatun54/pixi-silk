import { showcase } from './_shared/showcase';
import { cadence, espresso } from './_widgets/time';

await showcase(
    {
        title: 'Timers',
        subtitle:
            'Espresso ticks share one local gradient, and the newest ticks get an analytic motion blur. The cadence bars animate every frame. Each widget is one draw call.',
        cols: 2,
        maxScale: 2,
    },
    () => [espresso(), cadence()],
);
