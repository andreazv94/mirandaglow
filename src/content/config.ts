import { defineCollection, z } from 'astro:content';

// Esquema de cada artículo del blog. El frontmatter de tus .mdx
// debe cumplir esto (te avisa en build si te falta un campo).
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    fecha: z.date(),
    // Necesidad / preocupación principal (para filtrar): Acné, Manchas, Antiedad...
    concern: z.string().optional(),
    // Tipos de piel a los que aplica (para filtrar). Ej: ['seca','sensible']
    tipoPiel: z.array(z.string()).optional(),
    // Imagen de portada. Ruta dentro de /public, ej: '/img/blog/acne.jpg'
    // Si no se indica, se muestra un degradado de marca.
    imagen: z.string().optional(),
    // true si el artículo trata sobre skincare natural (para el filtro)
    natural: z.boolean().optional(),
  }),
});

export const collections = { blog };
