import { showcase } from './_shared/showcase';
import { fatArea } from './_widgets/health';

await showcase(
    {
        title: 'Area chart',
        subtitle:
            'Monotone-smoothed series, OKLab gradient fill with a smooth (spline) ramp, dotted guides, dashed forecast, sub-pixel dots. Data eases between updates.',
        cols: 1,
        maxScale: 2.2,
    },
    () => [fatArea(), fatArea({ empty: true })],
);
