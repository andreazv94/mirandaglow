// Datos estructurados (schema.org) para que Google entienda cada página.
const SITE = 'https://mirandaglow.com';
const abs = (p: string) => new URL(p, SITE).toString();

export const organizacion = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'Miranda Glow',
  url: SITE,
  logo: abs('/img/logo.png'),
  email: 'info@mirandaglow.com',
};

export function inicio() {
  return [
    { '@context': 'https://schema.org', ...organizacion },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE}/#web`,
      name: 'Miranda Glow',
      url: SITE,
      inLanguage: 'es-ES',
      publisher: { '@id': `${SITE}/#org` },
    },
  ];
}

export function articulo(o: { titulo: string; descripcion: string; ruta: string; fecha?: Date; imagen?: string; seccion?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: o.titulo,
    description: o.descripcion,
    url: abs(o.ruta),
    mainEntityOfPage: abs(o.ruta),
    inLanguage: 'es-ES',
    image: [abs(o.imagen || '/img/og.jpg')],
    ...(o.fecha && { datePublished: o.fecha.toISOString(), dateModified: o.fecha.toISOString() }),
    ...(o.seccion && { articleSection: o.seccion }),
    author: { '@type': 'Organization', name: 'Miranda Glow', url: SITE },
    publisher: { '@id': `${SITE}/#org`, ...organizacion },
  };
}

export function migas(l: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: l.map(([name, ruta], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(ruta) })),
  };
}
