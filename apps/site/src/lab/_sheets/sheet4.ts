import { horizontal, linear, type SilkGraphics, vertical } from 'pixi-silk';
import type { Cx, SheetWidget } from './cx';
import * as I from './icons';

/*
 * Reference sheet 4 (1200×672): iPhone Live Activities on a light backdrop, drawn in reference pixels.
 * Card boxes, corner shape (r 34, smoothing 0.3), shadow falloff, colours and chart shapes were measured
 * from the reference image. Widgets cut by the sheet edge are marked `partial`.
 */

const PI = Math.PI;
const W = 0xffffff;
const DEG = PI / 180;

const osc = (t: number, f: number, ph = 0) => Math.sin((t - 3) * f + ph) - Math.sin(ph);

function mix(a: number, b: number, t: number): number {
    const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);

    return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/** Piecewise-linear colour ramp over y. */
function ramp(stops: [number, number][], y: number): number {
    if (y <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
        const [y1, c1] = stops[i];

        if (y <= y1) {
            const [y0, c0] = stops[i - 1];

            return mix(c0, c1, (y - y0) / (y1 - y0));
        }
    }

    return stops[stops.length - 1][1];
}

// ------------------------------------------------------------------------------ traced data

/** Glucose bars: x, top, bottom (outer extents). */
const GLUCOSE = [
    [19, 80, 92],
    [29.5, 86, 98],
    [41, 83, 95],
    [52, 71, 91],
    [64, 81, 98],
    [75.5, 86, 103],
    [88.5, 69, 104],
    [101, 65, 82],
    [114, 67, 90],
    [127, 56, 97],
    [139.5, 70, 101],
    [152.5, 80, 113],
    [165.5, 66, 110],
    [178, 40, 98],
    [192, 44, 74],
    [206.5, 50, 80],
    [219, 67, 90],
    [231.5, 80, 97],
    [245, 81, 100],
    [257, 69, 89],
    [270, 80, 100],
];
const GLUCOSE_RAMP: [number, number][] = [
    [44, 0xff3aa6],
    [51, 0xf040e0],
    [57, 0xa38cff],
    [90, 0x95a0fc],
    [102, 0x9cd7fb],
    [112, 0xa9f9c9],
];
const GLUCOSE_GRADS = GLUCOSE.map(([, top, bottom]) =>
    linear(
        [
            [0, ramp(GLUCOSE_RAMP, top)],
            [1, ramp(GLUCOSE_RAMP, bottom)],
        ],
        { units: 'local', from: [0, top], to: [0, bottom] },
    ),
);

/** Cadence bar tops (bottom 84). */
const CADENCE = [
    71.5, 70, 68, 66.5, 64, 60, 58, 54, 50, 42, 36, 32, 29, 32, 36, 42, 51, 53, 58, 63, 65, 65, 66.5, 65, 64, 63, 58,
];

/** Blood-pressure bars: x, top, bottom (outer extents incl. dots). */
const PRESSURE = [
    [27, 83, 91],
    [39, 69, 92],
    [52.5, 57, 93],
    [65, 76, 101],
    [77.5, 72, 92],
    [90.5, 63, 99],
    [102.5, 51, 88],
    [114, 70, 103],
    [127, 59, 113],
    [139, 51, 115],
    [152, 66, 105],
    [163.5, 66, 90],
    [175, 59, 83],
    [187, 67, 91],
    [199, 59, 83],
    [211, 68, 77],
    [221, 75, 83],
    [232, 70, 90],
    [245.5, 56, 96],
    [257.5, 76, 101],
];

