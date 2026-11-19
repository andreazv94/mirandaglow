// ============================================================
//  GUÍA DE LA PIEL — índice por capítulos (/guia)
// ============================================================
//  Cada capítulo agrupa artículos del blog (por slug) y, si se
//  quiere, fichas de ingredientes. Para añadir un artículo a la
//  guía, pon su slug en el capítulo que toque.
// ============================================================

export type Capitulo = {
  id: string;
  titulo: string;
  intro: string;
  imagen?: string;
  articulos: string[];
  /** Enlaces extra (herramientas, fichas…) */
  extra?: { texto: string; href: string }[];
};

export const capitulos: Capitulo[] = [
  {
    id: 'conoce-tu-piel',
    titulo: 'Conoce tu piel',
    intro: 'Cómo funciona la piel, qué es la barrera cutánea y cómo saber qué tipo de piel tienes. La base para elegir bien todo lo demás.',
    imagen: '/img/piel.jpg',
    articulos: ['como-funciona-la-piel', 'mitos-absorcion-piel', 'tipos-de-piel'],
  },
  {
    id: 'rutina',
    titulo: 'Tu rutina',
    intro: 'Qué productos necesitas de verdad, en qué orden se ponen, cómo leer una etiqueta y cómo empezar con un activo nuevo sin irritarte.',
    imagen: '/img/rutina.jpg',
    articulos: ['rutina-principiantes', 'orden-rutina-skincare', 'como-leer-etiqueta-cosmetica', 'como-introducir-activos'],
    extra: [{ texto: 'Lector de ingredientes', href: '/ingredientes' }, { texto: 'Fichas de ingredientes', href: '/ingredientes/todos' }],
  },
  {
    id: 'sol',
    titulo: 'El sol',
    intro: 'El protector solar es el producto que más previene manchas y arrugas. Cómo elegirlo, cuánto ponerse y cómo cuidar los lunares.',
    imagen: '/img/protector.jpg',
    articulos: ['proteccion-solar-facial', 'lunares-piel-clara-proteccion-solar'],
  },
  {
    id: 'problemas',
    titulo: 'Problemas de la piel',
    intro: 'Acné, rojeces, manchas, dermatitis, ojeras… Qué es cada cosa, qué puedes hacer en casa y cuándo hace falta una dermatóloga.',
    articulos: [
      'rutina-piel-acne', 'marcas-cicatrices-acne', 'rutina-piel-grasa', 'rutina-rosacea-piel-reactiva',
      'dermatitis-atopica', 'dermatitis-seborreica', 'manchas-sol-melasma', 'ojeras-y-bolsas',
    ],
  },
  {
    id: 'etapas',
    titulo: 'Cada etapa de la vida',
    intro: 'La piel cambia con la edad y con las hormonas. Qué necesita en la adolescencia, en cada década, en el ciclo menstrual, el embarazo y la menopausia.',
    imagen: '/img/crema.jpg',
    articulos: [
      'skincare-adolescentes', 'piel-por-edades', 'piel-ciclo-menstrual', 'skincare-embarazo-lactancia',
      'piel-menopausia', 'rutina-skincare-hombre', 'rutina-antiedad',
    ],
  },
  {
    id: 'ingredientes',
    titulo: 'Ingredientes y tratamientos',
    intro: 'Para qué sirve cada activo, cómo se usa y qué herramientas ayudan de verdad (y cuáles son solo bonitas).',
    imagen: '/img/herramientas.jpg',
    articulos: ['herramientas-cuidado-piel', 'vitamina-c-skincare', 'serums-naturales'],
    extra: [{ texto: 'Todas las fichas de ingredientes', href: '/ingredientes/todos' }],
  },
  {
    id: 'habitos',
    titulo: 'Hábitos',
    intro: 'Alimentación, sueño, estrés, tabaco y deporte: lo que influye de verdad en la piel, sin mitos.',
    imagen: '/img/habitos.jpg',
    articulos: ['habitos-y-piel'],
  },
];
