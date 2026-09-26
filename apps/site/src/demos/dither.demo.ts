import { ColorMatrixFilter, Container } from 'pixi.js';
import { SilkGraphics, vertical } from 'pixi-silk';
import { defineDemo } from './runtime';

// A dark, wide gradient has only a few 8-bit steps. Half-float ramps + ±½ LSB dither hide them.
const NIGHT = vertical([0x0b1026, 0x1d1a3a, 0x10141f]);

export default defineDemo({
    size: [480, 220],
    background: 0x000000,
    controls: {
        dither: { type: 'toggle', label: 'dither', value: true },
        reveal: { type: 'toggle', label: 'reveal x8', value: true },
    },
    setup({ stage, params, tick }) {
        const view = new Container();
        const g = new SilkGraphics();
        // multiply the contrast by 8 around black so every banding step shows
        const reveal = new ColorMatrixFilter();

        reveal.brightness(8, false);
        view.addChild(g);
        stage.addChild(view);
        g.rect(0, 0, 480, 220).fill(NIGHT);
        g.circle(360, 70, 60).fill({ color: 0xffd9a0, alpha: 0.12, blur: 40 });
        tick(() => {
            g.dither = params.dither ? 1 : 0;
            view.filters = params.reveal ? [reveal] : [];
        });
    },
});
