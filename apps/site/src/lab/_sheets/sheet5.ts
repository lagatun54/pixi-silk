import { linear, radial, type SilkGraphics, vertical } from 'pixi-silk';
import type { Cx, SheetWidget } from './cx';
import * as I from './icons';

/*
 * Reference sheet 5 (1200×900): twenty more complications, drawn in reference pixels.
 */

const PI = Math.PI;
const W = 0xffffff;
const GRAY = 0x8e8e93;
const DIM = 0x48484a;
const RED = 0xff453a;
const XS = [102, 369, 637, 903];
const YS = [111, 260, 407, 556, 705];

/** Zero at t = 3 (the reference frame). */
const osc = (t: number, f: number, ph = 0) => Math.sin((t - 3) * f + ph) - Math.sin(ph);

type G = SilkGraphics;

function vlines(g: G, x0: number, x1: number, step: number, y0: number, y1: number, color = 0x1f1f21): void {
    for (let x = x0; x <= x1 + 0.01; x += step) g.line(x, y0, x, y1).stroke({ width: 0.8, color });
}

function axis(c: Cx, labels: [string, number, number?][], y: number, seps: number[] = []): void {
    for (const s of seps) c.g.line(s, y - 14, s, y + 3).stroke({ width: 1, color: 0x2c2c2e });
    for (const [s, x, color] of labels) c.text(s, x, y, { size: 12.5, color: color ?? GRAY, weight: '500' });
}

// ------------------------------------------------------------------------------------ row 1

function cycling(c: Cx): void {
    const { g } = c;

    g.roundRect(26, 1, 30, 20, 10).fill(0x16300d);
    g.roundRect(18, 1, 30, 20, 10).fill(0x2f5a1a);
    g.roundRect(0.7, 0.7, 40, 19.6, 9.8).fill(0xa8e63c);
    I.bike(g, 20.5, 11.5, 15, 0x000000, true);
    const x = c.run(63, 16.5, [
        ['156', 17, RED, '600', 2],
        ['BPM', 10.5, W, '700', 3],
    ]);

    g.heart(x + 6, 11.2, 11.5, 0.08).fill(RED);
    c.text('32:38', 194, 16.5, { size: 17, color: 0xffd60a, weight: '600', align: 'right' });
    c.text('128', 0, 33, { size: 12.5, color: GRAY, weight: '500' });
    c.text('HEART', 0, 45, { size: 10.5, color: RED, weight: '700' });
    c.text('RATE', 0, 57, { size: 10.5, color: RED, weight: '700' });
    c.text('104', 0, 70, { size: 12.5, color: GRAY, weight: '500' });
    for (const vx of [45, 82.3, 119, 156.3, 194]) g.line(vx, 24, vx, 86).stroke({ width: 1, color: 0x2c2c2e });
    g.line(45, 70.7, 194, 70.7).stroke({ width: 1, color: 0x3a3a3c });
    const steps: [number, number, number][] = [
        [45, 60, 47.3],
        [60, 65.7, 46.3],
        [65.7, 82.3, 44.7],
        [82.3, 95.7, 42.7],
        [95.7, 111.3, 39],
        [111.3, 120, 42.7],
        [120, 143.3, 46.3],
        [143.3, 156.7, 49],
        [156.7, 163, 44.7],
        [163, 177.3, 42.7],
        [177.3, 189, 46.3],
    ];

    steps.forEach(([x0, x1, y], i) => {
        const yy = y + osc(c.t, 1.1, i) * 0.8;

        g.rect(x0, yy, x1 - x0, 70.7 - yy).fill(
            vertical([
                [0, 0x6b0d0d, 0.95],
                [1, 0x2a0505, 0.6],
            ]),
        );
        g.rect(x0, yy - 1.1, x1 - x0, 2.2).fill(0xff3b30);
    });
    g.circle(191.5, 46.3, 3.1).fill(0x000000).stroke({ width: 1.6, color: 0xff3b30 });
    c.text('30 MINS AGO', 48, 83.5, { size: 12.5, color: GRAY, weight: '500' });
    c.text('NOW', 188, 83.5, { size: 12.5, weight: '700', align: 'right' });
}

function googleG(g: G, x: number, y: number, r: number): void {
    const w = r * 0.42;

    g.arcSweep(x, y, r, -2.55, 1.85).stroke({ width: w, color: 0xea4335 });
    g.arcSweep(x, y, r, 2.55, 1.05).stroke({ width: w, color: 0xfbbc05 });
    g.arcSweep(x, y, r, 0.72, 1.85).stroke({ width: w, color: 0x34a853 });
    g.arcSweep(x, y, r, -0.12, 0.86).stroke({ width: w, color: 0x4285f4 });
    g.rect(x + 0.2, y - w / 2, r + w / 2 - 0.2, w).fill(0x4285f4);
}

function twoFactor(c: Cx): void {
    const { g } = c;

    g.roundRect(1, 1, 22.5, 22.5, 5.5, 0.6).fill(W);
    googleG(g, 12.2, 12.2, 6.3);
    c.text('Google.com', 29, 18, { size: 17.5, weight: '600' });
    const p = 0.62 - (((((c.t - 3) / 30) % 1) + 1) % 1) * 0.62;

    c.text('12', 171, 17, { size: 16.5, color: 0x6e6cf5, weight: '500', align: 'right' });
    g.circle(185.3, 11.2, 6.2).stroke({ width: 4, color: 0x1c1c3a });
    g.arcSweep(185.3, 11.2, 6.2, -PI / 2, PI * 2 * Math.max(0.02, p)).stroke({ width: 4, color: 0x6e6cf5 });
    c.text('7luyuhang@gmail.com', 0, 43, { size: 16, weight: '500' });
    const x = c.run(0, 77.5, [['197', 30, 0x6e6cf5, '500', 5]]);

    g.circle(x + 2.5, 66.5, 1.9).fill(0x6e6e73);
    c.run(x + 10, 77.5, [['072', 30, 0x6e6cf5, '500']]);
}

