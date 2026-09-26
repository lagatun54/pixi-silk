import { CanvasTextMetrics, type Container, fontStringFromTextStyle, Text, type TextStyleFontWeight } from 'pixi.js';
import { SilkGraphics } from 'pixi-silk';
import { C, FONT } from '../_shared/theme';

export { C };

export interface Widget {
    view: Container;
    width: number;
    height: number;
    /** Advance animation. `dt` in seconds, `t` total seconds. */
    tick?(dt: number, t: number): void;
}

/** Text rendered at 2x the device resolution so widgets stay crisp when scaled up. */
export function txt(
    text: string,
    size: number,
    color: number = C.text,
    weight: TextStyleFontWeight = '400',
    extra: { letterSpacing?: number; family?: string } = {},
): Text {
    const t = new Text({
        text,
        style: {
            fontFamily: extra.family ?? FONT,
            fontSize: size,
            fill: color,
            fontWeight: weight,
            letterSpacing: extra.letterSpacing ?? 0,
        },
        resolution: Math.min(6, (window.devicePixelRatio || 1) * 2),
    });

    return t;
}

/** Distance from a Text's top edge to its baseline. */
export function ascent(t: Text): number {
    return CanvasTextMetrics.measureFont(fontStringFromTextStyle(t.style)).ascent;
}

/** Puts a text so that its baseline sits at `y`. */
export function atBaseline<T extends Text>(t: T, x: number, y: number): T {
    t.position.set(x, y - ascent(t));

    return t;
}

/** Places texts left-to-right on a shared baseline; returns the x after the last one. */
export function inline(parent: Container, x: number, baselineY: number, parts: [Text, number][]): number {
    let cx = x;

    for (const [t, gap] of parts) {
        atBaseline(t, cx, baselineY);
        parent.addChild(t);
        cx += t.width + gap;
    }

    return cx;
}

/** Like inline(), but the run ends at `right`. */
export function inlineRight(parent: Container, right: number, baselineY: number, parts: [Text, number][]): number {
    const total = parts.reduce((sum, [t, gap], i) => sum + t.width + (i < parts.length - 1 ? gap : 0), 0);

    return inline(parent, right - total, baselineY, parts);
}

/** Widget card: squircle-cornered dark panel. */
export function card(w: number, h: number, r = 22, color: number = C.card): SilkGraphics {
    const g = new SilkGraphics().roundRect(0, 0, w, h, r, 0.6).fill(color);

    // pure black cards get a hairline so they still read on a black page
    if (color === 0x000000) g.stroke({ width: 1, color: 0xffffff, alpha: 0.13, alignment: 'inside' });

    return g;
}

/** The "Fat" glyph: three stacked circles. */
export function fatIcon(g: SilkGraphics, x: number, y: number, s: number, color: number): void {
    const r = s * 0.25;

    g.circle(x, y - s * 0.2, r).fill(color);
    g.circle(x - s * 0.24, y + s * 0.2, r).fill(color);
    g.circle(x + s * 0.24, y + s * 0.2, r).fill(color);
}

/** Down arrow like "↓" drawn with strokes. */
export function arrowDown(g: SilkGraphics, x: number, y: number, s: number, color: number): void {
    g.line(x, y - s / 2, x, y + s / 2).stroke({ width: s * 0.12, color, cap: 'round' });
    g.polyline([x - s * 0.3, y + s * 0.2, x, y + s / 2, x + s * 0.3, y + s * 0.2]).stroke({
        width: s * 0.12,
        color,
        cap: 'round',
    });
}

/** Smoothly animated array of values (critically damped towards targets). */
export class DampedSeries {
    values: number[];
    targets: number[];

    constructor(initial: number[]) {
        this.values = initial.slice();
        this.targets = initial.slice();
    }

    set(targets: number[]): void {
        this.targets = targets.slice();
        while (this.values.length < targets.length) this.values.push(targets[this.values.length]);
        this.values.length = targets.length;
    }

    step(dt: number, lambda = 8): boolean {
        let moving = false;

        for (let i = 0; i < this.values.length; i++) {
            const v = this.targets[i] + (this.values[i] - this.targets[i]) * Math.exp(-lambda * dt);

            if (Math.abs(v - this.values[i]) > 1e-4) moving = true;
            this.values[i] = v;
        }

        return moving;
    }
}

/** Deterministic pseudo random (mulberry32) so demos look the same each load. */
export function rng(seed: number): () => number {
    let a = seed >>> 0;

    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;

        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Smooth random walk. */
export function walk(n: number, seed: number, start: number, spread: number, min: number, max: number): number[] {
    const r = rng(seed);
    const out: number[] = [];
    let v = start;

    for (let i = 0; i < n; i++) {
        v = Math.min(max, Math.max(min, v + (r() - 0.5) * spread));
        out.push(v);
    }

    return out;
}
