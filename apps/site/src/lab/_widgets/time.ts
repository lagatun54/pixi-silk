import { Container } from 'pixi.js';
import { along, horizontal, linear, monotoneX, radial, SilkGraphics, Spring, vertical } from 'pixi-silk';
import { atBaseline, C, card, inline, inlineRight, rng, txt, type Widget } from './common';

const PI = Math.PI;

// ------------------------------------------------------------------------------------ sleep

/** Sleep stages as rounded blocks on four levels, joined by hairline transitions. */
export function sleepStages(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    inline(view, 18, 32, [
        [txt('6', 19, C.text, '700'), 2],
        [txt('hr', 12, C.text, '700'), 5],
        [txt('38', 19, C.text, '700'), 2],
        [txt('min', 12, C.text, '700'), 0],
    ]);
    inlineRight(view, w - 18, 32, [
        [txt('51-68', 15, C.red, '700'), 3],
        [txt('BPM', 11, C.red, '700'), 5],
        [txt('AVG', 11, C.red, '700'), 0],
    ]);
    ['01:00', '03:00', '05:00', '07:00'].forEach((s, i) => {
        const t = txt(s, 10, C.muted, '600');

        t.position.set(22 + i * 96 - 4, 124);
        view.addChild(t);
    });
    const g = new SilkGraphics();

    view.addChild(g);
    // [level 0 awake .. 3 deep, duration]
    const r = rng(9);
    const plan: [number, number][] = [];
    let tot = 0;

    while (tot < 1) {
        const d = 0.02 + r() * 0.07;

        plan.push([Math.floor(r() * 4), d]);
        tot += d;
    }
    const colors = [0xff6b6b, 0x64d2ff, 0x2f7de0, 0x5e5ce6];
    const x0 = 18;
    const x1 = w - 18;
    const lvlY = (l: number) => 46 + l * 18;
    const grow = new Spring(0, 20, 8);

    grow.target = 1;

    return {
        view,
        width: w,
        height: h,
        tick(dt) {
            const k = grow.step(dt);

            g.clear();
            let x = x0;
            let prev: [number, number] | null = null;

            for (const [lvl, d] of plan) {
                const bw = Math.max(2, (d / tot) * (x1 - x0));
                const y = lvlY(lvl);

                if (x > x0 + (x1 - x0) * k) break;
                if (prev)
                    g.line(x, Math.min(prev[1], y) + 8, x, Math.max(prev[1], y) + 8).stroke({
                        width: 1,
                        color: 0xffffff,
                        alpha: 0.35,
                    });
                g.roundRect(x + 0.5, y, bw - 1, 16, 5).fill(vertical([colors[lvl], [1, colors[lvl], 0.75]]));
                prev = [x + bw, y];
                x += bw;
            }
        },
    };
}

/** Night summary: stage timeline strip plus the bed → alarm dotted arc (image 3). */
export function sleepNight(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    view.addChild(atBaseline(txt('02:03 - 08:26', 18, C.text, '700'), 18, 32));
    const dur = txt('6 HR 23 MIN', 11, C.muted, '700');

    view.addChild(dur);
    dur.position.set(w / 2 - dur.width / 2, 58);
    inline(view, 18, 136, [[txt('89%', 15, C.cyan, '700'), 0]]);
    inlineRight(view, w - 18, 136, [
        [txt('72 BPM', 15, C.pink, '700'), 5],
        [txt('AVG', 15, C.pink, '700'), 0],
    ]);
    const g = new SilkGraphics();

    view.addChild(g);
    const r = rng(21);
    const segs = Array.from({ length: 34 }, () => [r(), Math.floor(r() * 3)] as [number, number]);
    const total = segs.reduce((s, [d]) => s + d, 0);

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            // bed + alarm icon tiles
            g.roundRect(18, 44, 44, 34, 9).fill(0x2a2a52);
            g.roundRect(26, 58, 28, 10, 3).fill(0x8e8cff);
            g.roundRect(26, 53, 9, 6, 2).fill(0x8e8cff);
            g.roundRect(w - 62, 44, 44, 34, 9).fill(0x0f4f4f);
            g.circle(w - 40, 62, 9).stroke({ width: 2.4, color: 0x40e0d0 });
            g.line(w - 40, 62, w - 40, 57).stroke({ width: 2, color: 0x40e0d0, cap: 'round' });
            // dotted arc between them
            g.arcSweep(w / 2, 134, 92, PI * 1.24, PI * 0.52).stroke({
                width: 2.2,
                color: 0x7aa2ff,
                cap: 'round',
                dash: [0, 6.5],
                dashOffset: -t * 8,
            });
            // stage strip
            let x = 18;
            const x1 = w - 18;
            const colors = [0x3b82f6, 0x60a5fa, 0x1d4ed8];

            segs.forEach(([d, s]) => {
                const bw = (d / total) * (x1 - 18);

                g.roundRect(x, 92, Math.max(1.5, bw - 1.2), 12, 3).fill(colors[s]);
                x += bw;
            });
        },
    };
}

