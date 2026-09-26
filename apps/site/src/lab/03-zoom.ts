import { Container, Graphics } from 'pixi.js';
import { conic, SilkGraphics } from 'pixi-silk';
import { boot, C } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';

const proto = await boot({
    title: 'Infinite zoom',
    subtitle:
        'Five nested levels, 3000x apart. Curves stay exact at every scale. Lines thinner than a pixel fade out instead of aliasing. Scroll or pinch to zoom, drag to pan.',
    // the page is one interactive surface: drags and pinches belong to the canvas, not to scrolling
    touchAction: 'none',
});

const LEVELS = 5;
const SHRINK = 0.2;
const OFFSET = [0.3, 0.16];
// limit point of the nested centres: the zoom target
const focus = [(OFFSET[0] * 100) / (1 - SHRINK), (OFFSET[1] * 100) / (1 - SHRINK)];

type Draw = SilkGraphics | Graphics;

function drawLevel(g: Draw, cx: number, cy: number, s: number, k: number, silk: boolean): void {
    const hue = [C.cyan, C.pink, C.yellow, C.green, C.purple][k % 5];

    g.circle(cx, cy, 100 * s)
        .fill(0x15151a)
        .stroke({ width: 1.2 * s, color: 0xffffff, alpha: 0.35 });
    for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;

        g.moveTo(cx + Math.cos(a) * 60 * s, cy + Math.sin(a) * 60 * s)
            .lineTo(cx + Math.cos(a) * 96 * s, cy + Math.sin(a) * 96 * s)
            .stroke({ width: 0.35 * s, color: 0xffffff, alpha: 0.5 });
    }
    if (silk) {
        (g as SilkGraphics)
            .arc(cx, cy, 80 * s, -Math.PI / 2, Math.PI * 1.3)
            .stroke({ width: 9 * s, cap: 'round', gradient: conic([hue, 0xffffff]) });
        (g as SilkGraphics).circle(cx, cy, 70 * s).stroke({ width: 2 * s, color: hue, cap: 'round', dash: [0, 6 * s] });
    } else {
        g.beginPath()
            .arc(cx, cy, 80 * s, -Math.PI / 2, Math.PI * 1.3)
            .stroke({ width: 9 * s, cap: 'round', color: hue });
        g.circle(cx, cy, 70 * s).stroke({ width: 2 * s, color: hue });
    }
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;

        g.circle(cx + Math.cos(a) * 44 * s, cy + Math.sin(a) * 44 * s, 5 * s).fill(hue);
    }
    g.roundRect(cx - 22 * s, cy - 22 * s, 44 * s, 44 * s, 10 * s).fill(0x232329);
}

function build(silk: boolean): Container {
    const root = new Container();
    const g: Draw = silk ? new SilkGraphics() : new Graphics();
    let cx = 0;
    let cy = 0;
    let s = 1;

    for (let k = 0; k < LEVELS; k++) {
        drawLevel(g, cx, cy, s, k, silk);
        cx += OFFSET[0] * 100 * s;
        cy += OFFSET[1] * 100 * s;
        s *= SHRINK;
    }
    root.addChild(g);

    return root;
}

const silkScene = build(true);
const pixiScene = build(false);

pixiScene.visible = false;
const world = new Container();

world.addChild(silkScene, pixiScene);
proto.stage.addChild(world);

const hud = document.createElement('div');

hud.className = 'tag';
hud.style.cssText = 'right:16px;top:20px;font-size:13px;color:#f5f5f7';
document.body.appendChild(hud);

let auto = true;
let logZoom = 0;
let manualTimer = 0;
let pan = { x: 0, y: 0 };
let t = 0;

proto.app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;

    t += dt;
    if (!auto) {
        manualTimer += dt;
        if (manualTimer > 6) {
            auto = true;
            pan = { x: 0, y: 0 };
        }
    }
    if (auto) {
        // ping-pong through the levels on a log scale
        const u = 0.5 - 0.5 * Math.cos(t * 0.12);

        logZoom = Math.log(0.9) + u * Math.log(1 / SHRINK) * (LEVELS - 0.6);
    }
    const scale = (Math.exp(logZoom) * Math.min(proto.width, proto.height)) / 260;

    world.scale.set(scale);
    world.position.set(proto.width / 2 - focus[0] * scale + pan.x, proto.height / 2 - focus[1] * scale + pan.y);
    world.rotation = 0;
    hud.textContent = `${Math.exp(logZoom).toFixed(Math.exp(logZoom) < 10 ? 2 : 0)}x`;
});

proto.app.canvas.addEventListener(
    'wheel',
    (e) => {
        e.preventDefault();
        auto = false;
        manualTimer = 0;
        logZoom = Math.max(-3, Math.min(9, logZoom - e.deltaY * 0.0025));
    },
    { passive: false },
);

// one pointer pans, two pointers pinch-zoom
const pointers = new Map<number, { x: number; y: number }>();
let drag: { x: number; y: number } | null = null;
let pinch = 0;

const spread = () => {
    const [a, b] = [...pointers.values()];

    return Math.hypot(a.x - b.x, a.y - b.y);
};

proto.app.canvas.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    auto = false;
    manualTimer = 0;
    if (pointers.size === 1) drag = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    else if (pointers.size === 2) {
        drag = null;
        pinch = spread();
    }
});
window.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    manualTimer = 0;
    if (pointers.size === 2 && pinch > 0) {
        const d = spread();

        logZoom = Math.max(-3, Math.min(9, logZoom + Math.log(d / pinch)));
        pinch = d;
    } else if (drag) pan = { x: e.clientX - drag.x, y: e.clientY - drag.y };
});
const release = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    pinch = 0;
    drag = null;
    const rest = [...pointers.values()][0];

    // keep panning with the finger that stays down
    if (rest) drag = { x: rest.x - pan.x, y: rest.y - pan.y };
};

window.addEventListener('pointerup', release);
window.addEventListener('pointercancel', release);

proto.toggle('Pixi Graphics', false, (on) => {
    pixiScene.visible = on;
    silkScene.visible = !on;
});
proto.button('Auto zoom', () => {
    auto = true;
    pan = { x: 0, y: 0 };
});
attachLoupe([proto.app]);
