import type { SilkGraphics } from 'pixi-silk';

/*
 * SF-Symbol-like glyphs built from Silk primitives. Every icon draws centred on (x, y)
 * inside a box of height `s` (roughly the cap height of the text next to it).
 */

type G = SilkGraphics;
const PI = Math.PI;

/** Scales a unit-space drawing (units = s) into place. */
function at(g: G, x: number, y: number, s: number, draw: () => void, rot = 0): void {
    g.save().translateTransform(x, y);
    if (rot) g.rotateTransform(rot);
    g.scaleTransform(s);
    draw();
    g.restore();
}

export function clockFilled(g: G, x: number, y: number, s: number, color = 0xffffff, hands = 0x000000): void {
    at(g, x, y, s, () => {
        g.circle(0, 0, 0.5).fill(color);
        g.polyline([0, -0.3, 0, 0, 0.2, 0.1]).stroke({ width: 0.11, color: hands, cap: 'round' });
    });
}

export function clockOutline(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, 0, 0.44).stroke({ width: 0.1, color });
        g.polyline([0, -0.24, 0, 0, 0.16, 0.1]).stroke({ width: 0.1, color, cap: 'round' });
    });
}

export function cup(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.42, -0.34, 0.66, 0.5, [0.04, 0.04, 0.26, 0.26]).fill(color);
        g.arcSweep(0.24, -0.12, 0.13, -PI / 2, PI).stroke({ width: 0.09, color });
        g.pill(-0.56, 0.24, 1.0, 0.12).fill(color);
    });
}

export function book(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.52, -0.38, 0.49, 0.76, [0.14, 0.02, 0.02, 0.06]).fill(color);
        g.roundRect(0.03, -0.38, 0.49, 0.76, [0.02, 0.14, 0.06, 0.02]).fill(color);
        g.line(-0.42, -0.2, -0.12, -0.2).stroke({ width: 0.05, color: 0x000000, alpha: 0.5 });
        g.line(0.12, -0.2, 0.42, -0.2).stroke({ width: 0.05, color: 0x000000, alpha: 0.5 });
    });
}

export function runner(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        const w = { width: 0.13, color, cap: 'round' as const };

        g.circle(0.16, -0.4, 0.11).fill(color);
        g.line(0.06, -0.2, -0.08, 0.1).stroke({ ...w, width: 0.17 });
        g.polyline([-0.3, -0.12, -0.08, -0.22, 0.1, -0.16, 0.22, 0.0]).stroke(w);
        g.polyline([-0.08, 0.1, 0.12, 0.22, 0.02, 0.5]).stroke(w);
        g.polyline([-0.08, 0.1, -0.2, 0.3, -0.42, 0.28]).stroke(w);
    });
}

export function arrow(
    g: G,
    x: number,
    y: number,
    s: number,
    color: number,
    dir: 'up' | 'down' | 'left' | 'right',
    width = 0.12,
): void {
    const rot = { up: 0, right: PI / 2, down: PI, left: -PI / 2 }[dir];

    at(
        g,
        x,
        y,
        s,
        () => {
            g.line(0, 0.5, 0, -0.46).stroke({ width, color, cap: 'round' });
            g.polyline([-0.3, -0.16, 0, -0.48, 0.3, -0.16]).stroke({ width, color, cap: 'round' });
        },
        rot,
    );
}

export function chevron(
    g: G,
    x: number,
    y: number,
    s: number,
    color: number,
    dir: 'up' | 'down' | 'right',
    width = 0.14,
): void {
    const rot = { up: 0, right: PI / 2, down: PI }[dir];

    at(
        g,
        x,
        y,
        s,
        () => {
            g.polyline([-0.42, 0.22, 0, -0.2, 0.42, 0.22]).stroke({ width, color, cap: 'round' });
        },
        rot,
    );
}

/** ⇆ two opposing arrows. */
export function transfer(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        const w = { width: 0.11, color, cap: 'round' as const };

        g.line(-0.45, -0.18, 0.45, -0.18).stroke(w);
        g.polyline([0.2, -0.42, 0.46, -0.18, 0.2, 0.06]).stroke(w);
        g.line(0.45, 0.22, -0.45, 0.22).stroke(w);
        g.polyline([-0.2, -0.02, -0.46, 0.22, -0.2, 0.46]).stroke(w);
    });
}

