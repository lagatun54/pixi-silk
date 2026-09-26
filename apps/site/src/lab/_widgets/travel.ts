import { Container } from 'pixi.js';
import { catmullRom, horizontal, linear, SilkGraphics } from 'pixi-silk';
import { atBaseline, C, card, inlineRight, txt, type Widget } from './common';

/** Airplane glyph pointing right, centred on 0,0 (draw inside a transform). */
function plane(g: SilkGraphics, color: number): void {
    g.pill(-9, -2, 20, 4).fill(color);
    g.triangle(-1, -1, 4, -1, -4, -10, 1).fill(color);
    g.triangle(-1, 1, 4, 1, -4, 10, 1).fill(color);
    g.triangle(-9, -1, -5, -1, -10, -5, 0.6).fill(color);
    g.triangle(-9, 1, -5, 1, -10, 5, 0.6).fill(color);
}

/** SFO → YEG: gradient progress with a plane riding it (image 4). */
export function flight(): Widget {
    const w = 300;
    const h = 130;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    view.addChild(atBaseline(txt('San Francisco', 12, C.text, '500'), 22, 30));
    inlineRight(view, w - 22, 30, [[txt('Edmonton', 12, C.text, '500'), 0]]);
    view.addChild(atBaseline(txt('SFO', 26, C.text, '500'), 22, 64));
    inlineRight(view, w - 22, 64, [[txt('YEG', 26, C.text, '500'), 0]]);
    view.addChild(atBaseline(txt('9:59 PM', 12, C.text, '600'), 22, 104));
    inlineRight(view, w - 22, 104, [[txt('12:59 AM', 12, C.text, '600'), 0]]);
    const arrives = txt('Arrives in 47m', 12, 0x40e0d0, '600');

    view.addChild(arrives);
    arrives.position.set(w / 2 - arrives.width / 2, 92);
    const g = new SilkGraphics();

    view.addChild(g);
    const x0 = 86;
    const x1 = w - 86;

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            const p = 0.15 + 0.8 * (0.5 - 0.5 * Math.cos(t * 0.35));
            const px = x0 + (x1 - x0) * p;

            g.clear();
            g.pill(x0, 51, x1 - x0, 9).fill(0x0f3b3b);
            g.pill(x0, 51, px - x0, 9).fill(horizontal([0x0a6e6e, 0x40e0d0, 0xb6fff6]));
            g.circle(px, 55.5, 13).fill({ color: 0x40e0d0, blur: 6, alpha: 0.35 });
            g.save().translateTransform(px + 2, 55.5);
            plane(g, 0xffffff);
            g.restore();
        },
    };
}

/** Train line with stations and the current position (image 4). */
export function train(): Widget {
    const w = 300;
    const h = 96;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    const names = ['Harajuku', 'Shibuya', 'Ebisu'];
    const xs = [42, 150, 258];

    names.forEach((s, i) => {
        const t = txt(s, 13, 0x9be15d, '600');

        t.position.set(xs[i] - t.width / 2, 58);
        view.addChild(t);
    });
    const g = new SilkGraphics();

    view.addChild(g);

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            const p = (t * 0.08) % 1;
            const x = xs[0] + (xs[2] - xs[0]) * p;

            g.clear();
            g.pill(22, 30, w - 44, 16).fill(0x2a4a12);
            g.pill(22, 30, Math.max(16, x - 22 + 8), 16).fill(horizontal([0x9be15d, 0xc6ff7a]));
            xs.forEach((sx) => {
                g.circle(sx, 38, 5).fill(sx <= x ? 0x1c3a0a : 0x9be15d);
            });
            g.circle(x, 38, 8).fill(0xffffff).stroke({ width: 3, color: 0x9be15d, alignment: 'outside' });
        },
    };
}

