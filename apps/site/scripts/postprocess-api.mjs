#!/usr/bin/env node
/**
 * Turns TypeDoc's markdown output (src/pages/api) into Astro pages:
 * adds frontmatter (Docs layout, title, description, kind) and rewrites relative `.md` links
 * to absolute URLs (TypeDoc links are relative to the file, Astro serves `x.md` at `x/`).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src/pages/api');
const LAYOUT = path.resolve('src/layouts/Docs.astro');
const KINDS = {
    classes: 'Class',
    functions: 'Function',
    interfaces: 'Interface',
    types: 'Type',
    'type-aliases': 'Type',
    variables: 'Variable',
    enumerations: 'Enum',
};

function walk(dir) {
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((e) =>
            e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : [],
        );
}

function urlFor(file) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/').replace(/\.md$/, '');

    return rel === 'index' ? '/api/' : `/api/${rel.replace(/\/index$/, '')}/`;
}

function rewriteLinks(content, file) {
    return content.replace(/\]\(([^)\s]+?\.md)(#[^)\s]*)?\)/g, (match, url, hash) => {
        if (/^(?:https?:|mailto:|\/\/)/i.test(url)) return match;

        return `](${urlFor(path.resolve(path.dirname(file), url))}${hash ?? ''})`;
    });
}

function describe(content, kind, title) {
    let text = '';

    for (const block of content.split(/\n{2,}/)) {
        const t = block.trim();

        // skip headings, code, tables, quotes, rules, lists and raw HTML: the first prose paragraph wins
        if (!t || /^(#|```|\||>|\*\*\*|Defined in|\[|<|[-*] |\d+\. )/.test(t)) continue;
        text = t;
        break;
    }
    let flat = text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .replace(/[`*_\\]/g, '')
        .trim();

    // short summaries get context, so every API page has a useful snippet of its own
    if (flat.length < 70)
        flat = `${flat ? `${flat.replace(/\.?$/, '.')} ` : ''}${kind} ${title} of pixi-silk, smooth anti-aliased graphics for PixiJS v8.`;

    if (flat.length <= 158) return flat;
    // cut after the last whole sentence that fits, else at a word boundary
    const cut = flat.slice(0, 158);
    const end = cut.lastIndexOf('. ');

    return end >= 60 ? cut.slice(0, end + 1) : `${cut.slice(0, 155).replace(/\s+\S*$/, '')}...`;
}

const yamlString = (s) => `'${s.replace(/'/g, "''")}'`;
let count = 0;

for (const file of walk(ROOT)) {
    let content = fs.readFileSync(file, 'utf8');

    if (content.startsWith('---\n')) continue;
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const folder = rel.split('/')[0];
    const isIndex = rel === 'index.md';
    const title = isIndex ? 'API reference' : path.basename(file, '.md');
    const description = isIndex
        ? 'Every export of pixi-silk: SilkGraphics, createSilkApp, gradients, colour and curve utilities and motion helpers, generated from the source.'
        : describe(content, KINDS[folder] ?? 'Symbol', title);

    // "Defined in: file.ts:123" has no link without a git remote; it is noise for readers and LLMs
    content = rewriteLinks(content, file).replace(/^Defined in: .*\n\n?/gm, '');
    const fm = [
        '---',
        `layout: ${yamlString(path.relative(path.dirname(file), LAYOUT).replace(/\\/g, '/'))}`,
        `title: ${yamlString(title)}`,
        `description: ${yamlString(description)}`,
        `eyebrow: ${yamlString(isIndex ? 'Reference' : (KINDS[folder] ?? 'API'))}`,
        'section: api',
        '---',
        '',
    ];

    fs.writeFileSync(file, fm.join('\n') + content);
    count++;
}
console.log(`postprocess-api: ${count} pages`);
