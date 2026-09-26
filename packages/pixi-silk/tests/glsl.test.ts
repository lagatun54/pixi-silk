import { describe, expect, it } from 'vitest';
import { minifyGlsl } from '../build/glsl';
import { fragment, vertex } from '../src/shader';

/** Whitespace-separated words once comments are gone: identical lists mean identical programs. */
const words = (glsl: string) =>
    glsl
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/[^\n]*/g, '')
        .split(/\s+/)
        .filter(Boolean);
const directives = (glsl: string) =>
    glsl
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('#'));

describe('GLSL minification (build/glsl.ts)', () => {
    for (const [name, source] of [
        ['vertex', vertex],
        ['fragment', fragment],
    ] as const) {
        it(`keeps every token of the ${name} shader`, () => {
            const min = minifyGlsl(source);

            expect(words(min)).toEqual(words(source));
            expect(min.length).toBeLessThan(source.length * 0.8);
        });

        it(`keeps the ${name} shader's preprocessor lines and #version first`, () => {
            const min = minifyGlsl(source);

            expect(min.startsWith('#version 300 es\n')).toBe(true);
            expect(directives(min)).toEqual(
                directives(source).map((line) => line.replace(/\s+/g, ' ').replace(/\s*\/\/.*$/, '')),
            );
        });
    }

    it('never glues tokens together across a removed comment', () => {
        expect(minifyGlsl('float a/* x */=/* y */b;')).toBe('float a = b;');
        expect(minifyGlsl('a = 1; // tail\n   b = 2;')).toBe('a = 1;\nb = 2;');
    });
});
