import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { getAllPosts } from '../lib/posts';
import { absoluteUrl } from '../lib/urls';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const lastBuildDate = posts[0]?.data.date ?? new Date();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`notes/${post.id}/`);
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.data.excerpt)}</description>
      ${post.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${escapeXml(absoluteUrl(''))}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl('rss.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
