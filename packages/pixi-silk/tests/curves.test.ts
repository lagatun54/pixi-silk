import { describe, expect, it } from 'vitest';
import { catmullRom, monotoneX, toFlat } from '../src/curves';

const at = (flat: number[], x: number) => {
    for (let i = 0; i < flat.length; i += 2) if (Math.abs(flat[i] - x) < 1e-9) return flat[i + 1];

    return undefined;
};

describe('toFlat', () => {
    it('accepts point objects and typed arrays', () => {
        expect(
            toFlat([
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ]),
        ).toEqual([1, 2, 3, 4]);
        expect(toFlat(new Float32Array([5, 6]))).toEqual([5, 6]);
        expect(toFlat([])).toEqual([]);
    });
});

describe('monotoneX', () => {
    const data = [0, 10, 10, 50, 20, 50, 30, 0, 40, 20];

    it('passes through every data point', () => {
        const out = monotoneX(data, 1);

        for (let i = 0; i < data.length; i += 2) expect(at(out, data[i])).toBeCloseTo(data[i + 1], 9);
    });

    it('never overshoots and keeps flat runs flat', () => {
        const out = monotoneX(data, 0.5);

        for (let i = 0; i < out.length; i += 2) {
            expect(out[i + 1]).toBeLessThanOrEqual(50 + 1e-9);
            expect(out[i + 1]).toBeGreaterThanOrEqual(0 - 1e-9);
            if (out[i] > 10 && out[i] < 20) expect(out[i + 1]).toBeCloseTo(50, 9);
        }
    });

    it('leaves two points alone', () => {
        expect(monotoneX([0, 0, 1, 1])).toEqual([0, 0, 1, 1]);
    });
});

describe('catmullRom', () => {
    it('interpolates its control points', () => {
        const pts = [0, 0, 10, 20, 30, 5, 40, 40];
        const out = catmullRom(pts, false, 0.5);

        for (let i = 0; i < pts.length; i += 2) {
            const hit = out.some((_, j) => j % 2 === 0 && Math.hypot(out[j] - pts[i], out[j + 1] - pts[i + 1]) < 1e-6);

            expect(hit).toBe(true);
        }
    });
});
