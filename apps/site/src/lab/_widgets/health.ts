import { Container } from 'pixi.js';
import { horizontal, linear, SilkGraphics, vertical } from 'pixi-silk';
import { arrowDown, C, card, DampedSeries, fatIcon, inline, rng, txt, type Widget, walk } from './common';

const W = 340;
const H = 140;
const DIM = 0x48484a;
const DOT_GUIDE = {
    width: 1.1,
    color: 0xffffff,
    alpha: 0.28,
    cap: 'round' as const,
    dash: [0, 3.4] as [number, number],
};

type Icon = 'fat' | 'heart' | 'fat-dim' | 'heart-dim';

/** Icon + title + value row shared by all health cards. */
function header(view: Container, icon: Icon, title: string, value: string | null, rest: string[] = []): SilkGraphics {
    const g = new SilkGraphics();
    const dim = icon.endsWith('dim');

    if (icon.startsWith('fat')) fatIcon(g, 31, 35, 30, dim ? DIM : C.yellow);
    else g.heart(31, 35, 30, 0.1).fill(dim ? DIM : C.pink);
    view.addChild(g);
    const t = txt(title, 15, C.muted);

    inline(view, 60, 30, [[t, 0]]);
    if (value === null) {
        inline(view, 60, 55, [[txt('--', 17, C.muted), 0]]);

        return g;
    }
    const x = inline(view, 60, 55, [[txt(value, 17, C.text, '500'), 7]]);

    if (rest.length) {
        arrowDown(g, x + 4, 49.5, 11, C.muted);
        inline(
            view,
            x + 12,
            55,
            rest.map((s) => [txt(s, 17, C.muted), 7] as [ReturnType<typeof txt>, number]),
        );
    }

    return g;
}

function guideLabels(view: Container, labels: [string, number][], x: number): void {
    for (const [s, y] of labels) {
        const t = txt(s, 10, C.muted);

        t.position.set(x, y - t.height / 2);
        view.addChild(t);
    }
}

// ------------------------------------------------------------------------------------ area

/** "Fat 33%" card: area chart with gradient, dots, NOW marker and a dashed forecast. */
export function fatArea(options: { empty?: boolean } = {}): Widget {
    const empty = options.empty ?? false;
    const view = new Container();

    view.addChild(card(W, H, 20));
    header(view, empty ? 'fat-dim' : 'fat', 'Fat', empty ? null : '33%', ['3%', '66 lbs']);

    if (empty) {
        const plus = new SilkGraphics();

        plus.circle(W - 34, 34, 17).fill(C.green);
        plus.line(W - 42, 34, W - 26, 34).stroke({ width: 3, color: 0x000000, cap: 'round' });
        plus.line(W - 34, 26, W - 34, 42).stroke({ width: 3, color: 0x000000, cap: 'round' });
        view.addChild(plus);
    }

    const chart = new SilkGraphics();
    const top = 84; // 50 guide
    const low = 98; // 35 guide
    const bottom = 128;
    const x0 = 16;
    const xNow = 244;
    const xEnd = 282;
    const y = (v: number) => top + ((50 - v) / 15) * (low - top);
    const n = 14;
    const series = new DampedSeries(walk(n, 7, 43, 2.2, 38, 47));
    const accent = empty ? 0x8e8e93 : C.yellow;

    view.addChild(chart);
    guideLabels(
        view,
        [
            ['50', top],
            ['35', low],
        ],
        300,
    );

    const draw = () => {
        const pts: number[] = [];

        series.values.forEach((v, i) => pts.push(x0 + (i / (n - 1)) * (xNow - x0), y(v)));
        chart.clear();
        chart.line(x0, top, xEnd + 4, top).stroke(DOT_GUIDE);
        chart.line(x0, low, xEnd + 4, low).stroke(DOT_GUIDE);
        chart.area(pts, bottom).fill(
            vertical(
                empty
                    ? [
                          [0, 0x6e6e73, 0.55],
                          [1, 0x6e6e73, 0],
                      ]
                    : [
                          [0, 0xd98e04, 0.95],
                          [0.55, 0x8a5a00, 0.55],
                          [1, 0x3d2800, 0],
                      ],
                { easing: 'smooth' },
            ),
        );
        chart.polyline(pts).stroke({ width: 1.6, color: accent, cap: 'round' });
        const lx = pts[pts.length - 2];
        const ly = pts[pts.length - 1];

        chart.line(lx, ly, xEnd, ly + 5).stroke({ width: 1.6, color: accent, dash: [3.2, 3], cap: 'butt', alpha: 0.9 });
        if (!empty) {
            for (let i = 0; i < pts.length - 2; i += 2) {
                chart
                    .circle(pts[i], pts[i + 1], 2.9)
                    .fill(C.yellow)
                    .stroke({ width: 1.2, color: 0x1c1c1e, alignment: 'outside' });
            }
        }
        chart.line(xNow, 58, xNow, 132).stroke({ width: 1, color: 0xffffff, alpha: 0.9 });
        if (!empty)
            chart.circle(lx, ly, 5.2).fill(0xffffff).stroke({ width: 1.5, color: 0x1c1c1e, alignment: 'outside' });
    };

    draw();
    let next = 2;

    return {
        view,
        width: W,
        height: H,
        tick(dt, t) {
            if (t > next) {
                next = t + 2.4;
                series.set(walk(n, Math.floor(t * 10), 43, 2.4, 38, 47));
            }
            if (series.step(dt, 5)) draw();
        },
    };
}

