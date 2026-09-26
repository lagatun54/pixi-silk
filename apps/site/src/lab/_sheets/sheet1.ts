import { linear, type SilkGraphics, vertical } from 'pixi-silk';
import type { Cx, SheetWidget } from './cx';

/*
 * Reference sheet 1 (1080×1080): ten Health cards on black, drawn in reference pixels.
 * Card boxes, text metrics, bar/candle geometry and colours were measured from the reference image.
 */

const W = 0xffffff;
/** Primary text: the reference's "white" is a touch softer than pure white. */
const TEXT = 0xebebeb;
const GRAY = 0x8e8e93;
const YELLOW = 0xfad50a;
const PINK = 0xff2d60;
const DIM = 0x484848;
const CARD = 0x1a1a1a;
const GUIDE = 0x5a5a5c;
/** The reference's text runs ~0.06 em looser than Chrome's SF at these sizes. */
const TRACK = 1.3;

const osc = (t: number, f: number, ph = 0) => Math.sin((t - 3) * f + ph) - Math.sin(ph);

/** Weekly trend line shared by the two area charts. */
const TREND = [
    19, 124, 27, 125, 35, 126, 43, 127, 51, 126.5, 59, 126.5, 67, 127, 75, 128, 83, 128, 91, 128, 99, 129, 107, 129,
    115, 129, 123, 129, 131, 128, 139, 128, 147, 128, 155, 128, 163, 128, 171, 129, 179, 129, 187, 130, 195, 130, 203,
    131, 211, 131, 219, 131, 227, 132, 235, 133, 243, 133, 251, 133, 259, 132, 267, 132, 275, 132, 283, 132, 291, 132,
    299, 132, 306, 132,
];
const TREND_DOTS = [39, 53.5, 80, 94, 119, 132.5, 160, 199, 212.5, 239, 279, 305];
/** Fat % bars: tops (bottom 172), x = 24 + 12 i. */
const FAT_BARS = [
    122, 122, 124, 126, 128, 126, 125, 126, 129, 125, 131, 133, 135, 135, 133, 132, 132, 133, 135, 136, 138, 141, 141,
    140, 141, 142, 143,
];
const FAT_FUTURE = [142, 143, 142, 145, 146];
/** Heart-rate candles: top, bottom; x = 24 + 12 i. */
const CANDLES = [
    [122, 132],
    [114, 140],
    [119, 137],
    [119, 136],
    [117, 138],
    [123, 131],
    [116, 139],
    [122, 133],
    [125, 129],
    [116, 139],
    [119, 136],
    [122, 132],
    [121, 134],
    [111, 143],
    [120, 135],
    [126, 129],
    [123, 132],
    [125, 130],
    [119, 136],
    [115, 139],
    [123, 131],
    [125, 130],
    [121, 133],
    [124, 131],
    [122, 132],
    [124, 131],
    [125, 129],
];

const AREA_GOLD = vertical([
    [0, 0xa06a00],
    [0.35, 0x805101],
    [0.65, 0x51340c],
    [1, 0x201d19],
]);
const AREA_GRAY = vertical([
    [0, 0x4c4c4c],
    [1, 0x1f1f1f],
]);
const AURA_TILE = linear(
    [
        [0, 0xffffff],
        [0.55, 0xe6fbf3],
        [1, 0x7fe8c8],
    ],
    { from: [1, 0], to: [0, 1] },
);
const AURA_BRIDGE = linear(
    [
        [0, 0x9ff0d4],
        [1, 0x14cf4a],
    ],
    { from: [1, 0], to: [0, 1] },
);
const AURA_HEART = vertical([
    [0, 0xff4f7a],
    [1, 0xe8203c],
]);

type G = SilkGraphics;

function lineY(x: number): number {
    for (let i = 2; i < TREND.length; i += 2) {
        if (x <= TREND[i]) {
            const x0 = TREND[i - 2];

            return TREND[i - 1] + ((TREND[i + 1] - TREND[i - 1]) * (x - x0)) / (TREND[i] - x0);
        }
    }

    return TREND[TREND.length - 1];
}

/** Three-circle "body fat" glyph: `r` is the circle radius, (x, y) the top circle's centre. */
function fatIcon(g: G, x: number, y: number, r: number, color: number): void {
    const dy = r * Math.sqrt(3);

    g.circle(x, y, r).fill(color);
    g.circle(x - r, y + dy, r).fill(color);
    g.circle(x + r, y + dy, r).fill(color);
}

function stat(c: Cx, x: number, parts: [string, number][]): void {
    let cx = x;

    for (const [str, color] of parts) {
        c.text(str, cx, 72.5, { size: 22.5, color, weight: '400', spacing: TRACK });
        cx += c.width(str, { size: 22.5, weight: '400', spacing: TRACK }) + 12;
    }
}

