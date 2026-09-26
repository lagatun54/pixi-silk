import type { APIRoute } from 'astro';
import { SITE } from '@/lib/site';

/** Lets browsers add the docs search as a search engine (`<link rel="search">`). */
export const GET: APIRoute = () =>
    new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${SITE.name}</ShortName>
  <Description>Search the ${SITE.name} docs: smooth, anti-aliased graphics for PixiJS v8</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="32" height="32" type="image/x-icon">${SITE.url}/favicon.ico</Image>
  <Url type="text/html" template="${SITE.url}/search/?q={searchTerms}"/>
</OpenSearchDescription>
`,
        { headers: { 'Content-Type': 'application/opensearchdescription+xml; charset=utf-8' } },
    );
