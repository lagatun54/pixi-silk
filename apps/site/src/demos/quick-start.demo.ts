import { conic, SilkGraphics, vertical } from 'pixi-silk';
import { defineDemo } from './runtime';

const GAUGE = conic([0x30d158, 0xffd60a, 0xff453a]);
const FILL = vertical(
    [
        [0, 0xff9f0a, 0.8],
        [1, 0xff9f0a, 0],
    ],
    { easing: 'smooth' },
);

export default defineDemo({
    size: [360, 160],
    controls: {
        progress: { type: 'range', label: 'progress', min: 0, max: 1, step: 0.01, value: 0.72 },
    },
    setup({ stage, params, tick }) {
        const g = new SilkGraphics();

        stage.addChild(g);
        tick((t) => {
            const wave = [120, 100, 170, 80, 220, 92, 270, 60, 320, 70].map((v, i) =>
                i % 2 ? v + Math.sin(t + i) * 6 : v,
            );

            g.clear();
            g.roundRect(10, 10, 340, 140, 22, 0.6).fill(0x1c1c1e); // squircle card
            g.arcSweep(80, 80, 44, -Math.PI / 2, Math.PI * 2).stroke({ width: 12, color: 0x2c2c2e });
            g.arcSweep(80, 80, 44, -Math.PI / 2, Math.PI * 2 * params.progress).stroke({
                width: 12,
                cap: 'round',
                gradient: GAUGE,
            }); // gauge follows the arc
            g.area(wave, 130, { smooth: 'monotone' })
                .fill(FILL) // chart fill ...
                .stroke({ width: 2, color: 0xff9f0a, cap: 'round' }); // ... and its top line
        });
    },
});