function fatHeader(c: Cx, big: boolean, gray = false): void {
    const x = big ? 98 : 88;

    if (big) fatIcon(c.g, 48, 33.5, 14.5, gray ? DIM : YELLOW);
    else fatIcon(c.g, 43, 35, 12, YELLOW);
    c.text('Fat', x, 39, { size: 22, color: GRAY, weight: '400', spacing: TRACK });
    if (gray) c.text('--', x, 72.5, { size: 22.5, color: TEXT, weight: '400', spacing: TRACK });
    else
        stat(c, x, [
            ['33%', TEXT],
            ['↓ 3%', GRAY],
            ['66 lbs', GRAY],
        ]);
}

function heartHeader(c: Cx, gray = false): void {
    c.g.heart(43, 49.5, 46, 0.12).fill(gray ? DIM : PINK);
    c.text('Heart rate (Avg.)', 88, 39.5, { size: 22, color: GRAY, weight: '400', spacing: TRACK });
    if (gray) c.text('--', 88, 72.5, { size: 22.5, color: TEXT, weight: '400', spacing: TRACK });
    else
        stat(c, 87.5, [
            ['72 bpm', TEXT],
            ['↓ 3%', GRAY],
        ]);
}

function guides(c: Cx, ys: [number, number], labels: [string, string], lx: number, dy: number): void {
    for (const y of ys) c.g.line(19, y, 405, y).stroke({ width: 1, color: GUIDE, dash: [2, 2.6] });
    c.text(labels[0], lx, ys[0] + dy, { size: 13.5, color: GRAY, weight: '400', spacing: 0.8 });
    c.text(labels[1], lx, ys[1] + dy, { size: 13.5, color: GRAY, weight: '400', spacing: 0.8 });
}

function now(g: G, x: number): void {
    g.line(x, 96, x, 171).stroke({ width: 1.5, color: W });
}

// ------------------------------------------------------------------------------------ cards

function fatArea(c: Cx): void {
    const { g } = c;
    const wob = osc(c.t, 0.5) * 0.8;
    const pts = [...TREND, 332.5, 134.5].map((v, i) => (i % 2 ? v + wob * Math.sin(i * 0.3) : v));

    fatHeader(c, true);
    guides(c, [114, 133.5], ['50', '35'], 412, 7);
    g.area(pts, 172).fill(AREA_GOLD);
    g.polyline(pts).stroke({ width: 2, color: YELLOW });
    for (const x of TREND_DOTS) {
        const i = Math.round((x - 19) / 8) * 2 + 1;

        g.circle(x, lineY(x) + wob * Math.sin(i * 0.3), 3.5)
            .fill(YELLOW)
            .stroke({ width: 1.2, color: CARD, alignment: 'outside' });
    }
    g.line(339, 135.2, 392, 142.5).stroke({ width: 2.2, color: YELLOW, dash: [3, 3.5] });
    now(g, 332.5);
    g.circle(332.5, pts[pts.length - 1], 7)
        .fill(W)
        .stroke({ width: 1.5, color: CARD, alignment: 'outside' });
}

function fatEmpty(c: Cx): void {
    const { g } = c;
    const pulse = 1 + osc(c.t, 2) * 0.02;

    fatHeader(c, true, true);
    g.circle(415, 48, 29 * pulse).fill(0x1ed23c);
    g.line(400, 48, 430, 48).stroke({ width: 4, color: 0x0b1a10 });
    g.line(415, 33, 415, 63).stroke({ width: 4, color: 0x0b1a10 });
    guides(c, [114, 133.5], ['50%', '35%'], 413, 7);
    g.area(TREND, 172).fill(AREA_GRAY);
    g.polyline(TREND).stroke({ width: 1.5, color: 0x9a9a9a });
    g.line(306, 132, 400, 137).stroke({ width: 1.5, color: 0x9a9a9a, dash: [2.4, 3] });
    now(g, 334);
}

function fatBars(c: Cx): void {
    const { g } = c;

    fatHeader(c, false);
    guides(c, [114, 133.5], ['50%', '35%'], 412, 7);
    FAT_BARS.forEach((top, i) => {
        const tt = top + osc(c.t, 0.8, i) * 0.8;

        g.roundRect(24 + 12 * i - 4, tt, 8, 172 - tt, 2.5).fill(YELLOW);
    });
    FAT_FUTURE.forEach((top, i) => g.roundRect(348 + 12 * i - 4, top, 8, 172 - top, 2.5).fill(0x483f18));
    now(g, 334);
}

function fatBlocks(c: Cx): void {
    const { g } = c;
    const tops = [153, 138, 124, 110, 96];

    fatHeader(c, false);
    tops.forEach((top, i) => {
        const tt = top + (i < 3 ? osc(c.t, 0.6, i) * 1.2 : 0);

        g.roundRect(19 + 86 * i, tt, 81, 172 - tt, 4.5).fill(i < 3 ? YELLOW : DIM);
    });
}

