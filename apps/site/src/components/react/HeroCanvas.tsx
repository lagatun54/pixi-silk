import { createSilkApp, type SilkApp } from 'pixi-silk';
import { useEffect, useRef } from 'react';
import { heartZones } from '@/lab/_widgets/charts';
import type { Widget } from '@/lab/_widgets/common';
import { activityRings } from '@/lab/_widgets/rings';
import { sunsetPills } from '@/lab/_widgets/time';
import { flight } from '@/lab/_widgets/travel';

/** The home page hero: a strip of live widgets, one row on wide screens and two on narrow ones. */
export default function HeroCanvas() {
    const host = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let silk: SilkApp | null = null;
        let cancelled = false;

        (async () => {
            const app = await createSilkApp({ parent: host.current!, background: 0x070708 });

            if (cancelled) {
                app.destroy();

                return;
            }
            silk = app;
            const widgets: Widget[] = [activityRings(170), heartZones(), flight(), sunsetPills()];

            for (const w of widgets) app.app.stage.addChild(w.view);
            const layout = () => {
                const W = app.width;
                const H = app.height;
                const gap = 18;
                const rows = W < 900 ? [[widgets[1]], [widgets[2]]] : [widgets];
                const rowW = rows.map((r) => r.reduce((s, w) => s + w.width, 0) + gap * (r.length - 1));
                const rowH = rows.map((r) => Math.max(...r.map((w) => w.height)));
                const totalH = rowH.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);
                const s = Math.min(1.2, (W - 32) / Math.max(...rowW), (H - 32) / totalH);
                let y = (H - totalH * s) / 2;

                for (const w of widgets) w.view.visible = false;
                rows.forEach((row, i) => {
                    let x = (W - rowW[i] * s) / 2;

                    for (const w of row) {
                        w.view.visible = true;
                        w.view.scale.set(s);
                        w.view.position.set(x, y + ((rowH[i] - w.height) / 2) * s);
                        x += (w.width + gap) * s;
                    }
                    y += (rowH[i] + gap) * s;
                });
            };

            layout();
            app.app.renderer.on('resize', layout);
            let t = 0;

            app.app.ticker.add((ticker) => {
                const dt = Math.min(0.1, ticker.deltaMS / 1000);

                t += dt;
                for (const w of widgets) if (w.view.visible) w.tick?.(dt, t);
            });
        })();

        return () => {
            cancelled = true;
            silk?.destroy();
        };
    }, []);

    return <div ref={host} className="h-full w-full" aria-label="Live widgets rendered with pixi-silk" role="img" />;
}
