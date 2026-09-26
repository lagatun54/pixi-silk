import { Container } from 'pixi.js';
import { conic, SilkGraphics, vertical } from 'pixi-silk';
import { boot, C, fitOrScroll, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Primitives',
    subtitle: 'Every shape is an exact signed distance field evaluated per pixel. One SilkGraphics = one draw call.',
});

const board = new Container();

proto.stage.addChild(board);

const cells: [string, (g: SilkGraphics) => void][] = [
    ['roundRect', (g) => g.roundRect(-44, -30, 88, 60, 14).fill(C.blue)],
    ['per-corner radii', (g) => g.roundRect(-44, -30, 88, 60, [28, 4, 28, 4]).fill(C.indigo)],
    [
        'squircle corners',
        (g) =>
            g
                .roundRect(-38, -38, 76, 76, 18, 0.8)
                .fill(C.card2)
                .stroke({ width: 1.5, color: C.muted, alignment: 'inside' }),
    ],
    ['circle', (g) => g.circle(0, 0, 34).fill(C.yellow)],
    ['ellipse + stroke', (g) => g.ellipse(0, 0, 46, 24).fill(C.card2).stroke({ width: 4, color: C.orange })],
    [
        'ring (open arc)',
        (g) => g.arc(0, 0, 30, -Math.PI / 2, Math.PI * 1.1).stroke({ width: 10, color: C.green, cap: 'round' }),
    ],
    ['butt arc', (g) => g.arc(0, 0, 30, -Math.PI * 0.75, Math.PI * 0.25).stroke({ width: 12, color: C.teal })],
    [
        'conic ring',
        (g) =>
            g
                .arc(0, 0, 30, -Math.PI / 2, Math.PI * 1.25)
                .stroke({ width: 10, cap: 'round', gradient: conic([C.green, C.yellow, C.red]) }),
    ],
    ['pie', (g) => g.sector(0, 0, 36, -Math.PI / 2, Math.PI * 0.6).fill(C.orange)],
    ['donut segment', (g) => g.sector(0, 0, 38, -Math.PI * 0.8, -Math.PI * 0.1, 22, 5).fill(C.purple)],
    [
        'line caps',
        (g) => {
            g.line(-36, -16, 36, -16).stroke({ width: 8, color: C.text, cap: 'butt' });
            g.line(-36, 0, 36, 0).stroke({ width: 8, color: C.text, cap: 'round' });
            g.line(-36, 16, 36, 16).stroke({ width: 8, color: C.text, cap: 'square' });
        },
    ],
    [
        'polyline joins',
        (g) =>
            g
                .polyline([-40, 20, -20, -20, 0, 14, 20, -24, 40, 18])
                .stroke({ width: 7, color: C.pink, cap: 'round', alpha: 0.75 }),
    ],
    [
        'smooth curve',
        (g) =>
            g
                .polyline([-44, 18, -26, -8, -10, 10, 8, -22, 26, 4, 44, -14], { smooth: 'catmull' })
                .stroke({ width: 3, color: C.cyan, cap: 'round' }),
    ],
    [
        'area + gradient',
        (g) =>
            g
                .area([-44, 10, -30, -6, -14, 2, 2, -18, 18, -8, 34, -22, 44, -16], 30, { smooth: 'monotone' })
                .fill(
                    vertical([
                        [0, C.orange, 0.9],
                        [1, C.orange, 0],
                    ]),
                )
                .stroke({ width: 2, color: C.orange, cap: 'round' }),
    ],
    [
        'dashes & dots',
        (g) => {
            g.line(-40, -12, 40, -12).stroke({ width: 3, color: C.muted, dash: [8, 5] });
            g.line(-40, 12, 40, 12).stroke({ width: 5, color: C.yellow, cap: 'round', dash: [0, 9] });
        },
    ],
    ['dotted circle', (g) => g.circle(0, 0, 30).stroke({ width: 4, color: C.mint, cap: 'round', dash: [0, 10] })],
    ['heart', (g) => g.heart(0, 2, 72, 0.06).fill(C.pink)],
    ['star', (g) => g.star(0, 2, 5, 36, 16, 0, 3).fill(C.yellow)],
    ['hexagon', (g) => g.regularPoly(0, 0, 34, 6, 0, 6).fill(C.card2).stroke({ width: 3, color: C.blue })],
    ['rounded triangle', (g) => g.triangle(-26, -30, 34, 0, -26, 30, 6).fill(C.text)],
    [
        'glow (blur)',
        (g) => {
            g.circle(0, 0, 18).fill({ color: C.red, blur: 12 });
            g.circle(0, 0, 14).fill(C.red);
        },
    ],
    [
        'soft shadow',
        (g) => {
            g.roundRect(-40, -22, 80, 52, 14).fill({ color: 0x000000, alpha: 0.9, blur: 8 });
            g.roundRect(-40, -30, 80, 52, 14).fill(C.card2);
        },
    ],
    [
        'hairlines',
        (g) => {
            for (let i = 0; i < 8; i++)
                g.line(-40, -28 + i * 8, 40, -28 + i * 8 + 6).stroke({ width: 0.15 + i * 0.15, color: C.text });
        },
    ],
    [
        'stroke alignment',
        (g) => {
            g.roundRect(-40, -26, 22, 52, 6).fill(C.card2).stroke({ width: 5, color: C.orange, alignment: 'inside' });
            g.roundRect(-11, -26, 22, 52, 6).fill(C.card2).stroke({ width: 5, color: C.orange, alignment: 'center' });
            g.roundRect(18, -26, 22, 52, 6).fill(C.card2).stroke({ width: 5, color: C.orange, alignment: 'outside' });
        },
    ],
];

const graphics: SilkGraphics[] = [];

for (const [name, draw] of cells) {
    const cell = new Container();
    const bg = new SilkGraphics().roundRect(-64, -60, 128, 132, 18, 0.6).fill(C.card);
    const g = new SilkGraphics();

    draw(g);
    const t = label(name, { fontSize: 11, fill: C.muted });

    t.anchor.set(0.5, 0);
    t.position.set(0, 50);
    cell.addChild(bg, g, t);
    board.addChild(cell);
    graphics.push(g);
}

proto.onResize((w) => {
    const cellW = 140;
    const cellH = 144;
    const cols = Math.max(2, Math.min(8, Math.floor((w - 32) / cellW)));
    const rows = Math.ceil(cells.length / cols);

    board.children.forEach((c, i) => {
        c.position.set((i % cols) * cellW + cellW / 2, Math.floor(i / cols) * cellH + cellH / 2);
    });
    const { scale, x, y } = fitOrScroll(proto, cols * cellW, rows * cellH, { top: 96, maxScale: 1, readable: 0.8 });

    board.scale.set(scale);
    board.position.set(x, y);
});

attachLoupe([proto.app]);
