/*
 * Every lab page (full-screen prototypes, widget showcases and the 1:1 reference sheets),
 * grouped for the /lab/ index. Slugs match the module names in this folder.
 */

/** @type {[title: string, items: [slug: string, name: string, description: string][]][]} */
export const LAB_SECTIONS = [
    [
        'Foundations',
        [
            [
                '01-primitives',
                'Primitives',
                'All 24 shape kinds side by side: rects, squircles, circles, arcs, sectors, lines, areas, dashes, icons, blur.',
            ],
            [
                '02-versus',
                'v8 Graphics vs Silk',
                'The same scene with Graphics (no AA), Graphics + MSAA 4x and Silk. Hover to magnify device pixels.',
            ],
            [
                '03-zoom',
                'Infinite zoom',
                'Five nested levels, 3000x apart. Curves stay exact, hairlines fade instead of aliasing.',
            ],
            [
                '04-subpixel',
                'Sub-pixel motion',
                'Objects drifting at 2 px/s: tessellation crawls between samples, distance fields glide.',
            ],
            [
                '05-resolution',
                'Resolution & device pixels',
                'Siemens star, 1-device-pixel grating, live 1x / 1.5x / 2x / 3x switching and 1:1 mapping check.',
            ],
            [
                '06-render-texture',
                'Filters & render textures',
                'Why Graphics goes jaggy and blurry behind a filter, and why Silk does not.',
            ],
        ],
    ],
    [
        'Primitives',
        [
            [
                '07-rounded-rects',
                'Rounded rects & squircles',
                'Per-corner radii and continuous-curvature corners with a live smoothing slider.',
            ],
            [
                '08-activity-rings',
                'Activity rings',
                'Conic gradients that follow each arc, >100% overlap with a soft tip shadow, springs.',
            ],
            [
                '09-lines',
                'Lines',
                'Widths from 0.1 to 8 px, translucent joints without double blending, caps, gradients along strokes.',
            ],
            [
                '10-dashes',
                'Dashes & dots',
                'Dash patterns drawn in the shader: caps, closed outlines without a seam, marching ants, spinners.',
            ],
            [
                '11-icons',
                'Icons',
                'Sixteen glyphs built from primitives, crisp at 16, 28 and 56 px. Uses save / translateTransform.',
            ],
        ],
    ],
    [
        'Paint',
        [
            [
                '12-gradients',
                'Gradients',
                'Linear, radial, conic and along-the-path gradients, extend modes, sRGB vs linear vs OKLab, premultiplied alpha.',
            ],
            [
                '13-banding',
                'Banding',
                'Half-float ramps with ±0.5 LSB dither. Toggle dither and "reveal x8" to watch the contour lines disappear.',
            ],
            [
                '14-glow',
                'Glows & soft shadows',
                'Analytic gaussian blur on the distance field: neon glows, elevation shadows, bokeh. No extra passes.',
            ],
        ],
    ],
    [
        'Widgets from the references',
        [
            [
                '15-area-chart',
                'Area chart',
                'Smoothed series, gradient fill, dotted guides, dashed forecast, NOW marker, eased updates.',
            ],
            ['16-bar-charts', 'Bar charts', 'Slim bars with a past/future split and chunky stepped bars that grow in.'],
            [
                '17-pills-waves',
                'Pills & waveforms',
                'Heart-rate pills and a live pressure waveform sharing one gradient.',
            ],
            [
                '18-ranges',
                'Ranges & levels',
                'Progress bars with markers, range segments and signal bars, all anti-aliased at any size and pixel ratio.',
            ],
            [
                '19-health-cards',
                'Health cards',
                'Ten Apple Health style cards with area, bar, candle and range charts, drawn as smooth distance fields.',
            ],
            ['20-gauges', 'Gauges', 'ISS flyover, car battery, heading dial with ticks, barometer, UV week, dimmer.'],
            [
                '21-sparklines',
                'Sparklines',
                'Value-coloured strokes, gradient markers, threshold stops, interactive crosshair.',
            ],
            ['22-sleep', 'Sleep', 'Stage blocks with transitions, night strip, marching dotted arc.'],
            ['23-timers', 'Timers', 'Espresso ticks with analytic motion blur, run cadence bars and controls.'],
            ['24-journeys', 'Journeys', 'Flight progress, train stations, delivery route, ride pickup, race track.'],
            ['25-sky', 'Sky', 'Sunset pills with a glowing sun and stars, golden-hour curve, daylight bar.'],
        ],
    ],
    [
        'Reference sheets, rebuilt 1:1',
        [
            [
                '30-sheet-health',
                'Health cards (sheet 1)',
                'Ten Health cards over the first reference: area, bar, candle and range charts. Compare slider included.',
            ],
            [
                '31-sheet-complications',
                'Complications (sheet 2)',
                'Twenty watch complications from the second reference, laid out in its exact pixels.',
            ],
            [
                '32-sheet-fitness',
                'Fitness & home (sheet 3)',
                'Twenty more: calendar week, hike map, sound levels, elevation, water, wind, boarding pass.',
            ],
            [
                '33-sheet-live-activities',
                'Live Activities (sheet 4)',
                'Black cards with continuous corners and measured soft shadows on the light sheet, edges cropped like the reference.',
            ],
            [
                '34-sheet-watch',
                'Watch widgets (sheet 5)',
                'Cycling, 2FA, now playing, crosshair, garage, AirPods compass, barometer, moon phases.',
            ],
            [
                '35-widget-viewer',
                'Widget viewer',
                'Pick any of the 81 widgets and see it large next to its crop of the reference, or overlaid on it.',
            ],
        ],
    ],
    [
        'All together',
        [
            [
                '26-dashboard',
                'Dashboard',
                'Thirty live widgets in a masonry layout with smooth, frame-rate independent scrolling.',
            ],
            ['27-stress', 'Stress test', 'Up to 100k primitives in one draw call, rebuilt every frame or static.'],
        ],
    ],
];
