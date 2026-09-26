/**
 * Frame-rate independent motion helpers. Values glide the same at 60, 120 or 144 Hz,
 * and never overshoot unless you ask a spring to.
 */

/** Exponential approach: moves `current` towards `target`. `lambda` is about 1/seconds, higher is snappier. */
export function damp(current: number, target: number, lambda: number, dtSeconds: number): number {
    return target + (current - target) * Math.exp(-lambda * dtSeconds);
}

/** Damped angle approach along the shortest path. */
export function dampAngle(current: number, target: number, lambda: number, dtSeconds: number): number {
    let delta = (target - current) % (Math.PI * 2);

    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    return damp(current, current + delta, lambda, dtSeconds);
}

/**
 * Damped harmonic spring (semi-implicit Euler with fixed sub-steps).
 * `stiffness` / `damping` follow the usual UI spring convention (e.g. 170 / 26).
 */
export class Spring {
    /** Current value. */
    value: number;
    /** Value the spring moves towards. */
    target: number;
    /** Current speed, in units per second. */
    velocity = 0;
    /** Pull towards the target. Higher is faster. */
    stiffness: number;
    /** Friction. Lower bounces more. */
    damping: number;

    constructor(value = 0, stiffness = 170, damping = 26) {
        this.value = value;
        this.target = value;
        this.stiffness = stiffness;
        this.damping = damping;
    }

    /** Advances the spring and returns the new value. */
    step(dtSeconds: number): number {
        const h = 1 / 240;
        let t = Math.min(dtSeconds, 0.1);

        while (t > 0) {
            const dt = Math.min(h, t);
            const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;

            this.velocity += force * dt;
            this.value += this.velocity * dt;
            t -= dt;
        }

        return this.value;
    }

    /** True once the spring is at rest on its target. */
    get settled(): boolean {
        return Math.abs(this.value - this.target) < 1e-4 && Math.abs(this.velocity) < 1e-4;
    }
}

/** Easing curves for tweens (t from 0 to 1): inOutCubic, outCubic, inOutSine, outExpo. */
export const ease = {
    /** Slow start, fast middle, slow end. */
    inOutCubic: (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    /** Fast start, slow end. */
    outCubic: (t: number): number => 1 - (1 - t) ** 3,
    /** Gentle start and end. */
    inOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
    /** Sharp start, long soft landing. */
    outExpo: (t: number): number => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
};
