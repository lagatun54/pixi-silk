# usage: python3 scripts/crop.py <in> <out> x y w h [scale]
# or side by side: python3 scripts/crop.py --pair <a> <b> <out> x y w h [scale]  (same region of both, a left / b right)
import sys
from PIL import Image

args = sys.argv[1:]
if args[0] == '--stack':
    # reference above, render below: python3 scripts/crop.py --stack <ref> <mine> <out> x y w h [scale]
    a, b, out = args[1], args[2], args[3]
    x, y, w, h = map(int, args[4:8])
    s = float(args[8]) if len(args) > 8 else 2
    A = Image.open(a).convert('RGB').crop((x, y, x + w, y + h))
    B = Image.open(b).convert('RGB').crop((x, y, x + w, y + h))
    W, H = int(w * s), int(h * s)
    img = Image.new('RGB', (W, H * 2 + 6), (255, 0, 255))
    img.paste(A.resize((W, H), Image.LANCZOS), (0, 0))
    img.paste(B.resize((W, H), Image.LANCZOS), (0, H + 6))
    img.save(out)
elif args[0] == '--pair':
    a, b, out = args[1], args[2], args[3]
    x, y, w, h = map(int, args[4:8])
    s = float(args[8]) if len(args) > 8 else 2
    A = Image.open(a).convert('RGB').crop((x, y, x + w, y + h))
    B = Image.open(b).convert('RGB').crop((x, y, x + w, y + h))
    W, H = int(w * s), int(h * s)
    img = Image.new('RGB', (W * 2 + 8, H), (255, 0, 255))
    img.paste(A.resize((W, H), Image.LANCZOS), (0, 0))
    img.paste(B.resize((W, H), Image.LANCZOS), (W + 8, 0))
    img.save(out)
else:
    src, out = args[0], args[1]
    x, y, w, h = map(int, args[2:6])
    s = float(args[6]) if len(args) > 6 else 2
    Image.open(src).convert('RGB').crop((x, y, x + w, y + h)).resize((int(w * s), int(h * s)), Image.LANCZOS).save(out)
print('ok', out)