function nowPlaying(c: Cx): void {
    const { g, fg } = c;

    g.rect(-8, -6, 212, 100).fill(
        radial(
            [
                [0, 0x0d2c3c, 0.95],
                [0.6, 0x071a24, 0.7],
                [1, 0x000000, 0],
            ],
            { center: [0.45, 0.55], radius: 0.62 },
        ),
    );
    // album art: stylised blue stone face
    g.roundRect(2.3, 19, 49, 48.3, 4).fill(
        radial(
            [
                [0, 0x2a86b0],
                [0.7, 0x145a80],
                [1, 0x0a3550],
            ],
            { center: [0.5, 0.45], radius: 0.75 },
        ),
    );
    const blots: [number, number, number, number, number][] = [
        [18, 36, 7, 5, 0.5],
        [34, 35, 7, 5, 0.5],
        [26, 47, 5, 8, 0.35],
        [26, 58, 9, 3, 0.45],
        [12, 55, 6, 9, 0.3],
        [41, 52, 6, 10, 0.3],
        [26, 28, 14, 4, 0.25],
    ];

    for (const [bx, by, rx, ry, a] of blots) g.ellipse(bx, by, rx, ry).fill({ color: 0x06253a, alpha: a, blur: 1.5 });
    for (const [bx, by] of [
        [22, 42],
        [31, 42],
        [20, 62],
        [35, 61],
    ])
        g.circle(bx, by, 2).fill({ color: 0x7cc4e4, alpha: 0.35, blur: 1 });
    c.text('JIM HALL', 5, 24.5, { size: 3.6, weight: '700' });
    c.text('CONCIERTO', 48, 24.5, { size: 3.6, weight: '700', align: 'right' });
    c.text('Concierto de Aran', 67, 30, { size: 17, weight: '500' });
    c.text('Jim Hall - Concierto', 67, 50, { size: 16, color: 0x98989d, weight: '500' });
    c.text('-07:29', 67, 71.5, { size: 16, weight: '600' });
    // truncate softly at the right edge
    fg.rect(160, 14, 54, 62).fill(
        linear(
            [
                [0, 0x06141b, 0],
                [0.4, 0x040e13, 1],
                [1, 0x000000, 1],
            ],
            { from: [0, 0.5], to: [1, 0.5] },
        ),
    );
}

function aqiDots(g: G, x: number, y: number, s: number, color: number): void {
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (Math.hypot(i, j) > 2.3) continue;
            g.circle(x + i * s * 0.2, y + j * s * 0.2, s * 0.065).fill(color);
        }
    }
}

function weatherWeek(c: Cx): void {
    const { g } = c;

    I.sunIcon(g, 11.5, 7.5, 12, 0xffd60a);
    I.cloud(g, 7, 13, 12, W);
    c.text('22°C', 19, 17, { size: 17, weight: '600' });
    const gx = c.text('21-Good', 194, 17, { size: 17, color: 0x64d2ff, weight: '600', align: 'right' }).x;

    aqiDots(g, gx - 11, 11, 13, 0x64d2ff);
    c.text('27°', 0, 34.7, { size: 12.5, color: GRAY, weight: '500' });
    c.text('20°', 0, 50.7, { size: 12.5, color: GRAY, weight: '500' });
    c.text('18°', 0, 66.3, { size: 12.5, color: GRAY, weight: '500' });
    for (let i = 0; i <= 7; i++)
        g.line(25.7 + i * 24.3, 26, 25.7 + i * 24.3, 66.7).stroke({ width: 1, color: 0x2c2c2e });
    for (const y of [26, 36.3, 46.7, 56.7, 66.7]) g.line(25.7, y, 196, y).stroke({ width: 1, color: 0x2c2c2e });
    g.circle(121.3, 42.3, 20).fill({
        gradient: radial([
            [0, 0xffd60a, 0.35],
            [1, 0xffd60a, 0],
        ]),
    });
    const pts = [25.7, 62.3, 50, 62.3, 74.3, 51.7, 98.6, 51.7, 121.3, 42.3, 147, 42.3, 171.3, 30.7, 196, 30.7];

    g.polyline(pts).stroke({
        width: 2.4,
        cap: 'round',
        gradient: linear(
            [
                [0, 0x30d158],
                [0.3, 0xffd60a],
                [0.62, 0xffc02a],
                [1, 0xff453a],
            ],
            { units: 'local', from: [0, 62.3], to: [0, 30.7] },
        ),
    });
    g.circle(121.3, 42.3, 3.2).fill(W);
    c.text('18°', 27, 57.5, { size: 13.5, color: 0x30d158, weight: '600' });
    c.text('27°', 195, 49.5, { size: 13.5, color: RED, weight: '600', align: 'right' });
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) =>
        c.text(d, 30 + i * 24.4, 83, {
            size: 12.5,
            color: i === 4 ? W : DIM,
            weight: i === 4 ? '700' : '500',
            align: 'center',
        }),
    );
}

// ------------------------------------------------------------------------------------ row 2

