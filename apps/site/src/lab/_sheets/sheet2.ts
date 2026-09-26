import { along, linear, radial, vertical } from 'pixi-silk';
import type { Cx, SheetWidget } from './cx';
import * as I from './icons';

/*
 * Reference sheet 2 (1200×900): twenty watch complications. Every widget is drawn in
 * reference pixels relative to its grid origin; numbers were measured on the image.
 */

const PI = Math.PI;
const W = 0xffffff;
const GRAY = 0x8e8e93;
const DIM = 0x48484a;
const XS = [104, 370, 637, 904];
const YS = [114, 259, 410, 556, 705];

const wave = (x: number, t: number, k = 1) => Math.sin(x * 0.13 * k + t);
/** Oscillation that is exactly 0 at t = 3 (the reference frame), so snapshots match the sheet. */
const osc = (t: number, f: number, ph = 0) => Math.sin((t - 3) * f + ph) - Math.sin(ph);

// ------------------------------------------------------------------------------------ row 1

function zones(c: Cx): void {
    const { g } = c;
    const lv = [57, 45.7, 33, 20.7, 9];

    ['1', '2', '3', '4', '5'].forEach((s, i) => c.text(s, 0, lv[i] + 4.3, { size: 12.5, weight: '600' }));
    for (const y of [2.3, 20.7, 33, 45.7, 64.7]) g.line(17, y, 189, y).stroke({ width: 1, color: 0x3a3a3c });
    g.line(17, 2.3, 17, 64.7).stroke({ width: 1, color: 0x3a3a3c });
    g.line(189, 2.3, 189, 64.7).stroke({ width: 1, color: 0x3a3a3c });
    for (const x of [74, 131]) g.line(x, 2.3, x, 64.7).stroke({ width: 1, color: 0x3a3a3c, dash: [2, 2] });
    c.text('>178 BPM', 23, 12, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    c.text('<140 BPM', 186, 62, { size: 11.5, color: 0xd1d1d6, weight: '500', align: 'right' });
    const pts = [
        17, 57, 52, 57, 62, 45.7, 74, 45.7, 85.7, 33, 100.7, 33, 109, 20.7, 124, 20.7, 135.7, 33, 145.7, 33, 159, 9,
        174, 45.7, 189, 45.7,
    ];
    const phase = ((((c.t - 3) * 0.18) % 1.6) + 1.6) % 1.6;
    const reveal = phase < 0.6 ? 1 : phase - 0.6;
    const n = Math.max(2, Math.round((pts.length / 2) * reveal));

    g.polyline(pts.slice(0, n * 2), { smooth: 'monotone', step: 1 }).stroke({
        width: 2.3,
        cap: 'round',
        gradient: linear(
            [
                [0, 0x2f8bff],
                [0.24, 0x2fd67a],
                [0.5, 0xc2e534],
                [0.76, 0xff8f1f],
                [1, 0xff2d55],
            ],
            { units: 'local', from: [0, 57], to: [0, 9] },
        ),
    });
    if (n * 2 >= pts.length) g.circle(189, 45.7, 2.3).fill(W);
    c.text('15m', 17, 80.5, { size: 12, color: GRAY, weight: '500' });
    c.text('25m', 76, 80.5, { size: 12, color: GRAY, weight: '500' });
    c.text('35m', 134, 80.5, { size: 12, color: GRAY, weight: '500' });
    c.text('NOW', 166, 80.5, { size: 12, weight: '600' });
}

function totalTime(c: Cx): void {
    const { g } = c;

    I.clockFilled(g, 6, 10.5, 12.5);
    c.run(17, 16.5, [
        ['13', 17, W, '600', 1],
        ['H', 11.5, W, '600', 5],
        ['47', 17, W, '600', 1],
        ['M', 11.5, W, '600'],
    ]);
    c.text('TOTAL TIME', 193, 16, { size: 12, color: GRAY, weight: '500', align: 'right' });
    I.cup(g, 6.5, 26.5, 12.5, 0x98989d);
    I.book(g, 6.5, 44, 12.5, 0x6461e0);
    I.runner(g, 6.5, 60.5, 13.5, 0x1fd47f);
    c.text('30%', 55, 31, { size: 13, color: GRAY, weight: '500', align: 'right' });
    c.text('40%', 55, 48.5, { size: 13, color: 0x6461e0, weight: '500', align: 'right' });
    c.text('60%', 55, 65, { size: 13, color: 0x1fd47f, weight: '500', align: 'right' });
    for (let i = 0; i < 8; i++) g.line(58.5 + i * 19.2, 21, 58.5 + i * 19.2, 86).stroke({ width: 1, color: 0x1f2a24 });
    const rows: [number[], number][] = [
        [[0, 0, 1, 0, 1, 1, 0], 0x98989d],
        [[1, 0, 0, 1, 1, 1, 0], 0x6461e0],
        [[1, 1, 1, 0, 1, 0, 0], 0x1fd47f],
    ];
    const ys = [26.5, 44, 60.5];

    rows.forEach(([row, color], r) =>
        row.forEach((on, i) => {
            const x = 67.7 + i * 19.2;

            if (on) g.roundRect(x - 3.1, ys[r] - 3.1, 6.2, 6.2, 1.5).fill(color);
            else g.roundRect(x - 2.7, ys[r] - 2.7, 5.4, 5.4, 1.3).stroke({ width: 0.9, color: 0x6e6e73 });
        }),
    );
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) =>
        c.text(d, 67.7 + i * 19.2, 80.5, { size: 12, color: GRAY, weight: '500', align: 'center' }),
    );
}

