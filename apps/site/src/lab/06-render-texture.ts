import { AlphaFilter, Container, Graphics } from 'pixi.js';
import { SilkGraphics } from 'pixi-silk';
import { boot, C, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Filters & render textures',
    subtitle:
        'Two v8 traps. Filters render at resolution 1 by default, so they blur on retina screens. And there is no MSAA inside them, so edges get jaggy. createSilkApp fixes the first, and SilkGraphics does not need MSAA.',
    antialias: true,
});

type Draw = Graphics | SilkGraphics;

function scene(silk: boolean): Container {
    const c = new Container();
    const g: Draw = silk ? new SilkGraphics() : new Graphics();

    g.roundRect(-110, -70, 220, 140, 28).fill(C.card2).stroke({ width: 1, color: 0xffffff, alpha: 0.35 });
    g.circle(-50, -8, 34).stroke({ width: 6, color: C.green });
    g.circle(-50, -8, 20).fill(C.yellow);
    for (let i = 0; i < 5; i++)
        g.moveTo(10, -40 + i * 14)
            .lineTo(90, -34 + i * 16)
            .stroke({ width: 1.2, color: 0xffffff });
    g.moveTo(-90, 52)
        .lineTo(-50, 30)
        .lineTo(-10, 48)
        .lineTo(30, 26)
        .lineTo(90, 44)
        .stroke({ width: 4, color: C.pink, cap: 'round', join: 'round' });
    c.addChild(g);

    return c;
}

const variants = [
    { name: 'direct (MSAA)', filter: null },
    { name: 'filter, defaults', filter: () => new AlphaFilter({ alpha: 1, resolution: 1 }) },
    { name: 'filter, res inherit', filter: () => new AlphaFilter({ alpha: 1, resolution: 'inherit' }) },
];
const cells: { view: Container; caption: string }[] = [];

for (const silk of [false, true]) {
    for (const v of variants) {
        const holder = new Container();

        holder.addChild(scene(silk));
        if (v.filter) holder.filters = [v.filter()];
        cells.push({ view: holder, caption: `${silk ? 'Silk' : 'Graphics'}, ${v.name}` });
    }
}

const board = new Container();

proto.stage.addChild(board);
const captions = cells.map((c) => {
    const t = label(c.caption.toUpperCase(), { fontSize: 10, fill: C.muted, fontWeight: '600', letterSpacing: 0.6 });

    board.addChild(c.view, t);

    return t;
});

proto.onResize((w, h) => {
    const cellW = 250;
    const cellH = 196;
    const cols = w > h * 1.1 ? 3 : 2;
    const rows = Math.ceil(cells.length / cols);
    const scale = Math.max(0.5, Math.min(2, (w - 32) / (cellW * cols), (h - 150) / (cellH * rows)));

    cells.forEach((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        c.view.position.set(col * cellW + cellW / 2, row * cellH + cellH / 2 + 12);
        captions[i].position.set(col * cellW + 18, row * cellH);
    });
    board.scale.set(scale);
    board.position.set((w - cellW * cols * scale) / 2, 118);
});

let t = 0;

proto.app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;
    for (const c of cells) c.view.children[0].rotation = Math.sin(t * 0.4) * 0.12;
});
attachLoupe([proto.app]);
