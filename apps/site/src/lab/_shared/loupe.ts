import { type Application, UPDATE_PRIORITY } from 'pixi.js';

export interface LoupeOptions {
    /** Loupe size in CSS px. Default 240. */
    size?: number;
    /** Device pixels are magnified this many times. Default 8. */
    zoom?: number;
    /** Pin the loupe at a CSS position instead of following the pointer. */
    at?: { x: number; y: number };
    /** Where the loupe box is drawn when pinned (CSS px). Default: next to `at`. */
    boxAt?: { x: number; y: number };
    /** Start visible. Default false (press L). */
    enabled?: boolean;
}

/**
 * Magnifies the real device pixels of one or more canvases (nearest-neighbour) so edge
 * quality can be judged by eye. `L` toggles it; it follows the pointer.
 * `?loupe=x,y,zoom` in the URL pins it for screenshots.
 */
export function attachLoupe(
    apps: Application[],
    options: LoupeOptions = {},
): { setZoom(z: number): void; destroy(): void } {
    const size = options.size ?? 240;
    let zoom = options.zoom ?? 8;
    const params = new URLSearchParams(location.search).get('loupe');
    let pinned = options.at ?? null;

    if (params) {
        const [x, y, z] = params.split(',').map(Number);

        pinned = { x, y };
        if (z) zoom = z;
    }
    const box = document.createElement('canvas');

    box.style.cssText =
        `position:fixed;width:${size}px;height:${size}px;border-radius:14px;` +
        'box-shadow:0 0 0 1px rgba(255,255,255,.25),0 12px 40px rgba(0,0,0,.6);pointer-events:none;z-index:5;' +
        'image-rendering:pixelated;background:#000;display:none';
    document.body.appendChild(box);
    const ctx = box.getContext('2d')!;
    let pointer: { x: number; y: number } | null = pinned;
    // a hover loupe means nothing on touch screens (and would pop up while scrolling)
    const touchOnly = window.matchMedia('(hover: none)').matches;
    let enabled = pinned ? true : touchOnly ? false : (options.enabled ?? false);
    const hint = document.createElement('div');

    hint.className = 'tag';
    hint.style.cssText = 'left:16px;bottom:34px;text-transform:none;letter-spacing:0;font-weight:500';
    const setHint = () => {
        hint.textContent = enabled ? 'L: hide loupe' : 'L: pixel loupe';
    };

    setHint();
    if (!touchOnly) document.body.appendChild(hint);

    const onMove = (e: PointerEvent) => {
        if (!pinned) pointer = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
        if (!pinned) pointer = null;
    };
    const onKey = (e: KeyboardEvent) => {
        if (e.key === 'l' || e.key === 'L') {
            enabled = !enabled;
            setHint();
        }
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('keydown', onKey);

    const draw = (owner: Application) => {
        if (!enabled || !pointer) {
            box.style.display = 'none';

            return;
        }
        const dpr = window.devicePixelRatio || 1;
        const px = Math.round(size * dpr);

        if (box.width !== px) {
            box.width = px;
            box.height = px;
        }
        // find the canvas under the point
        const app = apps.find((a) => {
            const r = a.canvas.getBoundingClientRect();

            return pointer!.x >= r.left && pointer!.x <= r.right && pointer!.y >= r.top && pointer!.y <= r.bottom;
        });

        if (!app) {
            box.style.display = 'none';

            return;
        }
        // only read a canvas from its own ticker, right after it rendered
        if (app !== owner) return;
        const canvas = app.canvas;
        const rect = canvas.getBoundingClientRect();
        const sx = ((pointer.x - rect.left) / rect.width) * canvas.width;
        const sy = ((pointer.y - rect.top) / rect.height) * canvas.height;
        const src = px / zoom;

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, px, px);
        ctx.drawImage(canvas, Math.round(sx - src / 2), Math.round(sy - src / 2), src, src, 0, 0, px, px);
        // pixel grid when strongly magnified
        if (zoom >= 12) {
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i <= src; i++) {
                const p = Math.round(i * zoom) + 0.5;

                ctx.moveTo(p, 0);
                ctx.lineTo(p, px);
                ctx.moveTo(0, p);
                ctx.lineTo(px, p);
            }
            ctx.stroke();
        }
        box.style.display = 'block';
        const bx = options.boxAt?.x ?? Math.min(window.innerWidth - size - 12, pointer.x + 24);
        const by = options.boxAt?.y ?? Math.min(window.innerHeight - size - 12, Math.max(12, pointer.y - size / 2));

        box.style.left = `${bx}px`;
        box.style.top = `${by}px`;
    };

    // runs after the app's render (LOW) within the same frame, while the drawing buffer is valid
    const callbacks = apps.map((app) => {
        const cb = () => draw(app);

        app.ticker.add(cb, undefined, UPDATE_PRIORITY.UTILITY);

        return cb;
    });

    return {
        setZoom(z: number) {
            zoom = z;
        },
        destroy() {
            apps.forEach((app, i) => app.ticker.remove(callbacks[i]));
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('keydown', onKey);
            box.remove();
            hint.remove();
        },
    };
}
