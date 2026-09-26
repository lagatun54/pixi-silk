import { Text, type TextStyleOptions } from 'pixi.js';

/*
 * Palette, fonts and the text helper shared by the lab pages and the widgets. No CSS here, so the
 * widgets can also be used on regular site pages (the home page hero).
 */

export const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif';
export const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

/** Crisp text helper (Pixi renders text at the renderer resolution). */
export function label(text: string, style: TextStyleOptions = {}): Text {
    return new Text({
        text,
        style: {
            fontFamily: FONT,
            fontSize: 13,
            fill: 0xf5f5f7,
            ...style,
        },
    });
}

/** iOS-ish palette. */
export const C = {
    bg: 0x000000,
    card: 0x1c1c1e,
    card2: 0x2c2c2e,
    line: 0x3a3a3c,
    text: 0xf5f5f7,
    muted: 0x8e8e93,
    yellow: 0xffd60a,
    orange: 0xff9f0a,
    red: 0xff453a,
    pink: 0xff375f,
    green: 0x30d158,
    mint: 0x63e6e2,
    teal: 0x40c8e0,
    cyan: 0x64d2ff,
    blue: 0x0a84ff,
    indigo: 0x5e5ce6,
    purple: 0xbf5af2,
};
