import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/urls';

export const GET: APIRoute = async () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('sitemap-index.xml')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