function energy(c: Cx): void {
    const { g } = c;
    const green = 0x30d158;

    g.circle(6, 10.5, 6).stroke({ width: 1.4, color: green });
    I.bolt(g, 6, 10.5, 8, green);
    c.run(15, 17, [
        ['24.9', 17, green, '600', 3],
        ['hrs', 12.5, green, '600'],
    ]);
    c.run(88, 17, [
        ['49', 17, W, '600', 3],
        ['kWh', 12.5, W, '600'],
    ]);
    c.text('£398.2', 194, 17, { size: 17, color: green, weight: '600', align: 'right' });
    c.text('20', 0, 33, { size: 12.5, color: GRAY, weight: '500' });
    c.text('kWh', 0, 46, { size: 12.5, color: GRAY, weight: '500' });
    c.text('100', 0, 67.7, { size: 12.5, color: GRAY, weight: '500' });
    c.text('£', 0, 82, { size: 12.5, color: GRAY, weight: '500' });
    for (let x = 30.7; x <= 194; x += 6.8) g.line(x, 24, x, 72).stroke({ width: 0.8, color: 0x3a3a3c, dash: [1, 2.2] });
    const white: [number, number, number][] = [
        [30.7, 52, 38.3],
        [72.3, 100, 30],
        [100, 132.3, 36.3],
        [132.3, 194, 33.3],
    ];
    const greens: [number, number, number][] = [
        [30.7, 52, 54],
        [72.3, 100, 54],
        [100, 132.3, 64],
        [132.3, 194, 58],
    ];

    for (const [x0, x1, y] of white) {
        g.rect(x0, y, x1 - x0, 46.3 - y).fill(
            vertical([
                [0, 0xffffff, 0.3],
                [1, 0xffffff, 0.02],
            ]),
        );
        g.line(x0, y, x1, y).stroke({ width: 1.8, color: 0xe5e5ea });
    }
    for (const [x0, x1, y] of greens) {
        g.rect(x0, 46.3, x1 - x0, y - 46.3).fill(
            vertical([
                [0, green, 0.05],
                [1, green, 0.35],
            ]),
        );
        g.line(x0, y, x1, y).stroke({ width: 1.8, color: green });
    }
    g.line(30.7, 46.3, 194, 46.3).stroke({ width: 1.1, color: 0xd1d1d6 });
    const cx = 146.3 + osc(c.t, 0.25) * 6;

    g.line(cx, 25, cx, 72).stroke({ width: 1.5, color: W });
    g.circle(cx, 46.3, 3.3).fill(W);
    axis(
        c,
        [
            ['00', 36.7, DIM],
            ['06', 78],
            ['12', 118],
            ['18', 159],
        ],
        82,
        [30.7, 72.3, 113.3, 154.7],
    );
}

function bloodPressure(c: Cx): void {
    const { g } = c;
    const purple = 0xbf5af2;

    I.drop(g, 5, 10.5, 13, purple);
    c.run(13, 17, [
        ['119/75', 17, purple, '600', 4],
        ['AVG mmHg', 12.5, purple, '600'],
    ]);
    c.text('120', 0, 33, { size: 12.5, color: GRAY, weight: '500' });
    c.text('95', 0, 50.7, { size: 12.5, color: GRAY, weight: '500' });
    c.text('60', 0, 68, { size: 12.5, color: GRAY, weight: '500' });
    const tops = [30, 29, 34, 34, 33, 29, 34, 33, 34, 29, 30, 31];
    const bots = [57, 60, 54, 54, 57, 60, 54, 57, 54, 60, 57, 57];

    g.line(185.7, 26, 185.7, 70).stroke({ width: 1, color: 0x6e6e73, dash: [2, 2] });
    tops.forEach((top, i) => {
        const x = 31.3 + i * 13.5;
        const k = osc(c.t, 0.9, i) * 0.6;

        g.line(x, top + k, x, bots[i] - k).stroke({ width: 1.5, color: purple });
        g.circle(x, top + k, 2.7)
            .fill(0x000000)
            .stroke({ width: 1.5, color: purple });
        g.circle(x, bots[i] - k, 2.7)
            .fill(0x000000)
            .stroke({ width: 1.5, color: purple });
    });
    g.line(193, 34, 193, 54).stroke({ width: 1.5, color: W });
    g.circle(193, 34, 2.7).fill(0x000000).stroke({ width: 1.5, color: W });
    g.circle(193, 54, 2.7).fill(0x000000).stroke({ width: 1.5, color: W });
    c.text('30 MINS AGO', 40, 82, { size: 12.5, color: DIM, weight: '500' });
    c.text('NOW', 194, 82, { size: 12.5, weight: '700', align: 'right' });
}

function carBolt(g: G, x: number, y: number, s: number, color: number): void {
    g.roundRect(x - s * 0.5, y - s * 0.28, s, s * 0.56, s * 0.14).fill(color);
    g.roundRect(x - s * 0.36, y - s * 0.44, s * 0.72, s * 0.3, s * 0.1).fill(color);
    g.roundRect(x - s * 0.46, y + s * 0.22, s * 0.16, s * 0.18, s * 0.04).fill(color);
    g.roundRect(x + s * 0.3, y + s * 0.22, s * 0.16, s * 0.18, s * 0.04).fill(color);
    I.bolt(g, x, y + s * 0.02, s * 0.42, 0x000000);
}

function battery(c: Cx): void {
    const { g } = c;
    const cyan = 0x5ac8fa;

    carBolt(g, 8.5, 10.5, 16, cyan);
    c.run(19, 17, [
        ['56%', 17, cyan, '600', 4],
        ['REMAINING', 12.5, cyan, '600'],
    ]);
    c.text('9.3%', 182, 17, { size: 17, weight: '400', align: 'right' });
    I.chevron(g, 189, 12, 8, GRAY, 'up', 0.16);
    c.text('100', 0, 33, { size: 12.5, color: GRAY, weight: '500' });
    c.text('0', 0, 68, { size: 12.5, color: GRAY, weight: '500' });
    c.text('%', 0, 82, { size: 12.5, color: GRAY, weight: '500' });
    vlines(g, 30, 194, 6.8, 24, 72);
    const k = osc(c.t, 0.4) * 1.5;

    g.polyline([30, 46.3, 82.3, 46.3, 104, 61.3, 125.7, 61.3]).stroke({ width: 1.4, color: GRAY });
    g.polyline([132.3, 54, 170.7, 32.3, 185.7, 25.7, 193.3, 25.7]).stroke({ width: 1.4, color: GRAY });
    g.polyline([
        30,
        25.7,
        74,
        25.7,
        94,
        40,
        107,
        40,
        125.7,
        56.3,
        150.7,
        56.3,
        165.7,
        45.7 + k,
        193.3,
        45.7 + k,
    ]).stroke({ width: 1.7, color: 0x6ab0ff });
    c.text('TDAY', 31, 40.5, { size: 12.5, color: 0x6ab0ff, weight: '700' });
    c.text('YDAY', 31, 61, { size: 12.5, color: GRAY, weight: '700' });
    axis(
        c,
        [
            ['00', 36, DIM],
            ['06', 78],
            ['12', 118],
            ['18', 159],
        ],
        82,
        [30, 72, 113, 154],
    );
}