// ------------------------------------------------------------------------------------ bars

/** Many slim bars with past/future split. */
export function fatBars(): Widget {
    const view = new Container();

    view.addChild(card(W, H, 20));
    header(view, 'fat', 'Fat', '33%', ['3%', '66 lbs']);
    const chart = new SilkGraphics();

    view.addChild(chart);
    const top = 86;
    const low = 97;
    const bottom = 128;
    const n = 34;
    const x0 = 16;
    const x1 = 286;
    const past = 25;
    const bw = 4.8;
    const gap = (x1 - x0 - n * bw) / (n - 1);
    const base = Array.from({ length: n }, (_, i) => 48 - i * 0.38 + Math.sin(i * 1.3) * 1.2);
    const series = new DampedSeries(base.map(() => 30));

    series.set(base);
    guideLabels(
        view,
        [
            ['50%', top],
            ['35%', low],
        ],
        293,
    );
    const y = (v: number) => top + ((50 - v) / 15) * (low - top);

    const draw = () => {
        chart.clear();
        chart.line(x0, top, x1 + 4, top).stroke(DOT_GUIDE);
        chart.line(x0, low, x1 + 4, low).stroke(DOT_GUIDE);
        series.values.forEach((v, i) => {
            const x = x0 + i * (bw + gap);
            const yy = y(v);

            chart.roundRect(x, yy, bw, bottom - yy, 1.6).fill(i < past ? C.yellow : 0x4d4000);
        });
        const xNow = x0 + past * (bw + gap) - gap / 2;

        chart.line(xNow, 80, xNow, 132).stroke({ width: 1, color: 0xffffff, alpha: 0.9 });
    };

    draw();
    let next = 2.5;

    return {
        view,
        width: W,
        height: H,
        tick(dt, t) {
            if (t > next) {
                next = t + 2.6;
                const r = rng(Math.floor(t));

                series.set(base.map((b) => b + (r() - 0.5) * 6));
            }
            if (series.step(dt, 6)) draw();
        },
    };
}

/** Five chunky stepped bars. */
export function fatSteps(): Widget {
    const view = new Container();

    view.addChild(card(W, H, 20));
    header(view, 'fat', 'Fat', '33%', ['3%', '66 lbs']);
    const chart = new SilkGraphics();

    view.addChild(chart);
    const heights = [18, 32, 46, 60, 74];
    const grow = new DampedSeries(heights.map(() => 0));

    grow.set(heights);
    const draw = () => {
        chart.clear();
        grow.values.forEach((h, i) => {
            const x = 16 + i * 64;

            chart.roundRect(x, 128 - h, 60, h, 5).fill(i < 3 ? C.yellow : 0x48484a);
        });
    };

    draw();

    return {
        view,
        width: W,
        height: H,
        tick: (dt) => {
            if (grow.step(dt, 4)) draw();
        },
    };
}

// ------------------------------------------------------------------------------------ pills

