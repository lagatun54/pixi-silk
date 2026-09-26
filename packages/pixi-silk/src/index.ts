export { createSilkApp, type SilkApp, type SilkAppOptions } from './app';
export { GradientAtlas } from './atlas';
export { type ColorSpace, linearToOklab, oklabToLinear, parseColor, type RGBA } from './color';
export { catmullRom, monotoneX, type PointsInput, toFlat } from './curves';
export {
    along,
    ConicGradient,
    type ConicGradientOptions,
    conic,
    type Easing,
    type ExtendMode,
    Gradient,
    type GradientOptions,
    type GradientUnits,
    horizontal,
    LinearGradient,
    type LinearGradientOptions,
    linear,
    PathGradient,
    RadialGradient,
    type RadialGradientOptions,
    radial,
    type StopInput,
    type Vec2,
    vertical,
} from './gradient';
export { damp, dampAngle, ease, Spring } from './motion';
export {
    type AreaOptions,
    type FillInput,
    type FillStyle,
    type LineCap,
    type PolylineOptions,
    SilkGeometry,
    SilkGraphics,
    type SilkGraphicsOptions,
    type StrokeInput,
    type StrokeStyle,
} from './SilkGraphics';
