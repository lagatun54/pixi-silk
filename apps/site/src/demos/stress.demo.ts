import { Text } from 'pixi.js';
import { SilkGraphics } from 'pixi-silk';
import { defineDemo } from './runtime';

// Everything is rebuilt every frame: one SilkGraphics, one draw call, however many primitives.
export default defineDemo({
    size: [480, 260],
    controls: {
        count: { type: 'range', label: 'primitives', min: 500, max: 30000, step: 500, value: 5000 },
    },
    setup({ stage, params, tick }) {
        const g = new SilkGraphics();
        const stats = new Text({
            text: '',
            style: { fill: 0xffffff, fontSize: 12, fontFamily: 'ui-monospace, monospace' },
        });

        stats.position.set(12, 10);
        stage.addChild(g, stats);
        let cpu = 0;

        tick((t) => {
            const start = performance.now();

            g.clear();
            for (let i = 0; i < params.count; i++) {
                const a = i * 2.399963 + t * 0.2;
                const r = Math.sqrt(i / params.count) * 120;
                const x = 240 + Math.cos(a) * r * 1.8;
                const y = 130 + Math.sin(a) * r;

                if (i % 3 === 0) g.circle(x, y, 2.2).fill(0xff375f);
                else if (i % 3 === 1) g.roundRect(x - 2, y - 2, 4, 4, 1).fill(0x0a84ff);
                else g.line(x, y, x + 5, y + 2).stroke({ width: 1, color: 0x30d158 });
            }
            cpu = cpu * 0.9 + (performance.now() - start) * 0.1;
            stats.text = `${params.count} primitives, 1 draw call, rebuilt in ${cpu.toFixed(1)} ms`;
        });
    },
});
