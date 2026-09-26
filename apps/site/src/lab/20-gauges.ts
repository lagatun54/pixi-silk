import { showcase } from './_shared/showcase';
import { barometer, carBattery, heading, issFlyover, lampDimmer, uvWeek } from './_widgets/gauges';

await showcase(
    {
        title: 'Gauges',
        subtitle:
            'Arcs, sectors and dashed arcs as tick marks. The ISS view cone is a sector with a radial gradient in local units. The ticks are one dashed stroke. The station flies along the arc in a rotated frame.',
        cols: 2,
        maxScale: 1.7,
    },
    () => [issFlyover(), carBattery(), heading(), barometer(), uvWeek(), lampDimmer()],
);
