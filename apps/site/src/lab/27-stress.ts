import { Container } from 'pixi.js';
import { conic, SilkGraphics } from 'pixi-silk';
import { boot, C, label, MONO } from './_shared/kit';

const proto = await boot({
    title: 'Stress test',
    subtitle:
        'Every primitive is one instance of a quad, so the whole field below is one draw call. "Rebuild" regenerates all instances on the CPU every frame. "Static" builds once and only moves the camera.',
});

const g = new SilkGraphics();
const world = new Container();
const panel = new SilkGraphics().roundRect(0, 0, 250, 112, 16, 0.6).fill({ color: 0x1c1c1e, alpha: 0.92 });
const stats = label('', { fontFamily: MONO, fontSize: 12, fill: C.text, lineHeight: 18 });
const TOP = 118;

world.addChild(g);
proto.stage.addChild(world, panel, stats);
panel.position.set(16, TOP + 12);
stats.position.set(32, TOP + 24);

let count = 5000;
let rebuild = true;
let built = -1;
let t = 0;
let buildMs = 0;
const palette = [C.yellow, C.pink, C.cyan, C.green, C.orange, C.purple, C.blue];
const ring = conic([C.cyan, C.purple, C.pink]);

function build(time: number): void {
    const start = performance.now();
    const W = proto.width;
    const H = proto.height - TOP;
    const cols = Math.ceil(Math.sqrt(count * (W / H)));
    const rows = Math.ceil(count / cols);
    const cw = W / cols;
    const ch = H / rows;
    const s = Math.min(cw, ch);

    g.clear();
    for (let i = 0; i < count; i++) {
        const cx = ((i % cols) + 0.5) * cw;
        const cy = TOP + (Math.floor(i / cols) + 0.5) * ch;
        const k = i % 5;
        const wob = Math.sin(time * 1.3 + i * 0.37);
        const color = palette[i % palette.length];

        if (k === 0) g.circle(cx, cy, s * (0.28 + 0.1 * wob)).fill(color);
        else if (k === 1) g.roundRect(cx - s * 0.32, cy - s * 0.22, s * 0.64, s * 0.44, s * 0.12).fill(color);
        else if (k === 2)
            g.arcSweep(cx, cy, s * 0.3, time + i, Math.PI * (1 + wob * 0.8)).stroke({
                width: s * 0.12,
                cap: 'round',
                gradient: ring,
            });
        else if (k === 3) g.star(cx, cy, 5, s * 0.38, s * 0.16, time * 0.5 + i).fill(color);
        else
            g.line(cx - s * 0.3, cy + s * 0.3 * wob, cx + s * 0.3, cy - s * 0.3 * wob).stroke({
                width: Math.max(0.5, s * 0.08),
                color,
                cap: 'round',
            });
    }
    buildMs = performance.now() - start;
    built = count;
}

let frames = 0;
let acc = 0;
let fps = 0;

proto.app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;

    t += dt;
    frames++;
    acc += dt;
    if (acc > 0.5) {
        fps = frames / acc;
        frames = 0;
        acc = 0;
    }
    if (rebuild || built !== count) build(t);
    if (!rebuild) {
        world.pivot.set(proto.width / 2, proto.height / 2);
        world.position.set(proto.width / 2, proto.height / 2);
        world.rotation = Math.sin(t * 0.2) * 0.1;
        world.scale.set(1 + 0.08 * Math.sin(t * 0.5));
    } else {
        world.rotation = 0;
        world.scale.set(1);
        world.pivot.set(0, 0);
        world.position.set(0, 0);
    }
    stats.text = [
        `primitives   ${g.primitiveCount.toLocaleString()}`,
        'draw calls   1',
        `instance buf ${((g.primitiveCount * 160) / 1024 / 1024).toFixed(1)} MB`,
        `cpu build    ${rebuild ? `${buildMs.toFixed(1)} ms / frame` : 'once'}`,
        `fps          ${fps.toFixed(0)}`,
    ].join('\n');
});

proto.slider('count', 500, 100000, count, 500, (v) => {
    count = v;
});
proto.toggle('Rebuild every frame', true, (on) => {
    rebuild = on;
    built = -1;
});