// ------------------------------------------------------------------------------------ timers

/** Espresso shot timer: tick bars with a glowing, motion-blurred leading edge (image 4). */
export function espresso(): Widget {
    const w = 300;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    const g = new SilkGraphics();

    view.addChild(g);
    const n10 = txt('10', 11, C.orange, '700');
    const n20 = txt('20', 11, C.muted, '700');
    const label = txt('Espresso', 16, C.orange, '600');
    const secs = txt('16s', 30, C.orange, '500');

    view.addChild(n10, n20, label, secs);
    const x0 = 26;
    const n = 30;
    const step = (w - 52) / (n - 1);

    n10.position.set(x0 + 9 * step - n10.width / 2, 16);
    n20.position.set(x0 + 19 * step - n20.width / 2, 16);
    atBaseline(label, 26, 118);
    const ticks = linear(
        [
            [0, 0xc2410c],
            [0.6, 0xff7a1a],
            [1, 0xffb347],
        ],
        { units: 'local', from: [x0, 0], to: [x0 + 16 * step, 0] },
    );

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            const elapsed = (t * 1.2) % (n + 6);

            g.clear();
            for (let i = 0; i < n; i++) {
                const x = x0 + i * step;
                const on = i < elapsed;
                const edge = Math.abs(i - elapsed);

                if (on) {
                    // the newest ticks are motion blurred
                    const blur = edge < 3 ? (3 - edge) * 0.8 : 0;

                    g.roundRect(x - 2.5, 36, 5, 38, 2.5).fill({ gradient: ticks, blur });
                } else g.roundRect(x - 2.5, 36, 5, 38, 2.5).fill({ color: 0x3a3a3c, alpha: 0.6 });
            }
            // stop button
            g.circle(150, 112, 17).fill(0x5a2408);
            g.roundRect(144, 106, 12, 12, 2.5).fill(C.orange);
            secs.text = `${Math.min(n, Math.floor(elapsed))}s`;
            atBaseline(secs, w - 24 - secs.width, 124);
        },
    };
}

/** Run cadence: bell of yellow bars, the current one white, controls below (image 4). */
export function cadence(): Widget {
    const w = 300;
    const h = 170;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    view.addChild(atBaseline(txt('24:15', 20, C.yellow, '600'), 22, 34));
    inlineRight(view, w - 22, 34, [
        [txt('1.8', 20, C.yellow, '600'), 2],
        [txt('MI', 11, C.yellow, '700'), 0],
    ]);
    const g = new SilkGraphics();

    view.addChild(g);
    const n = 34;

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            const cur = Math.floor((t * 2) % n);

            for (let i = 0; i < n; i++) {
                const u = (i - n / 2) / (n / 2.6);
                const hh = 10 + 46 * Math.exp(-u * u) + Math.sin(i * 1.9 + t) * 3;
                const x = 22 + i * ((w - 44) / (n - 1));
                const color = i === cur ? 0xffffff : i < cur ? C.yellow : 0x5c4f00;

                g.pill(x - 2.3, 104 - hh, 4.6, hh).fill(color);
            }
            const btn = (cx: number, draw: () => void) => {
                g.pill(cx - 38, 118, 76, 36).fill(0x4d4000);
                draw();
            };

            btn(60, () => {
                g.line(53, 129, 67, 143).stroke({ width: 3, color: C.yellow, cap: 'round' });
                g.line(67, 129, 53, 143).stroke({ width: 3, color: C.yellow, cap: 'round' });
            });
            g.roundRect(143, 125, 5, 22, 2).fill(C.yellow);
            g.roundRect(152, 125, 5, 22, 2).fill(C.yellow);
            btn(240, () => {
                g.circle(240, 136, 8).stroke({ width: 2.4, color: C.yellow });
                g.circle(240, 136, 2.6).fill(C.yellow);
            });
        },
    };
}

// ------------------------------------------------------------------------------------ sky

/** Now / Sunset / Dusk gradient pills (image 4). */
export function sunsetPills(): Widget {
    const w = 330;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    const g = new SilkGraphics();

    view.addChild(g);
    const cols = [
        { x: 22, w: 118, top: 'Now', bottom: '5:50 PM' },
        { x: 146, w: 70, top: 'Sunset', bottom: 'in 57m' },
        { x: 222, w: 86, top: 'Dusk', bottom: '8:12' },
    ];

    cols.forEach((c, i) => {
        const a = txt(c.top, 12, i ? C.muted : C.text, '600');
        const b = txt(c.bottom, 12, i ? C.muted : C.text, '600');

        a.position.set(i ? c.x + c.w / 2 - a.width / 2 : c.x + 4, 22);
        b.position.set(i ? c.x + c.w / 2 - b.width / 2 : c.x + 4, 104);
        view.addChild(a, b);
    });
    const r = rng(4);
    const stars = Array.from({ length: 7 }, () => [r(), r(), 0.5 + r()]);

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            g.pill(22, 46, 118, 50).fill(horizontal([0x4f9dff, 0x8ec5ff, 0xdfeeff]));
            g.pill(146, 46, 70, 50).fill(horizontal([0xffc38a, 0xff8a4c, 0xff6a6a]));
            g.pill(222, 46, 86, 50).fill(horizontal([0xff6a8e, 0xa05bd6, 0x2b2f7a]));
            // the sun rides along the "now" pill
            const sx = 48 + (0.5 + 0.5 * Math.sin(t * 0.4)) * 66;

            g.circle(sx, 71, 14).fill({ color: 0xffffff, blur: 6, alpha: 0.8 });
            g.circle(sx, 71, 12).fill(0xffffff);
            for (const [u, v, k] of stars) {
                const tw = 0.5 + 0.5 * Math.sin(t * 2 * k + u * 9);

                g.star(260 + u * 40, 56 + v * 30, 4, 2.6 * k, 0.9 * k).fill({
                    color: 0xffffff,
                    alpha: 0.35 + 0.65 * tw,
                });
            }
        },
    };
}

