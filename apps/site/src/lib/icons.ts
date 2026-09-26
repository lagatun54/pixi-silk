import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

/** Renders public/favicon.svg to a square PNG (used by the icon and manifest endpoints). */
export function iconPng(size: number, padding = 0): Uint8Array {
    let svg = fs.readFileSync(path.resolve(process.cwd(), 'public/favicon.svg'), 'utf8');

    if (padding > 0) {
        // maskable icons need a safe zone: shrink the artwork onto a full-bleed background
        const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
        const s = 64 * (1 - 2 * padding);
        const o = 64 * padding;

        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b0b0d"/><g transform="translate(${o} ${o}) scale(${s / 64})">${inner}</g></svg>`;
    }

    return new Resvg(svg, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: false } }).render().asPng();
}

/** A .ico file holding PNG images (supported by every browser since IE Vista-era). */
export function icoFromPngs(pngs: { size: number; data: Uint8Array }[]): Uint8Array {
    const header = 6 + 16 * pngs.length;
    const total = header + pngs.reduce((n, p) => n + p.data.length, 0);
    const out = new Uint8Array(total);
    const view = new DataView(out.buffer);
    let offset = header;

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, pngs.length, true);
    pngs.forEach((p, i) => {
        const e = 6 + i * 16;

        out[e] = p.size >= 256 ? 0 : p.size;
        out[e + 1] = p.size >= 256 ? 0 : p.size;
        view.setUint16(e + 4, 1, true);
        view.setUint16(e + 6, 32, true);
        view.setUint32(e + 8, p.data.length, true);
        view.setUint32(e + 12, offset, true);
        out.set(p.data, offset);
        offset += p.data.length;
    });

    return out;
}
