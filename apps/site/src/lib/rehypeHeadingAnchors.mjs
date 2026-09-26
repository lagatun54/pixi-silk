/**
 * Appends a `#` permalink to every h2-h4 that has an id. Runs after `rehypeHeadingIds`.
 */
export function rehypeHeadingAnchors() {
    const text = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(text).join(''));
    const visit = (node) => {
        for (const child of node.children ?? []) {
            if (
                child.type === 'element' &&
                /^h[2-4]$/.test(child.tagName) &&
                typeof child.properties?.id === 'string'
            ) {
                child.children.push({
                    type: 'element',
                    tagName: 'a',
                    // data-pagefind-ignore keeps the '#' out of search excerpts
                    properties: {
                        className: ['heading-anchor'],
                        href: `#${child.properties.id}`,
                        ariaLabel: `Permalink to "${text(child).trim()}"`,
                        dataPagefindIgnore: '',
                    },
                    children: [{ type: 'text', value: '#' }],
                });
            }
            visit(child);
        }
    };

    return (tree) => visit(tree);
}
