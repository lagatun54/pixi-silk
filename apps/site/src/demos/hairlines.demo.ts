import { SilkGraphics } from 'pixi-silk';
import { defineDemo } from './runtime';

// Lines thinner than a device pixel keep one pixel of width and fade instead of breaking up.
export default defineDemo({
    size: [480, 220],
    controls: {
        scale: { type: 'range', label: 'width scale', min: 0.05, max: 2, step: 0.01, value: 0.5 },
    },
    setup({ stage, params, tick }) {
        const g = new SilkGraphics();

        stage.addChild(g);
        tick((t) => {
            g.clear();
            for (let i = 0; i < 24; i++) {
                const a = -Math.PI / 2 + (i / 23) * Math.PI + Math.sin(t * 0.3) * 0.05;
                const w = (0.1 + i * 0.12) * params.scale;

                g.line(240, 200, 240 + Math.cos(a) * 220, 200 + Math.sin(a) * 190).stroke({
                    width: w,
                    color: 0xffffff,
                });
            }
        });
    },
});