function crosshair(c: Cx): void {
    const { g } = c;
    const green = 0x30d158;

    g.roundRect(20, 0.7, 176, 71.6, 8).fill(0x1c1c1e);
    for (let i = 1; i < 12; i++)
        g.line(20 + i * 14.67, 0.7, 20 + i * 14.67, 72.3).stroke({ width: 1, color: 0x2e2e31 });
    for (let j = 1; j < 7; j++) g.line(20, 0.7 + j * 10.23, 196, 0.7 + j * 10.23).stroke({ width: 1, color: 0x2e2e31 });
    [
        ['0', 11.5],
        ['45', 28],
        ['30', 42.3],
        ['15', 57],
        ['0', 71.3],
    ].forEach(([s, y]) => c.text(s as string, 15, y as number, { size: 12.5, weight: '700', align: 'right' }));
    const x = 158.3 + osc(c.t, 0.3) * 4;

    g.line(20, 45, 196, 45).stroke({ width: 1.5, color: green });
    g.line(x, 0.7, x, 76).stroke({ width: 1.5, color: green });
    g.circle(x, 45, 3.8).fill(W).stroke({ width: 1.2, color: 0x000000, alignment: 'outside' });
    c.text('25', 28, 43, { size: 13, color: green, weight: '700' });
    for (let i = 0; i < 12; i++) {
        const on = i === 9;

        c.text(String(i + 1), 26.7 + i * 14.4, 85, {
            size: 12.5,
            color: on ? green : DIM,
            weight: on ? '700' : '500',
            align: 'center',
        });
    }
}

// ------------------------------------------------------------------------------------ row 3

function garage(c: Cx): void {
    const { g } = c;

    g.roundRect(0.7, 6.7, 49.3, 44, 9).fill(0x2c2c2e);
    g.rect(16, 13, 19, 32).stroke({ width: 2.2, color: 0x0a84ff, alignment: 'inside' });
    g.rect(18.7, 15.7, 13.6, 29.3).fill(0xd1d1d6);
    g.circle(29, 31, 1.1).fill(0x3a3a3c);
    g.roundRect(0.7, 53.3, 49.3, 26.7, 8).fill(0x3a3414);
    I.lock(g, 22, 66, 14, 0xd1d1d6);
    I.warning(g, 31.5, 70.5, 9, 0xffd60a);
    c.text('Garage Door', 60, 24, { size: 15, color: 0x98989d, weight: '500' });
    c.text('Closed', 194, 24, { size: 15.5, weight: '600', align: 'right' });
    c.text('Detected', 60, 44.5, { size: 15, color: 0x98989d, weight: '500' });
    c.text('5', 194, 44.5, { size: 16, weight: '600', align: 'right' });
    g.rect(59, 49, 113.3, 16.7).stroke({ width: 1, color: 0x3a3a3c });
    for (let x = 62; x < 171; x += 4.9) g.line(x, 55, x, 59.5).stroke({ width: 1.2, color: 0xd1d1d6 });
    for (const x of [109, 145.7]) g.line(x, 55, x, 59.5).stroke({ width: 1.4, color: 0x5ac8fa });
    const hit = Math.floor((((c.t - 3) * 0.8) % 5) + 5) % 5;

    [113.3, 117.7, 132.3, 136.7, 141].forEach((x, i) =>
        g.line(x, 50, x, 65).stroke({ width: 1.7, color: RED, alpha: i === hit ? 1 : 0.85 }),
    );
    c.text('>3', 194, 63, { size: 17, color: RED, weight: '600', align: 'right' });
    c.text('MINS', 194, 82, { size: 12.5, color: RED, weight: '600', align: 'right' });
    axis(
        c,
        [
            ['13', 62],
            ['14', 84],
            ['15', 107],
            ['16', 129],
        ],
        82,
    );
}

function sleepBlocks(c: Cx): void {
    const { g } = c;
    const B = 0x2d7cf0;
    const I2 = 0x3a3ab8;
    const L = 0x5ac8fa;
    const C = 0xff6b6b;
    const blocks: [number, number, number][] = [
        [0.7, 12, B],
        [13, 15, C],
        [16.7, 18.7, L],
        [21.3, 27.3, B],
        [29, 56.7, I2],
        [60.7, 78, B],
        [79, 81.3, L],
        [83, 110, B],
        [111.3, 112.7, I2],
        [114.7, 116, I2],
        [118, 126, I2],
        [128, 172.3, B],
        [174, 175.3, L],
        [177, 178, I2],
        [179.5, 180.5, I2],
        [182, 183, I2],
        [186.7, 190, C],
        [191, 194, C],
    ];

    c.run(0, 17, [
        ['6', 17, W, '600', 2],
        ['hr', 12.5, W, '600', 5],
        ['38', 17, W, '600', 2],
        ['min', 12.5, W, '600'],
    ]);
    const ax = c.text('AVG', 194, 16.5, { size: 11.5, color: 0xff375f, weight: '700', align: 'right' }).x;

    g.heart(ax - 7, 11.5, 11, 0.08).fill(0xff375f);
    c.text('51-68 BPM', ax - 14, 17, { size: 14.5, color: 0xff375f, weight: '600', align: 'right' });
    for (const [x0, x1, col] of blocks) g.roundRect(x0, 25.7, x1 - x0, 40, Math.min(2, (x1 - x0) / 2)).fill(col);
    ['01:00', '03:00', '05:00', '07:00'].forEach((s, i) =>
        c.text(s, [0.7, 56.7, 110, 164][i], 82, { size: 13, color: GRAY, weight: '500' }),
    );
}

