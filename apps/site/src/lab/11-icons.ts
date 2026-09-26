import { Container } from 'pixi.js';
import { linear, radial, SilkGraphics } from 'pixi-silk';
import { boot, C, fitOrScroll, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';
import { fatIcon } from './_widgets/common';

const proto = await boot({
    title: 'Icons from primitives',
    subtitle:
        'Glyph-like icons composed from distance-field primitives. Same code at 16, 28 and 56 px: tiny sizes stay legible because every edge is exactly one pixel of ramp.',
});

type IconDraw = (g: SilkGraphics, s: number, t: number) => void;

// every icon draws in a box of size s centred on 0,0
const icons: [string, IconDraw][] = [
    [
        'heart',
        (g, s, t) => {
            const beat = 1 + 0.08 * Math.max(0, Math.sin(t * 6)) ** 8;

            g.heart(0, s * 0.02, s * 0.9 * beat, 0.08).fill(C.pink);
        },
    ],
    ['fat', (g, s) => fatIcon(g, 0, 0, s * 0.9, C.yellow)],
    ['star', (g, s) => g.star(0, s * 0.03, 5, s * 0.48, s * 0.21, 0, s * 0.04).fill(C.yellow)],
    [
        'check',
        (g, s) => {
            g.circle(0, 0, s * 0.46).fill(C.green);
            g.polyline([-s * 0.2, 0, -s * 0.05, s * 0.15, s * 0.22, -s * 0.14]).stroke({
                width: s * 0.1,
                color: 0x000000,
                cap: 'round',
            });
        },
    ],
    [
        'plus',
        (g, s) => {
            g.circle(0, 0, s * 0.46).fill(C.blue);
            g.line(-s * 0.2, 0, s * 0.2, 0).stroke({ width: s * 0.1, color: 0xffffff, cap: 'round' });
            g.line(0, -s * 0.2, 0, s * 0.2).stroke({ width: s * 0.1, color: 0xffffff, cap: 'round' });
        },
    ],
    [
        'play',
        (g, s) => {
            g.circle(0, 0, s * 0.46).fill(0xffffff);
            g.triangle(-s * 0.1, -s * 0.18, s * 0.2, 0, -s * 0.1, s * 0.18, s * 0.03).fill(0x000000);
        },
    ],
    [
        'pause',
        (g, s) => {
            g.circle(0, 0, s * 0.46).fill(C.orange);
            g.roundRect(-s * 0.15, -s * 0.18, s * 0.1, s * 0.36, s * 0.03).fill(0x000000);
            g.roundRect(s * 0.05, -s * 0.18, s * 0.1, s * 0.36, s * 0.03).fill(0x000000);
        },
    ],
    [
        'battery',
        (g, s, t) => {
            const lvl = 0.25 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.8));

            g.roundRect(-s * 0.42, -s * 0.2, s * 0.76, s * 0.4, s * 0.1).stroke({
                width: s * 0.045,
                color: 0xffffff,
                alpha: 0.55,
                alignment: 'inside',
            });
            g.roundRect(-s * 0.42 + s * 0.075, -s * 0.125, s * 0.61 * lvl, s * 0.25, s * 0.05).fill(
                lvl < 0.3 ? C.red : C.green,
            );
            g.roundRect(s * 0.37, -s * 0.07, s * 0.06, s * 0.14, s * 0.03).fill({ color: 0xffffff, alpha: 0.55 });
        },
    ],
    [
        'signal',
        (g, s) => {
            for (let i = 0; i < 4; i++) {
                const h = s * (0.2 + i * 0.17);

                g.roundRect(-s * 0.4 + i * s * 0.22, s * 0.4 - h, s * 0.15, h, s * 0.04).fill(
                    i < 3 ? 0xffffff : 0x48484a,
                );
            }
        },
    ],
    [
        'location',
        (g, s) => {
            g.circle(0, 0, s * 0.46).fill(C.blue);
            g.triangle(-s * 0.18, s * 0.2, 0, -s * 0.24, s * 0.18, s * 0.2, s * 0.02).fill(0xffffff);
            g.triangle(-s * 0.17, s * 0.21, 0, s * 0.08, s * 0.17, s * 0.21).fill(C.blue);
        },
    ],
    [
        'moon',
        (g, s) => {
            g.circle(0, 0, s * 0.42).fill(0xf2e7b6);
            g.circle(s * 0.2, -s * 0.16, s * 0.36).fill(C.card);
        },
    ],
    [
        'sun',
        (g, s, t) => {
            g.circle(0, 0, s * 0.2).fill(C.yellow);
            g.circle(0, 0, s * 0.38).stroke({
                width: s * 0.08,
                color: C.yellow,
                cap: 'round',
                dash: [s * 0.08, s * 0.22],
                dashOffset: t * s * 0.1,
            });
        },
    ],
    [
        'cloud',
        (g, s) => {
            const c = 0xe5e5ea;

            g.circle(-s * 0.16, s * 0.04, s * 0.18).fill(c);
            g.circle(s * 0.06, -s * 0.06, s * 0.24).fill(c);
            g.roundRect(-s * 0.36, s * 0.02, s * 0.72, s * 0.22, s * 0.11).fill(c);
        },
    ],
    [
        'bolt',
        (g, s) => {
            g.triangle(s * 0.08, -s * 0.46, -s * 0.24, s * 0.06, s * 0.04, s * 0.06, s * 0.015).fill(C.yellow);
            g.triangle(-s * 0.04, -s * 0.06, s * 0.24, -s * 0.06, -s * 0.08, s * 0.46, s * 0.015).fill(C.yellow);
        },
    ],
    [
        'app',
        (g, s) => {
            g.roundRect(-s * 0.46, -s * 0.46, s * 0.92, s * 0.92, s * 0.22, 0.6).fill(
                linear([0x5e5ce6, 0xbf5af2], { from: [0, 0], to: [1, 1] }),
            );
            g.circle(0, 0, s * 0.2).fill(radial([0xffffff, [1, 0xffffff, 0.6]]));
        },
    ],
    [
        'bell',
        (g, s) => {
            g.roundRect(-s * 0.26, -s * 0.3, s * 0.52, s * 0.52, [s * 0.26, s * 0.26, s * 0.04, s * 0.04]).fill(
                C.orange,
            );
            g.roundRect(-s * 0.36, s * 0.16, s * 0.72, s * 0.1, s * 0.05).fill(C.orange);
            g.circle(0, s * 0.33, s * 0.07).fill(C.orange);
        },
    ],
];

