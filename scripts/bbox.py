# Bounding box of bright pixels in a region, for calibrating text size/position against a reference.
# usage: python3 scripts/bbox.py <img> x0 y0 x1 y1 [threshold] [ox oy]
# prints the box in image coordinates and, when ox/oy are given, relative to that origin.
import sys
from PIL import Image

img = Image.open(sys.argv[1]).convert('RGB')
x0, y0, x1, y1 = map(int, sys.argv[2:6])
th = int(sys.argv[6]) if len(sys.argv) > 6 else 90
ox, oy = (float(sys.argv[7]), float(sys.argv[8])) if len(sys.argv) > 8 else (0, 0)
px = img.load()
xs, ys = [], []
for y in range(y0, y1):
    for x in range(x0, x1):
        if max(px[x, y]) > th:
            xs.append(x)
            ys.append(y)
if not xs:
    print('empty')
else:
    bx0, bx1, by0, by1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    print(f'x {bx0}-{bx1} (w {bx1 - bx0})  y {by0}-{by1} (h {by1 - by0})  local x {bx0 - ox:.1f}-{bx1 - ox:.1f} y {by0 - oy:.1f}-{by1 - oy:.1f}')