export function fan(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        // four broad blades around a hub
        for (let i = 0; i < 4; i++) {
            g.save().rotateTransform((i * PI) / 2 + PI / 4);
            g.ellipse(0.02, -0.25, 0.2, 0.26).fill(color);
            g.restore();
        }
        g.circle(0, 0, 0.1).fill(0x000000);
    });
}

export function deskLamp(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        const w = { width: 0.12, color, cap: 'round' as const };

        g.pill(-0.42, 0.4, 0.56, 0.13).fill(color);
        g.polyline([-0.14, 0.42, -0.3, 0.02, 0.02, -0.26]).stroke(w);
        g.circle(-0.3, 0.02, 0.09).fill(color);
        // shade: a rotated trapezoid-ish cone
        g.save().translateTransform(0.12, -0.28).rotateTransform(0.75);
        g.triangle(-0.08, -0.14, -0.08, 0.14, 0.44, 0.0, 0.05).fill(color);
        g.roundRect(-0.14, -0.2, 0.2, 0.4, 0.08).fill(color);
        g.restore();
        g.line(0.36, 0.02, 0.44, 0.1).stroke({ width: 0.09, color, cap: 'round' });
    });
}

export function lock(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.36, -0.06, 0.72, 0.56, 0.1).fill(color);
        g.arcSweep(0, -0.1, 0.23, PI, PI).stroke({ width: 0.12, color });
        g.line(-0.23, -0.1, -0.23, -0.03).stroke({ width: 0.12, color });
        g.line(0.23, -0.1, 0.23, -0.03).stroke({ width: 0.12, color });
    });
}

/** Circle with a letter/number, text drawn by the caller. */
export function badge(g: G, x: number, y: number, r: number, color: number, ring = 0x000000, ringWidth = 2): void {
    g.circle(x, y, r).fill(color).stroke({ width: ringWidth, color: ring, alignment: 'outside' });
}

/** White circle with a black arrow (↑ or →). */
export function circledArrow(
    g: G,
    x: number,
    y: number,
    s: number,
    dir: 'up' | 'right',
    bg = 0xffffff,
    fg = 0x000000,
): void {
    g.circle(x, y, s / 2).fill(bg);
    arrow(g, x, y, s * 0.56, fg, dir, 0.2);
}

export function creditCard(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.62, -0.42, 1.24, 0.84, 0.12).fill(color);
        g.rect(-0.62, -0.2, 1.24, 0.16).fill(0x000000);
        g.roundRect(-0.46, 0.14, 0.3, 0.1, 0.04).fill(0x000000);
    });
}

export function suitcase(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.34, -0.3, 0.68, 0.76, 0.1).fill(color);
        g.roundRect(-0.14, -0.48, 0.28, 0.24, 0.06).stroke({ width: 0.08, color });
        g.line(-0.14, -0.2, -0.14, 0.4).stroke({ width: 0.05, color: 0x000000 });
        g.line(0.14, -0.2, 0.14, 0.4).stroke({ width: 0.05, color: 0x000000 });
    });
}

/** Circle with three dots (…). */
export function moreCircle(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, 0, 0.42).stroke({ width: 0.09, color });
        for (const dx of [-0.2, 0, 0.2]) g.circle(dx, 0, 0.055).fill(color);
    });
}

export function triangleDown(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => g.triangle(-0.42, -0.34, 0.42, -0.34, 0, 0.4, 0.05).fill(color));
}

export function drop(g: G, x: number, y: number, s: number, color: number, bubble = false): void {
    at(g, x, y, s, () => {
        g.circle(0, 0.16, 0.32).fill(color);
        g.triangle(-0.3, 0.08, 0.3, 0.08, 0, -0.5, 0.04).fill(color);
        if (bubble) g.circle(0.34, -0.3, 0.12).fill(color);
    });
}

export function cloud(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(-0.24, 0.06, 0.24).fill(color);
        g.circle(0.08, -0.08, 0.32).fill(color);
        g.circle(0.36, 0.1, 0.2).fill(color);
        g.pill(-0.48, 0.02, 1.04, 0.3).fill(color);
    });
}

