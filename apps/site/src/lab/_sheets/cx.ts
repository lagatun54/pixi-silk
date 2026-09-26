import { CanvasTextMetrics, Container, fontStringFromTextStyle, Text, TextStyle } from 'pixi.js';
import { SilkGraphics } from 'pixi-silk';

export const SF =
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';

export type Weight = '300' | '400' | '500' | '600' | '700' | '800';

export interface TextOpts {
    size?: number;
    color?: number;
    weight?: Weight;
    align?: 'left' | 'center' | 'right';
    alpha?: number;
    /** Letter spacing in px. */
    spacing?: number;
    /** Rotation in radians around the text centre (y is then the centre, not the baseline). */
    rotation?: number;
    family?: string;
}

/** One piece of an inline run: text, size, color, weight, gap after. */
export type RunPart = [string, number, number, Weight?, number?];

const ascents = new Map<string, number>();
const widths = new Map<string, number>();

function styleKey(o: Required<Omit<TextOpts, 'align' | 'alpha' | 'rotation'>>): string {
    return `${o.size}|${o.color}|${o.weight}|${o.spacing}|${o.family}|${Cx.optical}`;
}

/**
 * Immediate-mode drawing context for a widget: graphics are cleared every frame and texts
 * are reused by call order, so widget code can simply redraw everything from `t`.
 */
export class Cx {
    static textResolution = 2;
    /** Horizontal text scale; watch sheets use ~0.93 to match SF Compact's narrower glyphs. */
    static condense = 1;
    /**
     * Optical scale: text is laid out at `size * optical` and scaled back down. The system font picks its
     * optical size from the font size, so 2 reproduces a @2x design shown at 1x (tighter small text).
     */
    static optical = 1;

    readonly view = new Container();
    /** Main layer (below text). */
    readonly g = new SilkGraphics();
    /** Overlay layer (above text). */
    readonly fg = new SilkGraphics();
    t = 0;
    private readonly _textLayer = new Container();
    private readonly _texts: Text[] = [];
    private readonly _keys: string[] = [];
    private _used = 0;

    constructor() {
        this.view.addChild(this.g, this._textLayer, this.fg);
    }

    begin(t: number): void {
        this.t = t;
        this.g.clear();
        this.fg.clear();
        this._used = 0;
    }

    end(): void {
        for (let i = this._used; i < this._texts.length; i++) this._texts[i].visible = false;
    }

    private _style(o: TextOpts) {
        return {
            size: o.size ?? 12,
            color: o.color ?? 0xffffff,
            weight: o.weight ?? '600',
            spacing: o.spacing ?? 0,
            family: o.family ?? SF,
        };
    }

    private _textStyle(s: ReturnType<Cx['_style']>): TextStyle {
        return new TextStyle({
            fontFamily: s.family,
            fontSize: s.size * Cx.optical,
            fill: s.color,
            fontWeight: s.weight,
            letterSpacing: s.spacing * Cx.optical,
        });
    }

    /** Width of a string in the given style. */
    width(str: string, o: TextOpts = {}): number {
        const s = this._style(o);
        const key = `${styleKey(s)}|${str}`;
        let w = widths.get(key);

        if (w === undefined) {
            w = CanvasTextMetrics.measureText(str, this._textStyle(s)).width;
            if (widths.size > 4000) widths.clear();
            widths.set(key, w);
        }

        return (w / Cx.optical) * Cx.condense;
    }

    ascent(o: TextOpts = {}): number {
        const s = this._style(o);
        const font = fontStringFromTextStyle(this._textStyle(s));
        let a = ascents.get(font);

        if (a === undefined) {
            a = CanvasTextMetrics.measureFont(font).ascent;
            ascents.set(font, a);
        }

        return a / Cx.optical;
    }

    /** Draws text with its baseline at y (or centred on x,y when rotated). */
    text(str: string, x: number, y: number, o: TextOpts = {}): Text {
        const s = this._style(o);
        const key = styleKey(s);
        let t = this._texts[this._used];

        const resolution = Cx.textResolution / Cx.optical;

        if (!t) {
            t = new Text({ text: str, style: this._textStyle(s), resolution });
            this._texts.push(t);
            this._keys.push(key);
            this._textLayer.addChild(t);
        } else {
            if (this._keys[this._used] !== key) {
                t.style = this._textStyle(s);
                this._keys[this._used] = key;
            }
            if (t.text !== str) t.text = str;
            if (t.resolution !== resolution) t.resolution = resolution;
        }
        this._used++;
        t.visible = true;
        t.alpha = o.alpha ?? 1;
        t.scale.set(Cx.condense / Cx.optical, 1 / Cx.optical);
        const w = this.width(str, o);

        if (o.rotation !== undefined) {
            t.anchor.set(0.5, 0.5);
            t.rotation = o.rotation;
            t.position.set(x, y);
        } else {
            t.anchor.set(0, 0);
            t.rotation = 0;
            const ax = o.align === 'right' ? w : o.align === 'center' ? w / 2 : 0;

            t.position.set(x - ax, y - this.ascent(o));
        }

        return t;
    }

    /** Inline run of differently styled texts on one baseline. Returns the end x (or start x when right aligned). */
    run(x: number, y: number, parts: RunPart[], align: 'left' | 'right' | 'center' = 'left'): number {
        const total = parts.reduce(
            (sum, [str, size, , weight, gap], i) =>
                sum + this.width(str, { size, weight: weight ?? '600' }) + (i < parts.length - 1 ? (gap ?? 0) : 0),
            0,
        );
        let cx = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
        const start = cx;

        for (const [str, size, color, weight, gap] of parts) {
            this.text(str, cx, y, { size, color, weight: weight ?? '600' });
            cx += this.width(str, { size, weight: weight ?? '600' }) + (gap ?? 0);
        }

        return align === 'right' ? start : cx;
    }
}

/** A widget: its reference box and an immediate-mode draw function. */
export interface SheetWidget {
    id: string;
    name: string;
    /** Position and size in reference-sheet pixels. */
    x: number;
    y: number;
    w: number;
    h: number;
    /** Card corner radius, for sheets that paint cards behind widgets. */
    radius?: number;
    /** Cut off by the sheet edge in the reference: shown in sheet mode only. */
    partial?: boolean;
    draw(c: Cx): void;
}