/** Golden hour: descending glow curve with a gradient and a trailing fade (image 2). */
export function goldenHour(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    view.addChild(atBaseline(txt('18:43 - 19:41', 18, C.text, '700'), 18, 32));
    const gl = txt('GOLDEN\nHOUR', 12, C.text, '700');

    gl.style.align = 'right';
    gl.position.set(w - 18 - gl.width, 16);
    view.addChild(gl);
    inline(view, 40, 134, [
        [txt('17%', 13, C.text, '600'), 26],
        [txt('0%', 13, C.text, '600'), 0],
    ]);
    const g = new SilkGraphics();

    view.addChild(g);
    const curve = monotoneX([18, 66, 90, 72, 150, 86, 200, 104, 250, 116, 300, 118], 1.5);
    const paint = along(
        [
            [0, 0xffb14a, 0],
            [0.25, 0xff9f0a],
            [0.7, 0xbf5af2],
            [1, 0x5e5ce6],
        ],
        { easing: 'smooth' },
    );

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            g.circle(120, 70, 60).fill({
                gradient: radial([
                    [0, 0x6b5bd6, 0.28],
                    [1, 0x6b5bd6, 0],
                ]),
                blur: 10,
            });
            g.line(18, 108, w - 18, 108).stroke({ width: 1, color: 0xffffff, alpha: 0.35 });
            g.polyline(curve).stroke({ width: 8, gradient: paint, cap: 'round', blur: 4, alpha: 0.6 });
            g.polyline(curve).stroke({ width: 4, gradient: paint, cap: 'round' });
            // location arrow bobbing at the end
            const bob = Math.sin(t * 2) * 1.5;

            g.save()
                .translateTransform(306, 118 + bob)
                .rotateTransform(0.8);
            g.triangle(-5, 6, 0, -7, 5, 6, 0.8).fill(0xffffff);
            g.restore();
            // weather glyphs
            g.circle(24, 128, 4).fill(C.text);
            g.circle(29, 126, 5).fill(C.text);
            g.roundRect(20, 128, 16, 5, 2.5).fill(C.text);
            g.circle(78, 128, 3.5).fill(C.text);
            g.triangle(74.8, 127, 81.2, 127, 78, 121.5, 0.4).fill(C.text);
        },
    };
}

/** Daylight bar with two sun markers (image 3). */
export function daylight(): Widget {
    const w = 340;
    const h = 120;
    const view = new Container();

    view.addChild(card(w, h, 22));
    inline(view, 42, 30, [
        [txt('19:52', 17, C.orange, '700'), 6],
        [txt('GOLDEN TIME', 12, C.orange, '700'), 0],
    ]);
    inline(view, 18, 94, [[txt('05:33', 12, C.text, '700'), 0]]);
    inlineRight(view, w - 18, 94, [[txt('20:40', 12, C.orange, '700'), 0]]);
    inline(view, 18, 112, [[txt('DAYLIGHT', 12, C.text, '700'), 0]]);
    inlineRight(view, w - 18, 112, [[txt('15HRS 8MIN', 12, C.text, '700'), 0]]);
    const g = new SilkGraphics();

    view.addChild(g);

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            // sun glyph
            g.circle(26, 24, 5).fill(C.orange);
            g.circle(26, 24, 9).stroke({ width: 2, color: C.orange, dash: [2, 3.1], cap: 'round' });
            g.pill(18, 50, w - 36, 12).fill(horizontal([0x9ec9ff, 0x7fb2ff, 0xa5c8ff, 0xffa24c]));
            const p = 0.65 + Math.sin(t * 0.3) * 0.05;
            const x = 18 + (w - 36) * p;

            g.circle(x, 56, 11).fill({ color: 0xffffff, blur: 6, alpha: 0.6 });
            g.circle(x, 56, 5).fill(0xffffff);
            g.circle(w - 30, 56, 6)
                .fill(0x1c1c1e)
                .stroke({ width: 3, color: C.orange });
        },
    };
}