function heartCandles(c: Cx, gray: boolean): void {
    const { g } = c;
    const n = gray ? 25 : CANDLES.length;

    heartHeader(c, gray);
    guides(c, [119.5, 148], ['90', '50'], 421, 6.5);
    for (let i = 0; i < n; i++) {
        const [top, bottom] = CANDLES[i];
        const k = 1 + (gray ? 0 : osc(c.t, 1.3, i) * 0.12);
        const mid = (top + bottom) / 2;
        const h = Math.max(3, (bottom - top) * k);

        g.roundRect(24 + 12 * i - 3.75, mid - h / 2, 7.5, h, 2).fill(gray ? 0x464646 : PINK);
    }
    now(g, 334.5);
}

function heartRate(c: Cx): void {
    heartCandles(c, false);
}

function heartEmpty(c: Cx): void {
    const { g } = c;

    heartCandles(c, true);
    // Aura app icon: a green tile and a white tile melting into each other, lettering and a heart
    g.roundRect(386.75, 37.75, 38.75, 38.75, 9, 0.3).fill(0x10cf46);
    g.roundRect(404.25, 19, 40, 40, 9, 0.3).fill(AURA_TILE);
    g.roundRect(398, 31, 30, 30, 13).fill(AURA_BRIDGE);
    g.heart(428.6, 33.5, 20, 0.14).fill(AURA_HEART);
    c.text('ΛU', 394, 55.5, { size: 13.5, color: 0x0b3a18, weight: '500', spacing: 3 });
    c.text('RΛ', 394, 70, { size: 13.5, color: 0x0b3a18, weight: '500', spacing: 3 });
}

function ticks(c: Cx, xs: [number, number], labels: [string, string]): void {
    for (const x of xs) c.g.line(x, 94, x, 114).stroke({ width: 1, color: 0x9a9a9e });
    c.text(labels[0], xs[0] - 10, 107, { size: 13, color: GRAY, weight: '400', align: 'right', spacing: 0.8 });
    c.text(labels[1], xs[1] + 12, 107, { size: 13, color: GRAY, weight: '400', spacing: 0.8 });
}

function fatProgress(c: Cx): void {
    const { g } = c;
    const fill = 258 + osc(c.t, 0.3) * 4;

    fatHeader(c, false);
    ticks(c, [136, 310], ['40%', '60%']);
    g.roundRect(19, 114.5, 424, 19.5, 4).fill(DIM);
    g.roundRect(19, 114.5, fill - 19, 19.5, 4).fill(YELLOW);
}

function heartRange(c: Cx): void {
    const { g } = c;
    const s = osc(c.t, 0.3) * 3;

    heartHeader(c);
    ticks(c, [137, 311], ['50', '90']);
    g.roundRect(19, 114.5, 424, 19.5, 4).fill(DIM);
    g.roundRect(119 + s, 114.5, 127, 19.5, 4).fill(PINK);
}

function fatSignal(c: Cx): void {
    const { g } = c;
    const tops = [66, 54, 42, 31, 19];

    fatHeader(c, false);
    tops.forEach((top, i) => g.roundRect(376 + 14.5 * i, top, 9, 76 - top, 2).fill(i < 3 ? YELLOW : 0x494949));
}

function fatPlain(c: Cx): void {
    fatHeader(c, false);
}

const defs: [string, string, number, number, number, number, (c: Cx) => void][] = [
    ['s1-fat-area', 'Body fat · trend', 60, 60, 462, 191, fatArea],
    ['s1-fat-empty', 'Body fat · no data', 557, 60, 463, 191, fatEmpty],
    ['s1-fat-bars', 'Body fat · daily', 60, 286, 462, 191, fatBars],
    ['s1-fat-blocks', 'Body fat · weekly', 557, 286, 463, 191, fatBlocks],
    ['s1-heart', 'Heart rate', 60, 511, 462, 191, heartRate],
    ['s1-heart-empty', 'Heart rate · app', 557, 511, 463, 191, heartEmpty],
    ['s1-fat-progress', 'Body fat · goal', 60, 737, 462, 153, fatProgress],
    ['s1-heart-range', 'Heart rate · range', 557, 737, 463, 153, heartRange],
    ['s1-fat-signal', 'Body fat · level', 60, 925, 462, 95, fatSignal],
    ['s1-fat-plain', 'Body fat', 557, 925, 463, 95, fatPlain],
];

export const sheet1: SheetWidget[] = defs.map(([id, name, x, y, w, h, draw]) => ({
    id,
    name,
    x,
    y,
    w,
    h,
    draw,
    radius: 18,
}));

/** Card surface: #1a1a1a with slightly continuous 18 px corners. */
export function sheet1Card(g: G, w: SheetWidget): void {
    g.roundRect(0, 0, w.w, w.h, w.radius ?? 18, 0.25).fill(CARD);
}
