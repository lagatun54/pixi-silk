import { horizontal, linear, radial, type SilkGraphics, vertical } from 'pixi-silk';
import type { Cx, SheetWidget } from './cx';
import * as I from './icons';

/*
 * Reference sheet 3 (1080×1080): twenty fitness / home complications, drawn in reference pixels.
 * Text sizes, baselines and chart shapes were measured from the reference image.
 */

const PI = Math.PI;
const W = 0xffffff;
const GRAY = 0x8e8e93;
const AXIS = 0x7c7c80;
const DIM = 0x48484a;
const PALE = 0xf5e6a0;
const RED = 0xff5a5f;
const XS = [57, 315, 574, 832];
const YS = [212, 354, 495, 640, 784];

const osc = (t: number, f: number, ph = 0) => Math.sin((t - 3) * f + ph) - Math.sin(ph);
/** Deterministic 0..1 noise. */
const hash = (i: number) => {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;

    return s - Math.floor(s);
};

const GOLDEN_BAR = horizontal([
    [0, 0xdcc9ae],
    [0.27, 0x8fc0ec],
    [0.52, 0x5aa0e8],
    [0.74, 0x8aa8c8],
    [0.86, 0xc9b9a6],
    [0.9, 0xd8a060],
    [1, 0xe8a040],
]);
const KNOB_GLOW = radial([
    [0, 0x9cc4f0, 0.35],
    [1, 0x9cc4f0, 0],
]);
const BPM_HIGH = vertical([
    [0, 0x3a1f5a, 0.9],
    [1, 0x3a1f5a, 0.1],
]);
const BPM_LOW = vertical([
    [0, 0x0f3a4a, 0.1],
    [1, 0x0f3a4a, 0.9],
]);
const ALERT_GLOW = vertical([
    [0, 0x5a1414, 0.25],
    [1, 0x8a1a1a, 0.75],
]);
const POWER_FILL = vertical([
    [0, 0x2e5a14, 0.95],
    [1, 0x2e5a14, 0.08],
]);
const WATER_GLOW = vertical([
    [0, 0x3ad0f5, 0],
    [1, 0x3ad0f5, 0.35],
]);
const TEMP_LINE = linear(
    [
        [0, 0x6fd66f],
        [1, 0x4a6ae8],
    ],
    { units: 'local', from: [0, 30], to: [0, 60] },
);
const LAMP_TRACK = horizontal([
    [0, 0x3a3a3c],
    [1, 0x1c1c1e],
]);
const EDGE_FADE = horizontal([
    [0, 0x000000, 0],
    [0.6, 0x000000, 1],
]);

/** Run heart-rate candles traced from the reference: x, top, bottom. */
const CANDLES = [
    [36.5, 40, 44],
    [42.5, 46, 52],
    [49, 44, 55],
    [55.5, 46, 52],
    [62, 53, 57],
    [68.5, 45, 54],
    [75, 48, 56],
    [81.5, 49, 52],
    [88, 43, 51],
    [94.5, 42, 45],
    [101, 50, 53],
    [107.5, 45, 48],
    [114, 40, 44],
    [120.5, 46, 54],
    [127, 48, 60],
    [133.5, 44, 59],
    [140, 47, 53],
    [146.5, 34, 45],
    [153, 53, 58],
    [159.5, 48, 55],
    [166, 45, 50],
    [172.5, 44, 49],
    [179, 38, 44],
];

/** Wind speed curve traced from the reference. */
const WIND = [
    31, 54.5, 38, 55, 44, 54, 50, 52.5, 56, 53.5, 65, 53, 71, 53, 77, 55, 80, 50.5, 83, 45, 86, 42.5, 89, 42, 92, 44,
    95, 46, 98, 48, 101, 48.5, 104, 48, 110, 47, 113, 50, 116, 52, 122.7, 52, 131, 52, 134, 51, 137, 52, 143, 54.5, 149,
    54.5, 155, 56, 161, 57, 170, 56.5, 179, 57, 188, 58,
];

/** Hike route traced from the reference map. */
const ROUTE = [
    89, 65.7, 89, 28, 97, 28, 98, 25, 100, 27, 102, 33, 112, 33, 114, 13, 125, 13, 128, 29, 145, 29, 147, 23, 150, 16,
    173.3, 15.7,
];

type G = SilkGraphics;

function stripes(g: G, x0: number, x1: number, step: number, y0: number, y1: number, color = 0x262628): void {
    for (let x = x0; x <= x1 + 0.01; x += step) g.line(x, y0, x, y1).stroke({ width: 0.8, color });
}

function axis(c: Cx, labels: [string, number, number?][], y: number, seps: number[] = [], size = 11.5): void {
    for (const s of seps) c.g.line(s, y - 13, s, y + 3).stroke({ width: 1, color: 0x2c2c2e });
    for (const [s, x, color] of labels) c.text(s, x, y, { size, color: color ?? AXIS, weight: '500' });
}

function days(c: Cx, xs: number[], y: number, highlight = -1, dim = GRAY): void {
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) =>
        c.text(d, xs[i], y, {
            size: 11.5,
            color: i === highlight ? W : dim,
            weight: i === highlight ? '700' : '500',
            align: 'center',
        }),
    );
}

// ---------------------------------------------------------------------------------- icons

function tableLamp(g: G, x: number, y: number, s: number, color: number): void {
    g.save().translateTransform(x, y).scaleTransform(s);
    g.area([-0.36, -0.06, -0.2, -0.5, 0.2, -0.5, 0.36, -0.06], -0.06).fill(color);
    g.line(0, -0.06, 0, 0.4).stroke({ width: 0.1, color });
    g.pill(-0.2, 0.36, 0.4, 0.12).fill(color);
    g.restore();
}