const sizes = [16, 28, 56];
const board = new Container();
const g = new SilkGraphics();

board.addChild(g);
proto.stage.addChild(board);
const colW = 110;
const rowH = 96;

icons.forEach(([name], i) => {
    const t = label(name, { fontSize: 11, fill: C.muted });

    t.anchor.set(0.5, 0);
    t.position.set((i % 8) * colW + colW / 2, Math.floor(i / 8) * rowH * 2 + 160);
    board.addChild(t);
});

let time = 0;

function draw(): void {
    g.clear();
    icons.forEach(([, drawIcon], i) => {
        const x0 = (i % 8) * colW;
        const y0 = Math.floor(i / 8) * rowH * 2;

        g.roundRect(x0 + 4, y0, colW - 8, 182, 18, 0.6).fill(C.card);
        let y = y0 + 16;

        for (const s of sizes) {
            // the same icon code at three sizes: only the path transform changes
            g.save().translateTransform(x0 + colW / 2, y + s / 2);
            drawIcon(g, s, time);
            g.restore();
            y += s + 12;
        }
    });
}

proto.onResize(() => {
    const { scale, x, y } = fitOrScroll(proto, colW * 8, rowH * 4, { top: 104, maxScale: 1.4, readable: 0.8 });

    board.scale.set(scale);
    board.position.set(x, y);
});

proto.app.ticker.add((ticker) => {
    time += ticker.deltaMS / 1000;
    draw();
});
attachLoupe([proto.app], { zoom: 8 });