function activityRows(c: Cx): void {
    const { g } = c;
    const pink = 0xff375f;
    const lime = 0xb8f03a;
    const cyan = 0x5ae0e0;

    c.run(0, 17, [
        ['399', 17, pink, '500', 3],
        ['kcal', 12.5, W, '700', 8],
        ['38', 17, lime, '500', 3],
        ['min', 12.5, W, '700', 8],
        ['8', 17, cyan, '500', 3],
        ['hr', 12.5, W, '700'],
    ]);
    for (const x of [24, 65.7, 107.3, 149, 190.7]) g.line(x, 20, x, 86).stroke({ width: 1, color: 0x2c2c2e });
    I.arrow(g, 7, 28, 10, pink, 'right', 0.15);
    I.chevron(g, 5, 46, 7, lime, 'right', 0.2);
    I.chevron(g, 9, 46, 7, lime, 'right', 0.2);
    I.arrow(g, 7, 64.3, 10, cyan, 'up', 0.15);
    g.pill(22.3, 26, 170, 4).fill(0x3d0f1e);
    g.pill(22.3, 44, 170, 4).fill(0x2c3d10);
    g.pill(22.3, 62.3, 170, 4).fill(0x103535);
    for (const [a, b] of [
        [69, 79],
        [84, 122.3],
        [133.3, 140.7],
        [145.7, 189],
    ])
        g.pill(a, 26, b - a, 4).fill(pink);
    for (const [a, b] of [
        [68, 79],
        [119, 127.3],
    ])
        g.pill(a, 43.6, b - a, 4.8).fill(lime);
    for (const x of [90, 96.3, 113, 138]) g.circle(x, 46, 2.3).fill(lime);
    const lit = [89, 100, 110.7, 122.3, 130.7, 138, 145.7, 153.3, 160.7, 186.7];

    lit.forEach((x, i) =>
        g.circle(x, 64.3, 2.3).fill({ color: cyan, alpha: 0.75 + 0.25 * Math.cos((c.t - 3) * 2 + i) }),
    );
    for (const x of [168, 175.7]) g.circle(x, 64.3, 2.3).fill(0x1d6b6b);
    axis(
        c,
        [
            ['00', 27, DIM],
            ['06', 69],
            ['12', 111],
            ['18', 153],
        ],
        83,
    );
}

function noise(c: Cx): void {
    const { g } = c;

    I.checkCircle(g, 6.5, 10.5, 13, 0x30d158);
    c.run(16, 17, [
        ['OK', 17, W, '600', 4],
        ['AVG', 11.5, GRAY, '600'],
    ]);
    g.roundRect(88, 0.5, 56, 21, 6).fill(0x3a3310);
    I.warning(g, 97, 11, 11, 0xffd60a);
    c.text('LOUD', 104, 15.8, { size: 12.5, color: 0xffd60a, weight: '700' });
    c.run(
        194,
        17,
        [
            ['1.2', 17, W, '600', 3],
            ['HRS', 11.5, W, '600'],
        ],
        'right',
    );
    c.text('100', 0, 33, { size: 12.5, color: 0xd1d1d6, weight: '600' });
    c.text('80', 0, 47.3, { size: 12.5, color: 0xd1d1d6, weight: '600' });
    c.text('0', 0, 68.7, { size: 12.5, color: GRAY, weight: '500' });
    c.text('dB', 0, 83, { size: 12.5, color: GRAY, weight: '600' });
    vlines(g, 31.3, 194, 6.8, 24, 72);
    g.line(31.3, 43.3, 194, 43.3).stroke({ width: 1, color: 0x6e6e73, dash: [1.2, 2.2] });
    g.line(31.3, 69, 194, 25.7).stroke({
        width: 1.4,
        gradient: linear([0x3a7bd5, 0xd4b44a], { units: 'local', from: [31, 0], to: [194, 0] }),
    });
    const candles: [number, number, number][] = [
        [82.3, 45.7, 64],
        [89, 48, 57],
        [95.7, 44, 54],
        [102.3, 52, 62],
        [109, 40, 51],
        [115.7, 47, 58],
        [122.3, 50, 59],
        [129, 44, 55],
        [135.7, 48, 54],
        [142.3, 33, 39],
        [149, 30, 37],
        [149, 42, 55],
        [155.7, 47, 57],
        [162.3, 38, 48],
        [169, 44, 52],
        [182.3, 36, 45],
        [182.3, 50, 56],
    ];

    candles.forEach(([x, a, b], i) => {
        const k = osc(c.t, 1.3, i) * 0.8;

        g.pill(x - 1.1, a + k, 2.2, b - a).fill(W);
    });
    axis(
        c,
        [
            ['00', 36, DIM],
            ['06', 78],
            ['12', 118],
            ['18', 158],
        ],
        83,
        [31.3, 72, 112, 152],
    );
}

// ------------------------------------------------------------------------------------ row 4

