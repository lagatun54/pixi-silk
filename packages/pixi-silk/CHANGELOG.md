# pixi-silk

## 0.1.0

### Minor Changes

- First release. `SilkGraphics`: analytic anti-aliased rects, squircles, circles, ellipses, arcs, sectors,
  lines, polylines (smoothed, tapered), paths, areas, hearts, stars, polygons and triangles, drawn as one
  instanced draw call per object. Fill + stroke with exact coverage partition, shader-side dashes, gaussian
  blur on any paint, energy-conserving hairlines, transform stack and CPU hit testing.
- Gradients: linear, radial, conic and along-the-path, interpolated in OKLab (or linear / sRGB), baked into a
  half-float atlas and dithered at ±½ LSB.
- `createSilkApp`: a Pixi `Application` whose backing store maps 1:1 to device pixels (even at fractional
  DPRs), follows DPR changes, keeps sub-pixel positions and makes filters inherit the screen resolution.
- Motion helpers: `damp`, `dampAngle`, `Spring`, `ease`.
- ESM only, built one file per module and free of side effects, so bundlers keep only what an app imports.
  `SilkGraphics` with its shader is 14.8 kB gzipped and the motion helpers alone 0.4 kB. CommonJS code can
  still `require()` the package on Node 20.19+ and 22.12+.
- Works in Safari: the gradient atlas is uploaded as the premultiplied data it is.
