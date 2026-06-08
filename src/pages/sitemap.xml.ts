import { getCollection } from 'astro:content';

// Genera /sitemap.xml automáticamente: páginas fijas + todos los artículos.
// Más robusto que el plugin y sin dependencias extra.
export async function GET({ site }) {
  const base = (site?.href || 'https://mirandaglow.com/').replace(/\/$/, '');
  const posts = await getCollection('blog');

  const urls = [
    '/',
    '/test',
    '/blog',
    ...posts.map((p) => `/blog/${p.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
