import { Container } from 'pixi.js';
import { conic, horizontal, radial, SilkGraphics, Spring } from 'pixi-silk';
import { atBaseline, C, card, inline, inlineRight, txt, type Widget } from './common';

const PI = Math.PI;

/** "ISS Flyover": wide arc, visible pass window, fading view cone, moving station. */
export function issFlyover(): Widget {
    const w = 300;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    view.addChild(atBaseline(txt('ISS Flyover', 14, C.text, '500'), 22, 32));
    const eta = txt('in 15 min', 14, 0x6ad3ff, '500');

    view.addChild(atBaseline(eta, w - 22 - eta.width, 32));
    const g = new SilkGraphics();

    view.addChild(g);
    const cx = 150;
    const cy = 172;
    const r = 104;
    const a0 = PI * 1.13;
    const a1 = PI * 1.87;
    const win0 = PI * 1.4;
    const win1 = PI * 1.6;

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            // view cone: a slice whose radial gradient fades towards the observer below the card;
            // the inner radius starts it at the card's bottom edge instead of spilling past it
            const inner = (cy - h) / Math.cos((win1 - win0) / 2);

            g.sector(cx, cy, r, win0, win1, inner).fill(
                radial(
                    [
                        [0, 0x0b2a4a, 0],
                        [1, 0x2f7de0, 0.55],
                    ],
                    { units: 'local', center: [cx, cy], radius: r },
                ),
            );
            g.arc(cx, cy, r, a0, a1).stroke({
                width: 18,
                cap: 'round',
                gradient: conic([0x1f4f9a, 0x2f7de0, 0x1f4f9a], { startAngle: a0, sweep: a1 - a0 }),
            });
            g.arc(cx, cy, r, win0, win1).stroke({ width: 18, cap: 'round', color: 0x7fdcff, blur: 6, alpha: 0.6 });
            g.arc(cx, cy, r, win0, win1).stroke({ width: 18, cap: 'round', color: 0x6ad3ff });
            // the station flies along the arc in a frame rotated to the track: modules along the
            // direction of flight, solar arrays across it (like the real ISS); it fades in and out
            // at the horizon so the loop never jumps
            const u = (t * 0.06) % 1;
            const a = a0 + (a1 - a0) * u;
            const alpha = Math.min(1, u / 0.06, (1 - u) / 0.06);

            g.save()
                .translateTransform(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                .rotateTransform(a);
            g.circle(0, 0, 13).fill({ color: 0x000000, alpha: 0.5 * alpha, blur: 5 });
            g.roundRect(-3.5, -5, 7, 10, 2).fill({ color: 0xffffff, alpha });
            g.roundRect(-15, -2.5, 9, 5, 1).fill({ color: 0xffffff, alpha });
            g.roundRect(6, -2.5, 9, 5, 1).fill({ color: 0xffffff, alpha });
            g.restore();
        },
    };
}

/** Car battery: ring gauge, range pill and a charging history histogram. */
export function carBattery(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    view.addChild(atBaseline(txt('Tesla Model 3', 16, C.text, '600'), 18, 32));
    const ago = txt('17M AGO', 11, C.muted, '600', { letterSpacing: 0.4 });

    view.addChild(atBaseline(ago, w - 18 - ago.width, 30));
    const g = new SilkGraphics();

    view.addChild(g);
    const pct = txt('60%', 17, C.text, '700');

    view.addChild(pct);
    const range = txt('256 mi', 12, 0x000000, '700');

    view.addChild(range);
    const small = [txt('100%', 10, C.muted, '600'), txt('10AM TO NOW', 10, C.muted, '600')];

    view.addChild(...small);
    const bars = Array.from({ length: 34 }, (_, i) => 0.2 + 0.55 * (i / 33) + Math.sin(i * 1.7) * 0.06);
    const spring = new Spring(0, 40, 12);

    spring.target = 0.6;

    return {
        view,
        width: w,
        height: h,
        tick(dt, t) {
            const p = spring.step(dt);

            g.clear();
            const cx = 62;
            const cy = 92;

            g.circle(cx, cy, 36).stroke({ width: 8, color: 0x1f3a24 });
            g.arcSweep(cx, cy, 36, -PI / 2, PI * 2 * p).stroke({ width: 8, cap: 'round', color: C.green });
            // bolt badge on the ring
            g.circle(cx, cy - 36, 9).fill(0x1c1c1e);
            g.triangle(cx + 2, cy - 43, cx - 4, cy - 35, cx + 1, cy - 35, 0.4).fill(C.green);
            g.triangle(cx - 1, cy - 37, cx + 4, cy - 37, cx - 2, cy - 29, 0.4).fill(C.green);
            pct.position.set(cx - pct.width / 2, cy - 13);
            // range pill
            g.pill(cx - 30, cy + 26, 60, 20).fill(0xffffff);
            range.position.set(cx - range.width / 2, cy + 29);
            // histogram
            const x0 = 128;
            const x1 = w - 18;
            const bw = (x1 - x0) / bars.length - 2;

            bars.forEach((b, i) => {
                const pulse = i === bars.length - 1 ? 0.5 + 0.5 * Math.sin(t * 3) : 1;
                const hh = 62 * b;

                g.roundRect(x0 + i * (bw + 2), 118 - hh, bw, hh, 1.2).fill({
                    color: C.green,
                    alpha: (0.35 + 0.65 * (i / bars.length)) * pulse,
                });
            });
            g.line(x0, 52, x1, 52).stroke({ width: 1, color: 0xffffff, alpha: 0.25, dash: [0, 3.2], cap: 'round' });
            small[0].position.set(x1 - small[0].width, 38);
            small[1].position.set(x1 - small[1].width, 124);
        },
    };
}