function timer(g: G, x: number, y: number, s: number, color: number): void {
    g.save().translateTransform(x, y).scaleTransform(s);
    g.arcSweep(0, 0.04, 0.42, -PI * 0.35, PI * 1.7).stroke({ width: 0.1, color, cap: 'round' });
    g.line(0, 0.04, 0.18, -0.16).stroke({ width: 0.1, color, cap: 'round' });
    g.restore();
}

function walker(g: G, x: number, y: number, s: number, color: number, poles = false): void {
    g.save().translateTransform(x, y).scaleTransform(s);
    const w = { width: 0.13, color, cap: 'round' as const };

    g.circle(0.06, -0.4, 0.11).fill(color);
    g.line(0.02, -0.22, -0.04, 0.1).stroke({ ...w, width: 0.17 });
    g.polyline([-0.2, -0.02, 0, -0.18, 0.2, 0.02]).stroke(w);
    g.polyline([-0.04, 0.1, 0.16, 0.28, 0.14, 0.5]).stroke(w);
    g.polyline([-0.04, 0.1, -0.16, 0.32, -0.3, 0.46]).stroke(w);
    if (poles) g.line(0.28, -0.08, 0.36, 0.5).stroke({ width: 0.07, color, cap: 'round' });
    g.restore();
}

function pin(g: G, x: number, y: number, s: number, color: number): void {
    g.save().translateTransform(x, y).scaleTransform(s);
    g.circle(0, -0.14, 0.3).stroke({ width: 0.1, color });
    g.circle(0, -0.14, 0.1).fill(color);
    g.line(0, 0.16, 0, 0.48).stroke({ width: 0.1, color, cap: 'round' });
    g.restore();
}

function ear(g: G, x: number, y: number, s: number, color: number): void {
    g.save().translateTransform(x, y).scaleTransform(s);
    const w = { width: 0.1, color, cap: 'round' as const };

    g.moveTo(-0.16, 0.44)
        .bezierCurveTo(-0.38, 0.2, -0.4, -0.46, 0.02, -0.46)
        .bezierCurveTo(0.36, -0.46, 0.4, -0.08, 0.18, 0.1)
        .quadraticCurveTo(0.06, 0.2, 0.04, 0.34)
        .stroke(w);
    g.moveTo(-0.12, -0.02).bezierCurveTo(-0.14, -0.28, 0.16, -0.3, 0.14, -0.1).stroke(w);
    g.restore();
}

function windLines(g: G, x: number, y: number, s: number, color: number): void {
    g.save().translateTransform(x, y).scaleTransform(s);
    const w = { width: 0.1, color, cap: 'round' as const };

    g.moveTo(-0.48, -0.2).lineTo(0.18, -0.2).quadraticCurveTo(0.42, -0.2, 0.36, -0.38).stroke(w);
    g.line(-0.48, 0.02, 0.4, 0.02).stroke(w);
    g.moveTo(-0.48, 0.24).lineTo(0.12, 0.24).quadraticCurveTo(0.34, 0.26, 0.28, 0.44).stroke(w);
    g.restore();
}

// ------------------------------------------------------------------------------------ row 1

function goldenTime(c: Cx): void {
    const { g } = c;
    const orange = 0xf0a060;
    const dx = 95.7 + osc(c.t, 0.2) * 3;

    I.sunIcon(g, 6.5, 10.5, 14, orange);
    c.text('19:52', 15, 16, { size: 16.5, color: orange, weight: '600', spacing: 0.6 });
    c.text('GOLDEN TIME', 67, 16, { size: 11.5, color: orange, weight: '600' });
    g.ellipse(dx, 38, 18, 12).fill(KNOB_GLOW);
    g.pill(2.3, 28, 186.7, 5.5).fill(GOLDEN_BAR);
    g.circle(dx, 30.7, 12).fill({ color: 0x000000, alpha: 0.85, blur: 4 });
    g.circle(dx, 30.7, 3.8).fill(W).stroke({ width: 1.4, color: 0x000000, alignment: 'outside' });
    g.circle(168, 30.7, 3.8).fill(0xc8b8a8).stroke({ width: 1.4, color: 0x000000, alignment: 'outside' });
    c.text('05:33', 3, 54, { size: 14.5, weight: '500' });
    c.text('20:40', 189, 54, { size: 14.5, color: orange, weight: '500', align: 'right' });
    c.text('DAYLIGHT', 3, 76, { size: 14, weight: '500' });
    c.run(
        188,
        76,
        [
            ['15', 14.5, W, '500', 1],
            ['HRS', 10, W, '600', 4],
            ['8', 14.5, W, '500', 1],
            ['MIN', 10, W, '600'],
        ],
        'right',
    );
}

