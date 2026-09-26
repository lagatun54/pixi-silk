import { Container } from 'pixi.js';
import { along, conic, horizontal, linear, radial, SilkGraphics } from 'pixi-silk';
import { boot, C, fitOrScroll, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Gradients',
    subtitle:
        'Linear, radial (with inner radius), conic and along-the-stroke ramps, baked into a half-float atlas. OKLab keeps hue and lightness even. Alpha mixes premultiplied, so fading to transparent never goes grey.',
});

const board = new Container();
const g = new SilkGraphics();
const captions = new Container();

board.addChild(g, captions);
proto.stage.addChild(board);

function caption(text: string, x: number, y: number, anchor = 0): void {
    const t = label(text, { fontSize: 11, fill: C.muted });

    t.anchor.set(anchor, 0);
    t.position.set(x, y);
    captions.addChild(t);
}

const spectrum = [0xff453a, 0xff9f0a, 0xffd60a, 0x30d158, 0x64d2ff, 0x5e5ce6, 0xbf5af2];

// row 1: kinds
g.roundRect(0, 0, 150, 110, 18, 0.6).fill(linear([0x0a84ff, 0xbf5af2], { from: [0, 0], to: [1, 1] }));
caption('linear', 75, 118, 0.5);
g.roundRect(170, 0, 150, 110, 18, 0.6).fill(
    radial(
        [
            [0, 0xffd60a],
            [0.6, 0xff375f],
            [1, 0x2c0a3a],
        ],
        { center: [0.3, 0.3], radius: 0.8 },
    ),
);
caption('radial', 245, 118, 0.5);
g.circle(415, 55, 55).fill(conic([...spectrum, spectrum[0]]));
g.circle(415, 55, 22).fill(C.bg);
caption('conic', 415, 118, 0.5);
g.sector(535, 55, 55, -Math.PI * 1.25, Math.PI * 0.25, 30, 6).fill(
    radial([0x64d2ff, 0x0a84ff], { innerRadius: 30 / 110, radius: 0.5 }),
);
caption('radial across a ring', 535, 118, 0.5);
const wave: number[] = [];

for (let x = 0; x <= 150; x += 2) wave.push(630 + x, 55 + Math.sin(x * 0.07) * 32);
g.polyline(wave).stroke({ width: 10, cap: 'round', gradient: along(spectrum, { easing: 'smooth' }) });
caption('along the stroke', 705, 118, 0.5);

// row 2: extend modes
(['pad', 'repeat', 'reflect'] as const).forEach((extend, i) => {
    g.roundRect(i * 260, 160, 240, 44, 12).fill(
        linear([0xffffff, 0x0a84ff], { extend, from: [0.35, 0.5], to: [0.55, 0.5] }),
    );
    caption(`extend: ${extend}`, i * 260 + 120, 212, 0.5);
});

// row 3: interpolation spaces
const pairs: [number, number][] = [
    [0x0000ff, 0xffff00],
    [0xff0000, 0x00ffff],
    [0xffffff, 0x000000],
    [0xff00ff, 0x00ff00],
];

(['srgb', 'linear', 'oklab'] as const).forEach((space, row) => {
    caption(
        space === 'srgb' ? 'sRGB (CSS default)' : space === 'linear' ? 'linear light' : 'OKLab (default)',
        0,
        256 + row * 44,
    );
    pairs.forEach(([a, b], i) => {
        g.roundRect(140 + i * 160, 250 + row * 44, 150, 32, 8).fill(horizontal([a, b], { space }));
    });
});

// row 4: transparency done right, over a checkerboard
for (let x = 0; x < 780; x += 12) {
    for (let y = 0; y < 48; y += 12) {
        if (((x + y) / 12) % 2 === 0) g.rect(x, 400 + y, 12, 12).fill(0x3a3a3c);
    }
}
g.rect(0, 400, 390, 48).fill(
    horizontal([
        [0, 0xff375f, 0],
        [1, 0xff375f, 1],
    ]),
);
g.rect(390, 400, 390, 48).fill(
    horizontal(
        [
            [0, 0xffd60a, 1],
            [0.5, 0x0a84ff, 0],
            [1, 0x30d158, 1],
        ],
        { easing: 'smooth' },
    ),
);
caption('transparent to pink (premultiplied, no dark fringe)', 195, 456, 0.5);
caption('yellow to transparent to green, smooth easing', 585, 456, 0.5);

proto.onResize(() => {
    const { scale, x, y } = fitOrScroll(proto, 780, 480, { top: 108 });

    board.scale.set(scale);
    board.position.set(x, y);
});
attachLoupe([proto.app]);