/** Heading gauge with ticks, numbers, a red pointer and a value pill. */
export function heading(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    inline(view, 18, 32, [
        [txt('~135°', 19, C.red, '700'), 5],
        [txt('SE', 19, C.text, '700'), 0],
    ]);
    inlineRight(view, w - 18, 32, [
        [txt('128', 19, C.red, '700'), 3],
        [txt('M', 12, C.red, '700'), 3],
        [txt('elev', 19, C.text, '700'), 0],
    ]);
    const g = new SilkGraphics();

    view.addChild(g);
    const cx = w / 2;
    const cy = 176;
    const r = 112;
    const nums = [90, 120, 150, 180].map((n) => txt(String(n), 11, C.muted, '600'));

    view.addChild(...nums);
    const pill = txt('75°', 13, 0xffffff, '700');

    view.addChild(pill);
    const needle = new Spring(PI * 1.5, 30, 9);
    const s0 = PI * 1.16;
    const sw = PI * 0.68;

    return {
        view,
        width: w,
        height: h,
        tick(dt, t) {
            needle.target = PI * 1.5 + Math.sin(t * 0.5) * 0.3;
            const a = needle.step(dt);

            g.clear();
            // minor and major ticks: dashes on arcs
            g.arcSweep(cx, cy, r - 6, s0, sw).stroke({ width: 8, color: 0xffffff, alpha: 0.35, dash: [1.2, 4.6] });
            g.arcSweep(cx, cy, r - 9, s0, sw).stroke({
                width: 14,
                color: 0xffffff,
                alpha: 0.9,
                dash: [2, (sw * (r - 9)) / 12 - 2],
            });
            g.arcSweep(cx, cy, r + 2, s0, a - s0).stroke({ width: 3, color: C.red, cap: 'round' });
            nums.forEach((n, i) => {
                const na = s0 + sw * ((i + 0.5) / 4);

                n.position.set(cx + Math.cos(na) * (r - 32) - n.width / 2, cy + Math.sin(na) * (r - 32) - n.height / 2);
            });
            // pointer triangle (drawn in a rotated frame) and value pill
            g.save()
                .translateTransform(cx + Math.cos(a) * (r + 4), cy + Math.sin(a) * (r + 4))
                .rotateTransform(a + PI / 2);
            g.triangle(-6, -9, 6, -9, 0, 2, 1).fill(C.red);
            g.restore();
            g.pill(cx - 22, 116, 44, 22).fill(C.red);
            pill.position.set(cx - pill.width / 2, 119);
        },
    };
}

