import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // ⚠️ Cambia esto por tu dominio real cuando lo tengas conectado.
  // Es importante para que el sitemap y las URLs canónicas (SEO) sean correctas.
  site: 'https://mirandaglow.com',
  integrations: [react(), mdx()],
});
