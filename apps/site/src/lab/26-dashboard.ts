import { Container } from 'pixi.js';
import { SilkGraphics, vertical } from 'pixi-silk';
import { boot } from './_shared/kit';
import { attachLoupe } from './_shared/loupe';
import { budget, glucose, heartZones, stocks, weatherWeek } from './_widgets/charts';
import type { Widget } from './_widgets/common';
import { barometer, carBattery, heading, issFlyover, lampDimmer, uvWeek } from './_widgets/gauges';
import { fatArea, fatBars, heartPills, heartRange, pressureWave } from './_widgets/health';
import { activityCard } from './_widgets/rings';
import { cadence, daylight, espresso, goldenHour, sleepNight, sleepStages, sunsetPills } from './_widgets/time';
import { delivery, flight, pickup, raceTrack, train } from './_widgets/travel';

const proto = await boot({
    title: 'Dashboard',
    subtitle:
        'Thirty live widgets, every shape analytic. The masonry layout scrolls natively (wheel, keys, touch), and only visible widgets animate.',
});

const widgets: Widget[] = [
    activityCard(),
    fatArea(),
    issFlyover(),
    heartZones(),
    carBattery(),
    espresso(),
    sleepStages(),
    sunsetPills(),
    heartPills(),
    flight(),
    weatherWeek(),
    heading(),
    pressureWave(),
    glucose(),
    goldenHour(),
    train(),
    fatBars(),
    barometer(),
    stocks(),
    delivery(),
    cadence(),
    uvWeek(),
    sleepNight(),
    pickup(),
    heartRange(),
    budget(),
    raceTrack(),
    daylight(),
    lampDimmer(),
];

const content = new Container();
// eased scrim so content slides softly under the title (no hard edge, no banding)
const scrim = new SilkGraphics();

for (const w of widgets) content.addChild(w.view);
proto.stage.addChild(content);
proto.overlay.addChild(scrim);

const GAP = 16;
const COL = 340;
const TOP = 96;
let scale = 1;

/** Masonry: each widget goes into the currently shortest column; the page scrolls natively. */
function layout(w: number): void {
    const cols = Math.max(1, Math.min(4, Math.floor((w - 32 + GAP) / (COL + GAP))));

    scale = Math.min(1.3, (w - 32) / (cols * COL + (cols - 1) * GAP));
    const heights = new Array<number>(cols).fill(0);

    for (const wg of widgets) {
        const c = heights.indexOf(Math.min(...heights));

        wg.view.position.set(c * (COL + GAP) + (COL - wg.width) / 2, heights[c]);
        heights[c] += wg.height + GAP;
    }
    content.scale.set(scale);
    content.position.set(Math.round((w - (cols * COL + (cols - 1) * GAP) * scale) / 2), TOP);
    proto.setContentHeight(TOP + (Math.max(...heights) - GAP) * scale + 40);
}

proto.onResize((w) => {
    layout(w);
    scrim
        .clear()
        .rect(0, 0, w, TOP + 8)
        .fill(
            vertical(
                [
                    [0, 0x000000, 1],
                    [0.55, 0x000000, 0.9],
                    [1, 0x000000, 0],
                ],
                { easing: 'smooth' },
            ),
        );
});

let t = 0;

proto.app.ticker.add((ticker) => {
    const dt = Math.min(0.1, ticker.deltaMS / 1000);

    t += dt;
    const top = (proto.scrollY - TOP) / scale;
    const bottom = (proto.scrollY + proto.height) / scale;

    for (const wg of widgets) {
        // only animate what is on screen
        const visible = wg.view.y + wg.height > top - 40 && wg.view.y < bottom;

        wg.view.visible = visible;
        if (visible) wg.tick?.(dt, t);
    }
});
attachLoupe([proto.app]);