/** Race circuit centrelines: sectors 1+3 (bright) and sector 2 (dark). */
const TRACK_BRIGHT = [
    100.5, 101.5, 98.5, 99, 93.5, 95, 85, 90, 77.5, 85, 70.5, 82, 65, 79, 59.5, 75, 53, 71, 47, 67.5, 42, 64.5, 37, 62,
    33, 60.5, 30, 57.5, 29, 53, 28.5, 48, 27.5, 44, 25, 40.5, 22.5, 36.5, 21.5, 32, 21.5, 28, 23, 24.5, 26.5, 22, 31,
    20.5, 36, 20.5, 41, 21.5, 46, 24, 51, 27, 55, 29.5, 58, 32,
];
const TRACK_DARK = [
    58, 32, 63, 35, 65, 40, 63, 44, 57, 44, 50, 41.5, 43, 38, 38, 36, 35.5, 39, 36, 44, 37.5, 49, 40, 53.5, 44, 57.5,
    49, 60.5, 54, 61.5, 59, 59.5, 64, 55.5, 68, 51.5, 73, 48.5, 80, 47.5, 85, 49.5, 88, 53, 90.5, 57.5, 93, 62.5, 95.5,
    67.5, 98, 72.5, 101, 77, 103.5, 81.5, 106, 86, 108.5, 89.5, 111, 91, 113, 88, 112, 82, 111.5, 77, 112.5, 71.5, 115,
    68.5, 119, 68, 122, 70, 124, 74, 126, 78.5, 128, 83, 128, 87, 125.5, 91.5, 122, 95.5, 119, 99, 116, 102, 112, 105,
    107, 105.5, 103, 103.5, 100.5, 101.5,
];

const FLIGHT_FILL = horizontal([
    [0, 0x1fe6f0],
    [0.75, 0x22f6f2],
    [1, 0xc4fff6],
]);
const TRAIN_FILL = horizontal([
    [0, 0xb6fd6a],
    [1, 0xb0fb66],
]);
const CONE = vertical([
    [0, 0x3a7cc0, 0.95],
    [0.5, 0x1f3f68, 0.9],
    [1, 0x1a2b49, 0.85],
]);
const SUN_NOW = horizontal([
    [0, 0x85d2fc],
    [0.45, 0x70b5ff],
    [1, 0xffde94],
]);
const SUN_SET = horizontal([
    [0, 0xffd28e],
    [1, 0xfe9168],
]);
const SUN_DUSK = horizontal([
    [0, 0xf57a7c],
    [0.45, 0x3f83d4],
    [1, 0x2c3a8a],
]);
const GREEN_LINE = vertical([
    [0, 0x5ef0b0],
    [1, 0x5ef0b0],
]);

type G = SilkGraphics;

function arcPoint(cx: number, cy: number, r: number, a: number): [number, number] {
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}

// ------------------------------------------------------------------------------ column 1

function flight(c: Cx): void {
    const { g } = c;
    const px = 183 + osc(c.t, 0.05) * 6;

    c.text('San Francisco', 25, 30, { size: 13, weight: '400' });
    c.text('Edmonton', 270, 30, { size: 13, weight: '400', align: 'right' });
    c.text('SFO', 24, 58, { size: 25, weight: '300' });
    c.text('YEG', 270, 58, { size: 25, weight: '300', align: 'right' });
    g.pill(76, 44.5, 144, 10).fill(0x1a6e75);
    g.pill(76, 44.5, px - 76 + 4, 10).fill({ color: 0x22f6f2, alpha: 0.35, blur: 3 });
    g.pill(76, 44.5, px - 76 + 4, 10).fill(FLIGHT_FILL);
    I.plane(g, px, 49.5, 17, W);
    c.text('9:59 PM', 26, 76, { size: 12.5, weight: '400' });
    c.text('Arrives in 47m', 145.5, 76, { size: 12.5, color: 0x7aecec, weight: '500', align: 'center' });
    c.text('12:59 AM', 269, 76, { size: 12.5, weight: '400', align: 'right' });
}

function avatar(g: G, x: number, y: number, r: number): void {
    g.circle(x, y, r).fill(0x8f9480);
    g.ellipse(x, y + r * 0.95, r * 0.8, r * 0.45).fill(0x3c4a5a);
    g.ellipse(x, y + r * 0.05, r * 0.46, r * 0.56).fill(0xd8a58a);
    g.ellipse(x, y - r * 0.46, r * 0.46, r * 0.2).fill(0x6b4a34);
    g.ellipse(x, y + r * 0.36, r * 0.36, r * 0.24).fill({ color: 0x8a6446, alpha: 0.85 });
}