/** Delivery status with a tiny map and a route polyline (image 4). */
export function delivery(): Widget {
    const w = 300;
    const h = 130;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    view.addChild(atBaseline(txt('STATUS', 11, 0x64e8a5, '700'), 22, 30));
    view.addChild(atBaseline(txt('Out for delivery', 19, 0x64e8a5, '600'), 22, 54));
    view.addChild(atBaseline(txt('ETA', 11, C.text, '700'), 22, 84));
    view.addChild(atBaseline(txt('15-30 min', 19, C.text, '600'), 22, 108));
    const g = new SilkGraphics();

    view.addChild(g);
    const mx = w - 118;
    const my = 16;
    const ms = 98;
    const route = catmullRom(
        [mx + 26, my + 20, mx + 26, my + 50, mx + 52, my + 52, mx + 56, my + 76, mx + 76, my + 80],
        false,
        1.5,
    );
    const lens: number[] = [0];

    for (let i = 2; i < route.length; i += 2)
        lens.push(lens[lens.length - 1] + Math.hypot(route[i] - route[i - 2], route[i + 1] - route[i - 1]));

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            g.roundRect(mx, my, ms, ms, 18, 0.6).fill(0x0f3d2e);
            for (let i = 1; i < 4; i++) {
                g.line(mx + i * 24, my, mx + i * 24 + 6, my + ms).stroke({ width: 3, color: 0x1a5a44 });
                g.line(mx, my + i * 24, mx + ms, my + i * 24 - 4).stroke({ width: 3, color: 0x1a5a44 });
            }
            g.polyline(route).stroke({ width: 4, color: 0x64e8a5, cap: 'round' });
            // van position along the route by arc length
            const total = lens[lens.length - 1];
            const d = (t * 12) % total;
            let k = 1;

            while (k < lens.length - 1 && lens[k] < d) k++;
            const u = (d - lens[k - 1]) / (lens[k] - lens[k - 1] || 1);
            const vx = route[(k - 1) * 2] + (route[k * 2] - route[(k - 1) * 2]) * u;
            const vy = route[(k - 1) * 2 + 1] + (route[k * 2 + 1] - route[(k - 1) * 2 + 1]) * u;

            g.roundRect(route[0] - 8, route[1] - 8, 16, 16, 5).fill(0xffffff);
            g.circle(route[route.length - 2], route[route.length - 1], 5)
                .fill(0x64e8a5)
                .stroke({ width: 2.5, color: 0x0f3d2e, alignment: 'outside' });
            g.circle(vx, vy, 5).fill(0xffffff);
        },
    };
}

/** Ride pickup: purple progress with stop nodes (image 4). */
export function pickup(): Widget {
    const w = 300;
    const h = 130;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    view.addChild(atBaseline(txt('Picking up order', 13, 0xc58bff, '600'), 22, 30));
    inlineRight(view, w - 22, 30, [[txt('ETA 5:50', 13, 0xc58bff, '600'), 0]]);
    view.addChild(atBaseline(txt('Dave', 14, C.text, '600'), 58, 104));
    const g = new SilkGraphics();

    view.addChild(g);

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            const p = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.5));
            const x0 = 26;
            const x1 = w - 26;

            g.clear();
            g.pill(x0 - 8, 42, x1 - x0 + 16, 22).fill(0x3a2359);
            g.pill(x0 - 8, 42, (x1 - x0) * p + 16, 22).fill(linear([0x8e4de0, 0xc58bff], { from: [0, 0], to: [1, 0] }));
            [0, 0.5, 1].forEach((u) => {
                const x = x0 + (x1 - x0) * u;

                g.circle(x, 53, 9).fill(u <= p ? 0xe6d0ff : 0x6a4a94);
            });
            // avatar + two action buttons
            g.circle(38, 99, 14).fill(linear([0xffc38a, 0xff8a4c], { from: [0, 0], to: [1, 1] }));
            g.pill(w - 128, 84, 50, 30).fill(0x2c2c2e);
            g.pill(w - 72, 84, 50, 30).fill(0x2c2c2e);
            g.roundRect(w - 110, 92, 14, 14, 4).stroke({ width: 2, color: C.text });
            g.roundRect(w - 55, 92, 16, 12, 5).fill(C.text);
        },
    };
}

/** Race track outline as a closed smooth path, a car running laps (image 4). */
export function raceTrack(): Widget {
    const w = 300;
    const h = 150;
    const view = new Container();

    view.addChild(card(w, h, 34, 0x000000));
    const lapTimes = [
        ['Lap 5', ''],
        ['Lap 4', '1:16:36'],
        ['Lap 3', '1:17:24'],
        ['Lap 2', '1:18:15'],
    ];

    lapTimes.forEach(([a, b], i) => {
        const y = 32 + i * 24;

        inlineRight(view, w - 22, y, [
            [txt(a, 13, 0xff5a4f, '600'), 14],
            [txt(b, 13, 0xff5a4f, '600'), 0],
        ]);
    });
    view.addChild(atBaseline(txt('Sector 2', 13, 0xff5a4f, '600'), 22, 134));
    const g = new SilkGraphics();

    view.addChild(g);
    const ctrl = [30, 40, 60, 24, 90, 30, 100, 56, 132, 62, 140, 90, 118, 108, 80, 100, 56, 112, 34, 96, 40, 70];
    const loop = catmullRom(ctrl, true, 1.5);
    const n = loop.length / 2;

    return {
        view,
        width: w,
        height: h,
        tick(_dt, t) {
            g.clear();
            g.polyline(loop, { closed: true }).stroke({ width: 7, color: 0x5a1512, cap: 'round' });
            g.polyline(loop, { closed: true }).stroke({ width: 3, color: 0xff5a4f, cap: 'round' });
            const i = Math.floor((t * 22) % n);

            g.circle(loop[i * 2], loop[i * 2 + 1], 4.5).fill(0xffffff);
        },
    };
}
