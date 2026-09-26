import { Container } from 'pixi.js';
import type { Widget } from '../_widgets/common';
import { boot, type Proto } from './kit';
import { attachLoupe } from './loupe';

export interface ShowcaseOptions {
    title: string;
    subtitle: string;
    /** Max columns. Default 2. */
    cols?: number;
    /** Largest scale applied to the widgets. Default 1.6. */
    maxScale?: number;
    gap?: number;
    background?: number;
}

/**
 * Lays widgets out in a responsive grid (row heights follow the tallest widget in each row),
 * scales the grid to fit the window and drives every widget's tick().
 */
export async function showcase(options: ShowcaseOptions, make: () => Widget[]): Promise<Proto> {
    const proto = await boot({ title: options.title, subtitle: options.subtitle, background: options.background });
    const widgets = make();
    const grid = new Container();

    for (const w of widgets) grid.addChild(w.view);
    proto.stage.addChild(grid);
    const gap = options.gap ?? 16;

    proto.onResize((width, height) => {
        const top = 92;
        const bottom = 48;
        const availW = width - 32;
        const availH = height - top - bottom;
        const maxCols = Math.min(options.cols ?? 2, widgets.length);
        const readable = 0.9;
        let best = { scale: 0, cols: 1, fits: false };

        // 1) everything on one screen, if that stays readable
        for (let cols = 1; cols <= maxCols; cols++) {
            const { w, h } = layout(widgets, cols, gap, false);
            const scale = Math.min(options.maxScale ?? 1.6, availW / w, availH / h);

            if (scale > best.scale + 0.02) best = { scale, cols, fits: true };
        }
        // 2) otherwise fit the width and scroll
        if (best.scale < readable) {
            best = { scale: 0, cols: 1, fits: false };
            for (let cols = maxCols; cols >= 1; cols--) {
                const { w } = layout(widgets, cols, gap, false);
                const scale = Math.min(options.maxScale ?? 1.6, availW / w);

                if (scale >= readable || cols === 1) {
                    best = { scale, cols, fits: false };
                    break;
                }
            }
        }
        const { w, h } = layout(widgets, best.cols, gap, true);
        const offsetY = best.fits ? Math.max(0, (availH - h * best.scale) / 2) : 0;

        grid.scale.set(best.scale);
        grid.position.set(Math.round((width - w * best.scale) / 2), Math.round(top + offsetY));
        proto.setContentHeight(best.fits ? 0 : top + h * best.scale + bottom);
    });

    let t = 0;

    proto.app.ticker.add((ticker) => {
        const dt = Math.min(0.1, ticker.deltaMS / 1000);

        t += dt;
        for (const w of widgets) w.tick?.(dt, t);
    });
    attachLoupe([proto.app]);

    return proto;
}

function layout(widgets: Widget[], cols: number, gap: number, apply: boolean): { w: number; h: number } {
    const colW = Math.max(...widgets.map((w) => w.width));
    let y = 0;

    for (let i = 0; i < widgets.length; i += cols) {
        const row = widgets.slice(i, i + cols);
        const rowH = Math.max(...row.map((w) => w.height));

        if (apply) {
            row.forEach((w, j) =>
                w.view.position.set(j * (colW + gap) + (colW - w.width) / 2, y + (rowH - w.height) / 2),
            );
        }
        y += rowH + gap;
    }

    return { w: cols * colW + (cols - 1) * gap, h: y - gap };
}