function pickup(c: Cx): void {
    const { g } = c;
    const purple = 0xb77cf0;
    const fill = 89.5 + osc(c.t, 0.08) * 10;

    c.text('Picking up order', 28, 34.5, { size: 13, color: purple, weight: '500' });
    c.text('ETA 5:50', 266, 34.5, { size: 13, color: purple, weight: '500', align: 'right' });
    g.pill(34.5, 54.5, 225, 12).fill(0x562c6f);
    g.pill(34.5, 54.5, fill - 34.5, 12).fill(0xcc6cff);
    g.circle(147, 60.5, 12.5).fill(0x5a3278);
    g.circle(259.5, 60.5, 12.5).fill(0x5a3278);
    g.circle(34.5, 60.5, 12.5).fill(0xc86af4);
    I.box(g, 34.5, 60.5, 11, 0xf7ecff, 0xc86af4);
    I.carFront(g, 147, 61, 11, 0xb88ad8, 0x5a3278);
    I.house(g, 259.5, 60.5, 11, 0xb88ad8, 0x5a3278);
    avatar(g, 35.5, 97, 13.5);
    c.text('Dave', 61, 101, { size: 13, weight: '400' });
    g.pill(146, 84.5, 59.5, 30).fill(0x313131);
    g.pill(216, 84.5, 59.5, 30).fill(0x313131);
    I.phone(g, 176, 99.5, 15, 0x9a9a9e);
    I.bubble(g, 246, 99.5, 16, 0x9a9a9e);
}

function glucose(c: Cx): void {
    const { g } = c;
    const lav = 0xb4b0f0;

    c.text('7.2', 27, 39, { size: 21, color: lav, weight: '400' });
    c.text('mmol/L', 59, 39, { size: 13.5, color: lav, weight: '500' });
    c.text('2.2', 266, 34, { size: 16, color: lav, weight: '400', align: 'right' });
    I.arrow(g, 233, 28.5, 12, lav, 'down', 0.12);
    for (const x of [25.5, 104.5, 192, 282]) g.line(x, 50, x, 133.5).stroke({ width: 1, color: 0x2e2e36 });
    GLUCOSE.forEach(([x, top, bottom], i) => {
        const dy = osc(c.t, 0.7, i) * 0.8;

        g.pill(x - 4, top + dy, 8, bottom - top).fill(GLUCOSE_GRADS[i]);
    });
    c.text('1PM', 97, 133, { size: 12, color: 0x6a6880, weight: '500', align: 'right' });
    c.text('2PM', 185, 133, { size: 12, color: 0x6a6880, weight: '500', align: 'right' });
    c.text('NOW', 270, 133, { size: 12, color: 0x6a6880, weight: '500', align: 'right' });
}

function delivery(c: Cx): void {
    const { g } = c;
    const mint = 0x6ff0c8;

    c.text('STATUS', 24, 29, { size: 11, color: mint, weight: '600' });
    c.text('Out for delivery', 23, 48.5, { size: 19, color: mint, weight: '500' });
    c.text('ETA', 24, 71, { size: 10, weight: '600' });
    c.text('15-30 min', 23, 91, { size: 18.5, weight: '500' });
    g.roundRect(187.5, 14, 89, 91, 14, 0.3).fill(0x305b54);
    const rows = [14, 27.75, 49.6, 71.5, 90.25, 105];
    const streets = [[210, 235, 253.75], [207, 247.5], [203.75, 225.6, 260], [216, 241], [228]];

    for (const y of rows.slice(1, -1)) g.line(187.5, y, 276.5, y).stroke({ width: 1.4, color: 0x3d6e64 });
    streets.forEach((xs, i) =>
        xs.forEach((x) => g.line(x, rows[i], x, rows[i + 1]).stroke({ width: 1.4, color: 0x3d6e64 })),
    );
    g.polyline([212.5, 44, 212.5, 56.5, 217.5, 61.5, 245.5, 61.5, 250, 66, 250, 74]).stroke({
        width: 3,
        color: 0x6ff5cc,
        cap: 'round',
    });
    g.roundRect(209, 33, 7, 12, 3).fill(W);
    g.circle(250, 75, 3).fill(W);
}

// ------------------------------------------------------------------------------ column 2 (train card starts above the sheet)