function network(c: Cx): void {
    const { g } = c;
    const blue = 0x6a67f5;
    const pink = 0xc56cf0;

    I.arrow(g, 4.5, 10.5, 12, blue, 'down', 0.14);
    let x = c.run(12, 16.5, [
        ['522', 17, W, '600', 3],
        ['Mbps', 12, GRAY, '500'],
    ]);

    I.arrow(g, x + 8, 10.5, 12, pink, 'up', 0.14);
    x = c.run(x + 15, 16.5, [
        ['32', 17, W, '600', 3],
        ['Mbps', 12, GRAY, '500'],
    ]);
    c.text('600', 0, 31.5, { size: 12, color: GRAY, weight: '500' });
    c.text('0', 0, 50, { size: 12, color: GRAY, weight: '500' });
    g.rect(31, 22, 163, 46).fill(
        vertical(
            [
                [0, 0x2a1a5a, 0],
                [0.45, 0x3b2170, 0.75],
                [0.7, 0x301a5a, 0.5],
                [1, 0x2a1a5a, 0],
            ],
            { easing: 'smooth' },
        ),
    );
    for (let i = 0; i < 24; i++) {
        const cx = 31 + i * 7;
        const top = 27 + wave(i, c.t * 1.3, 4) * 1.2;
        const bot = 46.2 + wave(i + 3, c.t * 1.1, 3) * 1.2;

        g.line(cx, top, cx, bot).stroke({
            width: 0.9,
            alpha: 0.75,
            gradient: linear([blue, pink], { units: 'local', from: [0, 27], to: [0, 46] }),
        });
        g.circle(cx, top, 1.7).fill(blue);
        g.circle(cx, bot, 1.7).fill(pink);
    }
    for (const lx of [31, 71, 113]) g.line(lx, 50, lx, 66).stroke({ width: 1, color: 0x3a3a3c });
    c.text('10m', 35, 63.5, { size: 12, color: 0x6e6e73, weight: '500' });
    c.text('20m', 75, 63.5, { size: 12, color: 0x6e6e73, weight: '500' });
    c.text('30m', 117, 63.5, { size: 12, color: 0x6e6e73, weight: '500' });
    c.text('NOW', 192, 63.5, { size: 12, weight: '600', align: 'right' });
    c.run(0, 83, [
        ['PING', 11.5, W, '600', 5],
        ['ms', 11.5, GRAY, '500'],
    ]);
    let rx = c.text('10', 193, 83, { size: 12, weight: '600', align: 'right' }).x;

    I.arrow(g, rx - 6, 78.5, 10, pink, 'up', 0.15);
    rx = c.text('34', rx - 13, 83, { size: 12, weight: '600', align: 'right' }).x;
    I.arrow(g, rx - 6, 78.5, 10, blue, 'down', 0.15);
    rx = c.text('16', rx - 13, 83, { size: 12, weight: '600', align: 'right' }).x;
    I.transfer(g, rx - 8, 78.5, 10, 0x30d158);
}

function home(c: Cx): void {
    const { g } = c;

    c.text('yuhang’s Home', 0, 16.5, { size: 17, weight: '600' });
    const cy = 52;
    const r = 24.5;
    const gap = 0.52;

    // fan: dark teal ring with a gap for the icon
    g.arcSweep(27.5, cy, r, -PI / 2 + gap, PI * 2 - gap * 2).stroke({ width: 6, color: 0x0f3b48, cap: 'round' });
    I.fan(g, 27.5, cy - r, 14, 0x22c3e6);
    c.text('23°', 29, cy + 5.5, { size: 15.5, weight: '500', align: 'center' });
    I.badge(g, 47.5, 71, 6.6, 0x38c6ee, 0x000000, 2);
    c.text('A', 47.5, 74.5, { size: 9.5, color: 0x000000, weight: '800', align: 'center' });
    // lamp: gray track, yellow level
    const lvl = 0.5 + 0.08 * Math.sin((c.t - 3) * 0.9);

    g.arcSweep(96, cy, r, -PI / 2 + gap, PI * 2 - gap * 2).stroke({ width: 6, color: 0x2c2c2e, cap: 'round' });
    g.arcSweep(96, cy, r, PI / 2 + 0.05, (PI - gap - 0.05) * (lvl / 0.5) - 0.12).stroke({
        width: 6,
        color: 0xffd23a,
        cap: 'round',
    });
    I.deskLamp(g, 96, cy - r - 1, 14.5, 0xffd23a);
    c.text(`${Math.round(lvl * 100)}%`, 96, cy + 5.5, { size: 15.5, weight: '500', align: 'center' });
    I.badge(g, 116, 71, 6.6, W, 0x000000, 2);
    c.text('6', 116, 74.5, { size: 9.5, color: 0x000000, weight: '800', align: 'center' });
    // lock
    g.circle(164.3, 51, 26).fill(0x1a5a55);
    I.lock(g, 164.3, 51, 21, 0x1ff3ec);
    I.badge(g, 184, 71, 6.6, W, 0x000000, 2);
    c.text('2', 184, 74.5, { size: 9.5, color: 0x000000, weight: '800', align: 'center' });
}

// ------------------------------------------------------------------------------------ row 2

function calendar(c: Cx): void {
    const { g } = c;

    g.roundRect(0, 1, 187, 24, 6).fill(0x242426);
    g.rect(136, 1, 25, 24).fill(0x3d3413);
    g.roundRect(161, 1, 26, 24, [0, 6, 6, 0]).fill(0x113a1e);
    c.text('ALL DAY EVENT', 6, 17.5, { size: 12.5, weight: '600' });
    c.text('2', 148.5, 18.5, { size: 15.5, color: 0xf5d04a, weight: '600', align: 'center' });
    c.text('3', 174, 18.5, { size: 15.5, color: 0x30d158, weight: '600', align: 'center' });
    for (let y = 9; y < 88; y += 5.4) g.line(191.5, y, 195, y).stroke({ width: 1, color: 0x6e6e73 });
    g.pill(137, 40, 50, 7).fill(0x4f4dc8);
    g.pill(137, 49, 50, 7).fill(0x4f4dc8);
    const ny = 46.7 + osc(c.t, 0.5) * 0.6;

    g.line(127, ny, 190, ny).stroke({ width: 1.6, color: 0xff3b30 });
    g.triangle(195, ny - 4, 195, ny + 4, 188, ny, 0.8).fill(0xff3b30);
    g.polyline([137.5, 89, 137.5, 83, 137.5, 81, 140, 79, 184, 79, 186.5, 81, 186.5, 83, 186.5, 89]).stroke({
        width: 1.8,
        color: 0x0a84ff,
    });
    g.circle(3, 37, 2.8).fill(0x5e5ce6);
    c.text('10:00', 12, 42.5, { size: 17, weight: '600' });
    c.text('1H', 126, 42.5, { size: 15, color: GRAY, weight: '500', align: 'right' });
    g.circle(3, 57.5, 2.4).stroke({ width: 1.3, color: 0x0a84ff });
    c.text('13:30', 12, 63, { size: 17, weight: '600' });
    c.text('1.5H', 126, 63, { size: 15, color: GRAY, weight: '500', align: 'right' });
    c.text('8 MORE EVENTS', 0, 81.5, { size: 12.5, color: GRAY, weight: '600' });
}