function tempCompare(c: Cx): void {
    const { g } = c;
    const grad = linear(
        [
            [0, 0x0d2440],
            [0.45, 0x3d6a8c],
            [1, 0xcdeede],
        ],
        { units: 'local', from: [0, 0], to: [200, 0] },
    );

    I.thermometer(g, 4, 10.5, 15, W);
    c.text('7°C', 11, 17, { size: 17.5, weight: '600' });
    c.text('COMPARE WITH', 176, 10.5, { size: 9.5, weight: '600', align: 'right' });
    c.text('YESTERDAY', 176, 20.5, { size: 9.5, weight: '600', align: 'right' });
    c.text('+2°', 178, 16.5, { size: 13.5, color: 0x64d2ff, weight: '600' });
    g.roundRect(-4, 22.3, 77.5, 40, 11).fill(grad);
    g.roundRect(77.3, 22.3, 124, 40, 11).fill(grad);
    g.rect(60, 31, 30, 23).fill(grad);
    const mx = 74 + osc(c.t, 0.3) * 1.5;

    g.line(mx, 31.5, mx, 53.5).stroke({ width: 2.4, color: W, cap: 'round' });
    I.arrow(g, 5, 77.5, 11, GRAY, 'down', 0.13);
    c.text('6°', 11, 83, { size: 16.5, color: GRAY, weight: '500' });
    I.arrow(g, 36, 77.5, 11, GRAY, 'up', 0.13);
    c.text('11°', 42, 83, { size: 16.5, color: GRAY, weight: '500' });
    c.text('Mostly Cloudy', 194, 83, { size: 16.5, weight: '500', align: 'right' });
}

function screenTime(c: Cx): void {
    const { g } = c;
    const purple = 0x7d7aff;

    I.hourglass(g, 5, 10.5, 13, purple);
    c.run(13, 17, [
        ['4.8', 17, purple, '600', 3],
        ['HRS', 12.5, purple, '600'],
    ]);
    let rx = c.text('87', 194, 17, { size: 17, weight: '500', align: 'right' }).x;

    I.arrow(g, rx - 6, 11, 12, W, 'up', 0.13);
    rx = c.text('3%', rx - 15, 17, { size: 17, color: RED, weight: '600', align: 'right' }).x;
    I.chevron(g, rx - 7, 11.5, 10, RED, 'up', 0.18);
    c.text('60M', 0, 34, { size: 12.5, color: GRAY, weight: '500' });
    c.text('0', 0, 50, { size: 12.5, color: GRAY, weight: '500' });
    I.arrow(g, 4, 63.5, 10, GRAY, 'up', 0.14);
    c.text('20', 9, 68, { size: 12.5, color: GRAY, weight: '500' });
    vlines(g, 31.3, 194, 6.5, 24, 72);
    g.line(31.3, 46.7, 194, 46.7).stroke({ width: 1.2, color: 0x6e6e73 });
    const above: [number, number][] = [
        [33.7, 38.7],
        [40.3, 42.7],
        [47, 40],
        [53.7, 44.7],
        [60.3, 34.7],
        [99, 36],
        [105.7, 31],
        [112.3, 44],
        [118.7, 38.5],
        [125.3, 33],
        [131.7, 41],
    ];
    const below: [number, number][] = [
        [36, 55.5],
        [49, 55.5],
        [55.5, 55.5],
        [95, 62.5],
        [101.3, 57],
        [114, 52.5],
        [120.3, 56],
        [133, 55.5],
        [139.7, 58],
    ];

    above.forEach(([x, y], i) => g.circle(x, y + osc(c.t, 1.2, i) * 0.7, 2.1).fill(purple));
    below.forEach(([x, y]) => g.circle(x, y, 2.1).fill(W));
    g.line(105.7, 46.7, 102.3, 65.7).stroke({ width: 1.6, color: RED });
    g.circle(105.7, 46.7, 2.6).fill(RED);
    g.circle(102.3, 65.7, 2.2).fill(RED);
    g.line(126.3, 25, 126.3, 60).stroke({ width: 1.6, color: W });
    g.circle(126.3, 46.7, 3.2).fill(W);
    axis(
        c,
        [
            ['6AM', 34],
            ['12PM', 74],
            ['6PM', 114],
            ['12AM', 154],
        ],
        82,
        [31.3, 72, 112, 152],
    );
}

function airpods(c: Cx): void {
    const { g } = c;

    c.text('20 FT', 0, 17, { size: 16.5, color: 0x30d158, weight: '600' });
    c.run(
        194,
        17,
        [
            ['TO YOUR', 15.5, GRAY, '600', 4],
            ['RIGHT', 15.5, W, '700'],
        ],
        'right',
    );
    c.text('yuhang’s AirPods Max', 0, 42.5, { size: 19, weight: '500' });
    g.circle(15.3, 64, 15).fill(0x2c2c2e);
    I.headphones(g, 15.3, 63, 15, 0xc7c7cc);
    c.text('5M AGO', 42, 60.5, { size: 14.5, color: GRAY, weight: '600' });
    g.roundRect(42.5, 65, 14, 7, 2).stroke({ width: 1.1, color: W, alignment: 'inside' });
    g.roundRect(44.3, 66.8, 7.5, 3.4, 1).fill(W);
    g.roundRect(57, 67.3, 1.4, 2.6, 0.7).fill(W);
    const cx = 150.7;
    const cy = 86;
    const aim = -0.8 + osc(c.t, 0.5) * 0.08;

    g.arcSweep(cx, cy, 40, PI, PI).stroke({ width: 8, color: 0x3a3a3c });
    g.arcSweep(cx, cy, 40, -1.6, aim + 1.6).stroke({ width: 8, color: 0x6e6e73 });
    g.circle(cx + Math.cos(-1.6) * 40, cy + Math.sin(-1.6) * 40, 3.4).fill(0x8e8e93);
    g.circle(cx + Math.cos(aim) * 40, cy + Math.sin(aim) * 40, 3.6).fill(W);
    g.moveTo(143, 88).quadraticCurveTo(145, 71, 164, 67).stroke({ width: 2.6, color: W, cap: 'round' });
    g.polyline([158.5, 64.5, 166, 66.5, 161, 72.5]).stroke({ width: 2.6, color: W, cap: 'round' });
}