function train(c: Cx): void {
    const { g } = c;
    const light = 0xc8fa9a;
    const pos = 97 + osc(c.t, 0.1) * 8;

    g.pill(25, 71, 234, 12).fill(0x376910);
    g.pill(25, 71, 116, 12).fill(TRAIN_FILL);
    for (const x of [31, 141, 253.5]) g.circle(x, 77, 4).fill(0x0a1a04);
    g.circle(pos, 77, 4.5).fill(W);
    c.text('Harajuku', 24, 101.5, { size: 13, color: light, weight: '500' });
    c.text('Shibuya', 143, 101.5, { size: 13, color: light, weight: '500', align: 'center' });
    c.text('Ebisu', 257, 101.5, { size: 13, color: 0x7a9068, weight: '500', align: 'right' });
}

function espresso(c: Cx): void {
    const { g } = c;
    const orange = 0xff7a45;
    const sec = 16 + ((c.t - 3 + 1400) % 14);
    const lit = 12 + Math.floor((sec - 16) / 1.074);

    for (let i = 0; i < 23; i++) {
        const x = 17 + i * 11.59;
        const edge = Math.min(i, 22 - i);
        const blur = edge === 0 ? 2.6 : edge === 1 ? 1.4 : edge === 2 ? 0.6 : 0;
        const alpha = edge === 0 ? 0.55 : edge === 1 ? 0.85 : 1;
        const color =
            i < lit
                ? mix(0xc84a14, 0xf27905, Math.min(1, i / 11))
                : mix(0x777777, 0x484848, Math.min(1, (i - 12) / 10));

        g.roundRect(x - 3.5, 44, 7, 27.5, 3.5).fill({ color, alpha, blur });
    }
    c.text('10', 97.5, 38.5, { size: 12.5, color: 0xc86a3c, weight: '600', align: 'center' });
    c.text('20', 205.5, 40, { size: 12.5, color: 0x616161, weight: '600', align: 'center' });
    c.text('Espresso', 30, 103, { size: 15.5, color: orange, weight: '500' });
    g.circle(144.5, 103, 19).fill(0x6f1b00);
    g.roundRect(137, 95.5, 15, 15, 3.5).fill(0xfa7200);
    c.text(`${Math.floor(sec)}s`, 260, 111, { size: 33, color: 0xf27a48, weight: '300', align: 'right' });
}

function iss(c: Cx): void {
    const { g } = c;
    const cx = 141.25;
    const cy = 198.9;
    const R = 140;
    const upper: number[] = [];
    const lower: number[] = [];
    const dot = (-120.4 + osc(c.t, 0.05) * 4) * DEG;

    c.text('ISS Flyover', 25, 32, { size: 14, weight: '500' });
    c.text('in 15 min', 261, 32, { size: 13.5, color: 0x64d8f0, weight: '500', align: 'right' });
    g.arcSweep(cx, cy, R, -141 * DEG, 102 * DEG).stroke({ width: 13, color: 0x395d8f, cap: 'round' });
    // visibility cone: between the arc's inner edge and a V down to the tip
    for (let x = 92; x <= 186; x += 2) {
        const top = cy - Math.sqrt(134 * 134 - (x - cx) ** 2);
        const v = 119 - Math.abs(x - 137) * 1.13;

        upper.push(x, top);
        lower.push(x, Math.max(top, v));
    }
    g.area(upper, lower).fill(CONE);
    g.arcSweep(cx, cy, R, -111 * DEG, 40.5 * DEG).stroke({ width: 15, color: 0x59e4ff, cap: 'round' });
    I.satellite(g, 57, 59, 20, W, -35 * DEG);
    const [dx, dy] = arcPoint(cx, cy, R, dot);

    g.circle(dx, dy, 4.5).fill(W);
}

