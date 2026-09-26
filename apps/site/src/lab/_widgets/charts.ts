import { Container, type FederatedPointerEvent, Rectangle } from 'pixi.js';
import { linear, monotoneX, SilkGraphics, vertical } from 'pixi-silk';
import { atBaseline, C, card, DampedSeries, inline, inlineRight, rng, txt, type Widget, walk } from './common';

const GRID = { width: 1, color: 0xffffff, alpha: 0.12 };

/** Heart-rate zones: the stroke colour comes from a vertical gradient in local units (value → colour). */
export function heartZones(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    const g = new SilkGraphics();

    view.addChild(g);
    const x0 = 34;
    const x1 = w - 18;
    const yTop = 26;
    const yBot = 118;
    const zone = (z: number) => yBot - ((z - 1) / 4) * (yBot - yTop);
    for (let z = 1; z <= 5; z++) {
        const t = txt(String(z), 11, C.muted, '600');

        t.position.set(16, zone(z) - t.height / 2);
        view.addChild(t);
    }
    [
        ['>178 BPM', 0],
        ['<140 BPM', 1],
    ].forEach(([s, i]) => {
        const t = txt(s as string, 10, C.text, '600');

        t.position.set(i ? x1 - t.width - 4 : x0 + 6, i ? zone(1.35) - 12 : zone(5) + 2);
        view.addChild(t);
    });
    ['15m', '25m', '35m', 'NOW'].forEach((s, i) => {
        const t = txt(s, 10, i === 3 ? C.text : C.muted, '700');

        t.position.set(x0 + ((i + 0.6) * (x1 - x0)) / 4 - t.width / 2, 124);
        view.addChild(t);
    });
    const stroke = linear(
        [
            [0, 0x30d158],
            [0.3, 0xffd60a],
            [0.62, 0xff9f0a],
            [0.85, 0xff375f],
            [1, 0xbf5af2],
        ],
        {
            units: 'local',
            from: [0, zone(1)],
            to: [0, zone(5)],
        },
    );
    const plan = [1.1, 1.3, 1.9, 2.4, 2.5, 2.4, 3.3, 3.5, 3.4, 3.2, 4.1, 4.7, 4.3, 2.2, 1.6, 1.25];

    return {
        view,
        width: w,
        height: h,
        tick(_dt, time) {
            // draw the workout in, hold, repeat
            const reveal = Math.min(1, 0.08 + ((time * 0.3) % 1.6));
            g.clear();
            for (let z = 1; z <= 5; z++) g.line(x0, zone(z), x1, zone(z)).stroke(GRID);
            const n = plan.length;
            const pts: number[] = [];

            plan.forEach((v, i) => pts.push(x0 + (i / (n - 1)) * (x1 - x0 - 10), zone(v)));
            const smooth = monotoneX(pts, 1.5);
            const cut = Math.max(4, Math.floor((smooth.length / 2) * reveal) * 2);
            const shown = smooth.slice(0, cut);

            g.polyline(shown).stroke({ width: 3, cap: 'round', gradient: stroke });
            const ex = shown[shown.length - 2];
            const ey = shown[shown.length - 1];

            g.circle(ex, ey, 4).fill(0xffffff).stroke({ width: 2, color: C.card, alignment: 'outside' });
        },
    };
}

/** Week temperature line with hollow markers, colour shifting along the week. */
export function weatherWeek(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    inline(view, 18, 32, [
        [txt('23°', 17, C.text, '700'), 6],
        [txt('LONDON, UK', 17, C.text, '700'), 0],
    ]);
    inlineRight(view, w - 18, 30, [[txt('19-25 AUG', 11, C.muted, '600'), 0]]);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const x0 = 58;
    const x1 = w - 26;
    const step = (x1 - x0) / 6;

    days.forEach((d, i) => {
        const t = txt(d, 11, i === 3 ? C.text : C.muted, i === 3 ? '800' : '600');

        t.position.set(x0 + i * step - t.width / 2, 124);
        view.addChild(t);
    });
    ['25°', '15°'].forEach((s, i) => {
        const t = txt(s, 10, C.muted, '600');

        t.position.set(18, (i ? 100 : 50) - 6);
        view.addChild(t);
    });
    const g = new SilkGraphics();

    view.addChild(g);
    const series = new DampedSeries([21, 19, 17, 14, 16, 15, 21]);
    const color = linear([C.green, C.cyan, C.blue, C.blue, C.cyan], { units: 'local', from: [x0, 0], to: [x1, 0] });
    let next = 3;

    return {
        view,
        width: w,
        height: h,
        tick(dt, t) {
            if (t > next) {
                next = t + 3;
                series.set(walk(7, Math.floor(t), 18, 6, 12, 25));
            }
            series.step(dt, 4);
            g.clear();
            for (let i = 0; i < 7; i++)
                g.line(x0 + i * step, 44, x0 + i * step, 112).stroke({ ...GRID, dash: [0, 3.2], cap: 'round' });
            g.line(x0 - 10, 50, x1 + 8, 50).stroke(GRID);
            g.line(x0 - 10, 100, x1 + 8, 100).stroke(GRID);
            const y = (v: number) => 100 - ((v - 15) / 10) * 50;
            const pts = series.values.flatMap((v, i) => [x0 + i * step, y(v)]);

            g.polyline(pts).stroke({ width: 2.2, cap: 'round', gradient: color });
            for (let i = 0; i < pts.length; i += 2) {
                g.circle(pts[i], pts[i + 1], 4.2)
                    .fill(C.card)
                    .stroke({ width: 2, gradient: color });
            }
        },
    };
}