function weekCalendar(c: Cx): void {
    const { g } = c;
    const xs = [31.7, 55, 79.3, 102.7, 126.7, 150.7, 174.3];
    const ny = 55.7 + osc(c.t, 0.15) * 1.5;

    c.text('Next', 3, 16, { size: 16, color: 0xeb4d3d, weight: '600' });
    c.text('Staff meet...', 43, 16, { size: 16.5, weight: '500' });
    c.text('8/15 - 8/21', 189, 17, { size: 11, color: GRAY, weight: '500', align: 'right' });
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) =>
        c.text(d, xs[i], 33, { size: 11.5, color: i === 0 ? 0xeb4d3d : GRAY, weight: '600', align: 'center' }),
    );
    for (const x of [43.3, 67, 91, 114.7, 138.7, 162.5, 186.3])
        g.line(x, 20, x, 84).stroke({ width: 1, color: 0x2c2c2e });
    c.text('9', 3, 40.7, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    c.text('12', 1, 60, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    c.text('15', 1, 79, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    g.roundRect(26, 39.5, 11, 2.5, 1.2).fill(0x1a6a3a);
    g.roundRect(26, 59, 14, 11.7, 3).fill(0x6e6cf5);
    g.roundRect(26, 74, 14, 10, 3).fill(0x1a8ae8);
    g.roundRect(50, 74, 12, 10, 3).fill(0xff2d55);
    g.roundRect(73, 43.3, 14, 16.7, 3).fill(0x6e6cf5);
    g.roundRect(73, 76, 14, 8, 3).fill(0x5ac8fa);
    g.roundRect(121, 37, 13, 2.5, 1.2).fill(0xf5c56b);
    g.roundRect(121, 42, 13, 2.5, 1.2).fill(0xf5c56b);
    g.roundRect(121, 64, 13, 20, 3).fill(0x6e6e73);
    g.line(19, ny, 200, ny).stroke({ width: 1.1, color: 0xd83a34 });
    g.circle(19, ny, 2.3).fill(0xe0443c);
}

function runCandles(c: Cx): void {
    const { g } = c;

    c.run(2, 16, [
        ['23:48', 16, PALE, '600', 7],
        ['1.17', 16, 0x6ab8ff, '600', 2],
        ['KM', 10.5, 0x6ab8ff, '600', 7],
        ['83', 16, RED, '600', 2],
        ['KCAL', 10.5, RED, '600'],
    ]);
    g.circle(182, 10.5, 8).fill(0xb8f03a);
    I.runner(g, 182, 10.5, 11, 0x000000);
    c.text('155', 0, 33, { size: 11.5, color: GRAY, weight: '500' });
    c.text('BPM', 0, 50.7, { size: 11.5, color: 0xd9504a, weight: '600' });
    c.text('97', 0, 68, { size: 11.5, color: GRAY, weight: '500' });
    stripes(g, 30, 185.7, 6.5, 24, 86);
    CANDLES.forEach(([x, top, bottom], i) => {
        const dy = osc(c.t, 1.5, i) * 0.8;

        g.pill(x - 1.1, top + dy - 0.5, 2.2, bottom - top + 1).fill(0xe0453c);
    });
    axis(
        c,
        [
            ['9:06', 32],
            ['9:12', 71],
            ['9:18', 111],
            ['9:24', 150],
        ],
        80.5,
        [30, 69, 108.5, 147.5],
    );
}

function bpmScatter(c: Cx): void {
    const { g } = c;

    I.heartOutline(g, 11, 11, 14, W);
    c.run(22, 16, [
        ['76', 16, W, '600', 3],
        ['BPM', 10.5, W, '600', 6],
        ['AVG', 10.5, GRAY, '600'],
    ]);
    c.text('25 JUL, MON', 187, 17, { size: 14, color: GRAY, weight: '500', align: 'right' });
    c.text('150', 0, 33, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    c.text('100', 0, 50.7, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    c.text('50', 0, 68, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    g.rect(27.3, 22, 159.4, 25).fill(BPM_HIGH);
    g.rect(27.3, 50, 159.4, 19).fill(BPM_LOW);
    stripes(g, 27.3, 186.7, 6.5, 22, 47, 0x4a2a6a);
    stripes(g, 27.3, 186.7, 6.5, 50, 69, 0x17485a);
    g.line(27.3, 54.7, 186.7, 54.7).stroke({ width: 1.2, color: W });
    g.circle(27.3, 54.7, 1.8).fill(W);
    g.circle(186.7, 54.7, 1.8).fill(W);
    for (const [x, y] of [
        [105, 40],
        [111, 42],
        [118, 38],
        [124, 38.5],
        [130, 40],
        [137, 44],
    ])
        g.circle(x, y, 1.6).fill(0xc89bff);
    for (let i = 0; i < 30; i++) {
        const x = 60 + i * 4.1;
        const y = 60 + 4 * Math.sin(i * 1.9 + 1) + osc(c.t, 1.2, i) * 0.6;

        g.circle(x, y, 1.6).fill(0x5ac8fa);
    }
    axis(
        c,
        [
            ['00', 32, DIM],
            ['06', 70.7],
            ['12', 108],
            ['18', 147],
        ],
        83,
        [27.3, 66, 105, 144],
    );
}

// ------------------------------------------------------------------------------------ row 2

function lamp(c: Cx): void {
    const { g } = c;
    const orange = 0xff9f0a;
    const v = 0.64 + osc(c.t, 0.4) * 0.06;

    tableLamp(g, 5.5, 11, 15, 0xf5a54a);
    c.text('Accent Lamp', 13, 18.5, { size: 17.5, color: 0xf5a54a, weight: '400' });
    c.text('BEDROOM', 188, 17, { size: 10.5, color: GRAY, weight: '600', align: 'right' });
    g.roundRect(4, 30, 150, 25.7, 4).fill(LAMP_TRACK);
    g.roundRect(4, 30, 150 * v, 25.7, 4).fill({ color: orange, alpha: 0.5, blur: 3 });
    g.roundRect(4, 30, 150 * v, 25.7, 4).fill(orange);
    c.text(`${Math.round(v * 100)}%`, 150 * v + 1, 47.5, { size: 13, color: 0x5a2d00, weight: '600', align: 'right' });
    g.circle(175, 43, 12.8).fill(W);
    g.circle(175, 43, 11.3).fill(0x000000);
    g.circle(175, 43, 10.2).fill(orange);
    timer(g, 6.5, 72, 12, GRAY);
    c.run(14, 76.5, [
        ['TIMING SET TO', 11.5, GRAY, '500', 5],
        ['10:45', 13, W, '600', 2],
        ['AM', 9.5, W, '600'],
    ]);
}

function restingHr(c: Cx): void {
    const { g } = c;
    const pink = 0xff375f;
    const py = 39.7 + osc(c.t, 0.5) * 0.8;

    g.heart(6.5, 11, 14, 0.1).fill(0xff6482);
    I.arrow(g, 6.5, 11, 6, 0x000000, 'up', 0.2);
    c.text('8%', 16, 17, { size: 16, color: 0xff6482, weight: '500' });
    c.text('RESTING HEART RATES', 188, 17, { size: 11, color: GRAY, weight: '600', align: 'right' });
    c.text('74', 3, 33, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    c.text('BPM', 0, 50.7, { size: 11.5, color: pink, weight: '600' });
    c.text('54', 3, 68, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    stripes(g, 30.7, 186.7, 6.5, 24, 86);
    for (let i = 0; i < 17; i++) {
        const x = 33 + i * 6.5;
        const y = 51 + 7 * Math.sin(i * 2.3 + 1);

        if (i % 3 !== 1) g.circle(x, y, 0.95).fill(GRAY);
    }
    g.line(30.7, 51.3, 141.7, 51.3).stroke({ width: 2.4, color: 0xb0b0b5 });
    c.text('62', 32, 48.5, { size: 11.5, color: 0xd1d1d6, weight: '500' });
    g.line(141.7, 24, 141.7, 86).stroke({ width: 1.3, color: 0xaeaeb2 });
    for (let i = 0; i < 7; i++) g.circle(145 + i * 6.5, 48 + 4 * Math.sin(i * 2.1), 0.95).fill(pink);
    g.line(141.7, py, 186.7, py).stroke({ width: 2.4, color: pink });
    c.text('67', 144, py - 3.2, { size: 11.5, color: pink, weight: '500' });
    c.text('17D AVG', 33, 80.5, { size: 11.5, color: GRAY, weight: '600' });
    c.text('7D AVG', 186, 80.5, { size: 11.5, color: pink, weight: '600', align: 'right' });
}

function uvWeek(c: Cx): void {
    const { g } = c;
    const green = 0x30d158;
    const orange = 0xff9f0a;
    const xs = [30, 54, 78, 101.7, 125.7, 149.7, 173.7];
    const fills = [
        [57, green],
        [55, green],
        [44, orange],
        [55, green],
        [55, green],
        [44, orange],
        [53, green],
    ] as const;

    I.navArrow(g, 8, 10.5, 14, green);
    c.text('UVI5', 19, 17, { size: 16, color: green, weight: '600' });
    c.text('MODERATE', 61, 17, { size: 16, weight: '500' });
    c.text('11', 3, 33, { size: 11.5, color: GRAY, weight: '500' });
    c.text('0', 3, 68, { size: 11.5, color: GRAY, weight: '500' });
    for (const x of [42, 66, 90, 114, 138, 162, 186]) g.line(x, 22, x, 70).stroke({ width: 1, color: 0x1f1f21 });
    xs.forEach((x, i) => {
        const [top, col] = fills[i];

        g.pill(x - 2.6, 27, 5.2, 38.5).fill(0x2c2c2e);
        g.pill(x - 2.6, top + osc(c.t, 0.6, i) * 0.8, 5.2, 64 - top).fill(col);
    });
    g.circle(30, 50, 2.1).fill(W).stroke({ width: 1.2, color: 0x000000, alignment: 'outside' });
    g.circle(30, 55.5, 1.8).fill(W).stroke({ width: 1.2, color: 0x000000, alignment: 'outside' });
    ['S', 'S', 'M', 'T', 'W', 'T', 'F'].forEach((d, i) =>
        c.text(d, xs[i], 81, { size: 12, color: i === 0 ? W : GRAY, weight: i === 0 ? '700' : '500', align: 'center' }),
    );
}

function hikeMap(c: Cx): void {
    const { g } = c;
    const streets = [
        [80, 20, 140, 10],
        [78, 44, 132, 36],
        [84, 70, 186, 52],
        [104, 8, 96, 78],
        [120, 6, 130, 78],
        [150, 8, 158, 78],
        [168, 30, 186, 44],
        [78, 58, 118, 76],
        [136, 46, 186, 30],
    ];

    walker(g, 7, 10.5, 15, 0x6ab8ff);
    c.run(18, 17, [
        ['1.37', 16, 0x6ab8ff, '600', 2],
        ['KM', 10.5, 0x6ab8ff, '600'],
    ]);
    c.run(2, 36, [
        ['17-32', 15, 0x9be15d, '600', 2],
        ['M', 10.5, 0x9be15d, '600'],
    ]);
    c.text('ELEVATION', 2, 49, { size: 8.5, color: GRAY, weight: '600' });
    c.run(2, 66, [
        ['74-145', 15, 0xe8574f, '600', 2],
        ['BPM', 10.5, 0xe8574f, '600'],
    ]);
    c.text('HEART RATE', 2, 79, { size: 8.5, color: GRAY, weight: '600' });
    g.roundRect(76.7, 5.7, 111.6, 73.3, 7).fill(0x18212a);
    g.roundRect(150, 8, 34, 24, 3).fill(0x1b3326);
    for (const [x0, y0, x1, y1] of streets) g.line(x0, y0, x1, y1).stroke({ width: 1.1, color: 0x2a3540 });
    g.polyline(ROUTE).stroke({ width: 1.8, color: 0x6ac4f0, cap: 'round' });
    g.circle(89, 65.7, 2.8).fill(0xffe0e6).stroke({ width: 1.5, color: 0xff3b5c, alignment: 'outside' });
    g.circle(173.3, 15.7, 2.8).fill(0x5ad19a).stroke({ width: 1.3, color: W, alignment: 'outside' });
    c.text('23:51', 181, 75, { size: 14, color: PALE, weight: '600', align: 'right' });
}

// ------------------------------------------------------------------------------------ row 3

function soundLevels(c: Cx): void {
    const { g } = c;
    const blue = 0x3a8ad8;

    ear(g, 7.5, 12, 16, PALE);
    I.warning(g, 13, 16.5, 6.5, 0xffd60a);
    c.run(21, 18.5, [
        ['95', 16.5, PALE, '600', 2],
        ['dB', 10.5, PALE, '600'],
    ]);
    c.text('SOUND LEVELS HIT', 189, 18.5, { size: 11.5, color: GRAY, weight: '600', align: 'right' });
    c.text('107', 0, 33, { size: 11.5, color: GRAY, weight: '500' });
    c.text('90', 0, 50.7, { size: 11.5, color: blue, weight: '600' });
    c.text('0', 0, 68, { size: 11.5, color: GRAY, weight: '500' });
    stripes(g, 25.7, 187.3, 6.5, 24, 70);
    g.line(25.7, 48, 187.3, 48).stroke({ width: 1.3, color: blue });
    for (let i = 0; i < 25; i++) {
        const x = 29 + i * 6.5;
        const yc = 55 + 4 * Math.sin(i * 1.3 + 0.4) + osc(c.t, 1.4, i) * 0.7;
        const h = 4 + 6 * hash(i);

        if (i === 10 || i === 11 || i === 13 || i === 15) continue;
        g.pill(x - 1.5, yc - h / 2, 3, h).fill(0x6e6e73);
    }
    g.pill(94.5, 42, 3, 7).fill(blue);
    g.pill(106.5, 46, 3, 12).fill(blue);
    g.pill(115, 27 + osc(c.t, 0.9) * 1, 3, 23).fill(blue);
    g.pill(127, 41, 3, 19).fill(blue);
    c.text('09:30', 30, 81, { size: 12, color: AXIS, weight: '500' });
    c.text('09:45', 188, 81, { size: 12, color: AXIS, weight: '500', align: 'right' });
}

function reminder(c: Cx): void {
    const { g } = c;
    const mins = Math.max(1, 10 - Math.floor(Math.max(0, c.t - 3) / 60));

    g.pill(1.7, 12.3, 3.5, 35).fill(0x2f7de0);
    c.text('Catch up system desi...', 12.5, 26.5, { size: 17, weight: '500' });
    c.run(12.5, 48, [
        [`IN ${mins} MINS`, 14, W, '600', 7],
        ['45 MINS', 14, GRAY, '600'],
    ]);
    g.pill(1.5, 63, 3.5, 16).fill(0x30d158);
    g.pill(10, 63, 3.5, 16).fill(0xff453a);
    g.pill(18.5, 63, 3.5, 16).fill(0xffd60a);
    c.text('3 MORE EVENTS', 27.5, 76.5, { size: 14, weight: '600' });
}

function detected(c: Cx): void {
    const { g } = c;
    const red = 0xe0443c;

    pin(g, 8.5, 12, 15, red);
    c.text('DETECTED', 19, 19.5, { size: 16, color: red, weight: '600' });
    c.text('GARAGE', 188, 19, { size: 11, color: GRAY, weight: '600', align: 'right' });
    c.text('5', 0, 33, { size: 11.5, color: GRAY, weight: '500' });
    c.text('MIN', 0, 50.7, { size: 11.5, color: GRAY, weight: '500' });
    c.text('0', 0, 68, { size: 11.5, color: GRAY, weight: '500' });
    stripes(g, 29, 187.3, 6.5, 24, 70);
    g.rect(100, 24, 33.3, 46).fill(ALERT_GLOW);
    I.warning(g, 116.7, 38, 13, 0xff453a, W);
    [24, 15, 18, 14, 12, 10].forEach((h, i) => {
        const hh = h * (1 + osc(c.t, 1.3, i) * 0.06);

        g.rect(102 + i * 5, 70 - hh, 2.6, hh).fill(0xff453a);
    });
    for (const [x, h] of [
        [48, 6],
        [55, 4],
        [72, 3],
        [76, 4],
        [80, 3],
        [84, 5],
        [88, 4],
        [92, 6],
        [143, 5],
        [148, 3],
        [157, 5],
    ])
        g.rect(x, 70 - h, 2, h).fill(0xe5e5ea);
    axis(
        c,
        [
            ['13:00', 36, DIM],
            ['14:00', 76],
            ['15:00', 115],
            ['16:00', 150],
        ],
        81.5,
        [33, 72, 112, 147],
        12,
    );
}

function elevation(c: Cx): void {
    const { g } = c;
    const lime = 0x9be15d;

    walker(g, 7, 12, 15, lime, true);
    c.run(19, 19, [
        ['428', 15.5, lime, '600', 2],
        ['FT', 10.5, lime, '600', 7],
        ['56:32', 15.5, PALE, '600'],
    ]);
    c.text('436 FT', 188, 19, { size: 13.5, color: GRAY, weight: '500', align: 'right' });
    c.text('438', 0, 33, { size: 11.5, color: GRAY, weight: '500' });
    c.text('ELEV', 0, 46, { size: 9, color: lime, weight: '700' });
    c.text('GAINED', 0, 56.5, { size: 9, color: lime, weight: '700' });
    c.text('26', 0, 69, { size: 11.5, color: GRAY, weight: '500' });
    for (const x of [80, 116.7, 153.3]) g.line(x, 24, x, 70).stroke({ width: 1, color: 0x2c2c2e });
    for (let i = 0; i < 70; i++) {
        const x = 44 + i * 2.07;
        let h = 8 + 16 * (i / 70) + 5 * Math.sin(i * 0.35) + 2 * Math.sin(i * 1.3);

        if (i >= 67) h = 24 + (i - 66) * 3;
        g.rect(x, 69 - h, 1.35, h).fill(i >= 67 ? W : lime);
    }
    c.text('30 MINS AGO', 45, 81, { size: 12, color: GRAY, weight: '600' });
    c.text('NOW', 188, 81, { size: 12, weight: '700', align: 'right' });
}

// ------------------------------------------------------------------------------------ row 4

function sleepQuality(c: Cx): void {
    const { g } = c;
    const purple = 0x7d7aff;
    const xs = [37.3, 60.7, 83.3, 106.7, 129, 151.7, 174];
    const bright = [47, 40.5, 33, 42];

    I.moonZ(g, 5.5, 10.5, 12, purple);
    c.run(13, 17, [
        ['78', 16, purple, '600', 1],
        ['% AVG', 10.5, purple, '600'],
    ]);
    c.text('12-18 AUG', 188, 17, { size: 13.5, color: 0xd1d1d6, weight: '500', align: 'right' });
    c.text('100', 3, 34.7, { size: 11, color: GRAY, weight: '500' });
    c.text('50', 3, 50.7, { size: 11, color: GRAY, weight: '500' });
    c.text('0', 3, 66.7, { size: 11, color: GRAY, weight: '500' });
    for (const x of [25.7, 49, 72, 95, 118, 141, 164, 187.3])
        g.line(x, 24, x, 70).stroke({ width: 1, color: 0x232325 });
    xs.forEach((x, i) => {
        if (i < 4) {
            const top = bright[i] + osc(c.t, 0.7, i) * 1;

            g.pill(x - 2.6, 27, 5.2, 39).fill(0x34336a);
            g.pill(x - 2.6, top, 5.2, 66 - top).fill(0x8e8cf8);
        } else g.pill(x - 2.6, 27, 5.2, 39).fill(0x2c2c2e);
    });
    g.line(26, 36.7, 188, 36.7).stroke({ width: 1.5, color: W });
    days(c, xs, 81);
}

function cyclingPower(c: Cx): void {
    const { g } = c;
    const lime = 0x9be15d;
    const pts: number[] = [];

    I.bike(g, 8, 10.5, 15, lime, true);
    c.run(17, 17, [
        ['235', 16.5, lime, '600', 2],
        ['W', 10.5, lime, '600', 7],
        ['31:47', 16.5, PALE, '600'],
    ]);
    c.text('NEXT', 176, 16.5, { size: 11.5, color: GRAY, weight: '600', align: 'right' });
    I.runner(g, 183, 10.5, 12, GRAY);
    c.text('275', 0, 33, { size: 11.5, color: GRAY, weight: '500' });
    c.text('AVERAGE', 2, 44.5, { size: 9, color: lime, weight: '700' });
    c.text('POWER', 2, 54.5, { size: 9, color: lime, weight: '700' });
    c.text('180', 0, 68, { size: 11.5, color: GRAY, weight: '500' });
    for (const x of [45, 80, 116.7, 153.3]) g.line(x, 24, x, 70).stroke({ width: 1, color: 0x2c2c2e });
    g.line(45, 66.7, 188.3, 66.7).stroke({ width: 1, color: 0x3a3a3c });
    for (let x = 46; x <= 188; x += 2.4) {
        const y =
            48 -
            4 * Math.sin(x * 0.07 + 0.6) +
            2 * Math.sin(x * 0.23) +
            1.5 * Math.cos(x * 0.5) +
            osc(c.t, 1.1, x * 0.1) * 0.5;

        pts.push(x, y);
    }
    g.area(pts, 66.7).fill(POWER_FILL);
    for (let i = 0; i < pts.length; i += 2) g.circle(pts[i], pts[i + 1], 1).fill(0xd9f99d);
    c.text('30 MINS AGO', 47, 81, { size: 12, color: GRAY, weight: '600' });
    c.text('NOW', 188, 81, { size: 12, weight: '700', align: 'right' });
}

function water(c: Cx): void {
    const { g } = c;
    const xs = [13.3, 40.7, 68, 95, 122.3, 149.7, 176.7];
    const lv = [14, 26, 12, 7, 20, 0, 0];

    g.circle(7, 10.5, 7).fill(0x5ac8fa);
    I.drop(g, 7, 11, 8, 0x0a3a50);
    c.run(16, 17, [
        ['150', 16.5, 0x64d2ff, '600', 2],
        ['/300 ML', 11, GRAY, '600'],
    ]);
    xs.forEach((x, i) => {
        const h = lv[i] * (1 + osc(c.t, 0.8, i) * 0.05);

        g.roundRect(x - 10, 24, 20, 40, 4).fill(i === 4 ? 0x16414a : 0x0f3238);
        if (i === 4) g.rect(x - 10, 64 - h - 18, 20, 18).fill(WATER_GLOW);
        if (h > 0) g.roundRect(x - 10, 64 - h, 20, h, 4).fill(i === 4 ? 0x36d0f5 : 0x1e9dc0);
    });
    ['S', 'S', 'M', 'T', 'W', 'T', 'F'].forEach((d, i) =>
        c.text(d, xs[i], 81, { size: 12, color: i === 4 ? W : GRAY, weight: i === 4 ? '700' : '500', align: 'center' }),
    );
}

function runPace(c: Cx): void {
    const { g } = c;
    const pink = 0xff375f;
    const knob = 140.5 + osc(c.t, 0.3) * 3;
    const pts: number[] = [];

    timer(g, 8, 10.5, 14, PALE);
    c.text('26:04', 21, 17, { size: 16, color: PALE, weight: '600' });
    let rx = c.text('56', 188, 16.5, { size: 14.5, color: RED, weight: '500', align: 'right' }).x;

    g.heart(rx - 7, 11, 11, 0.1).stroke({ width: 1.5, color: RED });
    rx = c.text('147', rx - 14, 16.5, { size: 14.5, color: RED, weight: '500', align: 'right' }).x;
    g.heart(rx - 7, 11, 11, 0.1).fill(RED);
    for (const x of [65, 133]) g.line(x, 26, x, 50).stroke({ width: 1, color: 0x2c2c2e });
    g.line(3, 26, 188, 26).stroke({ width: 1, color: 0x2c2c2e });
    for (let i = 0; i <= 26; i++) {
        const x = 4 + i * 5;

        pts.push(x, 42 + 5 * Math.sin(i * 1.7 + 0.3) + 2 * Math.cos(i * 0.9));
    }
    g.polyline(pts).stroke({ width: 0.9, color: 0xe0443c });
    for (let i = 0; i < pts.length; i += 2) g.circle(pts[i], pts[i + 1], 1.2).fill(0xe0443c);
    g.pill(2.7, 49.8, 185.6, 5).fill({ color: 0xff9ab0, alpha: 0.85 });
    g.pill(2.7, 49.8, knob - 2.7, 5).fill(pink);
    g.circle(knob, 52.3, 11).fill(0x5a0f1f).stroke({ width: 2, color: pink, alignment: 'inside' });
    I.runner(g, knob, 52.3, 12, W);
    c.run(3, 81, [
        ['12′23″', 16.5, 0x6ab8ff, '600', 2],
        ['/KM', 10.5, 0x6ab8ff, '600'],
    ]);
    c.run(
        188,
        81,
        [
            ['AVG', 10.5, pink, '700', 3],
            ['148', 16.5, pink, '500', 2],
            ['KCAL', 10.5, pink, '700'],
        ],
        'right',
    );
}

// ------------------------------------------------------------------------------------ row 5

function zoneStack(c: Cx): void {
    const { g, fg } = c;

    g.pill(26, 2.7, 28, 4).fill(0x1f4f8a);
    g.roundRect(20, 12.3, 40, 14.4, 4).fill(0x4ad8e8);
    c.text('ZONE 2', 40, 22.8, { size: 9.5, color: 0x083a40, weight: '800', align: 'center' });
    g.triangle(36.5, 30.5, 43.5, 30.5, 40, 26.5, 0.4).fill(W);
    g.pill(26, 32.5, 28, 4.5).fill(0x1a5a3a);
    g.pill(26, 39, 28, 4.5).fill(0x5a3a1a);
    g.pill(26, 45.5, 28, 4.5).fill(0x5a1a2a);
    c.text('TIME IN ZONE', 38, 62, { size: 10.5, weight: '600', align: 'center' });
    c.text('03:15', 37, 77.5, { size: 11, color: 0x5ac8fa, weight: '600', align: 'center' });
    const x = c.run(78, 16, [
        ['136', 16.5, W, '500', 2],
        ['BPM', 10.5, W, '600', 3],
    ]);

    g.heart(x + 6, 11, 11, 0.08).fill(0xff453a);
    c.text('AVG', x + 13, 16, { size: 10.5, weight: '600' });
    I.runner(g, 182, 10.5, 14, 0x30d158);
    stripes(g, 77.3, 195.7, 6.5, 24, 70);
    // audio-like waveform in two bursts, traced from the reference
    for (let bx = 80; bx <= 128; bx += 2) {
        const k = Math.round(bx);
        const burst = (bx > 86 && bx < 106) || (bx > 109 && bx < 126);
        const a = (burst ? 0.55 + 0.45 * hash(k) : 0.15 + 0.25 * hash(k)) * (1 + osc(c.t, 1.6, k) * 0.1);

        if (hash(k + 3) < 0.12) continue;
        g.line(bx, 44.7 - 10.5 * a, bx, 44.7 + 12 * a * (0.5 + 0.5 * hash(k + 7))).stroke({
            width: 1,
            color: 0xd83a34,
        });
    }
    g.line(77.3, 44.7, 195.7, 44.7).stroke({ width: 1.2, color: W });
    g.circle(77.3, 44.7, 2.3).fill(W);
    c.text('138', 187, 32, { size: 10.5, weight: '700', align: 'right' });
    c.text('129', 187, 67, { size: 10.5, weight: '700', align: 'right' });
    axis(
        c,
        [
            ['02:00', 80, DIM],
            ['03:00', 119, DIM],
            ['04:00', 158, DIM],
        ],
        81,
        [77.3, 116, 155],
    );
    fg.rect(176, 70, 24, 16).fill(EDGE_FADE);
}

function london(c: Cx): void {
    const { g } = c;
    const pts: [number, number, number][] = [
        [38.3, 27.3, 0],
        [60.7, 33.3, 0],
        [83.3, 56.7, 1],
        [106.7, 64, 1],
        [130, 54, 1],
        [152.3, 61.7, 1],
        [175, 36.7, 0],
    ];
    const flat = pts.flatMap(([x, y], i) => [x, y + osc(c.t, 0.6, i) * 0.8]);

    I.navArrow(g, 7, 10.5, 13, 0x64d2ff);
    c.text('23°', 15, 16.5, { size: 16.5, color: 0x64d2ff, weight: '600' });
    c.text('LONDON, UK', 46, 16.5, { size: 13, weight: '600' });
    c.text('19-25 AUG', 189, 16.5, { size: 12.5, color: GRAY, weight: '500', align: 'right' });
    c.text('25°', 3, 35, { size: 11.5, color: GRAY, weight: '500' });
    c.text('15°', 3, 64, { size: 11.5, color: GRAY, weight: '500' });
    for (const [x] of pts) g.line(x, 24, x, 70).stroke({ width: 1, color: 0x232325 });
    g.line(26, 44, 188, 44).stroke({ width: 1, color: 0x6e6e73, dash: [1.4, 2.2] });
    g.polyline(flat).stroke({ width: 1.2, gradient: TEMP_LINE });
    pts.forEach(([, , b], i) =>
        g
            .circle(flat[i * 2], flat[i * 2 + 1], 2.3)
            .fill(b ? 0x4a6ae8 : 0x6fd66f)
            .stroke({ width: 1.2, color: 0x000000, alignment: 'outside' }),
    );
    days(
        c,
        pts.map(([x]) => x),
        81,
        3,
        DIM,
    );
}

function boarding(c: Cx): void {
    const { g } = c;
    const green = 0x34c759;
    const p = 114.7 + osc(c.t, 0.25) * 2;
    const x = c.run(2, 15.5, [['SFO', 15.5, W, '600']]);

    I.plane(g, x + 10, 10.5, 13, 0x8e8e93);
    c.text('JFK', x + 19, 15.5, { size: 15.5, weight: '600' });
    c.text('NOW BOARDING', 188, 16, { size: 12.5, color: green, weight: '600', align: 'right' });
    g.pill(2.3, 24.1, 42.4, 3.2).fill(green);
    g.pill(50, 24.1, 42.3, 3.2).fill(green);
    g.pill(97.3, 24.1, 41.7, 3.2).fill(0x3a3a3c);
    g.pill(97.3, 24.1, p - 97.3, 3.2).fill(green);
    g.circle(p, 25.7, 3.1).fill(green);
    g.pill(145.7, 24.1, 41.6, 3.2).fill(0x3a3a3c);
    c.text('20:30', 3, 53, { size: 22, weight: '400' });
    c.text('5H 30M', 94.5, 52, { size: 12.5, color: GRAY, weight: '600', align: 'center' });
    c.text('5:00', 177, 53, { size: 22, weight: '400', align: 'right' });
    c.text('+1', 178, 41.5, { size: 10, weight: '600' });
    c.text('Gate 24', 2, 74, { size: 15.5, weight: '500' });
    c.text('Seat 30A', 188, 74, { size: 15.5, weight: '500', align: 'right' });
}

function wind(c: Cx): void {
    const { g } = c;
    const blue = 0x5ac8fa;
    const ticks = [31, 70, 109, 148];
    const sway = osc(c.t, 0.5) * 0.8;
    const pts = WIND.map((v, i) => (i % 2 ? v + sway * Math.sin(WIND[i - 1] * 0.2) : v));

    windLines(g, 6.5, 10.5, 15, blue);
    c.run(17, 16.5, [
        ['8', 16, blue, '600', 2],
        ['mph', 10.5, blue, '600', 5],
        ['SW', 16, W, '600'],
    ]);
    c.text('GUSTS: 19', 188, 16.5, { size: 13, color: GRAY, weight: '500', align: 'right' });
    stripes(g, 31, 188.3, 4, 33, 70, 0x1c1c1e);
    for (const x of ticks) g.line(x, 20, x, 70).stroke({ width: 1, color: 0x3a3a3c });
    axis(
        c,
        [
            ['0', ticks[0] + 3.5],
            ['6 AM', ticks[1] + 3.5],
            ['12', ticks[2] + 3.5],
            ['6 PM', ticks[3] + 3.5],
        ],
        31.5,
    );
    c.text('15', 3, 49, { size: 11.5, color: GRAY, weight: '500' });
    c.text('0', 3, 67, { size: 11.5, color: GRAY, weight: '500' });
    g.polyline(pts, { smooth: 'monotone' }).stroke({ width: 7, color: blue, alpha: 0.22, blur: 3.5 });
    g.polyline(pts, { smooth: 'monotone' }).stroke({ width: 1.7, color: blue, cap: 'round' });
    g.circle(122.7, pts[pts.indexOf(122.7) + 1], 2.1).fill(W);
    c.text('GUSTS', 3, 83, { size: 8.5, color: GRAY, weight: '700' });
    [
        [40.5, 0, '18'],
        [79.5, 0, '14'],
        [118, PI / 4, '19'],
        [158, PI / 4, '17'],
    ].forEach(([ax, rot, n]) => {
        I.navArrow(g, ax as number, 79, 11, W, rot as number);
        c.text(n as string, (ax as number) + 28, 83.5, { size: 12, weight: '500', align: 'right' });
    });
}

const defs: [string, string, (c: Cx) => void][] = [
    ['s3-golden-time', 'Golden time', goldenTime],
    ['s3-week', 'Week calendar', weekCalendar],
    ['s3-run', 'Run heart rate', runCandles],
    ['s3-bpm', 'Heart rate scatter', bpmScatter],
    ['s3-lamp', 'Accent lamp', lamp],
    ['s3-resting', 'Resting heart rate', restingHr],
    ['s3-uv', 'UV index', uvWeek],
    ['s3-hike', 'Hike map', hikeMap],
    ['s3-sound', 'Sound levels', soundLevels],
    ['s3-reminder', 'Next event', reminder],
    ['s3-detected', 'Motion detected', detected],
    ['s3-elevation', 'Elevation', elevation],
    ['s3-sleep', 'Sleep quality', sleepQuality],
    ['s3-power', 'Cycling power', cyclingPower],
    ['s3-water', 'Water intake', water],
    ['s3-pace', 'Run pace', runPace],
    ['s3-zone', 'Time in zone', zoneStack],
    ['s3-london', 'Weather', london],
    ['s3-boarding', 'Boarding', boarding],
    ['s3-wind', 'Wind', wind],
];

export const sheet3: SheetWidget[] = defs.map(([id, name, draw], i) => ({
    id,
    name,
    x: XS[i % 4],
    y: YS[Math.floor(i / 4)],
    w: 192,
    h: 88,
    draw,
}));
