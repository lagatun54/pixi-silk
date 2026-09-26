import { Container } from 'pixi.js';
import { conic, radial, SilkGraphics, Spring } from 'pixi-silk';
import { boot, C, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Glows & soft shadows',
    subtitle:
        'blur is a gaussian applied analytically to the distance field (erf), not a post-process: no render targets, no extra passes, still one draw call. Hover the cards.',
});

const bokeh = new SilkGraphics();
const glowAdd = new SilkGraphics();
const sharp = new SilkGraphics();
const surface = new SilkGraphics();
const cards = new Container();

glowAdd.blendMode = 'add';
proto.stage.addChild(bokeh, surface, cards, glowAdd, sharp);

let sigma = 10;
let t = 0;
let W = 800;
let H = 600;

// bokeh background: big blurred discs with radial gradients drifting slowly
const discs = Array.from({ length: 9 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 60 + Math.random() * 110,
    c: [C.indigo, C.purple, C.blue, C.pink, C.teal][i % 5],
    s: 0.02 + Math.random() * 0.04,
    p: Math.random() * 6,
}));

// three elevation cards that lift on hover
const elevations = [2, 8, 22];
const springs = elevations.map(() => new Spring(0, 220, 20));
const cardViews = elevations.map((e, i) => {
    const c = new Container();
    const g = new SilkGraphics();
    const tl = label(`elevation ${e}`, { fontSize: 13, fill: 0x1c1c1e, fontWeight: '600' });

    tl.position.set(18, 16);
    c.addChild(g, tl);
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.on('pointerenter', () => {
        springs[i].target = 1;
    });
    c.on('pointerleave', () => {
        springs[i].target = 0;
    });
    cards.addChild(c);

    return { c, g };
});

function drawCards(dt: number): void {
    cardViews.forEach(({ c, g }, i) => {
        const lift = springs[i].step(dt);
        const e = elevations[i] * (1 + lift * 1.2);

        g.clear();
        g.roundRect(4, 4 + e * 0.5, 172, 104, 20).fill({ color: 0x1a1a40, alpha: 0.28 + lift * 0.06, blur: e * 0.6 });
        g.roundRect(0, 0, 180, 110, 22, 0.6).fill(0xffffff);
        c.y = H * 0.64 - lift * 6;
    });
}

function draw(dt: number): void {
    bokeh.clear();
    for (const d of discs) {
        const x = d.x * W + Math.sin(t * d.s * 6 + d.p) * 40;
        const y = d.y * H + Math.cos(t * d.s * 5 + d.p) * 30;

        bokeh.circle(x, y, d.r).fill({
            gradient: radial(
                [
                    [0, d.c, 0.5],
                    [1, d.c, 0],
                ],
                { easing: 'smooth' },
            ),
            blur: 14,
        });
    }

    // neon ring: additive glow underneath a crisp core
    const cx = W * 0.3;
    const cy = H * 0.33;
    const r = Math.min(W, H) * 0.14;
    const sweep = Math.PI * (1.1 + 0.6 * Math.sin(t * 0.8));
    const grad = conic([0x00e5ff, 0xbf5af2, 0xff375f]);

    glowAdd.clear();
    sharp.clear();
    glowAdd
        .arcSweep(cx, cy, r, -Math.PI / 2, sweep)
        .stroke({ width: 14, cap: 'round', gradient: grad, blur: sigma, alpha: 0.9 });
    sharp.arcSweep(cx, cy, r, -Math.PI / 2, sweep).stroke({ width: 6, cap: 'round', gradient: grad });

    // glowing sparkline
    const pts: number[] = [];
    const x0 = W * 0.52;
    const x1 = W * 0.9;

    for (let i = 0; i <= 60; i++) {
        const u = i / 60;

        pts.push(x0 + (x1 - x0) * u, cy + Math.sin(u * 9 + t * 1.5) * 22 * Math.sin(u * 3.1) + Math.cos(u * 17) * 5);
    }
    glowAdd.polyline(pts).stroke({ width: 6, color: C.green, blur: sigma * 0.7, alpha: 0.9, cap: 'round' });
    sharp.polyline(pts).stroke({ width: 2, color: 0xd9ffe4, cap: 'round' });

    drawCards(dt);
}

proto.onResize((w, h) => {
    W = w;
    H = h;
    surface.clear();
    const sw = Math.min(w - 32, 700);

    surface.roundRect((w - sw) / 2, h * 0.56, sw, Math.min(250, h * 0.4), 30, 0.6).fill(0xe9e9ef);
    cardViews.forEach(({ c }, i) => {
        c.x = w / 2 - 290 + i * 200;
    });
    if (w < 700)
        cardViews.forEach(({ c }, i) => {
            c.x = 16 + (i * (w - 32)) / 3;
            c.scale.set((w - 48) / 3 / 180);
        });
    else cardViews.forEach(({ c }) => c.scale.set(1));
});

proto.slider('glow blur', 0, 30, sigma, 0.5, (v) => {
    sigma = v;
});
proto.app.ticker.add((ticker) => {
    const dt = Math.min(0.1, ticker.deltaMS / 1000);

    t += dt;
    draw(dt);
});
attachLoupe([proto.app]);
