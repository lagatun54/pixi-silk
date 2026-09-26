import { type CollectionEntry, getCollection } from 'astro:content';
import { DOCS_NAV } from '@/content/nav.mjs';

export interface DocLink {
    slug: string;
    title: string;
    description: string;
    href: string;
    section: string;
}

let cache: DocLink[] | null = null;

/** Docs pages in sidebar order. Throws when the nav and the collection disagree. */
export async function docsInOrder(): Promise<DocLink[]> {
    if (cache) return cache;
    const entries = await getCollection('docs');
    const byId = new Map<string, CollectionEntry<'docs'>>(entries.map((e) => [e.id, e]));
    const listed = DOCS_NAV.flatMap((s) => s.items);
    const missing = entries.filter((e) => !listed.includes(e.id)).map((e) => e.id);
    const unknown = listed.filter((id) => !byId.has(id));

    if (missing.length || unknown.length) {
        throw new Error(
            `src/content/nav.mjs is out of sync. Not in nav: [${missing.join(', ')}]. No such page: [${unknown.join(', ')}].`,
        );
    }
    cache = DOCS_NAV.flatMap((section) =>
        section.items.map((id) => {
            const { title, description } = byId.get(id)!.data;

            return { slug: id, title, description, href: `/docs/${id}/`, section: section.title };
        }),
    );

    return cache;
}
