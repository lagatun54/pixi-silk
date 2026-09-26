// Copies the library changelog into the site (rendered at /changelog/).
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('src/generated', { recursive: true });
copyFileSync('../../packages/pixi-silk/CHANGELOG.md', 'src/generated/CHANGELOG.md');