function cadence(c: Cx): void {
    const { g } = c;
    const yellow = 0xfbf03c;

    c.text('24:15', 25, 40, { size: 20, color: 0xfff05a, weight: '400' });
    c.text('1.8', 249, 38.5, { size: 20, color: 0xfff05a, weight: '400', align: 'right' });
    c.text('MI', 250, 31, { size: 9.5, color: 0xfff05a, weight: '600' });
    CADENCE.forEach((top, i) => {
        const x = 25 + i * 9.07;
        const tt = top + (i < 19 ? osc(c.t, 1.2, i) * 1.2 : 0);

        g.pill(x - 3, tt, 6, 84 - tt).fill(i < 19 ? yellow : i === 19 ? W : 0x645402);
    });
    g.pill(21.5, 100, 82.5, 29).fill(0x53460a);
    g.pill(183, 100, 82, 29).fill(0x53460a);
    I.xMark(g, 62.75, 114.5, 13, yellow, 0.14);
    g.roundRect(133, 104, 7, 22.5, 2).fill(yellow);
    g.roundRect(144, 104, 7, 22.5, 2).fill(yellow);
    I.crosshair(g, 224, 114.5, 17, yellow);
}

// ------------------------------------------------------------------------------ column 3

function sunset(c: Cx): void {
    const { g } = c;
    const gray = 0x727272;
    const sun = 48 + osc(c.t, 0.1) * 6;

    c.text('Now', 31, 35, { size: 11.5, weight: '400' });
    c.text('Sunset', 148, 35, { size: 11.5, color: gray, weight: '500', align: 'center' });
    c.text('Dusk', 216.5, 35, { size: 11.5, color: gray, weight: '500', align: 'center' });
    g.pill(21.5, 45, 99, 33.5).fill(SUN_NOW);
    g.pill(125.5, 45, 46, 33.5).fill(SUN_SET);
    g.pill(176.5, 45, 80, 33.5).fill(SUN_DUSK);
    g.circle(sun, 61.5, 11).fill({ color: W, alpha: 0.45, blur: 3 });
    g.circle(sun, 61.5, 8.5).fill(W);
    for (const [x, y, r] of [
        [232, 57, 1.1],
        [243, 60, 0.8],
        [237, 66.5, 0.9],
        [250, 55, 0.8],
        [247, 70, 1],
        [226, 70, 0.7],
    ])
        g.circle(x, y, r).fill({ color: W, alpha: 0.9 });
    c.text('5:50 PM', 30, 97, { size: 11.5, weight: '400' });
    c.text('in 57m', 148, 97, { size: 11.5, color: gray, weight: '500', align: 'center' });
    c.text('8:12', 216, 97, { size: 11.5, color: gray, weight: '500', align: 'center' });
}

function pressure(c: Cx): void {
    const { g } = c;
    const pink = 0xf06ac8;

    c.text('82', 24, 40, { size: 24, color: pink, weight: '400' });
    c.text('mmhg', 55, 39.5, { size: 13, color: pink, weight: '500' });
    c.text('5 min', 254, 37, { size: 13.5, weight: '400', align: 'right' });
    PRESSURE.forEach(([x, top, bottom], i) => {
        const k = 1 + osc(c.t, 0.9, i) * 0.06;
        const mid = (top + bottom) / 2;
        const a = mid + (top + 4 - mid) * k;
        const b = mid + (bottom - 4 - mid) * k;

        if (b - a > 1) g.line(x, a, x, b).stroke({ width: 6.5, color: 0x531944, cap: 'round' });
        g.circle(x, a, 3.8).fill(0xe765c3);
        if (b - a > 1) g.circle(x, b, 3.8).fill(0xe765c3);
    });
}

function meter(c: Cx): void {
    const { g } = c;
    const cyan = 0x6ad8e8;
    const left = Math.max(0, 97 - Math.floor(Math.max(0, c.t - 3)));

    g.circle(32.5, 34, 15.5).stroke({ width: 3.5, color: 0x296671 });
    g.arcSweep(32.5, 34, 15.5, -PI / 2, (left / 97) * PI * 0.72).stroke({ width: 3.5, color: 0x58d8de });
    g.line(37.5, 34, 41.5, 34.8).stroke({ width: 3, color: 0x58d8de, cap: 'round' });
    c.text('Meter Remaining', 209, 45, { size: 13, color: cyan, weight: '500', align: 'right' });
    c.text(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, 212, 44, {
        size: 29,
        color: cyan,
        weight: '300',
    });
}

