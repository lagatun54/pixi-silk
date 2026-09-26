import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { mdxToMarkdown } from '@/lib/mdx-to-md.mjs';
import { SITE } from '@/lib/site';

const demos = import.meta.glob<string>('../../demos/*.demo.ts', { query: '?raw', import: 'default', eager: true });

export const getStaticPaths: GetStaticPaths = async () => {
    const docs = await getCollection('docs');

    return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

/** Plain-Markdown twin of every docs page, for LLMs and other tools. */
export const GET: APIRoute = ({ props }) => {
    const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection<'docs'>>>[number] };
    const body = mdxToMarkdown(entry.body ?? '', (name) => demos[`../../demos/${name}.demo.ts`]);
    const text = `# ${entry.data.title}\n\n> ${entry.data.description}\n\nSource: ${SITE.url}/docs/${entry.id}/\n\n${body}\n`;

    return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