function sunAltitude(c: Cx): void {
    const { g } = c;
    let x = c.run(0, 16.5, [['10:07', 17, W, '600']]);

    I.circledArrow(g, x + 9, 10.5, 12.5, 'up');
    x = c.run(x + 18, 16.5, [['0°N', 17, W, '600']]);
    c.run(
        192,
        16.5,
        [
            ['ALTITUDE', 11.5, W, '500', 5],
            ['-56°', 17, W, '600'],
        ],
        'right',
    );
    g.rect(3, 28, 188, 44).fill(
        vertical([
            [0, 0x0a2a55, 0],
            [0.42, 0x0a2a55, 0.95],
            [0.6, 0x082347, 0.85],
            [1, 0x082347, 0],
        ]),
    );
    g.line(2.7, 24, 2.7, 86).stroke({ width: 1, color: 0x2a3140 });
    g.line(191, 24, 191, 86).stroke({ width: 1, color: 0x2a3140 });
    for (const vx of [49.3, 96, 142.7]) g.line(vx, 38, vx, 70).stroke({ width: 1, color: 0x2a3548 });
    g.line(2.7, 46.7, 191, 46.7).stroke({ width: 1.2, color: 0x9fb2cf });
    c.text('239° WSW', 7, 33.5, { size: 12, color: GRAY, weight: '500' });
    c.text('115° ESE', 187, 33.5, { size: 12, color: GRAY, weight: '500', align: 'right' });
    for (let i = 0; i <= 26; i++) {
        const dx = 29 + (i / 26) * 135;
        const u = (dx - 96.5) / 67.5;

        g.circle(dx, 68 - 25 * u * u, 0.95).fill(W);
    }
    c.text('SET · 02:08', 0, 84.5, { size: 12.5, weight: '600' });
    c.text('RISE · 17:45', 192, 84.5, { size: 12.5, weight: '600', align: 'right' });
}