function race(c: Cx): void {
    const { g } = c;
    const red = 0xf06470;

    g.polyline(TRACK_DARK, { smooth: 'catmull' }).stroke({ width: 5.5, color: 0x923640, cap: 'round' });
    g.polyline(TRACK_BRIGHT, { smooth: 'catmull' }).stroke({ width: 5.5, color: 0xef4e5a, cap: 'round' });
    g.save().translateTransform(37, 62).rotateTransform(0.35);
    g.ellipse(0, 0, 2.7, 4.6).fill(0xf5d32a);
    g.restore();
    const u = 0.5 + osc(c.t, 0.3) * 0.08;

    g.circle(59.5 + (85 - 59.5) * u, 75 + (90 - 75) * u, 2.6).fill(W);
    c.text('Sector 2', 23, 104, { size: 13, color: red, weight: '500' });
    c.text('Lap 5', 255, 30, { size: 13, color: red, weight: '500', align: 'right' });
    [
        ['Lap 4', '1:16:36'],
        ['Lap 3', '1:17:24'],
        ['Lap 2', '1:18:15'],
    ].forEach(([lap, time], i) => {
        const y = 56 + i * 22;

        g.line(152, y - 15, 256, y - 15).stroke({ width: 1, color: 0x5a1a22 });
        c.text(lap, 153, y, { size: 13, color: red, weight: '500' });
        c.text(time, 255, y, { size: 13, color: red, weight: '500', align: 'right' });
    });
}

// ------------------------------------------------------------------------------ cropped edge widgets

function edgeDashes(c: Cx): void {
    c.g.pill(167, 13, 8, 4).fill(0xff4a6a);
    c.g.pill(177, 19, 16, 4).fill(0xff4a6a);
}

function edgeMt(c: Cx): void {
    c.text('5', 218, 42, { size: 28, weight: '300', align: 'right' });
    c.text('MT', 235, 38, { size: 15, color: 0x8c9cff, weight: '600' });
}

function edgeParking(c: Cx): void {
    const { g } = c;

    c.text('45m left', 216, 34, { size: 14, weight: '500' });
    g.polyline([212, 41, 222, 51, 232, 65, 241, 74, 249, 78.5, 274, 80], { smooth: 'catmull' }).stroke({
        width: 3,
        gradient: GREEN_LINE,
        cap: 'round',
    });
    g.pill(219.5, 96.5, 55, 30).fill(0x3a3a3c);
    I.carFront(g, 247, 111.5, 15, W, 0x3a3a3c);
}

function edgePlane(c: Cx): void {
    I.plane(c.g, 185, 16.5, 20, 0x5ad8f0);
}

function edgeBox(c: Cx): void {
    c.g.roundRect(174.5, 7, 23, 23, 7).fill(0xc080f0);
    I.box(c.g, 186, 18.5, 12, 0xf6ecff, 0xc080f0);
}

function edgeBike(c: Cx): void {
    I.bike(c.g, 23.5, 20, 20, 0xe0f050, true);
}

function edgeBus(c: Cx): void {
    I.bus(c.g, 19.5, 17, 18, 0x6ae06a);
}

function edgeHeart(c: Cx): void {
    c.g.heart(32, 34.5, 26, 0.12).fill(0xff4f8a);
    c.text('87', 51, 43, { size: 30, color: 0xff5a8c, weight: '400' });
}

function edgeDropOff(c: Cx): void {
    const { g } = c;

    c.text('Drop off in', 25, 35, { size: 13, color: 0x9fa5bb, weight: '500' });
    g.pill(20, 53, 100, 9).fill(0x3a3a3c);
    g.pill(20, 53, 40, 9).fill(0x8cc8ff);
    g.pill(39, 49.5, 25, 17).fill(W);
    g.roundRect(46, 53, 3, 10, 1).fill(0x3a3a3c);
    g.roundRect(54, 53, 3, 10, 1).fill(0x3a3a3c);
    g.circle(35, 93, 12.5).fill(0x3a3f55);
    I.person(g, 35, 93, 14, 0x8a90b0);
    c.text('Mich', 59, 98, { size: 15.5, weight: '500' });
}

function edgeF1(c: Cx): void {
    I.f1Car(c.g, 25.5, 18.5, 11, 0xe8403c);
}

