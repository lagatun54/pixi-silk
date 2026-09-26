import { SilkGraphics } from 'pixi-silk';
import { boot, C, label, MONO } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Resolution & device pixels',
    subtitle:
        'The backing store is sized from devicePixelContentBoxSize, so one canvas pixel is exactly one device pixel even at fractional DPRs. The AA ramp is always one device pixel wide. Switch resolutions to compare.',
});

const star = new SilkGraphics();
const grating = new SilkGraphics();
const info = label('', { fontFamily: MONO, fontSize: 12, fill: C.text, lineHeight: 19 });
const caption1 = label('SIEMENS STAR, 48 WEDGES', {
    fontSize: 11,
    fill: C.muted,
    fontWeight: '600',
    letterSpacing: 0.6,
});
const caption2 = label('1 DEVICE PX LINES, HAIRLINE FAN', {
    fontSize: 11,
    fill: C.muted,
    fontWeight: '600',
    letterSpacing: 0.6,
});

proto.stage.addChild(star, grating, info, caption1, caption2);

/** Classic resolution target: wedges converge until they are finer than a pixel. */
function drawStar(radius: number): void {
    const n = 48;

    star.clear();
    star.circle(0, 0, radius + 4).fill(0x000000);
    for (let i = 0; i < n; i += 2) {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;

        star.sector(0, 0, radius, a0, a1).fill(0xf5f5f7);
    }
    star.circle(0, 0, radius + 0.5).stroke({ width: 1, color: 0xffffff, alpha: 0.3 });
}

/** Lines exactly one device pixel wide on the device-pixel grid, plus a fan of hairlines. */
function drawGrating(w: number, h: number, res: number): void {
    const px = 1 / res;

    grating.clear();
    grating.rect(0, 0, w, h).fill(0x000000);
    const half = Math.floor(w / 2);

    for (let x = 0; x < half; x += px * 2) grating.rect(x, 0, px, h).fill(0xffffff);
    // fan: 1 device px lines at every angle from the bottom-left corner of the right half
    for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * (Math.PI / 2);
        const c = Math.cos(a);
        const s = Math.sin(a);
        const t = Math.min(c > 1e-6 ? (w - half) / c : Infinity, s > 1e-6 ? h / s : Infinity);

        grating.line(half, h, half + c * t, h - s * t).stroke({ width: px, color: C.yellow });
    }
}

function refresh(): void {
    const res = proto.silk.resolution;
    const canvas = proto.app.canvas;
    const rect = canvas.getBoundingClientRect();
    const expected = rect.width * window.devicePixelRatio * (res / (window.devicePixelRatio || 1));
    const exact = Math.abs(expected - canvas.width) < 0.75 && Math.abs(res - window.devicePixelRatio) < 1e-6;

    info.text = [
        `devicePixelRatio      ${window.devicePixelRatio}`,
        `renderer.resolution   ${res}`,
        `canvas backing store  ${canvas.width} x ${canvas.height}`,
        `CSS box               ${rect.width.toFixed(2)} x ${rect.height.toFixed(2)}`,
        `1:1 device mapping    ${exact ? 'yes' : 'no - the browser resamples the canvas'}`,
        `AA ramp               1 canvas px = ${(1 / res).toFixed(3)} CSS px`,
    ].join('\n');
}

proto.onResize((w, h) => {
    const res = proto.silk.resolution;
    const wide = w > 700;
    const size = wide ? Math.max(140, Math.min((w - 80) / 2, h - 170)) : Math.min(w - 40, (h - 200) / 2);
    const top = 112;

    drawStar(size / 2);
    if (wide) {
        star.position.set(Math.round(w / 2 - 20 - size / 2), top + 24 + size / 2);
        grating.position.set(Math.round(w / 2 + 20), top + 24);
    } else {
        star.position.set(Math.round(w / 2), top + 24 + size / 2);
        grating.position.set(Math.round((w - size) / 2), top + size + 64);
    }
    caption1.position.set(star.x - size / 2, star.y - size / 2 - 22);
    caption2.position.set(grating.x, grating.y - 22);
    const gw = Math.floor(size);
    const gh = Math.floor(size * (wide ? 0.55 : 0.4));

    drawGrating(gw, gh, res);
    info.position.set(grating.x, grating.y + gh + 18);
    refresh();
});

for (const r of [1, 1.5, 2, 3]) proto.button(`${r}x`, () => proto.silk.setResolution(r));
proto.button('auto', () => proto.silk.setResolution(null));
attachLoupe([proto.app], { zoom: 10, enabled: true });