export function cloudRain(g: G, x: number, y: number, s: number, color: number, rain: number): void {
    at(g, x, y, s, () => {
        g.circle(-0.22, -0.1, 0.22).fill(color);
        g.circle(0.08, -0.22, 0.3).fill(color);
        g.circle(0.34, -0.06, 0.18).fill(color);
        g.pill(-0.44, -0.14, 0.96, 0.26).fill(color);
        for (const dx of [-0.24, 0.02, 0.28])
            g.line(dx, 0.22, dx - 0.06, 0.42).stroke({ width: 0.08, color: rain, cap: 'round' });
    });
}

/** Navigation arrow (paper plane pointing up-right when rot = 0). */
export function navArrow(g: G, x: number, y: number, s: number, color: number, rot = 0): void {
    at(
        g,
        x,
        y,
        s,
        () => {
            // two halves of the notched dart; the first overlaps the shared edge slightly so no AA seam shows
            g.triangle(0.46, -0.46, -0.46, -0.04, 0.021, 0.009, 0.03).fill(color);
            g.triangle(0.46, -0.46, 0.02, -0.02, 0.04, 0.46, 0.03).fill(color);
        },
        rot,
    );
}

/** Wind direction arrow like ➤ (points along rot, 0 = up). */
export function windArrow(g: G, x: number, y: number, s: number, color: number, rot = 0): void {
    at(
        g,
        x,
        y,
        s,
        () => {
            g.triangle(0, -0.5, 0.38, 0.42, -0.38, 0.42, 0.03).fill(color);
            g.triangle(-0.3, 0.46, 0.3, 0.46, 0, 0.14).fill(0x000000);
        },
        rot,
    );
}

export function meditation(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, -0.36, 0.13).fill(color);
        g.roundRect(-0.14, -0.2, 0.28, 0.36, 0.1).fill(color);
        g.polyline([-0.44, 0.02, -0.18, -0.12, -0.12, -0.02]).stroke({ width: 0.1, color, cap: 'round' });
        g.polyline([0.44, 0.02, 0.18, -0.12, 0.12, -0.02]).stroke({ width: 0.1, color, cap: 'round' });
        g.ellipse(0, 0.26, 0.46, 0.13).fill(color);
    });
}

export function eye(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.ellipse(0, 0, 0.56, 0.36).fill(color);
        g.circle(0, 0, 0.24).fill(0x000000);
        g.circle(0, 0, 0.13).fill(color);
    });
}

/** ∡ measured-angle symbol. */
export function angle(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.polyline([0.42, -0.42, -0.42, 0.4, 0.46, 0.4]).stroke({ width: 0.09, color, cap: 'round' });
        g.arcSweep(-0.42, 0.4, 0.44, -PI / 4, PI / 4 - 0.05).stroke({ width: 0.08, color, dash: [0.06, 0.08] });
    });
}

export function bulb(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, -0.14, 0.34).fill(color);
        g.roundRect(-0.2, 0.08, 0.4, 0.24, 0.06).fill(color);
        g.roundRect(-0.15, 0.36, 0.3, 0.07, 0.03).fill(color);
        g.roundRect(-0.12, 0.46, 0.24, 0.06, 0.03).fill(color);
    });
}

/** ↺ ring with an arrow head (the caller draws the "$"). */
export function dollarCycle(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.arcSweep(0, 0, 0.42, -PI * 0.72, PI * 1.62).stroke({ width: 0.1, color, cap: 'round' });
        g.triangle(-0.5, -0.5, -0.12, -0.38, -0.44, -0.08, 0.02).fill(color);
    });
}

export function pills(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.save().rotateTransform(-0.6);
        g.pill(-0.5, -0.33, 0.62, 0.3).fill(color);
        g.restore();
        g.circle(0.2, 0.18, 0.28).fill(color);
        g.line(0.02, 0.18, 0.38, 0.18).stroke({ width: 0.07, color: 0x000000 });
    });
}

/** Smiley: filled (emoji-less) or dashed placeholder. */
export function smiley(g: G, x: number, y: number, r: number, color: number, dashed = false): void {
    if (dashed) g.circle(x, y, r).stroke({ width: r * 0.1, color, dash: [r * 0.22, r * 0.2] });
    else g.circle(x, y, r).fill(color);
    const c = dashed ? color : 0x000000;

    g.circle(x - r * 0.3, y - r * 0.18, r * 0.1).fill(c);
    g.circle(x + r * 0.3, y - r * 0.18, r * 0.1).fill(c);
    g.arcSweep(x, y + r * 0.02, r * 0.45, PI * 0.2, PI * 0.6).stroke({ width: r * 0.1, color: c, cap: 'round' });
}

