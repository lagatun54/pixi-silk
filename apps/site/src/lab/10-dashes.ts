import { Container } from 'pixi.js';
import { along, conic, SilkGraphics } from 'pixi-silk';
import { boot, C, fitOrScroll, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Dashes & dots',
    subtitle:
        'Dash patterns are evaluated in the shader along the path, with caps on every dash. Closed outlines stretch the pattern to tile without a seam. Animate dashOffset for marching ants and spinners.',
});

const board = new Container();
const g = new SilkGraphics();
const captions = new Container();

board.addChild(g, captions);
proto.stage.addChild(board);

function caption(text: string, x: number, y: number): void {
    const t = label(text.toUpperCase(), { fontSize: 10, fill: C.muted, fontWeight: '600', letterSpacing: 0.6 });

    t.anchor.set(0.5, 0);
    t.position.set(x, y);
    captions.addChild(t);
}

caption('spinner', 80, 170);
caption('dotted ring', 250, 170);
caption('tick gauge', 420, 170);
caption('marching ants', 120, 380);
caption('cap styles', 390, 380);
caption('dotted sun path', 250, 560);

/** Rounded rect outline as a closed polyline (corners flattened as arcs). */
function roundedPath(x: number, y: number, w: number, h: number, r: number): number[] {
    const pts: number[] = [];
    const corner = (cx: number, cy: number, a0: number) => {
        for (let i = 0; i <= 8; i++) {
            const a = a0 + (i / 8) * (Math.PI / 2);

            pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
    };

    corner(x + w - r, y + r, -Math.PI / 2);
    corner(x + w - r, y + h - r, 0);
    corner(x + r, y + h - r, Math.PI / 2);
    corner(x + r, y + r, Math.PI);

    return pts;
}

const ants = roundedPath(20, 210, 200, 150, 22);
let t = 0;

function draw(): void {
    g.clear();
    // spinner: dots with a comet tail via a conic gradient
    g.circle(80, 80, 56).stroke({
        width: 9,
        cap: 'round',
        dash: [0, 22],
        dashOffset: -t * 40,
        gradient: conic(
            [
                [0, 0xffffff, 0.05],
                [1, 0xffffff, 1],
            ],
            { startAngle: t * 2.2 },
        ),
    });
    // dotted ring with fitted pattern
    g.circle(250, 80, 56).stroke({ width: 5, color: C.mint, cap: 'round', dash: [0, 11] });
    g.circle(250, 80, 40).stroke({ width: 2, color: C.mint, alpha: 0.6, dash: [6, 5] });
    // tick gauge: butt-capped dashes on an arc
    g.arcSweep(420, 90, 60, Math.PI * 0.8, Math.PI * 1.4).stroke({
        width: 14,
        color: 0xffffff,
        alpha: 0.25,
        dash: [2, 5],
    });
    g.arcSweep(420, 90, 60, Math.PI * 0.8, Math.PI * 1.4 * (0.5 + 0.5 * Math.sin(t))).stroke({
        width: 14,
        color: C.orange,
        dash: [2, 5],
    });

    // marching ants around a rounded rect
    g.polyline(ants, { closed: true }).stroke({ width: 2, color: 0xffffff, dash: [7, 5], dashOffset: t * 18 });
    g.roundRect(44, 234, 152, 102, 12).fill({ color: C.blue, alpha: 0.25 });

    // caps
    (['butt', 'round', 'square'] as const).forEach((cap, i) => {
        const y = 232 + i * 42;

        g.line(290, y, 490, y).stroke({ width: 10, color: C.yellow, cap, dash: [16, 14], dashOffset: t * 10 });
    });

    // sun path: dotted parabola, horizon, sun
    const pts: number[] = [];

    for (let x = 0; x <= 440; x += 4) {
        const u = (x / 440) * 2 - 1;

        pts.push(30 + x, 540 - (1 - u * u) * 110);
    }
    g.line(20, 520, 480, 520).stroke({ width: 1, color: 0xffffff, alpha: 0.3 });
    g.polyline(pts).stroke({ width: 3, cap: 'round', dash: [0, 9], gradient: along([0xff9f0a, 0xffffff, 0xff9f0a]) });
    const u = Math.sin(t * 0.4);

    g.circle(30 + ((u + 1) / 2) * 440, 540 - (1 - u * u) * 110, 8).fill(C.yellow);
    g.circle(30 + ((u + 1) / 2) * 440, 540 - (1 - u * u) * 110, 9).fill({ color: C.yellow, blur: 8, alpha: 0.7 });
}

proto.onResize(() => {
    const { scale, x, y } = fitOrScroll(proto, 500, 580, { top: 108, maxScale: 1.7 });

    board.scale.set(scale);
    board.position.set(x, y);
});

proto.app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;
    draw();
});
attachLoupe([proto.app]);
