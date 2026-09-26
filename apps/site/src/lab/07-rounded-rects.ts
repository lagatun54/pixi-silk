import { Container } from 'pixi.js';
import { linear, SilkGraphics } from 'pixi-silk';
import { boot, C, fitOrScroll, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Rounded rects & squircles',
    subtitle:
        'Per-corner radii and continuous-curvature corners (superellipse, like iOS icons and widgets). The overlay compares a circular corner (red) with the squircle (white).',
});

let radius = 46;
let smoothing = 0.6;
const board = new Container();
const g = new SilkGraphics();
const captions = new Container();

board.addChild(g, captions);
proto.stage.addChild(board);

function caption(text: string, x: number, y: number) {
    const t = label(text.toUpperCase(), { fontSize: 10, fill: C.muted, fontWeight: '600', letterSpacing: 0.6 });

    t.anchor.set(0.5, 0);
    t.position.set(x, y);
    captions.addChild(t);

    return t;
}

const S = 170;
const W = 118;

caption('circular corners', S / 2, S + 10);
const squircleCaption = caption('', S + 30 + S / 2, S + 10);

caption('overlay', (S + 30) * 2 + S / 2, S + 10);
caption('per-corner radii', (W + 22) * 2 - 11, S + 60 + W + 10);
caption('animated alignment', (W + 22) * 4 + W / 2, S + 60 + W + 10);

let t = 0;
const panel = linear([0x3a3a3c, 0x232326], { from: [0, 0], to: [1, 1] });

function draw(): void {
    g.clear();

    // 1. circular vs squircle, side by side
    g.roundRect(0, 0, S, S, radius).fill(panel);
    g.roundRect(S + 30, 0, S, S, radius, smoothing).fill(panel);
    squircleCaption.text = `SQUIRCLE, SMOOTHING ${smoothing.toFixed(2)}`;

    // 2. overlay of both outlines
    const ox = (S + 30) * 2;

    g.roundRect(ox, 0, S, S, radius).stroke({ width: 1.5, color: C.red });
    g.roundRect(ox, 0, S, S, radius, smoothing).stroke({ width: 1.5, color: 0xffffff });

    // 3. per-corner radii, animated
    const y2 = S + 60;
    const k = 0.5 + 0.5 * Math.sin(t * 1.1);
    const shapes: [number, number, number, number][] = [
        [S / 2, 8, S / 2, 8],
        [8 + k * 60, 60 - k * 50, 8 + k * 60, 60 - k * 50],
        [S / 2, S / 2, 6, S / 2],
        [4, 4, 4, 4 + k * 80],
    ];
    shapes.forEach((r, i) => {
        g.roundRect(i * (W + 22), y2, W, W, r, smoothing).fill([C.blue, C.indigo, C.orange, C.green][i]);
    });

    // 4. stroke alignment with a thick stroke on one shape
    g.roundRect((W + 22) * 4, y2, W, W, 28, smoothing)
        .fill(C.card2)
        .stroke({ width: 10, color: C.yellow, alpha: 0.85, alignment: 0.5 + 0.5 * Math.sin(t * 0.8) });
}

proto.onResize(() => {
    const { scale, x, y } = fitOrScroll(proto, 690, 390, { top: 110, bottom: 64 });

    board.scale.set(scale);
    board.position.set(x, y);
});

proto.slider('radius', 0, 85, radius, 1, (v) => {
    radius = v;
});
proto.slider('smoothing', 0, 1, smoothing, 0.01, (v) => {
    smoothing = v;
});
proto.app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;
    draw();
});
attachLoupe([proto.app]);
