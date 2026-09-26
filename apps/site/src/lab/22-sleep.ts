import { showcase } from './_shared/showcase';
import { sleepNight, sleepStages } from './_widgets/time';

await showcase(
    {
        title: 'Sleep',
        subtitle:
            'Stage blocks on four levels with hairline transitions, a segmented night strip and a marching dotted arc.',
        cols: 1,
        maxScale: 2.2,
    },
    () => [sleepStages(), sleepNight()],
);
