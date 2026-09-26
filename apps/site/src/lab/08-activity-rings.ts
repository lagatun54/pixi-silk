import { Container } from 'pixi.js';
import { conic, SilkGraphics } from 'pixi-silk';
import { showcase } from './_shared/showcase';
import type { Widget } from './_widgets/common';
import { activityCard, activityRings } from './_widgets/rings';

/** Extra ring styles: 270° gauge with dotted track, and a segmented ring. */
function variants(): Widget {
    const view = new Container();
    const g = new SilkGraphics();

    view.addChild(g);

    return {
        view,
        width: 340,
        height: 150,
        tick(_dt, t) {
            g.clear();
            const p = 0.5 + 0.45 * Math.sin(t * 0.7);
            // 270° gauge
            const a0 = Math.PI * 0.75;

            g.arcSweep(70, 75, 56, a0, Math.PI * 1.5).stroke({
                width: 3,
                color: 0xffffff,
                alpha: 0.25,
                cap: 'round',
                dash: [0, 7],
            });
            g.arcSweep(70, 75, 56, a0, Math.PI * 1.5 * p).stroke({
                width: 10,
                cap: 'round',
                gradient: conic([0x30d158, 0xffd60a, 0xff453a], { sweep: Math.PI * 1.5 }),
            });
            // segmented donut
            const segs = 12;

            for (let i = 0; i < segs; i++) {
                const a = -Math.PI / 2 + (i / segs) * Math.PI * 2;
                const on = i / segs < p;

                g.sector(190, 75, 56, a + 0.04, a + (Math.PI * 2) / segs - 0.04, 38, 4).fill(on ? 0x0a84ff : 0x1c2a3a);
            }
            // pie that sweeps
            g.sector(290, 75, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p, 0, 3).fill(0xbf5af2);
            g.circle(290, 75, 40).stroke({ width: 1, color: 0xffffff, alpha: 0.2, alignment: 'outside' });
        },
    };
}

await showcase(
    {
        title: 'Activity rings',
        subtitle:
            'Conic gradients that follow each arc, round caps, and progress past 100% with a soft analytic shadow under the overlapping tip. Springs drive the values.',
        cols: 2,
        maxScale: 1.8,
    },
    () => [activityRings(300), activityCard(), variants()],
);
