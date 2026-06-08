import { defineCollection, z } from 'astro:content';

// Esquema de cada artículo del blog. El frontmatter de tus .mdx
// debe cumplir esto (te avisa en build si te falta un campo).
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    fecha: z.date(),
    concern: z.string().optional(), // preocupación principal: acne, manchas, edad...
    imagen: z.string().optional(),
  }),
});

export const collections = { blog };
