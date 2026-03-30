import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || 'https://ekimseo.com';
  const content = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}sitemap-index.xml`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
