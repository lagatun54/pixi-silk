import { Container } from 'pixi.js';
import { along, SilkGraphics } from 'pixi-silk';
import { boot, C, fitOrScroll, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Lines',
    subtitle:
        'Widths from 0.1 to 8 px at every angle. Each pixel of a polyline is shaded exactly once by its nearest segment, so translucent strokes have clean joints. Hairlines below one device pixel fade instead of breaking up.',
});

const board = new Container();
const g = new SilkGraphics();
const captions = new Container();

board.addChild(g, captions);
proto.stage.addChild(board);

function caption(text: string, x: number, y: number): void {
    const t = label(text.toUpperCase(), { fontSize: 10, fill: C.muted, fontWeight: '600', letterSpacing: 0.6 });

    t.position.set(x, y);
    captions.addChild(t);
}

caption('starburst, 0.1 to 6 px', 0, 0);
caption('one path (silk) vs separate segments', 300, 0);
caption('caps', 300, 176);
caption('gradient along the path', 0, 330);
caption('hairlines 0.05 to 1 px', 300, 330);

const zig = [0, 60, 30, 10, 60, 64, 90, 6, 120, 60, 150, 16, 180, 52, 210, 8, 240, 44];

let t = 0;

function draw(): void {
    g.clear();
    // starburst
    const cx = 130;
    const cy = 160;

    for (let i = 0; i < 90; i++) {
        const a = (i / 90) * Math.PI * 2 + t * 0.05;
        const w = 0.1 + ((i % 15) / 14) * 5.9;

        g.moveTo(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24)
            .lineTo(cx + Math.cos(a) * 128, cy + Math.sin(a) * 128)
            .stroke({ width: w, color: 0xffffff, alpha: 0.9, cap: 'round' });
    }

    // translucent zigzag: single path vs one path per segment
    g.polyline(zig.map((v, i) => v + (i % 2 ? 24 : 300))).stroke({
        width: 12,
        color: C.pink,
        alpha: 0.55,
        cap: 'round',
    });
    for (let i = 0; i < zig.length - 2; i += 2) {
        g.line(zig[i] + 300, zig[i + 1] + 100, zig[i + 2] + 300, zig[i + 3] + 100).stroke({
            width: 12,
            color: C.cyan,
            alpha: 0.55,
            cap: 'round',
        });
    }

    // caps with endpoint markers
    (['butt', 'round', 'square'] as const).forEach((cap, i) => {
        const y = 206 + i * 34;

        g.line(330, y, 510, y).stroke({ width: 16, color: C.yellow, cap });
        g.line(330, y - 14, 330, y + 14).stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
        g.line(510, y - 14, 510, y + 14).stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
    });

    // sine with a rainbow gradient that follows the stroke
    const pts: number[] = [];

    for (let x = 0; x <= 260; x += 2) pts.push(x + 10, 400 + Math.sin(x * 0.045 + t * 2) * 30 * Math.sin(x * 0.012));
    g.polyline(pts).stroke({
        width: 7,
        cap: 'round',
        gradient: along([0xff453a, 0xff9f0a, 0xffd60a, 0x30d158, 0x64d2ff, 0x5e5ce6, 0xbf5af2], { easing: 'smooth' }),
    });

    // hairline ladder
    for (let i = 0; i < 20; i++) {
        const w = 0.05 + i * 0.05;
        const y = 356 + i * 5.5;

        g.line(300, y, 540, y + 3).stroke({ width: w, color: 0xffffff });
    }
}

proto.onResize(() => {
    const { scale, x, y } = fitOrScroll(proto, 550, 470, { top: 108, maxScale: 1.8 });

    board.scale.set(scale);
    board.position.set(x, y);
});

proto.app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;
    draw();
});
attachLoupe([proto.app]);