function compass(c: Cx): void {
    const { g } = c;
    const cx = 97.3;
    const cy = 140.6;
    const R = 116.6;
    const a0 = -2.62;
    const a1 = -0.52;

    c.run(0, 17, [
        ['~135°', 17.5, RED, '600', 5],
        ['SE', 17.5, W, '600'],
    ]);
    c.run(
        194,
        17,
        [
            ['128', 17.5, RED, '600', 1],
            ['M', 11, RED, '700', 4],
            ['elev', 17.5, W, '600'],
        ],
        'right',
    );
    g.arcSweep(cx, cy, R, a0, a1 - a0).stroke({ width: 1, color: W, alpha: 0.3 });
    for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 60) {
        g.line(
            cx + Math.cos(a) * (R - 3),
            cy + Math.sin(a) * (R - 3),
            cx + Math.cos(a) * (R - 9),
            cy + Math.sin(a) * (R - 9),
        ).stroke({ width: 1, color: 0x6e6e73 });
    }
    for (let k = 0; k <= 6; k++) {
        const a = -2.36 + k * 0.26;

        g.line(
            cx + Math.cos(a) * (R - 3),
            cy + Math.sin(a) * (R - 3),
            cx + Math.cos(a) * (R - 13),
            cy + Math.sin(a) * (R - 13),
        ).stroke({ width: 1.6, color: W });
    }
    [
        ['90', -2.24],
        ['120', -1.84],
        ['150', -1.3],
        ['180', -0.9],
    ].forEach(([s, a]) => {
        const ang = a as number;

        c.text(s as string, cx + Math.cos(ang) * (R - 24), cy + Math.sin(ang) * (R - 24), {
            size: 13,
            color: 0xd1d1d6,
            weight: '600',
            rotation: ang + PI / 2,
        });
    });
    const needle = -PI / 2 + osc(c.t, 0.4) * 0.05;
    const nx = cx + Math.cos(needle) * R;
    const ny = cy + Math.sin(needle) * R;

    g.arcSweep(cx, cy, R, -2.345, needle + 2.345).stroke({ width: 2.4, color: RED, cap: 'round' });
    g.circle(cx + Math.cos(-2.345) * R, cy + Math.sin(-2.345) * R, 2.8).fill(RED);
    g.line(nx, ny, cx, 70).stroke({ width: 1.6, color: W });
    g.circle(nx, ny, 3.4).fill(RED);
    g.pill(78.3, 69, 38, 17).fill(RED);
    c.text('75°', cx, 82, { size: 14, weight: '700', align: 'center' });
}

// ------------------------------------------------------------------------------------ row 5

function barometer(c: Cx): void {
    const { g } = c;
    const purple = 0xbf5af2;
    const cx = 97.3;
    const cy = 44;
    const lit = -1.06 + osc(c.t, 0.3) * 0.02;

    c.text('1,012', 26, 40, { size: 19, weight: '600', align: 'center' });
    c.text('hPa', 26, 57.5, { size: 14, color: GRAY, weight: '500', align: 'center' });
    for (let i = 0; i <= 10; i++) {
        const a = PI * 0.75 + (i / 10) * PI * 1.5;
        const on = Math.abs(((a - lit + PI * 3) % (PI * 2)) - PI) < 0.2;

        g.circle(cx + Math.cos(a) * 35, cy + Math.sin(a) * 35, 3.4).fill(on ? purple : 0x5a5a5e);
        g.circle(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22, 2.3).fill(on ? purple : 0x333336);
    }
    I.arrow(g, cx, cy, 16, W, 'up', 0.12);
    c.text('LOW', 64, 78.5, { size: 12.5, color: GRAY, weight: '500' });
    c.text('HIGH', 119, 78.5, { size: 12.5, color: GRAY, weight: '500' });
    I.gauge(g, 173, 32, 15, purple);
    c.text('Rising', 173, 58, { size: 17.5, color: purple, weight: '600', align: 'center' });
}

function zone2(c: Cx): void {
    const { g } = c;
    const teal = 0x3de0c0;
    const x = c.run(0, 16.5, [['49:27', 16.5, 0xffd60a, '600']]);

    I.clockOutline(g, x + 8, 10.5, 11.5, 0xffd60a);
    const x2 = c.run(x + 18, 16.5, [
        ['156', 16.5, RED, '600', 2],
        ['BPM', 10, W, '700', 3],
    ]);

    g.heart(x2 + 6, 11, 11, 0.08).fill(RED);
    I.runner(g, 186, 10.5, 14, 0x30d158);
    g.roundRect(8, 22.3, 166, 55, 11).fill(0x0a2723).stroke({ width: 1.3, color: 0x1f5a4f, alignment: 'inside' });
    c.run(
        168,
        36,
        [
            ['142-158', 14.5, W, '600', 3],
            ['BPM', 10.5, W, '700'],
        ],
        'right',
    );
    const secs = 25 * 60 + 27 + Math.floor(Math.max(0, c.t - 3));

    c.text(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 16, 70, {
        size: 20.5,
        color: teal,
        weight: '500',
    });
    c.text('TIME IN ZONE 2', 168, 68, { size: 11, color: teal, weight: '700', align: 'right' });
    g.pill(0, 31, 3.2, 38).fill(0x2f5f9f);
    [0x6a7a1a, 0xa05a10, 0x8a1a2a].forEach((col, i) => g.pill(180 + i * 5, 31, 3.2, 38).fill(col));
}

