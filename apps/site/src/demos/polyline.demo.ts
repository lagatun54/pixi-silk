import { SilkGraphics } from 'pixi-silk';
import { defineDemo } from './runtime';

export default defineDemo({
    size: [480, 220],
    controls: {
        width: { type: 'range', label: 'width', min: 0.25, max: 16, step: 0.25, value: 6, unit: 'px' },
        smooth: { type: 'select', label: 'smooth', options: ['none', 'monotone', 'catmull'], value: 'none' },
        alpha: { type: 'range', label: 'alpha', min: 0.1, max: 1, step: 0.05, value: 0.6 },
    },
    setup({ stage, params, tick }) {
        const g = new SilkGraphics();

        stage.addChild(g);
        tick((t) => {
            const pts: number[] = [];

            for (let i = 0; i <= 12; i++) pts.push(30 + i * 35, 110 + Math.sin(i * 1.3 + t) * 60 * Math.cos(i * 0.7));
            g.clear();
            // translucent on purpose: every pixel is shaded once, so joints never double-blend
            g.polyline(pts, { smooth: params.smooth === 'none' ? undefined : (params.smooth as 'monotone') }).stroke({
                width: params.width,
                color: 0x0a84ff,
                alpha: params.alpha,
                cap: 'round',
            });
            for (let i = 0; i < pts.length; i += 2) g.circle(pts[i], pts[i + 1], 3).fill(0xffffff);
        });
    },
});
