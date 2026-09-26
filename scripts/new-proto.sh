#!/bin/sh
# usage: sh scripts/new-proto.sh 36-my-idea
# Creates apps/site/src/lab/36-my-idea.ts; add it to apps/site/src/lab/catalog.mjs to give it a page at /lab/36-my-idea/.
for n in "$@"; do
    f="apps/site/src/lab/$n.ts"
    if [ -e "$f" ]; then echo "exists: $f"; continue; fi
    cat > "$f" <<'TS'
import { SilkGraphics } from 'pixi-silk';
import { boot } from './_shared/kit';

const proto = await boot({ title: 'New prototype', subtitle: 'What this page shows.' });
const g = new SilkGraphics();

proto.stage.addChild(g);
proto.app.ticker.add(() => {
    g.clear().circle(proto.width / 2, proto.height / 2, 80).fill(0x0a84ff);
});
TS
    echo "created $f: now add ['$n', 'Name', 'Description'] to apps/site/src/lab/catalog.mjs"
done
