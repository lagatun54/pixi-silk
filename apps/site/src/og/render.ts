import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { OG } from './theme';

export interface OgTarget {
    id: string;
    eyebrow: string;
    title: string;
    subtitle?: string;
}

type Node = { type: string; props: Record<string, unknown> };

function h(
    type: string,
    style: Record<string, unknown>,
    children?: unknown,
    attrs: Record<string, unknown> = {},
): Node {
    return { type, props: { style, ...attrs, ...(children === undefined ? {} : { children }) } };
}

// the favicon doubles as the brand mark
const logo = `data:image/svg+xml;base64,${fs.readFileSync(path.resolve(process.cwd(), 'public/favicon.svg')).toString('base64')}`;

// fonts are read from the source tree: at build time this module is bundled elsewhere
const fontFile = (name: string) => fs.readFileSync(path.resolve(process.cwd(), 'src/og/fonts', name));
let fonts: { name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' }[] | null = null;

function loadFonts() {
    return [
        { name: 'Inter', data: fontFile('Inter-400.woff'), weight: 400 as const, style: 'normal' as const },
        { name: 'Inter', data: fontFile('Inter-600.woff'), weight: 600 as const, style: 'normal' as const },
        { name: 'Inter', data: fontFile('Inter-700.woff'), weight: 700 as const, style: 'normal' as const },
        {
            name: 'JetBrains Mono',
            data: fontFile('JetBrainsMono-400.woff'),
            weight: 400 as const,
            style: 'normal' as const,
        },
    ];
}

const clamp = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 3).replace(/\s+\S*$/, '')}...` : s);
const titleSize = (t: string) => (t.length <= 22 ? 78 : t.length <= 36 ? 64 : t.length <= 54 ? 54 : 46);

function card(t: OgTarget, host: string): Node {
    // the silk ribbon: stacked translucent stripes in the brand gradient
    const ribbon = h(
        'div',
        {
            position: 'absolute',
            right: -80,
            top: 60,
            display: 'flex',
            flexDirection: 'column',
            transform: 'rotate(-14deg)',
        },
        ['#ff9f0a', '#ff375f', '#bf5af2', '#64d2ff'].map((c, i) =>
            h('div', {
                width: 560,
                height: 46,
                marginTop: i ? 14 : 0,
                borderRadius: 23,
                backgroundImage: `linear-gradient(90deg, ${c}00, ${c}cc 45%, ${c}22)`,
            }),
        ),
    );

    return h(
        'div',
        {
            position: 'relative',
            display: 'flex',
            width: OG.width,
            height: OG.height,
            background: OG.bg,
            color: OG.fg,
            fontFamily: 'Inter',
            padding: 72,
            overflow: 'hidden',
        },
        [
            ribbon,
            h(
                'div',
                {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                },
                [
                    h('div', { display: 'flex', alignItems: 'center' }, [
                        h(
                            'img',
                            { width: 56, height: 56, borderRadius: 16, border: `1px solid ${OG.border}` },
                            undefined,
                            { src: logo, width: 56, height: 56 },
                        ),
                        h('div', { marginLeft: 18, fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }, 'pixi-silk'),
                    ]),
                    h('div', { display: 'flex', flexDirection: 'column', maxWidth: 820 }, [
                        h(
                            'div',
                            {
                                fontFamily: 'JetBrains Mono',
                                fontSize: 20,
                                letterSpacing: 3,
                                textTransform: 'uppercase',
                                color: OG.muted,
                                marginBottom: 20,
                            },
                            t.eyebrow,
                        ),
                        h(
                            'div',
                            { fontSize: titleSize(t.title), fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 },
                            clamp(t.title, 84),
                        ),
                        ...(t.subtitle
                            ? [
                                  h(
                                      'div',
                                      { marginTop: 22, fontSize: 26, lineHeight: 1.4, color: OG.muted },
                                      clamp(t.subtitle, 170),
                                  ),
                              ]
                            : []),
                    ]),
                    h(
                        'div',
                        {
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontFamily: 'JetBrains Mono',
                            fontSize: 20,
                            color: OG.faint,
                        },
                        [h('div', {}, host), h('div', {}, 'Smooth vector graphics for PixiJS v8')],
                    ),
                ],
            ),
        ],
    );
}

export async function renderOg(target: OgTarget, host: string): Promise<Uint8Array> {
    fonts ??= loadFonts();
    const svg = await satori(card(target, host) as never, { width: OG.width, height: OG.height, fonts });

    return new Resvg(svg, { fitTo: { mode: 'width', value: OG.width }, font: { loadSystemFonts: false } })
        .render()
        .asPng();
}
