import { Container } from 'pixi.js';
import { conic, SilkGraphics, Spring } from 'pixi-silk';
import { C, card, inline, txt, type Widget } from './common';

const TOP = -Math.PI / 2;
const TAU = Math.PI * 2;

export interface RingSpec {
    from: number;
    to: number;
    track: number;
    value: number;
}

/**
 * Activity-ring renderer. Progress above 100% wraps around, and the overlapping tip
 * gets a soft shadow so the ring reads as stacked - all analytic.
 */
export function drawRing(
    g: SilkGraphics,
    cx: number,
    cy: number,
    r: number,
    width: number,
    spec: RingSpec,
    p: number,
): void {
    g.circle(cx, cy, r).stroke({ width, color: spec.track });
    if (p <= 0.0005) {
        // a dot at the start, like the real thing
        g.circle(cx, cy - r, width / 2).fill(spec.from);

        return;
    }
    const grad = conic([spec.from, spec.to]);

    if (p < 1) {
        g.arcSweep(cx, cy, r, TOP, p * TAU).stroke({ width, cap: 'round', gradient: grad });

        return;
    }
    // full lap with the gradient, then the overflow in the end colour
    g.circle(cx, cy, r).stroke({ width, gradient: conic([spec.from, spec.to], { startAngle: TOP, sweep: TAU }) });
    const extra = Math.min(p - 1, 0.999) * TAU;
    const endA = TOP + extra;
    const ex = cx + Math.cos(endA) * r;
    const ey = cy + Math.sin(endA) * r;
    // tip shadow: offset a little along the direction of travel
    const dx = -Math.sin(endA);
    const dy = Math.cos(endA);

    g.circle(ex + dx * width * 0.18, ey + dy * width * 0.18, width * 0.5).fill({
        color: 0x000000,
        alpha: 0.6,
        blur: width * 0.16,
    });
    g.arcSweep(cx, cy, r, TOP - 0.02, extra + 0.02).stroke({ width, cap: 'round', color: spec.to });
}

export const MOVE: RingSpec = { from: 0xe8134f, to: 0xff5aa0, track: 0x3a0717, value: 0.82 };
export const EXERCISE: RingSpec = { from: 0x8be100, to: 0xc6ff3d, track: 0x223a00, value: 1.28 };
export const STAND: RingSpec = { from: 0x00c7e6, to: 0x5ef2ff, track: 0x033a44, value: 0.58 };

/** Three concentric rings with springy progress. */
export function activityRings(size = 220): Widget {
    const view = new Container();
    const g = new SilkGraphics();

    view.addChild(g);
    const specs = [MOVE, EXERCISE, STAND];
    const springs = specs.map(() => new Spring(0, 60, 14));
    const width = size * 0.1;
    const gap = size * 0.012;
    const c = size / 2;

    springs.forEach((s, i) => {
        s.target = specs[i].value;
    });
    let next = 4;

    return {
        view,
        width: size,
        height: size,
        tick(dt, t) {
            if (t > next) {
                next = t + 4;
                springs.forEach((s, i) => {
                    s.target = Math.max(0.05, specs[i].value + (Math.random() - 0.5) * 0.5);
                });
            }
            g.clear();
            springs.forEach((s, i) => {
                const r = c - width / 2 - i * (width + gap);

                drawRing(g, c, c, r, width, specs[i], s.step(dt));
            });
        },
    };
}

/** Card with rings and the three metrics. */
export function activityCard(): Widget {
    const w = 340;
    const h = 170;
    const view = new Container();

    view.addChild(card(w, h, 24));
    const rings = activityRings(134);

    rings.view.position.set(18, 18);
    view.addChild(rings.view);
    const rows: [string, string, string, number][] = [
        ['Move', '410/500', 'CAL', 0xff375f],
        ['Exercise', '38/30', 'MIN', 0xa6ff00],
        ['Stand', '7/12', 'HRS', 0x00e6ff],
    ];

    rows.forEach(([name, value, unit, color], i) => {
        const y = 44 + i * 44;

        inline(view, 172, y - 16, [[txt(name, 13, C.text, '500'), 0]]);
        inline(view, 172, y + 5, [
            [txt(value, 19, color, '600'), 3],
            [txt(unit, 13, color, '600'), 0],
        ]);
    });

    return { view, width: w, height: h, tick: rings.tick };
}
