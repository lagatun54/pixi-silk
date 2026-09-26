/*
 * Site search over the Pagefind index (built by `pagefind --site dist`). Shared by the ⌘K modal and
 * the /search/ page. Plain script (not bundled): the index only exists in the production build.
 */
(() => {
    let pagefind = null;

    async function load() {
        if (pagefind) return pagefind;
        try {
            const url = '/pagefind/' + 'pagefind.js';

            pagefind = await import(url);
            await pagefind.options({ baseUrl: '/', excerptLength: 22 });
        } catch {
            pagefind = null;
        }

        return pagefind;
    }

    const escapeHtml = (s) =>
        String(s).replace(
            /[&<>"']/g,
            (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
        );

    /** Binds an input, a result list and optional filter chips; returns a `run(query)` function. */
    function bind({ input, list, chips, limit = 10, onQuery }) {
        let seq = 0;
        let active = -1;
        let section = null;

        const highlight = (i) => {
            const items = [...list.querySelectorAll('a')];

            active = Math.max(-1, Math.min(items.length - 1, i));
            items.forEach((a, k) => a.classList.toggle('bg-accent', k === active));
            items[active]?.scrollIntoView({ block: 'nearest' });
        };
        const run = async (value) => {
            const id = ++seq;
            const q = (value ?? input.value).trim();

            onQuery?.(q);
            if (!q) {
                list.innerHTML = '';

                return;
            }
            const pf = await load();

            if (id !== seq) return;
            if (!pf) {
                list.innerHTML =
                    '<li class="p-3 text-muted-foreground">Search works on the production build (<code>pnpm site:build && pnpm site:preview</code>).</li>';

                return;
            }
            const search = await pf.search(q, section ? { filters: { section } } : {});
            const data = await Promise.all(search.results.slice(0, limit).map((r) => r.data()));

            if (id !== seq) return;
            active = -1;
            list.innerHTML = data.length
                ? data
                      .map(
                          (d) => `<li><a href="${d.url}" class="block rounded-md px-3 py-2 hover:bg-accent">
                    <div class="flex items-baseline justify-between gap-3"><span class="font-medium">${escapeHtml(d.meta.title ?? d.url)}</span>
                    <span class="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">${escapeHtml(d.filters?.section?.[0] ?? '')}</span></div>
                    <div class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">${d.excerpt}</div></a></li>`,
                      )
                      .join('')
                : `<li class="p-3 text-muted-foreground">No results for "${escapeHtml(q)}".</li>`;
        };

        input.addEventListener('input', () => run());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                highlight(active + 1);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                highlight(active - 1);
            }
            if (e.key === 'Enter') {
                const link = list.querySelectorAll('a')[Math.max(active, 0)];

                if (link) {
                    e.preventDefault();
                    location.href = link.href;
                }
            }
        });
        chips?.forEach((chip) =>
            chip.addEventListener('click', () => {
                section = chip.dataset.section || null;
                chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
                run();
            }),
        );

        return { run, load };
    }

    window.silkSearch = { bind, load };
})();