export function bed(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.56, -0.02, 1.12, 0.3, 0.05).fill(color);
        g.roundRect(-0.46, -0.2, 0.3, 0.2, 0.08).fill(color);
        g.roundRect(-0.1, -0.24, 0.62, 0.24, 0.1).fill(color);
        g.rect(-0.56, 0.28, 0.12, 0.14).fill(color);
        g.rect(0.44, 0.28, 0.12, 0.14).fill(color);
    });
}

export function alarm(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, 0.04, 0.33).stroke({ width: 0.1, color });
        g.polyline([0, -0.13, 0, 0.06, 0.12, 0.14]).stroke({ width: 0.08, color, cap: 'round' });
        g.arcSweep(0, 0.04, 0.52, -PI * 0.78, PI * 0.26).stroke({ width: 0.08, color, cap: 'round' });
        g.arcSweep(0, 0.04, 0.52, -PI * 0.48, PI * 0.26).stroke({ width: 0.08, color, cap: 'round' });
        g.arcSweep(0, 0.04, 0.52, PI * 0.02, PI * 0.2).stroke({ width: 0.08, color, cap: 'round' });
        g.arcSweep(0, 0.04, 0.52, PI * 0.78, PI * 0.2).stroke({ width: 0.08, color, cap: 'round' });
    });
}

/** Crescent with small z's. */
export function moonZ(g: G, x: number, y: number, s: number, color: number, bg = 0x000000): void {
    at(g, x, y, s, () => {
        g.circle(-0.08, 0.1, 0.38).fill(color);
        g.circle(0.1, -0.06, 0.3).fill(bg);
        g.polyline([0.22, -0.46, 0.4, -0.46, 0.22, -0.28, 0.4, -0.28]).stroke({ width: 0.07, color, cap: 'round' });
    });
}

export function batteryBolt(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.52, -0.32, 0.96, 0.64, 0.12).fill(color);
        g.roundRect(0.46, -0.14, 0.08, 0.28, 0.04).fill(color);
        bolt(g, -0.04, 0, 0.5, 0x000000);
    });
}

export function bolt(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.triangle(0.14, -0.5, -0.28, 0.08, 0.04, 0.08, 0.02).fill(color);
        g.triangle(-0.06, -0.08, 0.28, -0.08, -0.14, 0.5, 0.02).fill(color);
    });
}

export function thermometer(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.12, -0.5, 0.24, 0.7, 0.12).stroke({ width: 0.07, color });
        g.circle(0, 0.3, 0.2).fill(color);
        g.line(0, 0.2, 0, -0.18).stroke({ width: 0.09, color, cap: 'round' });
        for (const dy of [-0.34, -0.2, -0.06]) g.line(0.2, dy, 0.32, dy).stroke({ width: 0.05, color, cap: 'round' });
    });
}

export function hourglass(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.pill(-0.36, -0.52, 0.72, 0.1).fill(color);
        g.pill(-0.36, 0.42, 0.72, 0.1).fill(color);
        g.triangle(-0.3, -0.42, 0.3, -0.42, 0, 0.0, 0.03).fill(color);
        g.triangle(-0.3, 0.42, 0.3, 0.42, 0, 0.0, 0.03).fill(color);
    });
}

export function checkCircle(g: G, x: number, y: number, s: number, color: number): void {
    g.circle(x, y, s / 2).fill(color);
    g.polyline([x - s * 0.22, y, x - s * 0.06, y + s * 0.16, x + s * 0.24, y - s * 0.16]).stroke({
        width: s * 0.12,
        color: 0x000000,
        cap: 'round',
    });
}

export function warning(g: G, x: number, y: number, s: number, color: number, mark = 0x000000): void {
    at(g, x, y, s, () => {
        g.triangle(0, -0.48, 0.52, 0.42, -0.52, 0.42, 0.08).fill(color);
        g.line(0, -0.18, 0, 0.12).stroke({ width: 0.12, color: mark, cap: 'round' });
        g.circle(0, 0.28, 0.065).fill(mark);
    });
}

export function heartOutline(g: G, x: number, y: number, s: number, color: number): void {
    g.heart(x, y, s, 0.1).stroke({ width: s * 0.1, color });
}