/** Heart-rate pills around a baseline. */
export function heartPills(options: { empty?: boolean } = {}): Widget {
    const empty = options.empty ?? false;
    const view = new Container();

    view.addChild(card(W, H, 20));
    header(view, empty ? 'heart-dim' : 'heart', 'Heart rate (Avg.)', empty ? null : '72 bpm', ['3%']);
    if (empty) view.addChild(auraIcon(W - 36, 34));

    const chart = new SilkGraphics();

    view.addChild(chart);
    const top = 86;
    const low = 104;
    const mid = 95;
    const n = 38;
    const x0 = 16;
    const x1 = 244;
    const step = (x1 - x0) / (n - 1);
    const r = rng(3);
    const kinds = Array.from({ length: n }, (_, i) => (r() < 0.32 && i % 3 !== 0 ? 0 : 1));
    const series = new DampedSeries(kinds.map((k) => (k ? 4 + r() * 16 : 3)));
    const color = empty ? 0x5a5a5e : C.pink;

    guideLabels(
        view,
        [
            ['90', top],
            ['50', low],
        ],
        300,
    );

    const draw = () => {
        chart.clear();
        chart.line(x0, top, 290, top).stroke(DOT_GUIDE);
        chart.line(x0, low, 290, low).stroke(DOT_GUIDE);
        series.values.forEach((h, i) => {
            const x = x0 + i * step;

            if (kinds[i]) chart.pill(x - 2.6, mid - h / 2, 5.2, h).fill(color);
            else chart.line(x - 2, mid, x + 2, mid).stroke({ width: 3, color, cap: 'round' });
        });
        chart.line(x1 + 8, 58, x1 + 8, 132).stroke({ width: 1, color: 0xffffff, alpha: 0.9 });
    };

    draw();
    let next = 1.5;

    return {
        view,
        width: W,
        height: H,
        tick(dt, t) {
            if (t > next) {
                next = t + 1.8;
                const rr = rng(Math.floor(t * 7));

                series.set(kinds.map((k) => (k ? 4 + rr() * 16 : 3)));
            }
            if (series.step(dt, 7)) draw();
        },
    };
}

/** A made-up third-party app icon: squircle with gradient, lettering and a badge. */
function auraIcon(cx: number, cy: number): Container {
    const c = new Container();
    const g = new SilkGraphics();

    g.roundRect(cx - 15, cy - 13, 30, 30, 8, 0.6).fill(linear([0x2ee88a, 0x16b57a], { from: [0, 0], to: [1, 1] }));
    g.roundRect(cx + 1, cy - 20, 18, 16, 5, 0.6).fill(0xffffff);
    g.heart(cx + 10, cy - 12, 10, 0.1).fill(C.pink);
    c.addChild(g);
    const a = txt('AU', 8.5, 0x05351f, '700', { letterSpacing: 1.5 });
    const b = txt('RA', 8.5, 0x05351f, '700', { letterSpacing: 1.5 });

    a.position.set(cx - 12, cy - 6);
    b.position.set(cx - 12, cy + 3);
    c.addChild(a, b);

    return c;
}

// ------------------------------------------------------------------------------------ ranges

const SHORT = 100;

/** Progress with labelled markers. */
export function fatRange(): Widget {
    const view = new Container();

    view.addChild(card(W, H - 28, 20));
    header(view, 'fat', 'Fat', '33%', ['3%', '66 lbs']);
    const g = new SilkGraphics();

    view.addChild(g);
    const x0 = 16;
    const x1 = W - 16;
    const y = 84;
    const w = x1 - x0;
    let value = 0;

    for (const [p, s] of [
        [0.28, '40%'],
        [0.7, '60%'],
    ] as [number, string][]) {
        const t = txt(s, 10, C.muted);

        t.position.set(x0 + p * w - t.width - 4, y - 18);
        view.addChild(t);
    }
    const draw = () => {
        g.clear();
        g.roundRect(x0, y, w, 13, 3).fill(0x3a3a3c);
        g.roundRect(x0, y, w * value, 13, 3).fill(C.yellow);
        for (const p of [0.28, 0.7])
            g.line(x0 + p * w, y - 16, x0 + p * w, y).stroke({ width: 1, color: 0xffffff, alpha: 0.7 });
    };

    draw();

    return {
        view,
        width: W,
        height: H - 28,
        tick(dt, t) {
            const target = 0.565 + Math.sin(t * 0.7) * 0.05;

            value = target + (value - target) * Math.exp(-4 * dt);
            draw();
        },
    };
}

