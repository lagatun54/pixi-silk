import { SilkGraphics } from 'pixi-silk';
import { defineDemo } from './runtime';

// Every shape is centred on (0, 0) and moved into its cell with the transform stack.
const SHAPES: { draw: (g: SilkGraphics) => SilkGraphics; color: number; open?: boolean }[] = [
    { draw: (g) => g.rect(-30, -22, 60, 44), color: 0x0a84ff },
    { draw: (g) => g.roundRect(-30, -22, 60, 44, 14, 0.6), color: 0x5e5ce6 },
    { draw: (g) => g.pill(-34, -14, 68, 28), color: 0xbf5af2 },
    { draw: (g) => g.circle(0, 0, 26), color: 0xff375f },
    { draw: (g) => g.ellipse(0, 0, 34, 20), color: 0xff9f0a },
    { draw: (g) => g.arc(0, 0, 26, -2.5, 0.8), color: 0xffd60a, open: true },
    { draw: (g) => g.sector(0, 0, 30, -2.2, 1.6, 14, 4), color: 0x30d158 },
    { draw: (g) => g.heart(0, 2, 56, 0.12), color: 0xff453a },
    { draw: (g) => g.star(0, 0, 5, 30, undefined, 0, 3), color: 0xffd60a },
    { draw: (g) => g.regularPoly(0, 0, 28, 6, 0, 5), color: 0x64d2ff },
    { draw: (g) => g.triangle(-30, 22, 30, 22, 0, -28, 6), color: 0xac8e68 },
    { draw: (g) => g.polyline([-34, 14, -12, -16, 10, 10, 34, -18]), color: 0xffffff, open: true },
];

export default defineDemo({
    size: [520, 250],
    controls: {
        outline: { type: 'toggle', label: 'outline', value: false },
        spin: { type: 'toggle', label: 'rotate', value: false },
    },
    setup({ stage, params, tick }) {
        const g = new SilkGraphics();

        stage.addChild(g);
        tick((t) => {
            g.clear();
            SHAPES.forEach((shape, i) => {
                g.save()
                    .translateTransform(50 + (i % 6) * 84, 65 + Math.floor(i / 6) * 120)
                    .rotateTransform(params.spin ? t * 0.6 : 0);
                const path = shape.draw(g);

                if (shape.open) path.stroke({ width: 5, cap: 'round', color: shape.color });
                else if (params.outline) path.stroke({ width: 2, color: shape.color });
                else path.fill(shape.color);
                g.restore();
            });
        });
    },
});