function reading(c: Cx): void {
    const { g } = c;
    const purple = 0x7d7aff;
    const xs = [4, 26.7, 49, 71.7, 94, 116.7, 139];
    const ys = [9, 25.7, 40.7, 56.3, 72.3];
    const rows = [
        ['_', '_', '_', 'f', 'q.5', 'd', 'd'],
        ['q.75', 'f', 'f', 'f', 'd', 'd', 'd'],
        ['d', 'd', 'd', 'd', 'q.25', 'r.8', 'd'],
        ['d', 'f', 'f', 'w', 'h', 'h', 'h'],
        ['h', 'h', 'h', 'h', 'h', '_', '_'],
    ];

    g.line(xs[1], ys[1], xs[3], ys[1]).stroke({ width: 2.4, color: purple });
    g.line(xs[1], ys[3], xs[2], ys[3]).stroke({ width: 2.4, color: purple });
    rows.forEach((row, r) =>
        row.forEach((v, i) => {
            const x = xs[i];
            const y = ys[r];
            const k = v[0];
            const f = Number(v.slice(1)) || 0;

            if (k === 'f') g.circle(x, y, 4.2).fill(purple);
            else if (k === 'd') g.circle(x, y, 4.2).fill(0x3a3a3c);
            else if (k === 'h') g.circle(x, y, 3.6).stroke({ width: 1.3, color: 0x48484a });
            else if (k === 'w') g.circle(x, y, 3.6).stroke({ width: 1.8, color: W });
            else if (k === 'q') {
                g.circle(x, y, 4.2).fill(0x3a3a3c);
                g.sector(x, y, 4.2, -PI / 2, -PI / 2 + f * PI * 2).fill(purple);
            } else if (k === 'r') {
                g.circle(x, y, 4.2).fill(0x3a3a3c);
                g.arcSweep(x, y, 3.5, -PI / 2, f * PI * 2).stroke({ width: 1.4, color: purple });
            }
        }),
    );
    g.roundRect(158, 4, 34.3, 53.3, 8, 0.6).fill(0x1d1d3a);
    I.book(g, 175.2, 17.5, 15, purple);
    I.checkCircle(g, 175.2, 40, 17, W);
    g.polyline([170.5, 40, 173.8, 43.3, 179.8, 36.8]).stroke({ width: 2, color: purple, cap: 'round' });
    c.text('22%', 194, 81, { size: 18, weight: '600', align: 'right' });
}

function moon(c: Cx): void {
    const { g } = c;
    const pos: [number, number, number][] = [
        [25.7, 64, 0.62],
        [46.7, 49, 0.72],
        [70.7, 38, 0.84],
        [96.7, 34.7, 0.93],
        [123.7, 36.3, 1.0],
        [147.3, 47.3, -0.86],
        [169, 64, -0.7],
    ];

    g.rect(-6, 22, 208, 70).fill(
        radial(
            [
                [0, 0x1b4cb0, 0.85],
                [0.45, 0x0c2a6a, 0.7],
                [1, 0x000000, 0],
            ],
            { center: [0.5, 0.85], radius: 0.62 },
        ),
    );
    c.text('Waxing Gibbous', 0, 17, { size: 17.5, weight: '600' });
    c.text('72%', 194, 17, { size: 17.5, color: 0x64a8ff, weight: '600', align: 'right' });
    pos.forEach(([x, y, f], i) => {
        const lift = osc(c.t, 0.8, i) * 0.6;
        const r = 9.6;
        const yy = y + lift;
        const k = Math.abs(f);

        // lit part = half disc on the lit side + terminator half-ellipse (all inside the disc)
        g.circle(x, yy, r).fill(0x0c2360);
        if (k >= 0.999) g.circle(x, yy, r).fill(W);
        else {
            const start = f > 0 ? -PI / 2 : PI / 2;

            g.sector(x, yy, r, start, start + PI).fill(W);
            g.ellipse(x, yy, r * Math.abs(2 * k - 1), r).fill(k > 0.5 ? W : 0x0c2360);
        }
        g.circle(x, yy, r + 1).stroke({ width: 1.3, color: W });
    });
    g.circle(36.3, 78.3, 1.8).fill(0x8e8e93);
    c.text('SUN 7', 96.7, 84, { size: 15.5, weight: '700', align: 'center' });
}

const defs: [string, string, (c: Cx) => void][] = [
    ['s5-cycling', 'Cycling heart rate', cycling],
    ['s5-2fa', 'One-time code', twoFactor],
    ['s5-now-playing', 'Now playing', nowPlaying],
    ['s5-weather', 'Weather week', weatherWeek],
    ['s5-energy', 'Energy & cost', energy],
    ['s5-blood-pressure', 'Blood pressure', bloodPressure],
    ['s5-battery', 'Car battery day', battery],
    ['s5-crosshair', 'Crosshair grid', crosshair],
    ['s5-garage', 'Garage door', garage],
    ['s5-sleep-blocks', 'Sleep stages', sleepBlocks],
    ['s5-activity', 'Activity rows', activityRows],
    ['s5-noise', 'Noise', noise],
    ['s5-temp', 'Temperature compare', tempCompare],
    ['s5-screen-time', 'Screen time', screenTime],
    ['s5-airpods', 'Find AirPods', airpods],
    ['s5-compass', 'Compass', compass],
    ['s5-barometer', 'Barometer', barometer],
    ['s5-zone', 'Time in zone', zone2],
    ['s5-reading', 'Reading goal', reading],
    ['s5-moon', 'Moon phases', moon],
];

export const sheet5: SheetWidget[] = defs.map(([id, name, draw], i) => ({
    id,
    name,
    x: XS[i % 4],
    y: YS[Math.floor(i / 4)],
    w: 196,
    h: 88,
    draw,
}));
