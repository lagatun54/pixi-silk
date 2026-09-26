import { Container, Graphics } from 'pixi.js';
import { SilkGraphics } from 'pixi-silk';
import { boot, C, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Sub-pixel motion',
    subtitle:
        'Everything drifts at 2 px per second. Triangle geometry snaps between pixel (or MSAA sample) positions and crawls. Distance fields glide smoothly. Watch the edges, not the shapes.',
    antialias: true,
});

type Draw = Graphics | SilkGraphics;

interface Row {
    name: string;
    build(g: Draw): void;
    move(c: Container, t: number): void;
}

const drift = (c: Container, t: number) => {
    c.x = (t * 2) % 40;
};

const rows: Row[] = [
    {
        name: '1 px line, 3° slope',
        build: (g) => g.moveTo(0, 0).lineTo(220, 11.5).stroke({ width: 1, color: 0xffffff }),
        move: drift,
    },
    {
        name: 'circle r = 3',
        build: (g) => {
            for (let i = 0; i < 8; i++) g.circle(i * 28, 0, 3).fill(C.yellow);
        },
        move: drift,
    },
    {
        name: 'thin ring',
        build: (g) => {
            for (let i = 0; i < 5; i++) g.circle(18 + i * 46, 0, 16).stroke({ width: 1, color: C.cyan });
        },
        move: drift,
    },
    {
        name: 'slow clock hand',
        build: (g) => g.moveTo(0, 0).lineTo(110, 0).stroke({ width: 1.5, color: C.pink, cap: 'round' }),
        move: (c, t) => {
            c.x = 110;
            c.rotation = t * 0.02;
        },
    },
];

const board = new Container();

proto.stage.addChild(board);
const movers: { c: Container; row: Row }[] = [];

rows.forEach((row, i) => {
    for (const side of [0, 1]) {
        const holder = new Container();
        const g: Draw = side === 0 ? new Graphics() : new SilkGraphics();

        row.build(g);
        holder.addChild(g);
        holder.position.set(side * 330, 40 + i * 70);
        const wrap = new Container();

        wrap.addChild(holder);
        board.addChild(wrap);
        movers.push({ c: g as unknown as Container, row });
    }
    const t = label(row.name, { fontSize: 11, fill: C.muted });

    t.position.set(0, 12 + i * 70);
    board.addChild(t);
});
for (const [i, s] of ['Pixi Graphics, MSAA 4x', 'SilkGraphics'].entries()) {
    const t = label(s.toUpperCase(), { fontSize: 11, fill: C.text, fontWeight: '600', letterSpacing: 0.6 });

    t.position.set(i * 330, -18);
    board.addChild(t);
}

let zoom = 3;

proto.onResize((w, h) => {
    zoom = Math.max(1, Math.min(3, (w - 40) / 640, (h - 160) / 300));
    board.scale.set(zoom);
    board.position.set((w - 640 * zoom) / 2, 118 + 28 * zoom);
});

let t = 0;

proto.app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;
    for (const m of movers) m.row.move(m.c, t);
});

attachLoupe([proto.app], { zoom: 6, enabled: true });