export function bike(g: G, x: number, y: number, s: number, color: number, rider = true): void {
    at(g, x, y, s, () => {
        const w = { width: 0.08, color, cap: 'round' as const };

        g.circle(-0.38, 0.2, 0.25).stroke(w);
        g.circle(0.38, 0.2, 0.25).stroke(w);
        g.polyline([-0.38, 0.2, -0.12, -0.12, 0.2, -0.12, 0.38, 0.2]).stroke(w);
        g.polyline([-0.12, -0.12, 0.02, 0.2, 0.2, -0.12]).stroke(w);
        if (rider) {
            g.circle(0.16, -0.52, 0.1).fill(color);
            g.polyline([-0.1, -0.18, 0.08, -0.4, 0.28, -0.2]).stroke({ ...w, width: 0.11 });
        }
    });
}

export function gauge(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, 0, 0.44).stroke({ width: 0.08, color });
        g.arcSweep(0, 0.04, 0.26, PI * 1.1, PI * 0.8).stroke({ width: 0.07, color, cap: 'round', dash: [0.02, 0.1] });
        g.line(0, 0.04, 0.16, -0.14).stroke({ width: 0.08, color, cap: 'round' });
        g.circle(0, 0.04, 0.06).fill(color);
    });
}

export function headphones(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.arcSweep(0, 0.06, 0.38, PI, PI).stroke({ width: 0.08, color });
        g.roundRect(-0.46, 0.02, 0.18, 0.34, 0.08).fill(color);
        g.roundRect(0.28, 0.02, 0.18, 0.34, 0.08).fill(color);
    });
}

export function sunIcon(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, 0, 0.2).fill(color);
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * PI * 2;

            g.line(Math.cos(a) * 0.32, Math.sin(a) * 0.32, Math.cos(a) * 0.46, Math.sin(a) * 0.46).stroke({
                width: 0.08,
                color,
                cap: 'round',
            });
        }
    });
}

/** Airplane pointing right. */
export function plane(g: G, x: number, y: number, s: number, color: number, rot = 0): void {
    at(
        g,
        x,
        y,
        s,
        () => {
            g.pill(-0.5, -0.08, 1.0, 0.16).fill(color);
            g.triangle(-0.08, -0.06, 0.18, -0.06, -0.22, -0.5, 0.03).fill(color);
            g.triangle(-0.08, 0.06, 0.18, 0.06, -0.22, 0.5, 0.03).fill(color);
            g.triangle(-0.48, -0.05, -0.3, -0.05, -0.5, -0.24, 0.02).fill(color);
            g.triangle(-0.48, 0.05, -0.3, 0.05, -0.5, 0.24, 0.02).fill(color);
        },
        rot,
    );
}

/** Telephone handset. */
export function phone(g: G, x: number, y: number, s: number, color: number): void {
    at(
        g,
        x,
        y,
        s,
        () => {
            g.moveTo(-0.3, -0.42)
                .bezierCurveTo(-0.52, -0.2, -0.3, 0.2, 0.1, 0.42)
                .stroke({ width: 0.2, color, cap: 'round' });
            g.roundRect(-0.46, -0.5, 0.26, 0.2, 0.08).fill(color);
            g.save()
                .translateTransform(0.24, 0.36)
                .rotateTransform(-PI / 4);
            g.roundRect(-0.13, -0.1, 0.26, 0.2, 0.08).fill(color);
            g.restore();
        },
        -0.12,
    );
}

/** Speech bubble. */
export function bubble(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.ellipse(0, -0.04, 0.5, 0.4).fill(color);
        g.triangle(-0.36, 0.16, -0.12, 0.3, -0.44, 0.46, 0.02).fill(color);
    });
}

/** Package box (isometric). */
export function box(g: G, x: number, y: number, s: number, color: number, ink: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.42, -0.4, 0.84, 0.84, 0.1).fill(color);
        g.line(-0.42, -0.12, 0.42, -0.12).stroke({ width: 0.08, color: ink });
        g.line(0, -0.12, 0, 0.44).stroke({ width: 0.08, color: ink });
    });
}

/** Car seen from the front. */
export function carFront(g: G, x: number, y: number, s: number, color: number, ink = 0x000000): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.5, -0.1, 1, 0.42, 0.12).fill(color);
        g.roundRect(-0.36, -0.42, 0.72, 0.4, 0.12).fill(color);
        g.roundRect(-0.26, -0.33, 0.52, 0.2, 0.05).fill(ink);
        g.circle(-0.3, 0.1, 0.07).fill(ink);
        g.circle(0.3, 0.1, 0.07).fill(ink);
        g.roundRect(-0.44, 0.26, 0.2, 0.2, 0.05).fill(color);
        g.roundRect(0.24, 0.26, 0.2, 0.2, 0.05).fill(color);
    });
}