function cardSpend(c: Cx): void {
    const { g } = c;

    I.creditCard(g, 6.5, 10.5, 11, W);
    c.text('$3,812', 17, 16.5, { size: 17, weight: '600' });
    c.text('**** 6753', 193, 16.5, { size: 15, color: GRAY, weight: '500', align: 'right' });
    I.transfer(g, 6, 30, 10, 0x98989d);
    I.suitcase(g, 6, 46.5, 11, 0x98989d);
    I.moreCircle(g, 6, 63, 11.5, 0x98989d);
    I.triangleDown(g, 6, 79.5, 9, 0x30d158);
    c.text('20%', 56, 34.5, { size: 13, color: GRAY, weight: '500', align: 'right' });
    c.text('16%', 56, 51, { size: 13, color: GRAY, weight: '500', align: 'right' });
    c.text('64%', 56, 68, { size: 13, color: GRAY, weight: '500', align: 'right' });
    c.text('$568', 56, 84.5, { size: 13, color: 0x30d158, weight: '600', align: 'right' });
    g.rect(64.7, 37, 128.3, 21).fill(
        vertical([
            [0, 0x0b2f60],
            [1, 0x0b2f60, 0],
        ]),
    );
    for (const vx of [64.7, 107.5, 150.3, 193])
        g.line(vx, 24, vx, 86).stroke({ width: 1, color: vx === 64.7 ? 0x3a3a3c : 0x222226 });
    c.text('$1.36K', 129, 34.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
    g.line(64.7, 56.3, 193, 56.3).stroke({ width: 1.1, color: 0x9be38a, alpha: 0.6, dash: [0, 2.6], cap: 'round' });
    const bars: [number, number][] = [
        [76.7, 60.7],
        [103, 47.3],
        [128.3, 62.3],
        [154.7, 42.3],
        [180.7, 64],
    ];

    bars.forEach(([bx, top], i) => {
        const h = (69 - top) * (1 + 0.08 * osc(c.t, 1.2, i));

        g.roundRect(bx - 5, 69 - h, 10, h, 2).fill(0x0a84ff);
    });
    c.text('1-7', 76, 84.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
    c.text('15-21', 130, 84.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
    c.text('29-30', 172, 84.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
}

function glucose(c: Cx): void {
    const { g } = c;

    I.drop(g, 5, 10.5, 13, 0xff3b30, true);
    const x = c.run(13, 16.5, [
        ['150', 17, W, '600', 4],
        ['mg/dL', 12.5, W, '600'],
    ]);

    I.circledArrow(g, x + 13, 10.5, 13, 'right');
    g.rect(0, 22.3, 193, 18.4).fill(0x2e2805);
    g.line(0, 40.7, 193, 40.7).stroke({ width: 1.3, color: 0xe6cf6e });
    g.rect(0, 59, 193, 10).fill(0x360b0b);
    g.line(0, 59, 193, 59).stroke({ width: 1.3, color: 0xd63a3a });
    for (const vx of [36.7, 73.7, 111]) g.line(vx, 22, vx, 86).stroke({ width: 1, color: 0x2c2c2e });
    c.text('240', 190, 36.5, { size: 13, color: 0xf5d04a, weight: '600', align: 'right' });
    c.text('40', 190, 54, { size: 13, color: 0xff453a, weight: '600', align: 'right' });
    for (let dx = 2; dx < 146; dx += 3.1) {
        const y = 50.3 + 1.4 * Math.sin(dx * 0.16 + c.t * 0.3) - 11.5 * Math.exp(-(((dx - 71) / 4.2) ** 2));

        g.circle(dx, y, 0.95).fill(y < 40.7 ? 0xf5d04a : W);
    }
    g.line(147, 22, 147, 84).stroke({ width: 1.6, color: W });
    c.text('1', 31, 84.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
    c.text('2', 68.7, 84.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
    c.text('3', 104.3, 84.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
    c.text('NOW', 131.7, 84.5, { size: 12.5, weight: '600', align: 'center' });
    c.text('hrs', 181, 84.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
}

// ------------------------------------------------------------------------------------ row 3

function goldenHour(c: Cx): void {
    const { g } = c;

    g.ellipse(96, 30, 52, 20).fill({
        gradient: radial([
            [0, 0x2b2152, 0.85],
            [1, 0x2b2152, 0],
        ]),
        blur: 6,
    });
    c.text('18:43 - 19:41', 0, 16.5, { size: 17, weight: '600' });
    c.text('GOLDEN', 192, 15.5, { size: 12.5, weight: '600', align: 'right' });
    c.text('HOUR', 192, 30.5, { size: 12.5, weight: '600', align: 'right' });
    g.line(0, 47.3, 192, 47.3).stroke({ width: 1, color: 0x48484a });
    const pts: number[] = [];

    for (let i = 0; i <= 40; i++) {
        const u = i / 40;

        pts.push(64 + 103 * u, 25.7 + 51 * (1 - (1 - u) ** 2.3));
    }
    g.polyline(pts).stroke({
        width: [1.2, 5.2],
        cap: 'round',
        gradient: along(
            [
                [0, 0xf4d9c6, 0],
                [0.12, 0xf0b89a, 0.55],
                [0.26, 0xe0643a],
                [0.55, 0x9a4cf0],
                [1, 0x7b4cff],
            ],
            { easing: 'smooth' },
        ),
    });
    I.cloud(g, 7.5, 77, 14, W);
    c.text('17%', 16.5, 82.5, { size: 14, weight: '600' });
    I.drop(g, 61.5, 76.5, 11.5, W);
    c.text('0%', 67.5, 82.5, { size: 14, weight: '600' });
    I.navArrow(g, 184, 77, 11, W);
}

/** Rectangular watch face: ticks along a stadium, seconds sub-dial, date. */
function analogClock(c: Cx): void {
    const { g } = c;
    const cx = 96;
    const cy = 43;
    const a = 97;
    const b = 43;
    const sd = (x: number, y: number) => Math.hypot(Math.max(Math.abs(x) - (a - b), 0), y) - b;

    for (let i = 0; i < 60; i++) {
        const ang = -PI / 2 + (i / 60) * PI * 2;
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        let lo = 0;
        let hi = 200;

        for (let k = 0; k < 24; k++) {
            const m = (lo + hi) / 2;

            if (sd(dx * m, dy * m) < -2) lo = m;
            else hi = m;
        }
        const major = i % 5 === 0;
        const len = major ? 6 : 3.5;

        g.line(cx + dx * lo, cy + dy * lo, cx + dx * (lo - len), cy + dy * (lo - len)).stroke({
            width: major ? 1.6 : 0.9,
            color: major ? 0xe5e5ea : 0x6e6e73,
            cap: 'round',
        });
    }
    c.text('12', cx, 24.5, { size: 16, weight: '600', align: 'center' });
    c.text('6', cx, 69.5, { size: 16, weight: '600', align: 'center' });
    c.text('9', 16, 49.5, { size: 16, weight: '600', align: 'center' });
    c.text('3', 176, 49.5, { size: 16, weight: '600', align: 'center' });
    // seconds sub-dial
    const sx = 51;
    const sy = 41;

    for (let i = 0; i < 60; i++) {
        const ang = (i / 60) * PI * 2;

        g.line(
            sx + Math.cos(ang) * 21.5,
            sy + Math.sin(ang) * 21.5,
            sx + Math.cos(ang) * (i % 5 ? 23 : 24),
            sy + Math.sin(ang) * (i % 5 ? 23 : 24),
        ).stroke({ width: 0.7, color: 0x8e8e93 });
    }
    ['60', '10', '20', '30', '40', '50'].forEach((s, i) => {
        const ang = -PI / 2 + (i / 6) * PI * 2;

        c.text(s, sx + Math.cos(ang) * 14.5, sy + Math.sin(ang) * 14.5, {
            size: 7.5,
            color: 0xc7c7cc,
            weight: '500',
            rotation: ang + PI / 2,
        });
    });
    const sec = -PI / 2 + (((c.t - 3) % 60) / 60) * PI * 2 + 2.62;

    g.line(sx, sy, sx + Math.cos(sec) * 18, sy + Math.sin(sec) * 18).stroke({
        width: 1.5,
        color: 0xf5a524,
        cap: 'round',
    });
    g.circle(sx, sy, 2.4).fill(0x000000).stroke({ width: 1.2, color: 0xf5a524 });
    // hands
    const mx = 96;
    const my = 40.7;

    g.line(mx, my, 84.3, 37.3).stroke({ width: 2.2, color: 0xf5a524, cap: 'round' });
    const mAng = -0.52 + osc(c.t, 0.05) * 0.02;

    g.line(mx, my, mx + Math.cos(mAng) * 38, my + Math.sin(mAng) * 38).stroke({
        width: 1.6,
        color: 0xf5a524,
        cap: 'round',
    });
    g.circle(mx, my, 2.8).fill(0x000000).stroke({ width: 1.3, color: 0xf5a524 });
    c.run(120, 49.5, [
        ['TUE', 13, 0xff453a, '600', 3],
        ['25', 13, W, '600'],
    ]);
}

function streak(c: Cx): void {
    const { g } = c;
    const cx = 25.7;
    const cy = 30;
    const p = 0.83 + 0.04 * osc(c.t, 0.8);

    g.arcSweep(cx, cy, 23, PI * 0.75, PI * 1.5).stroke({ width: 5, color: 0x0e3a3b, cap: 'round' });
    g.arcSweep(cx, cy, 23, PI * 0.75, PI * 1.5 * p).stroke({ width: 5, color: 0x39d6d6, cap: 'round' });
    const e = PI * 0.75 + PI * 1.5 * p;

    g.circle(cx + Math.cos(e) * 23, cy + Math.sin(e) * 23, 3.3)
        .fill(0x39d6d6)
        .stroke({ width: 1.5, color: 0x000000, alignment: 'outside' });
    c.text('32', cx, 38, { size: 21, weight: '500', align: 'center' });
    I.meditation(g, cx, 49.5, 11, 0x39d6d6);
    c.text('STREAK', 0, 79.5, { size: 13, color: GRAY, weight: '500' });
    c.text('TODAY', 62, 14.5, { size: 13.5, color: GRAY, weight: '500' });
    c.text('2', 193, 14.5, { size: 15.5, weight: '600', align: 'right' });
    c.text('THIS WEEK', 62, 34.5, { size: 13.5, color: GRAY, weight: '500' });
    c.text('3/14', 193, 34.5, { size: 15.5, weight: '600', align: 'right' });
    for (let i = 0; i < 5; i++) g.line(62 + i * 33.7, 44.7, 62 + i * 33.7, 65.7).stroke({ width: 1, color: 0x2c2c2e });
    [49, 55.7, 50].forEach((y, i) => {
        const x0 = 62.5 + i * 33.7;

        g.rect(x0, y, 32.7, 65.7 - y).fill(
            vertical([
                [0, 0x0f4a4a, 0.9],
                [1, 0x0f4a4a, 0.1],
            ]),
        );
        g.line(x0 + 1, y, x0 + 31.7, y).stroke({ width: 1.8, color: 0x39d6d6 });
    });
    ['1W', '2W', '3W', '4W'].forEach((s, i) =>
        c.text(s, 62 + i * 33.7, 79.5, { size: 12.5, color: 0x6e6e73, weight: '500' }),
    );
}

function jupiter(c: Cx): void {
    const { g } = c;
    const blue = 0x8a93c8;

    I.angle(g, 5.5, 11, 11, blue);
    c.run(13, 16.5, [
        ['-35°12′', 16.5, blue, '600', 6],
        ['Jupiter', 17, W, '600'],
    ]);
    I.eye(g, 185.5, 10.5, 13, W);
    g.rect(0, 19, 196, 67).fill(
        linear(
            [
                [0, 0x1a212c],
                [1, 0x07090d],
            ],
            { from: [0.8, 0], to: [0.2, 1] },
        ),
    );
    for (const vx of [1, 41.7, 84.3, 126, 167.7]) g.line(vx, 19, vx, 86).stroke({ width: 1, color: 0x353b46 });
    g.line(0, 50, 196, 50).stroke({ width: 1.2, color: 0x9a9da6 });
    const cy = (x: number) => 50 - 13.7 * Math.cos((PI * (x - 56)) / 90);
    const pts: number[] = [];

    for (let x = 0; x <= 196; x += 2) pts.push(x, cy(x));
    g.polyline(pts).stroke({ width: 1.3, color: 0xaeb2ba });
    const nx = 112 + osc(c.t, 0.2) * 2;

    g.line(nx, 19, nx, 86).stroke({ width: 1.5, color: W });
    g.circle(nx, cy(nx), 2.7).fill(W);
    c.text('90°', 192, 31.5, { size: 12.5, color: GRAY, weight: '500', align: 'right' });
    c.text('-90°', 192, 83, { size: 12.5, color: GRAY, weight: '500', align: 'right' });
    c.text('18', 4, 83, { size: 12.5, color: GRAY, weight: '500' });
    c.text('OCT 14', 51.5, 83, { size: 11.5, color: GRAY, weight: '500' });
    c.text('06', 94, 83, { size: 11.5, color: GRAY, weight: '500' });
    c.text('12', 134, 83, { size: 12.5, color: GRAY, weight: '500' });
}

// ------------------------------------------------------------------------------------ row 4

function energy(c: Cx): void {
    const { g } = c;

    g.circle(7.5, 10.5, 5.8).fill(0xf5c518);
    c.text('3', 7.5, 13.8, { size: 9, color: 0x000000, weight: '800', align: 'center' });
    I.bulb(g, 22, 10.5, 12.5, 0xf5c518);
    c.run(31, 16.5, [
        ['4.26', 17, W, '600', 3],
        ['kWh', 12.5, W, '600'],
    ]);
    c.text('24', 0, 32, { size: 12.5, color: GRAY, weight: '500' });
    c.text('12', 0, 50.5, { size: 12.5, color: GRAY, weight: '500' });
    c.text('0', 0, 68.5, { size: 12.5, color: GRAY, weight: '500' });
    c.text('HRS', 0, 81.5, { size: 12.5, color: DIM, weight: '500' });
    g.rect(30, 24, 162, 60).fill(
        vertical([
            [0, 0x2e2600],
            [1, 0x2e2600, 0],
        ]),
    );
    for (let i = 0; i <= 24; i++) g.line(30 + i * 6.75, 24, 30 + i * 6.75, 84).stroke({ width: 0.8, color: 0x3d3306 });
    const ys = [
        45.7, 55.7, 26.3, 41.7, 50.7, 41.7, 45.7, 53.3, 33.3, 48.3, 47.3, 0, 45.7, 53.3, 0, 45.7, 57.3, 43, 47.3, 33.3,
        50.7, 0, 48.3,
    ];

    ys.forEach((y, i) => {
        const x = 36 + i * 6.7;

        if (!y) g.circle(x, 64.7, 2.3).stroke({ width: 1, color: 0x8a7520 });
        else {
            g.circle(x, 64.7, 0.75).fill(0x5a4c10);
            g.circle(x, y + osc(c.t, 1.4, i) * 0.8, 2.3).fill(0xf5d33a);
        }
    });
    c.text('12 SEP', 32, 81.5, { size: 12.5, color: GRAY, weight: '500' });
    c.text('TOTAL 24 DAYS', 192, 81.5, { size: 12.5, weight: '600', align: 'right' });
}

function weather(c: Cx): void {
    const { g } = c;

    I.cloudRain(g, 6.5, 10.5, 13.5, W, 0x5ac8fa);
    c.text('16°C', 17, 16.5, { size: 17, weight: '600' });
    let rx = c.text('6MM', 192, 16.5, { size: 16, color: 0x5ac8fa, weight: '600', align: 'right' }).x;

    rx = c.text('6°', rx - 7, 16.5, { size: 16, weight: '600', align: 'right' }).x;
    I.chevron(g, rx - 6, 11.5, 8, W, 'down', 0.2);
    rx = c.text('18°', rx - 13, 16.5, { size: 16, weight: '600', align: 'right' }).x;
    I.chevron(g, rx - 6, 11, 8, W, 'up', 0.2);
    g.rect(0, 30, 163, 42).fill(
        vertical([
            [0, 0x0c2638],
            [1, 0x061520],
        ]),
    );
    for (const vx of [41, 81, 121]) g.line(vx, 30, vx, 72).stroke({ width: 1, color: 0x22384a });
    // cloud cover: one tapered stroke, width per point
    const xs = [0, 8, 14, 22, 30, 50, 55, 60, 70, 76, 108, 114, 124, 130, 142, 150, 162];
    const ws = [2, 2, 3, 8, 9, 9, 3, 2, 2, 8, 8, 5, 5, 3, 3, 8, 8];

    g.polyline(xs.flatMap((x) => [x, 26.3])).stroke({ width: ws, color: 0xf2f2f7, cap: 'round' });
    [12.5, 20, 27.5, 35, 92, 100, 108, 131, 139].forEach((x) => g.circle(x, 43.3, 1.35).fill(0x4fc3f7));
    const pts: number[] = [];

    for (let x = 0; x <= 162; x += 2)
        pts.push(x, 60 + 2.2 * Math.sin(x * 0.14 + c.t * 0.6) + 1.4 * Math.sin(x * 0.05) - (x / 162) ** 6 * 6);
    g.polyline(pts).stroke({ width: 1.6, color: 0x8c99a6, cap: 'round' });
    g.circle(162.5, pts[pts.length - 1], 2.3).fill(W);
    I.cloud(g, 186, 30, 12, 0x6e6e73);
    I.chevron(g, 188, 48, 7, 0x6e6e73, 'up', 0.18);
    I.chevron(g, 188, 61.5, 7, 0x6e6e73, 'down', 0.18);
    for (const vx of [41, 81, 121, 162.7]) g.line(vx, 72, vx, 86).stroke({ width: 1, color: 0x3a3a3c });
    c.text('00', 3, 81.5, { size: 12.5, color: GRAY, weight: '500' });
    I.navArrow(g, 35, 77, 8.5, W);
    c.text('06', 46, 81.5, { size: 12.5, color: GRAY, weight: '500' });
    I.navArrow(g, 75, 77, 8.5, W);
    c.text('12', 86, 81.5, { size: 12.5, color: GRAY, weight: '500' });
    I.windArrow(g, 115, 77, 8.5, W);
    c.text('18', 126, 81.5, { size: 12.5, color: GRAY, weight: '500' });
    I.navArrow(g, 155, 77, 8.5, W);
    c.text('NOW', 192, 81.5, { size: 12.5, weight: '600', align: 'right' });
}

function budget(c: Cx): void {
    const { g } = c;

    I.dollarCycle(g, 6.5, 10.5, 13, W);
    c.text('$', 6.5, 14, { size: 9, weight: '700', align: 'center' });
    c.run(16, 16.5, [
        ['$382', 17, W, '600', 5],
        ['LEFT OF BUDGET', 13, GRAY, '500'],
    ]);
    c.text('3K', 0, 32, { size: 12.5, color: GRAY, weight: '500' });
    c.text('1.5K', 0, 50, { size: 12.5, color: GRAY, weight: '500' });
    c.text('0', 0, 68, { size: 12.5, color: GRAY, weight: '500' });
    c.text('SEP', 0, 85, { size: 12.5, color: DIM, weight: '500' });
    for (let i = 0; i <= 24; i++) g.line(30 + i * 6.8, 24, 30 + i * 6.8, 86).stroke({ width: 0.8, color: 0x1f1f21 });
    g.line(30, 46, 192, 46).stroke({ width: 1, color: 0x8e8e93, alpha: 0.7, dash: [0, 2.6], cap: 'round' });
    const pts = [
        30, 70.7, 38, 68, 44, 66.6, 50, 66.2, 56, 67, 62, 65.8, 67, 61, 71, 54.5, 76, 51, 84, 50, 100, 49, 120, 48, 140,
        47, 160, 45.8, 170, 44, 178, 40.5, 186, 37.2, 192.3, 34.7,
    ];

    g.polyline(pts, { smooth: 'monotone', step: 1 }).stroke({
        width: 2.4,
        cap: 'round',
        gradient: linear(
            [
                [0, 0x30d158],
                [0.28, 0x30d158],
                [0.45, 0x8d8a52],
                [0.7, 0xc84f4a],
                [1, 0xff453a],
            ],
            { units: 'local', from: [30, 0], to: [192, 0] },
        ),
    });
    g.line(192.3, 25, 192.3, 31).stroke({ width: 1.3, color: W, dash: [2, 2] });
    g.line(192.3, 34.7, 192.3, 86).stroke({ width: 1.3, color: W });
    g.circle(192.3, 34.7, 2.4).fill(W);
    c.text('1', 33, 85, { size: 12.5, color: DIM, weight: '500' });
    c.text('7', 76, 85, { size: 12.5, color: GRAY, weight: '500' });
    c.text('13', 120, 85, { size: 12.5, color: GRAY, weight: '500' });
    c.text('TODAY', 189.5, 85, { size: 12.5, weight: '600', align: 'right' });
}

/** Two nested paperclip tracks with progress. */
function tracks(c: Cx): void {
    const { g } = c;
    const clip = (y0: number, r: number, left: number) => {
        const pts: number[] = [left, y0, 152, y0];

        for (let i = 1; i <= 24; i++) {
            const a = -PI / 2 + (i / 24) * PI;

            pts.push(152 + Math.cos(a) * r, 43.5 + Math.sin(a) * r);
        }
        pts.push(118, 43.5 + r);

        return pts;
    };
    const partial = (pts: number[], frac: number) => {
        let total = 0;

        for (let i = 2; i < pts.length; i += 2) total += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
        let left = total * frac;
        const out = [pts[0], pts[1]];

        for (let i = 2; i < pts.length; i += 2) {
            const d = Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);

            if (d >= left) {
                const u = left / d;

                out.push(pts[i - 2] + (pts[i] - pts[i - 2]) * u, pts[i - 1] + (pts[i + 1] - pts[i - 1]) * u);
                break;
            }
            out.push(pts[i], pts[i + 1]);
            left -= d;
        }

        return out;
    };
    const outer = clip(11.3, 32.2, 6.5);
    const inner = clip(29.2, 14.3, 6.5);

    for (const pts of [outer, inner]) {
        g.polyline(pts).stroke({ width: 14, color: 0x3a3a3c, cap: 'round' });
        g.polyline(pts).stroke({ width: 12, color: 0x0e0e10, cap: 'round' });
    }
    const po = partial(outer, 0.58 + 0.02 * osc(c.t, 0.7));
    const pi = partial(inner, 0.47);

    g.polyline(po).stroke({ width: 12, color: 0x1c4a8f, cap: 'round' });
    g.polyline(pi).stroke({ width: 12, color: 0x3a3a3e, cap: 'round' });
    g.circle(po[po.length - 2], po[po.length - 1], 2.8).fill(0x3a8cff);
    g.circle(pi[pi.length - 2], pi[pi.length - 1], 2.6).fill(0x8e8e93);
    c.text('65%', 5, 15.5, { size: 12.5, color: 0x4a8cf0, weight: '500' });
    c.text('47%', 5, 33.5, { size: 12.5, color: GRAY, weight: '500' });
    c.text('DISTANCE', 0, 59.5, { size: 12.5, color: 0x3a8cff, weight: '600' });
    c.run(0, 82.5, [
        ['2.64', 19.5, W, '600', 3],
        ['mi', 13.5, W, '500'],
    ]);
    c.text('STEPS', 79, 59.5, { size: 12.5, color: GRAY, weight: '600' });
    c.text('3,378', 73, 82.5, { size: 19.5, weight: '600' });
}

// ------------------------------------------------------------------------------------ row 5

function pillsMatrix(c: Cx): void {
    const { g } = c;
    const purple = 0x6a67f0;

    I.pills(g, 7, 10.5, 13.5, purple);
    c.run(15, 16.5, [
        ['6', 17.5, purple, '600', 1],
        ['/30', 12.5, GRAY, '500'],
    ]);
    c.text('TIMES', 73, 15.5, { size: 13, weight: '600' });
    const xs = [2.3, 19, 35.7, 52.7, 69.7, 86.7, 103.3];
    const ys = [26.3, 38.3, 50.7, 63, 75.7];
    const data = [
        [0, 0, 0, 2, 3, 1, 1],
        [3, 2, 2, 2, 1, 1, 1],
        [1, 1, 1, 1, 3, 3, 1],
        [1, 2, 2, 4, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
    ];

    data.forEach((row, r) =>
        row.forEach((v, i) => {
            const x = xs[i];
            const y = ys[r];

            if (v === 1) g.circle(x, y, 3.1).fill(0x2a2a2c);
            else if (v === 2) g.circle(x, y, 3.2).fill(purple);
            else if (v === 3) g.circle(x, y, 2.7).stroke({ width: 1.2, color: purple });
            else if (v === 4) g.circle(x, y, 3.2).fill(W);
        }),
    );
    const dx = 155;
    const dy = 40.7;

    g.circle(dx, dy, 36).fill(0x1c1c1e);
    for (let i = 0; i < 24; i++) {
        const a = (i / 24) * PI * 2;

        if (i % 6 === 0) continue;
        g.line(dx + Math.cos(a) * 31, dy + Math.sin(a) * 31, dx + Math.cos(a) * 34, dy + Math.sin(a) * 34).stroke({
            width: 1,
            color: 0xd1d1d6,
        });
    }
    c.text('24', dx, dy - 21.5, { size: 12.5, weight: '600', align: 'center' });
    c.text('06', dx + 27, dy + 4.5, { size: 12.5, weight: '600', align: 'center' });
    c.text('12', dx, dy + 31, { size: 12.5, weight: '600', align: 'center' });
    c.text('18', dx - 27, dy + 4.5, { size: 12.5, weight: '600', align: 'center' });
    for (const a of [151, 120, 29])
        g.circle(dx + Math.cos((a * PI) / 180) * 32.5, dy + Math.sin((a * PI) / 180) * 32.5, 2.4).fill(purple);
    g.circle(dx, dy, 16.5).fill(0x000000);
    const ha = (45 * PI) / 180 + osc(c.t, 0.1) * 0.02;

    g.line(dx, dy, dx + Math.cos(ha) * 17, dy + Math.sin(ha) * 17).stroke({ width: 2.4, color: W, cap: 'round' });
    g.circle(dx, dy, 3.2).fill(W);
}

function mood(c: Cx): void {
    const { g } = c;

    I.smiley(g, 6.5, 10.5, 6.3, W);
    c.text('MOOD TRACKER', 16, 16.5, { size: 15.5, weight: '600' });
    const lines = [-1.3, 27, 55.3, 83.7, 112, 140.3, 168.7, 197];

    for (const x of lines) g.line(x, 24, x, 86).stroke({ width: 1, color: 0x2c2c2e });
    const days = ['17', '18', '19', '20', '21', '22', '23'];
    const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const faces: Record<number, string> = { 0: '🙂', 2: '🥵', 3: '🥶' };

    days.forEach((d, i) => {
        const x = (lines[i] + lines[i + 1]) / 2;
        const today = i === 4;

        c.text(d, x, 30.5, { size: 13, color: today ? W : GRAY, weight: today ? '600' : '500', align: 'center' });
        if (faces[i]) c.text(faces[i], x, 51, { size: 21, rotation: 0 });
        else I.smiley(g, x, 50.5, 8.3, 0x48484a, true);
        c.text(letters[i], x, 80.5, {
            size: 12.5,
            color: today ? W : GRAY,
            weight: today ? '600' : '500',
            align: 'center',
        });
    });
}

function sleep(c: Cx): void {
    const { g } = c;

    c.text('02:03 - 08:26', 0, 16.5, { size: 17, weight: '600' });
    g.roundRect(0, 24, 44, 24.5, 7).fill(0x1b1e3c);
    I.bed(g, 22, 36.5, 14, 0x6f6cf5);
    g.roundRect(147, 24, 44, 24.5, 7).fill(0x0d3533);
    I.alarm(g, 169, 36.5, 13.5, 0x39d6d0);
    const R = 85;

    for (let i = 0; i <= 20; i++) {
        const a = -PI / 2 - 0.569 + (i / 20) * 1.138;

        g.circle(96 + Math.cos(a) * R, 107.3 + Math.sin(a) * R, 1.05).fill(0x7f95c4);
    }
    c.text('6 HR 23 MIN', 96, 47.5, { size: 12.5, color: GRAY, weight: '500', align: 'center' });
    const seq: [number, number][] = [
        [5, 0x5ac8fa],
        [2, 0x5e5ce6],
        [1.2, 0xff6b5b],
        [10, 0x5e5ce6],
        [4, 0x0a84ff],
        [10, 0x0a84ff],
        [1.3, 0xff6b5b],
        [18, 0x0a84ff],
        [1.3, 0xff6b5b],
        [8, 0x0a84ff],
        [4, 0x5ac8fa],
        [12, 0x0a84ff],
        [1.3, 0xff6b5b],
        [1.3, 0xff6b5b],
        [9, 0x5ac8fa],
        [12, 0x0a84ff],
        [9, 0x5ac8fa],
        [7, 0x5ac8fa],
        [1.3, 0xff6b5b],
    ];
    const total = seq.reduce((s, [w]) => s + w, 0);
    let x = 2;

    for (const [w, col] of seq) {
        const ww = (w / total) * 190;

        g.roundRect(x + 0.4, 55.3, Math.max(1.2, ww - 0.8), 6.3, Math.min(2, ww / 2)).fill(col);
        x += ww;
    }
    I.moonZ(g, 6, 76.5, 13.5, 0x3ec5d8);
    c.text('89%', 15, 82.5, { size: 15.5, color: 0x3ec5d8, weight: '600' });
    const ax = c.text('AVG', 192, 82.5, { size: 15.5, color: 0xff5a5f, weight: '600', align: 'right' }).x;

    g.heart(ax - 9, 77, 12.5, 0.08).fill(0xff3b53);
    c.text('72 BPM', ax - 17, 82.5, { size: 15.5, color: 0xff5a5f, weight: '600', align: 'right' });
}

function tesla(c: Cx): void {
    const { g } = c;

    c.text('Tesla Model 3', 0, 16.5, { size: 17, weight: '600' });
    c.text('17M AGO', 193, 16.5, { size: 13.5, color: GRAY, weight: '500', align: 'right' });
    const cx = 27;
    const cy = 50.7;
    const sweep = ((165 * PI) / 180) * (1 + 0.03 * osc(c.t, 0.6));

    g.circle(cx, cy, 20.5).stroke({ width: 5, color: 0x2c2c2e });
    g.arcSweep(cx, cy, 20.5, PI * 0.75, sweep).stroke({ width: 5, color: 0x30d158, cap: 'round' });
    const e = PI * 0.75 + sweep;

    g.circle(cx + Math.cos(e) * 20.5, cy + Math.sin(e) * 20.5, 1.8).fill(W);
    c.run(
        cx,
        57,
        [
            ['60', 21, W, '600', 1],
            ['%', 11, GRAY, '500'],
        ],
        'center',
    );
    I.batteryBolt(g, cx, 65.5, 11.5, 0x30d158);
    g.pill(39.3, 67.3, 51.7, 13.4).fill(W);
    c.text('256 mi', 65.2, 78.6, { size: 13, color: 0x000000, weight: '600', align: 'center' });
    g.line(66, 24, 66, 72).stroke({ width: 1, color: 0x2c2c2e });
    g.rect(88.7, 23, 27.3, 47).fill(0x0d3a1b);
    I.bolt(g, 102.3, 29.5, 9, 0x30d158);
    const hs = [
        0.6, 0.56, 0.52, 0.48, 0.74, 0.9, 0.93, 0.96, 0.78, 0.74, 0.62, 0.6, 0.62, 0.6, 0.57, 0.57, 0.52, 0.54, 0.52,
        0.49, 0.47, 0.45, 0.52,
    ];

    hs.forEach((h, i) => {
        const x = 69 + i * 5.35;
        const hh = 40 * h * (1 + 0.03 * osc(c.t, 2, i));

        g.rect(x, 70 - hh, 2.7, hh).fill(i % 4 === 3 ? 0x1f8a3c : 0x30d158);
    });
    c.text('100%', 192, 36.5, { size: 12.5, color: GRAY, weight: '500', align: 'right' });
    c.run(
        192,
        83,
        [
            ['10AM TO', 12.5, GRAY, '500', 4],
            ['NOW', 12.5, W, '600'],
        ],
        'right',
    );
}

const defs: [string, string, (c: Cx) => void][] = [
    ['s2-zones', 'Heart rate zones', zones],
    ['s2-total-time', 'Total time', totalTime],
    ['s2-network', 'Network speed', network],
    ['s2-home', 'Home controls', home],
    ['s2-calendar', 'All-day events', calendar],
    ['s2-sun', 'Sun altitude', sunAltitude],
    ['s2-card', 'Card spending', cardSpend],
    ['s2-glucose', 'Glucose', glucose],
    ['s2-golden', 'Golden hour', goldenHour],
    ['s2-clock', 'Watch face', analogClock],
    ['s2-streak', 'Streak', streak],
    ['s2-jupiter', 'Jupiter', jupiter],
    ['s2-energy', 'Energy', energy],
    ['s2-weather', 'Rain', weather],
    ['s2-budget', 'Budget', budget],
    ['s2-tracks', 'Distance & steps', tracks],
    ['s2-pills', 'Pills', pillsMatrix],
    ['s2-mood', 'Mood tracker', mood],
    ['s2-sleep', 'Sleep', sleep],
    ['s2-tesla', 'Car battery', tesla],
];

export const sheet2: SheetWidget[] = defs.map(([id, name, draw], i) => ({
    id,
    name,
    x: XS[i % 4],
    y: YS[Math.floor(i / 4)],
    w: 196,
    h: 88,
    draw,
}));
