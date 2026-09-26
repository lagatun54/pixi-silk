import { Container, Graphics } from 'pixi.js';
import { SilkGraphics } from 'pixi-silk';
import { C } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';
import { split } from './_shared/split';

const panes = await split(
    'Pixi v8 Graphics vs Silk',
    'Same scene three times. v8 Graphics tessellates once and relies on MSAA; Silk evaluates exact distances per pixel. Hover to magnify device pixels.',
    [
        { caption: 'Graphics, antialias off', plain: true, options: { antialias: false } },
        { caption: 'Graphics, MSAA 4x', plain: true, options: { antialias: true } },
        { caption: 'SilkGraphics', options: {} },
    ],
);

type Draw = Graphics | SilkGraphics;

const chart = [-120, 70, -95, 30, -70, 58, -45, 8, -20, 40, 5, -6, 30, 26, 55, -20, 80, 12, 105, -30, 125, -8];

/** Builds the same drawing with either API (they share most of the Graphics vocabulary). */
function build(isSilk: boolean) {
    const make = (): Draw => (isSilk ? new SilkGraphics() : new Graphics());
    const scene = new Container();

    const card = make();

    card.roundRect(-140, -110, 280, 220, 34).fill(C.card).stroke({ width: 1, color: 0xffffff, alpha: 0.28 });

    const rings = make();

    rings.circle(-80, -52, 34).stroke({ width: 1, color: 0xffffff, alpha: 0.7 });
    // Pixi's arc() continues the current path (canvas semantics), so start a fresh one
    rings
        .beginPath()
        .arc(-80, -52, 24, -Math.PI / 2, Math.PI * 0.9)
        .stroke({ width: 9, color: C.green, cap: 'round' });

    const lines = make();

    for (let i = 0; i < 6; i++) {
        const y = -78 + i * 9;

        lines
            .moveTo(-20, y)
            .lineTo(120, y + 6 + i * 1.5)
            .stroke({ width: 1, color: 0xffffff, alpha: 0.85 });
    }

    const zig = make();

    if (isSilk) (zig as SilkGraphics).polyline(chart).stroke({ width: 7, color: C.pink, alpha: 0.6, cap: 'round' });
    else
        (zig as Graphics)
            .poly(chart, false)
            .stroke({ width: 7, color: C.pink, alpha: 0.6, cap: 'round', join: 'round' });
    zig.y = 40;

    // a 4px dot, scaled up: tessellated curves show their facets
    const dotHolder = new Container();
    const dot = make();

    dot.circle(0, 0, 4).fill(C.yellow);
    dotHolder.addChild(dot);
    dotHolder.position.set(0, 168);

    scene.addChild(card, rings, lines, zig, dotHolder);

    return { scene, dotHolder };
}

const scenes = panes.map((pane, i) => {
    const s = build(i === 2);

    pane.app.stage.addChild(s.scene);
    pane.onResize((w, h) => {
        const k = Math.min(1.6, w / 320, (h - 40) / 380);

        s.scene.scale.set(k);
        s.scene.position.set(w / 2, h / 2 - 50 * k);
    });

    return s;
});

// ?t=5 jumps the animation clock (handy for screenshots)
let t = Number(new URLSearchParams(location.search).get('t') ?? 0);

panes[2].app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;
    const rot = Math.sin(t * 0.35) * 0.22;
    const zoom = 1 + 10 * (0.5 - 0.5 * Math.cos(t * 0.6));

    for (const s of scenes) {
        s.scene.rotation = rot;
        s.dotHolder.scale.set(zoom);
    }
});

attachLoupe(
    panes.map((p) => p.app),
    { zoom: 8, enabled: true },
);
