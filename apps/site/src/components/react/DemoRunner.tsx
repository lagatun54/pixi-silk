import { useEffect, useRef, useState } from 'react';
import { type Control, type Demo, initialValues, type MountedDemo, mountDemo } from '@/demos/runtime';

// one lazily loaded chunk per demo
const modules = import.meta.glob<{ default: Demo }>('../../demos/*.demo.ts');

interface Props {
    name: string;
    height?: number;
    /** Accessible description of what the canvas shows. */
    label?: string;
}

/**
 * Live demo island: loads the demo module, mounts it only while it is near the viewport
 * (browsers allow ~16 WebGL contexts per page) and renders its controls.
 */
export default function DemoRunner({ name, height = 280, label }: Props) {
    const frame = useRef<HTMLDivElement>(null);
    const host = useRef<HTMLDivElement>(null);
    const mounted = useRef<MountedDemo | null>(null);
    const values = useRef<Record<string, unknown>>({});
    const [demo, setDemo] = useState<Demo | null>(null);
    const [params, setParams] = useState<Record<string, unknown>>({});
    const [visible, setVisible] = useState(false);
    const [generation, setGeneration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [live, setLive] = useState(false);

    useEffect(() => {
        const load = modules[`../../demos/${name}.demo.ts`];

        if (!load) {
            setError(`Unknown demo "${name}"`);

            return;
        }
        load().then(
            (m) => {
                values.current = initialValues(m.default.controls);
                setParams(values.current);
                setDemo(m.default);
            },
            (e: unknown) => setError(String(e)),
        );
    }, [name]);

    useEffect(() => {
        const el = frame.current;

        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), {
            rootMargin: '400px 0px',
        });

        io.observe(el);

        return () => io.disconnect();
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: bumping `generation` (Restart) remounts the demo
    useEffect(() => {
        if (!demo || !visible || !host.current) return;
        let cancelled = false;
        let instance: MountedDemo | null = null;

        mountDemo(demo, host.current, values.current).then(
            (m) => {
                if (cancelled) m.destroy();
                else {
                    mounted.current = instance = m;
                    setLive(true);
                }
            },
            (e: unknown) => setError(String(e)),
        );

        return () => {
            cancelled = true;
            instance?.destroy();
            mounted.current = null;
            setLive(false);
        };
    }, [demo, visible, generation]);

    const set = (key: string, value: unknown) => {
        values.current = { ...values.current, [key]: value };
        setParams(values.current);
        mounted.current?.setParam(key, value);
    };
    const reset = () => {
        values.current = initialValues(demo?.controls);
        setParams(values.current);
        setGeneration((g) => g + 1);
    };
    const controls = Object.entries(demo?.controls ?? {});

    return (
        <div ref={frame}>
            <div
                ref={host}
                role="img"
                aria-label={label}
                className="relative w-full overflow-hidden"
                style={{ height, background: '#0b0b0d' }}
            >
                {!live && !error && (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-wider text-white/35">
                        Live demo
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 font-mono text-xs text-red-400">
                        {error}
                    </div>
                )}
            </div>
            <div className="flex min-h-[41px] flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-2.5 text-xs">
                {controls.map(([key, control]) => (
                    <ControlInput
                        key={key}
                        name={key}
                        control={control}
                        value={params[key]}
                        onChange={(v) => set(key, v)}
                    />
                ))}
                <button
                    type="button"
                    onClick={reset}
                    className="ml-auto rounded-md px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}

function ControlInput({
    name,
    control,
    value,
    onChange,
}: {
    name: string;
    control: Control;
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    const label = control.label ?? name;

    if (control.type === 'range') {
        const v = Number(value);

        return (
            <label className="flex items-center gap-2">
                <span className="text-muted-foreground">{label}</span>
                <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step ?? 'any'}
                    value={v}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-28 accent-[hsl(var(--silk))]"
                />
                <span className="w-12 font-mono tabular-nums">
                    {Number.isInteger(v) ? v : v.toFixed(2)}
                    {control.unit ?? ''}
                </span>
            </label>
        );
    }
    if (control.type === 'toggle') {
        return (
            <label className="flex cursor-pointer items-center gap-2">
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="accent-[hsl(var(--silk))]"
                />
                <span className="text-muted-foreground">{label}</span>
            </label>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex overflow-hidden rounded-md border">
                {control.options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`px-2 py-1 font-mono ${value === option ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