/** Glucose: threshold bands, dotted readings, NOW marker. */
export function glucose(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    const g = new SilkGraphics();

    view.addChild(g);
    inline(view, 40, 32, [
        [txt('150', 18, C.text, '700'), 4],
        [txt('mg/dL', 12, C.muted, '600'), 0],
    ]);
    const x0 = 18;
    const x1 = 250;
    const ticks = ['1', '2', '3', 'NOW', 'hrs'];

    ticks.forEach((s, i) => {
        const t = txt(s, 10, s === 'NOW' ? C.text : C.muted, '700');

        t.position.set(x0 + 30 + i * 58 - t.width / 2, 124);
        view.addChild(t);
    });
    [
        ['240', 50],
        ['40', 92],
    ].forEach(([s, y]) => {
        const t = txt(s as string, 12, s === '240' ? C.yellow : C.red, '700');

        t.position.set(w - 18 - t.width, (y as number) - 8);
        view.addChild(t);
    });
    const r = rng(5);
    const readings = Array.from({ length: 70 }, (_, i) => 70 + Math.sin(i * 0.18) * 8 + (r() - 0.5) * 6);

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            // drop icon
            g.circle(26, 26, 6).fill(C.red);
            g.triangle(21, 24, 31, 24, 26, 15, 1).fill(C.red);
            // bands
            g.rect(x0, 42, w - x0 - 18, 16).fill(
                vertical([
                    [0, C.yellow, 0.45],
                    [1, C.yellow, 0.15],
                ]),
            );
            g.line(x0, 58, w - 18, 58).stroke({ width: 1.2, color: C.yellow });
            g.rect(x0, 84, w - x0 - 18, 16).fill(
                vertical([
                    [0, C.red, 0.15],
                    [1, C.red, 0.45],
                ]),
            );
            g.line(x0, 84, w - 18, 84).stroke({ width: 1.2, color: C.red });
            // dotted readings, gently scrolling
            const shift = (t * 3) % 1;

            readings.forEach((v, i) => {
                const x = x0 + 4 + (i - shift) * ((x1 - x0) / 70);

                if (x < x0 + 2) return;
                g.circle(x, v, 1.35).fill(0xffffff);
            });
            // NOW marker
            g.line(x1, 34, x1, 118).stroke({ width: 1, color: 0xffffff });
            g.circle(x1, 34, 3).fill(0xffffff);
        },
    };
}

/** Budget line that turns red once it crosses the limit (a hard gradient stop). */
export function budget(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    inline(view, 42, 32, [
        [txt('$382', 17, C.text, '700'), 6],
        [txt('LEFT OF BUDGET', 11, C.muted, '700'), 0],
    ]);
    const g = new SilkGraphics();

    view.addChild(g);
    ['3K', '1.5K', '0'].forEach((s, i) => {
        const t = txt(s, 10, C.muted, '600');

        t.position.set(18, 46 + i * 30 - 6);
        view.addChild(t);
    });
    ['SEP', '7', '13', 'TODAY'].forEach((s, i) => {
        const t = txt(s, 10, s === 'TODAY' ? C.text : C.muted, '700');

        t.position.set(52 + i * 80 - (i === 3 ? t.width : 0), 124);
        view.addChild(t);
    });
    const x0 = 52;
    const x1 = w - 22;
    const spend = [0.05, 0.12, 0.2, 0.28, 0.33, 0.4, 0.47, 0.5, 0.56, 0.64, 0.72, 0.8, 0.86, 0.9, 0.96];
    const budgetY = 52;
    const y = (v: number) => 106 - v * 60;
    const pts = monotoneX(
        spend.flatMap((v, i) => [x0 + (i / (spend.length - 1)) * (x1 - x0), y(v)]),
        2,
    );
    // where the line crosses the budget: hard stop there
    let cross = x1;

    for (let i = 0; i < pts.length - 2; i += 2) {
        if (pts[i + 1] >= budgetY && pts[i + 3] < budgetY) {
            cross = pts[i] + (pts[i + 2] - pts[i]) * ((pts[i + 1] - budgetY) / (pts[i + 1] - pts[i + 3]));
            break;
        }
    }
    const c = (cross - x0) / (x1 - x0);
    const paint = linear(
        [
            [0, 0x30d158],
            [c - 0.001, 0x9be15d],
            [c, 0xff453a],
            [1, 0xff453a],
        ],
        { units: 'local', from: [x0, 0], to: [x1, 0] },
    );

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            g.circle(26, 26, 9).stroke({ width: 1.8, color: C.text });
            g.line(26, 21, 26, 31).stroke({ width: 1.8, color: C.text, cap: 'round' });
            for (let i = 0; i < 12; i++)
                g.line(x0 + i * ((x1 - x0) / 11), 44, x0 + i * ((x1 - x0) / 11), 108).stroke({ ...GRID, alpha: 0.08 });
            g.line(x0, budgetY, x1, budgetY).stroke({ width: 1, color: 0xffffff, alpha: 0.4, dash: [4, 3] });
            const reveal = Math.min(pts.length, Math.max(4, Math.floor((((t * 0.25) % 1.3) * pts.length) / 2) * 2));

            g.polyline(pts.slice(0, reveal)).stroke({ width: 2.4, cap: 'round', gradient: paint });
            g.line(x1, 44, x1, 110).stroke({ width: 1.5, color: 0xffffff, dash: [0, 3.5], cap: 'round' });
        },
    };
}