function edgeDrop(c: Cx): void {
    I.dropOutline(c.g, 14, 18, 14, 0xb4b0f0, 0.1);
    c.text('7.2', 21.5, 23, { size: 17, color: 0xb4b0f0, weight: '400' });
}

function edgeEv(c: Cx): void {
    I.bolt(c.g, 17.5, 20, 14, 0x5ef0b0);
    c.text('45m', 190, 25, { size: 18, color: 0x5ef0b0, weight: '500', align: 'right' });
}

const none = () => undefined;

type Def = [
    id: string,
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    draw: (c: Cx) => void,
    partial?: boolean,
    radius?: number,
];

const defs: Def[] = [
    ['s4-flight', 'Flight', 114, 32, 292, 102, flight],
    ['s4-pickup', 'Order pickup', 113, 178, 293, 132, pickup],
    ['s4-glucose', 'Glucose', 113, 354, 293, 158, glucose],
    ['s4-delivery', 'Delivery', 115, 561, 291, 132, delivery],
    ['s4-train', 'Train', 459, -60, 286, 128, train, true],
    ['s4-espresso', 'Espresso timer', 458, 106, 287, 137, espresso],
    ['s4-iss', 'ISS flyover', 457, 296, 286, 141, iss],
    ['s4-cadence', 'Run cadence', 456, 486, 286, 147, cadence],
    ['s4-sunset', 'Sunset', 796, 39, 282, 123, sunset],
    ['s4-pressure', 'Blood pressure', 797, 205, 282, 132, pressure],
    ['s4-meter', 'Parking meter', 796, 377, 280, 66, meter, false, 33],
    ['s4-race', 'Race', 797, 485, 281, 127, race],
    // cut by the sheet edges
    ['s4-edge-dashes', 'Edge', -130, 42, 205, 37, edgeDashes, true, 18.5],
    ['s4-edge-mt', 'Edge', -205, 143, 280, 64, edgeMt, true, 32],
    ['s4-edge-parking', 'Edge', -217, 271, 292, 144, edgeParking, true],
    ['s4-edge-plane', 'Edge', -130, 476, 206, 36, edgePlane, true, 18],
    ['s4-edge-box', 'Edge', -130, 573, 208, 37, edgeBox, true, 18.5],
    ['s4-edge-bottom', 'Edge', 501, 662, 197, 36, none, true, 18],
    ['s4-edge-top', 'Edge', 804, -25, 197, 36, none, true, 18],
    ['s4-edge-ev', 'Edge', 795, 651, 202, 40, edgeEv, true, 20],
    ['s4-edge-bike', 'Edge', 1109, 31, 205, 36, edgeBike, true, 18],
    ['s4-edge-bus', 'Edge', 1112, 132, 205, 36, edgeBus, true, 18],
    ['s4-edge-heart', 'Edge', 1113, 218, 280, 67, edgeHeart, true, 33.5],
    ['s4-edge-dropoff', 'Edge', 1116, 348, 290, 126, edgeDropOff, true],
    ['s4-edge-f1', 'Edge', 1112, 539, 205, 36, edgeF1, true, 18],
    ['s4-edge-drop', 'Edge', 1086, 641, 205, 36, edgeDrop, true, 18],
];

export const sheet4: SheetWidget[] = defs.map(([id, name, x, y, w, h, draw, partial, radius]) => ({
    id,
    name,
    x,
    y,
    w,
    h,
    draw,
    partial,
    radius,
}));

/** Light backdrop measured from the reference. */
export function sheet4Backdrop(g: G): void {
    g.rect(0, 0, 1200, 672).fill(
        vertical([
            [0, 0xe8e8e8],
            [1, 0xe2e2e2],
        ]),
    );
}

/** Black card with the reference's continuous corners and its big soft shadow (σ 30.5, 37.5 px down, 45%). */
export function sheet4Card(g: G, w: SheetWidget): void {
    const r = w.radius ?? 34;
    const smooth = w.radius ? 0 : 0.3;

    g.roundRect(0, 37.5, w.w, w.h, r, smooth).fill({ color: 0x000000, alpha: 0.45, blur: 30.5 });
    g.roundRect(0, 0, w.w, w.h, r, smooth).fill(0x000000);
}
