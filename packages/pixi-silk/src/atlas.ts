import { BufferImageSource } from 'pixi.js';
import { toHalf } from './color';
import { ATLAS_ROWS, RAMP_WIDTH } from './constants';
import type { Gradient } from './gradient';

interface Row {
    row: number;
    refs: number;
}

/**
 * All gradient ramps live in one RGBA16F texture (one ramp per row), shared by every
 * SilkGraphics. Half floats keep ~11 bits per channel so dark and low-alpha ramps
 * don't get quantised before the shader dithers them to the 8-bit framebuffer.
 */
export class GradientAtlas {
    private static _shared: GradientAtlas | null = null;

    /** The atlas every SilkGraphics uses. */
    static get shared(): GradientAtlas {
        GradientAtlas._shared ??= new GradientAtlas();

        return GradientAtlas._shared;
    }

    /** The half-float texture that holds the ramps. */
    readonly source: BufferImageSource;
    private readonly _data: Uint16Array;
    private readonly _rows = new Map<string, Row>();
    private _nextRow = 0;
    private readonly _scratch = new Float32Array(RAMP_WIDTH * 4);

    constructor() {
        this._data = new Uint16Array(RAMP_WIDTH * ATLAS_ROWS * 4);
        this.source = new BufferImageSource({
            resource: this._data,
            width: RAMP_WIDTH,
            height: ATLAS_ROWS,
            format: 'rgba16float',
            // Ramps are baked premultiplied. The default ('premultiply-alpha-on-upload') would
            // premultiply them again, and WebKit rejects premultiplied uploads of half floats
            // outright (texImage2D INVALID_OPERATION), which left Safari without any SilkGraphics.
            alphaMode: 'premultiplied-alpha',
            scaleMode: 'linear',
            addressMode: 'clamp-to-edge',
            autoGenerateMipmaps: false,
            label: 'silk-gradient-atlas',
        });
    }

    /** Returns the atlas row for a gradient ramp, baking it on first use. */
    acquire(gradient: Gradient): number {
        let entry = this._rows.get(gradient.key);

        if (!entry) {
            entry = { row: this._allocate(), refs: 0 };
            this._rows.set(gradient.key, entry);
            this._write(gradient, entry.row);
        }
        entry.refs++;

        return entry.row;
    }

    /** Drops one reference to a ramp. When the atlas is full, rows nobody uses are reused. */
    release(key: string): void {
        const entry = this._rows.get(key);

        if (entry && entry.refs > 0) entry.refs--;
    }

    private _allocate(): number {
        if (this._nextRow < ATLAS_ROWS) return this._nextRow++;

        // Reuse a ramp nobody references any more.
        for (const [key, entry] of this._rows) {
            if (entry.refs === 0) {
                this._rows.delete(key);

                return entry.row;
            }
        }
        console.warn(`[pixi-silk] more than ${ATLAS_ROWS} gradients in use; reusing row 0`);

        return 0;
    }

    private _write(gradient: Gradient, row: number): void {
        const tmp = this._scratch;

        gradient.bake(tmp);
        const base = row * RAMP_WIDTH * 4;

        for (let i = 0; i < tmp.length; i++) this._data[base + i] = toHalf(tmp[i]);
        this.source.update();
    }
}
