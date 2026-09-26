import { ColorMatrixFilter, Container } from 'pixi.js';
import { horizontal, linear, radial, SilkGraphics } from 'pixi-silk';
import { boot, C, label } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Banding',
    subtitle:
        'Dark, wide gradients only have a handful of 8-bit steps. Silk bakes ramps in half floats and adds ±½ LSB dither, which turns contour lines into invisible noise. "Reveal" multiplies the output by 8 so the steps become obvious.',
});

const world = new Container();
const bg = new SilkGraphics();
const panels = new SilkGraphics();
const captions = new Container();

world.addChild(bg, panels, captions);
proto.stage.addChild(world);

function caption(text: string, x: number, y: number): void {
    const t = label(text.toUpperCase(), { fontSize: 10, fill: C.muted, fontWeight: '600', letterSpacing: 0.6 });

    t.position.set(x, y);
    captions.addChild(t);
}

function draw(w: number, h: number): void {
    bg.clear();
    bg.rect(0, 0, w, h).fill(
        radial(
            [
                [0, 0x1d1b2c],
                [0.55, 0x0e0d16],
                [1, 0x000000],
            ],
            { center: [0.5, 0.25], radius: 0.8 },
        ),
    );

    panels.clear();
    captions.removeChildren().forEach((c) => c.destroy());
    const pw = Math.min(520, w - 48);
    const x = (w - pw) / 2;
    let y = 150;

    panels.roundRect(x, y, pw, 90, 18, 0.6).fill(horizontal([0x000000, 0x16161a]));
    caption('#000 to #16161a, 22 levels over the width', x, y - 18);
    y += 130;
    panels.roundRect(x, y, pw, 90, 18, 0.6).fill(linear([0x2a1a08, 0x000000], { from: [0, 0], to: [0, 1] }));
    caption('warm vignette, vertical', x, y - 18);
    y += 130;
    // Mach bands: linear vs smooth easing between three stops
    const half = (pw - 12) / 2;

    panels.roundRect(x, y, half, 90, 18, 0.6).fill(horizontal([0x0a84ff, 0xffffff, 0x0a84ff]));
    panels
        .roundRect(x + half + 12, y, half, 90, 18, 0.6)
        .fill(horizontal([0x0a84ff, 0xffffff, 0x0a84ff], { easing: 'smooth' }));
    caption('linear stops (mach bands)', x, y - 18);
    caption('smooth stops', x + half + 12, y - 18);
}

proto.onResize(draw);

const reveal = new ColorMatrixFilter();

reveal.matrix = [8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 1, 0];
proto.toggle('Dither', true, (on) => {
    bg.dither = on ? 1 : 0;
    panels.dither = on ? 1 : 0;
});
proto.toggle('Reveal x8', false, (on) => {
    world.filters = on ? [reveal] : [];
});
attachLoupe([proto.app], { zoom: 6 });
