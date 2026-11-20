import { getCollection } from 'astro:content';
import { fichas } from '../data/fichas';
import { analisis } from '../data/analisis';

// Genera /sitemap.xml automáticamente: páginas fijas + todos los artículos.
// Más robusto que el plugin y sin dependencias extra.
export async function GET({ site }) {
  const base = (site?.href || 'https://mirandaglow.com/').replace(/\/$/, '');
  const posts = await getCollection('blog');

  const hoy = new Date().toISOString().slice(0, 10);
  const urls: (string | [string, string])[] = [
    '/',
    '/test',
    '/blog',
    '/guia',
    '/ingredientes',
    '/ingredientes/todos',
    '/analisis',
    '/comparar',
    '/mitos',
    '/lunares',
    ...analisis.map((a): [string, string] => [`/analisis/${a.slug}`, a.comprobado]),
    ...fichas.map((f) => `/ingredientes/${f.slug}`),
    '/sobre',
    '/aviso-legal',
    '/privacidad',
    '/cookies',
    ...posts.map((p): [string, string] => [`/blog/${p.slug}`, p.data.fecha.toISOString().slice(0, 10)]),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => {
  const [ruta, fecha] = Array.isArray(u) ? u : [u, hoy];
  return `  <url><loc>${base}${ruta}</loc><lastmod>${fecha}</lastmod></url>`;
}).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
