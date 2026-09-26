import { showcase } from './_shared/showcase';
import { fatBars, fatSteps } from './_widgets/health';

await showcase(
    {
        title: 'Bar charts',
        subtitle:
            '34 slim bars in one draw call, with the future dimmed. Chunky stepped bars grow in with damped motion.',
        cols: 1,
        maxScale: 2.2,
    },
    () => [fatBars(), fatSteps()],
);
