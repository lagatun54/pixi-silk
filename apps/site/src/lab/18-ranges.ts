import { showcase } from './_shared/showcase';
import { fatPlain, fatRange, fatSignal, heartRange } from './_widgets/health';

await showcase(
    {
        title: 'Ranges & levels',
        subtitle:
            'Progress with markers, a range segment inside a track, signal bars. Hairline markers stay exactly 1 CSS px on every DPR.',
        cols: 2,
        maxScale: 2,
    },
    () => [fatRange(), heartRange(), fatSignal(), fatPlain()],
);