/** Interactive: hover the chart for a crosshair that snaps to the data. */
export function stocks(): Widget {
    const w = 340;
    const h = 170;
    const view = new Container();

    view.addChild(card(w, h, 22));
    const title = txt('AAPL', 15, C.text, '700');
    const price = txt('', 22, C.text, '700');
    const delta = txt('', 13, C.green, '700');

    view.addChild(atBaseline(title, 18, 30), price, delta);
    const g = new SilkGraphics();

    view.addChild(g);
    const n = 60;
    const data = walk(n, 42, 180, 7, 140, 230);
    const x0 = 18;
    const x1 = w - 18;
    const top = 60;
    const bot = 150;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const X = (i: number) => x0 + (i / (n - 1)) * (x1 - x0);
    const Y = (v: number) => bot - ((v - min) / (max - min)) * (bot - top);
    const pts = monotoneX(
        data.flatMap((v, i) => [X(i), Y(v)]),
        1.5,
    );
    let hover: number | null = null;
    let cursor = n - 1;

    view.eventMode = 'static';
    view.hitArea = new Rectangle(0, 0, w, h);
    view.on('pointermove', (e: FederatedPointerEvent) => {
        const p = view.toLocal(e.global);

        hover = Math.max(0, Math.min(n - 1, Math.round(((p.x - x0) / (x1 - x0)) * (n - 1))));
    });
    view.on('pointerleave', () => {
        hover = null;
    });

    return {
        view,
        width: w,
        height: h,
        tick(dt) {
            const target = hover ?? n - 1;

            cursor = target + (cursor - target) * Math.exp(-18 * dt);
            const i = Math.round(cursor);
            const v = data[i];
            const up = v >= data[0];

            price.text = `$${v.toFixed(2)}`;
            delta.text = `${up ? '+' : ''}${((v / data[0] - 1) * 100).toFixed(2)}%`;
            delta.style.fill = up ? C.green : C.red;
            atBaseline(price, 18, 58 - 4);
            atBaseline(delta, 26 + price.width, 58 - 4);
            g.clear();
            g.area(pts, bot + 8).fill(
                vertical(
                    [
                        [0, up ? C.green : C.red, 0.35],
                        [1, up ? C.green : C.red, 0],
                    ],
                    { easing: 'smooth' },
                ),
            );
            g.polyline(pts).stroke({ width: 2, color: up ? C.green : C.red, cap: 'round' });
            const cx = x0 + (cursor / (n - 1)) * (x1 - x0);
            // y on the smooth curve at cx
            let cy = Y(v);

            for (let k = 0; k < pts.length - 2; k += 2) {
                if (pts[k] <= cx && pts[k + 2] >= cx) {
                    cy = pts[k + 1] + (pts[k + 3] - pts[k + 1]) * ((cx - pts[k]) / (pts[k + 2] - pts[k] || 1));
                    break;
                }
            }
            g.line(cx, top - 6, cx, bot + 8).stroke({ width: 1, color: 0xffffff, alpha: 0.5, dash: [3, 3] });
            g.circle(cx, cy, 9).fill({ color: up ? C.green : C.red, alpha: 0.25 });
            g.circle(cx, cy, 4.5)
                .fill(0xffffff)
                .stroke({ width: 2, color: up ? C.green : C.red, alignment: 'outside' });
        },
    };
}