/** Barometer: dots on an arc, the current one lit, a trend arrow. */
export function barometer(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    view.addChild(atBaseline(txt('1,012', 24, C.text, '700'), 22, 76));
    view.addChild(atBaseline(txt('hPa', 13, C.muted, '600'), 38, 96));
    const rising = txt('Rising', 16, C.purple, '700');

    view.addChild(atBaseline(rising, 250, 104));
    const low = txt('LOW', 10, C.muted, '600');
    const high = txt('HIGH', 10, C.muted, '600');

    view.addChild(low, high);
    const g = new SilkGraphics();

    view.addChild(g);
    const cx = 170;
    const cy = 84;
    const r = 44;

    low.position.set(cx - 50, 122);
    high.position.set(cx + 28, 122);

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            const n = 13;
            const lit = Math.round(6 + Math.sin(t * 0.7) * 3);

            for (let i = 0; i < n; i++) {
                const a = PI * 0.75 + (i / (n - 1)) * PI * 1.5;
                const x = cx + Math.cos(a) * r;
                const y = cy + Math.sin(a) * r;

                if (i === lit) {
                    g.circle(x, y, 7).fill({ color: C.purple, blur: 4, alpha: 0.7 });
                    g.circle(x, y, 5).fill(0xd6a4ff);
                } else g.circle(x, y, 3.4).fill(i < lit ? 0x6e6e73 : 0x3a3a3c);
            }
            g.line(cx, cy + 12, cx, cy - 12).stroke({ width: 3, color: C.text, cap: 'round' });
            g.polyline([cx - 7, cy - 5, cx, cy - 12, cx + 7, cy - 5]).stroke({ width: 3, color: C.text, cap: 'round' });
            // gauge icon next to "Rising"
            g.circle(270, 56, 13).stroke({ width: 2.2, color: C.purple });
            g.arcSweep(270, 58, 7, PI * 1.1, PI * 0.8).stroke({ width: 2, color: C.purple, cap: 'round' });
            g.line(270, 58, 275, 52).stroke({ width: 2, color: C.purple, cap: 'round' });
        },
    };
}

/** UV index week: pill tracks with a colored level and dots. */
export function uvWeek(): Widget {
    const w = 340;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 22));
    inline(view, 18, 32, [
        [txt('UVI 5', 17, C.green, '700'), 8],
        [txt('MODERATE', 17, C.text, '700'), 0],
    ]);
    const days = ['S', 'S', 'M', 'T', 'W', 'T', 'F'];
    const labels = days.map((d, i) => {
        const l = txt(d, 11, i === 0 ? C.text : C.muted, '700');

        view.addChild(l);

        return l;
    });
    const g = new SilkGraphics();

    view.addChild(g);
    const levels = [0.55, 0.72, 0.4, 0.8, 0.62, 0.7, 0.66];
    const colors = [C.green, C.green, C.orange, C.orange, C.green, C.orange, C.green];

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            days.forEach((_d, i) => {
                const x = 40 + i * 43;
                const lvl = levels[i] + Math.sin(t * 0.8 + i) * 0.05;

                g.pill(x - 5, 46, 10, 72).fill(0x2c2c2e);
                g.pill(x - 5, 46 + 72 * (1 - lvl), 10, 72 * lvl).fill(colors[i]);
                if (i === 0) g.circle(x, 46 + 72 * (1 - lvl) + 5, 3).fill(0xffffff);
                labels[i].position.set(x - labels[i].width / 2, 124);
            });
            g.line(20, 82, w - 20, 82).stroke({ width: 1, color: 0xffffff, alpha: 0.18, dash: [0, 3.2], cap: 'round' });
        },
    };
}

/** Accent lamp: dimmer pill with a knob (image 3). */
export function lampDimmer(): Widget {
    const w = 340;
    const h = 110;
    const view = new Container();

    view.addChild(card(w, h, 22));
    inline(view, 18, 30, [[txt('Accent Lamp', 17, C.orange, '700'), 0]]);
    const room = txt('BEDROOM', 11, C.muted, '600', { letterSpacing: 0.5 });

    view.addChild(atBaseline(room, w - 18 - room.width, 29));
    const g = new SilkGraphics();
    const pct = txt('64%', 13, 0x000000, '700');

    view.addChild(g, pct);
    const spring = new Spring(0.2, 60, 14);

    return {
        view,
        width: w,
        height: h,
        tick(dt, t) {
            spring.target = 0.64 + Math.sin(t * 0.6) * 0.18;
            const v = spring.step(dt);
            const x0 = 18;
            const tw = w - 90;

            g.clear();
            g.roundRect(x0, 46, tw, 34, 9).fill(0x2c2c2e);
            g.roundRect(x0, 46, tw * v, 34, 9).fill(horizontal([0xff8a00, 0xffb340]));
            g.circle(w - 40, 63, 20).fill({ color: C.orange, blur: 5, alpha: 0.35 });
            g.circle(w - 40, 63, 17)
                .fill(0xffb340)
                .stroke({ width: 3, color: 0x000000, alignment: 'inside', alpha: 0.35 });
            pct.text = `${Math.round(v * 100)}%`;
            pct.position.set(x0 + 10, 55);
        },
    };
}
