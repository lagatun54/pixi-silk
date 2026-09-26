import { describe, expect, it } from 'vitest';
import {
    fromSpace,
    linearToOklab,
    linearToSrgb,
    oklabToLinear,
    parseColor,
    srgbToLinear,
    toHalf,
    toSpace,
} from '../src/color';

describe('parseColor', () => {
    it('reads hex numbers, css strings and alpha', () => {
        expect(parseColor(0xff0000)).toEqual([1, 0, 0, 1]);
        expect(parseColor('#00ff00', 0.5)).toEqual([0, 1, 0, 0.5]);
        const [r, g, b, a] = parseColor('rgba(0, 0, 255, 0.25)');

        expect([r, g, b]).toEqual([0, 0, 1]);
        expect(a).toBeCloseTo(0.25);
    });

    it('returns a fresh array so callers can mutate it', () => {
        const a = parseColor(0x123456);

        a[0] = 99;
        expect(parseColor(0x123456)[0]).not.toBe(99);
    });
});

describe('colour spaces', () => {
    it('round-trips sRGB through linear light', () => {
        for (const c of [0, 0.002, 0.04, 0.2, 0.5, 0.9, 1]) expect(linearToSrgb(srgbToLinear(c))).toBeCloseTo(c, 6);
    });

    it('round-trips linear light through OKLab', () => {
        const samples: [number, number, number][] = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
            [0.2, 0.5, 0.8],
            [1, 1, 1],
        ];

        for (const rgb of samples) {
            const back = oklabToLinear(...linearToOklab(...rgb));

            back.forEach((v, i) => expect(v).toBeCloseTo(rgb[i], 5));
        }
    });

    it('puts white at L = 1 and greys on the neutral axis', () => {
        const [L, a, b] = linearToOklab(1, 1, 1);

        expect(L).toBeCloseTo(1, 4);
        expect(a).toBeCloseTo(0, 4);
        expect(b).toBeCloseTo(0, 4);
    });

    it('converts to and from every working space', () => {
        for (const space of ['srgb', 'linear', 'oklab'] as const) {
            const back = fromSpace(toSpace([0.3, 0.6, 0.9, 1], space), space);

            back.forEach((v, i) => expect(v).toBeCloseTo([0.3, 0.6, 0.9][i], 5));
        }
    });
});

describe('toHalf', () => {
    it('encodes IEEE 754 half floats', () => {
        expect(toHalf(0)).toBe(0);
        expect(toHalf(1)).toBe(0x3c00);
        expect(toHalf(0.5)).toBe(0x3800);
        expect(toHalf(-2)).toBe(0xc000);
        expect(toHalf(65504)).toBe(0x7bff);
        expect(toHalf(1e6)).toBe(0x7c00);
    });

    it('keeps subnormals instead of flushing them to zero', () => {
        expect(toHalf(2 ** -20)).toBeGreaterThan(0);
    });
});