export function house(g: G, x: number, y: number, s: number, color: number, ink = 0x000000): void {
    at(g, x, y, s, () => {
        g.triangle(-0.5, -0.02, 0.5, -0.02, 0, -0.48, 0.04).fill(color);
        g.rect(-0.34, -0.04, 0.68, 0.48).fill(color);
        g.roundRect(-0.1, 0.12, 0.2, 0.32, 0.04).fill(ink);
    });
}

/** Satellite: body with two striped solar panels. */
export function satellite(g: G, x: number, y: number, s: number, color: number, rot = 0): void {
    at(
        g,
        x,
        y,
        s,
        () => {
            g.circle(0, 0, 0.14).fill(color);
            for (const side of [-1, 1]) {
                const x0 = side < 0 ? -0.62 : 0.24;

                for (let i = 0; i < 3; i++) g.roundRect(x0 + i * 0.14, -0.2, 0.09, 0.4, 0.03).fill(color);
            }
        },
        rot,
    );
}

export function xMark(g: G, x: number, y: number, s: number, color: number, width = 0.14): void {
    at(g, x, y, s, () => {
        g.line(-0.4, -0.4, 0.4, 0.4).stroke({ width, color, cap: 'round' });
        g.line(-0.4, 0.4, 0.4, -0.4).stroke({ width, color, cap: 'round' });
    });
}

export function crosshair(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        const w = { width: 0.12, color, cap: 'round' as const };

        g.circle(0, 0, 0.32).stroke(w);
        g.line(0, -0.5, 0, -0.22).stroke(w);
        g.line(0, 0.22, 0, 0.5).stroke(w);
        g.line(-0.5, 0, -0.22, 0).stroke(w);
        g.line(0.22, 0, 0.5, 0).stroke(w);
    });
}

/** Tram / bus front. */
export function bus(g: G, x: number, y: number, s: number, color: number, ink = 0x000000): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.38, -0.5, 0.76, 0.86, 0.18).fill(color);
        g.roundRect(-0.28, -0.36, 0.56, 0.3, 0.06).fill(ink);
        g.circle(-0.2, 0.14, 0.07).fill(ink);
        g.circle(0.2, 0.14, 0.07).fill(ink);
        g.line(-0.24, 0.36, -0.34, 0.5).stroke({ width: 0.1, color, cap: 'round' });
        g.line(0.24, 0.36, 0.34, 0.5).stroke({ width: 0.1, color, cap: 'round' });
    });
}

/** Formula-1 car in profile, facing right (width 2s). */
export function f1Car(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.roundRect(-0.8, -0.1, 1.7, 0.26, 0.1).fill(color);
        g.roundRect(-1.0, -0.36, 0.22, 0.34, 0.05).fill(color);
        g.roundRect(-0.2, -0.3, 0.34, 0.24, 0.1).fill(color);
        g.circle(-0.62, 0.18, 0.2).fill(color);
        g.circle(0.62, 0.18, 0.2).fill(color);
        g.roundRect(0.72, 0.02, 0.32, 0.12, 0.05).fill(color);
    });
}

/** Person silhouette (head and shoulders). */
export function person(g: G, x: number, y: number, s: number, color: number): void {
    at(g, x, y, s, () => {
        g.circle(0, -0.18, 0.2).fill(color);
        g.ellipse(0, 0.36, 0.36, 0.2).fill(color);
    });
}

/** Water drop outline. */
export function dropOutline(g: G, x: number, y: number, s: number, color: number, width = 0.09): void {
    at(g, x, y, s, () => {
        g.moveTo(0, -0.5)
            .bezierCurveTo(0.1, -0.3, 0.36, -0.06, 0.36, 0.16)
            .bezierCurveTo(0.36, 0.38, 0.2, 0.5, 0, 0.5)
            .bezierCurveTo(-0.2, 0.5, -0.36, 0.38, -0.36, 0.16)
            .bezierCurveTo(-0.36, -0.06, -0.1, -0.3, 0, -0.5)
            .stroke({ width, color, cap: 'round' });
    });
}
