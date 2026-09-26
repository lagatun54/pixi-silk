#!/usr/bin/env node
/**
 * Writes a `.gz` next to every compressible file in dist/ (level 9, only when it is smaller), so
 * nginx can serve it with `gzip_static on` instead of compressing on every request.
 */
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = path.resolve('dist');
const EXT = /\.(html|css|js|mjs|json|xml|txt|md|svg|webmanifest|map)$/;
let files = 0;
let saved = 0;

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);

        if (entry.isDirectory()) walk(file);
        else if (EXT.test(entry.name)) {
            const raw = fs.readFileSync(file);

            if (raw.length < 512) continue;
            const gz = gzipSync(raw, { level: 9 });

            if (gz.length >= raw.length * 0.95) continue;
            fs.writeFileSync(`${file}.gz`, gz);
            files++;
            saved += raw.length - gz.length;
        }
    }
}

walk(DIST);
console.log(`precompress: ${files} files, ${(saved / 1024 / 1024).toFixed(1)} MB saved`);
