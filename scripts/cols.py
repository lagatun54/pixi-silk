# Per-column vertical extent of pixels matching a hue predicate, in widget-local coordinates.
# usage: python3 scripts/cols.py <img> ox oy x0 y0 x1 y1 <red|blue|green|white|pink|cyan|purple> [minsat]
import sys, colorsys
from PIL import Image

img = Image.open(sys.argv[1]).convert('RGB')
ox, oy, x0, y0, x1, y1 = map(float, sys.argv[2:8])
kind = sys.argv[8]
px = img.load()

def match(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h *= 360
    if kind == 'white':
        return v > 0.7 and s < 0.2
    if s < 0.35 or v < 0.35:
        return False
    return {
        'red': h < 15 or h > 340,
        'pink': 330 < h or h < 5,
        'blue': 190 < h < 225,
        'cyan': 175 < h < 200,
        'green': 70 < h < 150,
        'purple': 240 < h < 300,
    }[kind]

runs = []
for x in range(int(ox + x0), int(ox + x1)):
    ys = [y for y in range(int(oy + y0), int(oy + y1)) if match(*px[x, y])]
    if ys:
        runs.append((x - ox, min(ys) - oy, max(ys) + 1 - oy))
# merge adjacent columns with similar extents into groups
groups = []
for r in runs:
    if groups and r[0] - groups[-1][-1][0] <= 1:
        groups[-1].append(r)
    else:
        groups.append([r])
for gr in groups:
    xa, xb = gr[0][0], gr[-1][0] + 1
    ya = min(r[1] for r in gr)
    yb = max(r[2] for r in gr)
    print(f'x {xa:.0f}-{xb:.0f}  y {ya:.0f}-{yb:.0f}')