/** Pink range inside a track. */
export function heartRange(): Widget {
    const view = new Container();

    view.addChild(card(W, H - 28, 20));
    header(view, 'heart', 'Heart rate (Avg.)', '72 bpm', ['3%']);
    const g = new SilkGraphics();

    view.addChild(g);
    const x0 = 16;
    const x1 = W - 16;
    const y = 84;
    const w = x1 - x0;
    let a = 0.5;
    let b = 0.5;

    for (const [p, s] of [
        [0.28, '50'],
        [0.7, '90'],
    ] as [number, string][]) {
        const t = txt(s, 10, C.muted);

        t.position.set(x0 + p * w - t.width - 4, y - 18);
        view.addChild(t);
    }
    const draw = () => {
        g.clear();
        g.roundRect(x0, y, w, 13, 3).fill(0x3a3a3c);
        g.roundRect(x0 + a * w, y, (b - a) * w, 13, 3).fill(horizontal([0xff6482, C.pink]));
        for (const p of [0.28, 0.7])
            g.line(x0 + p * w, y - 16, x0 + p * w, y).stroke({ width: 1, color: 0xffffff, alpha: 0.7 });
    };

    return {
        view,
        width: W,
        height: H - 28,
        tick(dt, t) {
            const ta = 0.24 + Math.sin(t * 0.9) * 0.02;
            const tb = 0.54 + Math.sin(t * 0.6 + 1) * 0.04;

            a = ta + (a - ta) * Math.exp(-5 * dt);
            b = tb + (b - tb) * Math.exp(-5 * dt);
            draw();
        },
    };
}

/** Signal-strength style bars at the right edge. */
export function fatSignal(): Widget {
    const view = new Container();

    view.addChild(card(W, SHORT - 28, 20));
    header(view, 'fat', 'Fat', '33%', ['3%', '66 lbs']);
    const g = new SilkGraphics();

    for (let i = 0; i < 5; i++) {
        const h = 9 + i * 8.5;

        g.roundRect(W - 82 + i * 12.5, 58 - h, 9, h, 2).fill(i < 3 ? C.yellow : 0x48484a);
    }
    view.addChild(g);

    return { view, width: W, height: SHORT - 28 };
}

export function fatPlain(): Widget {
    const view = new Container();

    view.addChild(card(W, SHORT - 28, 20));
    header(view, 'fat', 'Fat', '33%', ['3%', '66 lbs']);

    return { view, width: W, height: SHORT - 28 };
}

// ------------------------------------------------------------------------------------ waveform

/** "82 mmHg": pink gradient bars with bright caps, scrolling live. */
export function pressureWave(): Widget {
    const w = 300;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    inline(view, 22, 38, [
        [txt('82', 20, 0xff5cc8, '600'), 4],
        [txt('mmhg', 13, 0xff5cc8, '500'), 0],
    ]);
    const five = txt('5 min', 13, C.text, '500');

    five.position.set(w - 22 - five.width, 24);
    view.addChild(five);
    const g = new SilkGraphics();

    view.addChild(g);
    const n = 24;
    const r = rng(11);
    const vals = Array.from({ length: n }, () => r());
    let phase = 0;
    // one gradient in local units: every bar samples the same vertical ramp
    const bars = linear(
        [
            [0, 0xff8ae0],
            [0.55, 0xc42b8f],
            [1, 0x4a0b3a],
        ],
        { units: 'local', from: [0, 58], to: [0, 138] },
    );
    const draw = () => {
        g.clear();
        for (let i = 0; i < n; i++) {
            const x = 26 + i * 10.5;
            const v = vals[i];
            const hh = 18 + Math.abs(Math.sin(i * 0.55 + phase)) * 40 * (0.6 + v * 0.4);
            const cy = 98;

            g.pill(x - 2.5, cy - hh / 2, 5, hh).fill(bars);
            g.circle(x, cy - hh / 2 + 2.5, 2.6).fill(0xffb3ec);
        }
    };

    return {
        view,
        width: w,
        height: h,
        tick(dt) {
            phase += dt * 1.6;
            draw();
        },
    };
}
