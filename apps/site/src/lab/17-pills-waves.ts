import { showcase } from './_shared/showcase';
import { heartPills, pressureWave } from './_widgets/health';

await showcase(
    {
        title: 'Pills & waveforms',
        subtitle:
            'Pill bars are rounded rects with radius = width / 2. The pressure wave shares one local-space gradient across every bar and animates at display rate.',
        cols: 2,
        maxScale: 2,
    },
    () => [heartPills(), heartPills({ empty: true }), pressureWave()],
);
