// ============================================================
//  BIBLIOTECA CENTRAL DE PRODUCTOS
// ============================================================
//  Este es el ÚNICO sitio donde viven los productos y sus
//  enlaces de afiliado. Si cambias de programa o se rompe un
//  enlace, lo tocas aquí y se actualiza en TODA la web.
//
//  Cada producto tiene:
//   - id:          identificador único (lo usas en el quiz y en MDX)
//   - nombre, categoria, descripcion: para mostrar (sin precio: cambian mucho)
//   - tags:        para que el motor del quiz lo seleccione
//   - url:         página del producto (cuando haya afiliación, aquí va el enlace)
//   - tienda:      dónde se abre el enlace
//   - momento:     'am' (mañana), 'pm' (noche) o 'ambos'
//   - frecuencia:  texto que se muestra ('Cada día', '2-3 veces/sem'...)
//   - orden:       posición dentro de la rutina (1 limpieza ... 5 SPF)
//   - imagen:      ruta a la foto del producto (opcional)
// ============================================================

export type Momento = 'am' | 'pm' | 'ambos';

export type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  tags: string[];
  url: string;
  tienda: string;
  momento: Momento;
  frecuencia: string;
  orden: number;
  imagen?: string;
  natural?: boolean;
  /** Opción menos conocida, con poca publicidad, que hace lo mismo */
  alternativa?: { nombre: string; descripcion: string; tienda: string; url: string };
};

export const productos: Record<string, Producto> = {
  limpiador: {
    id: 'limpiador',
    nombre: 'CeraVe Limpiadora Hidratante',
    categoria: 'Limpieza',
    descripcion: 'Limpia sin espuma ni tirantez, con ceramidas y ácido hialurónico. Sin perfume.',
    tags: ['limpieza', 'todos'],
    url: 'https://farmaciajimenez.com/nuestras-marcas/cerave/cerave-limpiadora-hidratante-473-ml',
    tienda: 'Farmacia Jiménez',
    alternativa: { nombre: 'Rilastil Aqua Gel Limpiador', descripcion: 'Gel suave de farmacia con ácido hialurónico y ceramidas. Poco conocido y muy barato.', tienda: 'PromoFarma', url: 'https://www.promofarma.com/en/rilastil-aqua-facial-hygiene-200ml/p-25876' },
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 1,
  },
  limpiadorSeca: {
    id: 'limpiadorSeca',
    nombre: 'CeraVe Limpiadora Crema-Espuma Hidratante',
    categoria: 'Limpieza',
    descripcion: 'Crema que se vuelve espuma suave: limpia y deja la piel seca cómoda. Sin perfume.',
    tags: ['limpieza', 'seca', 'sensible'],
    url: 'https://farmaciajimenez.com/nuestras-marcas/cerave/cerave-limpiadora-crema-espuma-hidratante-473-ml',
    tienda: 'Farmacia Jiménez',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 1,
  },
  vitC: {
    id: 'vitC',
    nombre: 'The Ordinary Vitamin C Suspension 23% + HA Spheres 2%',
    categoria: 'Tratamiento',
    descripcion: 'Vitamina C pura (ácido ascórbico) sin agua, muy estable. Puede picar al principio: mézclala con tu crema si te pasa.',
    tags: ['tratamiento', 'manchas', 'luz', 'edad'],
    url: 'https://theordinary.com/es-es/vitamin-c-suspension-23-ha-spheres-2-vitamin-c-100451.html',
    tienda: 'Web de The Ordinary',
    alternativa: { nombre: 'Sesderma C-Vit Liposomal Serum', descripcion: 'Vitamina C estabilizada (más suave que la pura) de un laboratorio español. Mejor si la vitamina C pura te pica.', tienda: 'Farmacia Jiménez', url: 'https://farmaciajimenez.com/nuestras-marcas/sesderma/sesderma-c-vit/sesderma-c-vit-liposomal-serum-30-ml' },
    momento: 'am',
    frecuencia: 'Cada mañana',
    orden: 2,
  },
  niacin: {
    id: 'niacin',
    nombre: 'The Ordinary Niacinamide 10% + Zinc 1%',
    categoria: 'Tratamiento',
    descripcion: 'Niacinamida al 10 % para poros, brillos y marcas. Uno de los sérums con mejor relación calidad-precio.',
    tags: ['tratamiento', 'acne', 'poros', 'manchas'],
    url: 'https://theordinary.com/es-es/niacinamide-10-zinc-1-serum-100436.html',
    tienda: 'Web de The Ordinary',
    momento: 'am',
    frecuencia: 'Cada mañana',
    orden: 2,
  },
  hialu: {
    id: 'hialu',
    nombre: 'The Ordinary Hyaluronic Acid 2% + B5 (con ceramidas)',
    categoria: 'Tratamiento',
    descripcion: 'Cinco tipos de ácido hialurónico, pantenol y ceramidas. Ligero, sin perfume.',
    tags: ['tratamiento', 'sequedad', 'seca'],
    url: 'https://theordinary.com/es-es/hyaluronic-acid-2-b5-serum-with-ceramides-769915233490.html',
    tienda: 'Web de The Ordinary',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 2,
  },
  retinol: {
    id: 'retinol',
    nombre: 'The Ordinary Retinol 0.2% in Squalane',
    categoria: 'Tratamiento',
    descripcion: 'Retinol suave para empezar, en escualano para que reseque menos. Solo de noche.',
    tags: ['tratamiento', 'edad'],
    url: 'https://theordinary.com/es-es/retinol-02-in-squalane-serum-100439.html',
    tienda: 'Web de The Ordinary',
    alternativa: { nombre: 'Sesderma Sesmahal R Retinol 0,15 %', descripcion: 'Retinol al 0,15 % de un laboratorio español, para empezar con suavidad.', tienda: 'PromoFarma', url: 'https://www.promofarma.com/en/sesderma-sesmahal-r-retinol-0-15-serum-concentrado-30-ml/p-791864' },
    momento: 'pm',
    frecuencia: 'Empieza 2 noches/sem',
    orden: 3,
  },
  bha: {
    id: 'bha',
    nombre: 'The Ordinary Salicylic Acid 2% Solution',
    categoria: 'Tratamiento',
    descripcion: 'Ácido salicílico al 2 % para poros, puntos negros y granitos. Sin alcohol ni perfume.',
    tags: ['tratamiento', 'acne', 'poros'],
    url: 'https://theordinary.com/es-es/salicylic-acid-2-solution-exfoliator-100619.html',
    tienda: 'Web de The Ordinary',
    momento: 'pm',
    frecuencia: '2-3 noches/sem',
    orden: 3,
  },
  hidra: {
    id: 'hidra',
    nombre: 'CeraVe Loción Hidratante de Rostro',
    categoria: 'Hidratación',
    descripcion: 'Hidratante ligera con ceramidas, niacinamida y ácido hialurónico. No engrasa.',
    tags: ['hidratacion', 'todos'],
    url: 'https://www.promofarma.com/es/cerave-locion-hidratante-de-rostro-52ml/p-90435',
    tienda: 'PromoFarma',
    alternativa: { nombre: 'Acofarderm Crema Facial Pieles Atópicas', descripcion: 'La crema de la marca de las farmacias: ligera, calmante y de las más baratas que hay.', tienda: 'PromoFarma', url: 'https://www.promofarma.com/en/acofarderm-facial-cream-pieles-atopicas-50ml/p-47805' },
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 4,
  },
  hidraRica: {
    id: 'hidraRica',
    nombre: 'CeraVe Crema Hidratante Intensiva',
    categoria: 'Hidratación',
    descripcion: 'La más rica de CeraVe: urea al 5 %, ceramidas y manteca de karité para piel muy seca.',
    tags: ['hidratacion', 'seca', 'edad'],
    url: 'https://farma2go.com/products/cerave-crema-hidratante-intensiva-340g',
    tienda: 'Farma2Go',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 4,
  },
  spf: {
    id: 'spf',
    nombre: 'Garnier Ambre Solaire Fluido Sensible Ultra Ligero SPF50+',
    categoria: 'Protección',
    descripcion: 'Protector facial muy ligero, para usar cada día debajo del maquillaje. Precio de supermercado.',
    tags: ['proteccion', 'todos'],
    url: 'https://www.lookfantastic.es/p/garnier-ambre-solaire-ultra-light-sensitive-sun-protection-face-fluid-spf50-40ml/12564736/',
    tienda: 'Lookfantastic',
    alternativa: { nombre: 'Isntree Hyaluronic Acid Watery Sun Gel SPF50+', descripcion: 'Protector coreano en gel, muy ligero e hidratante, sin marcas blancas.', tienda: 'Lookfantastic', url: 'https://eu.lookfantastic.com/p/isntree-hyaluronic-acid-watery-sun-gel-spf50-pa-50ml/15443552/' },
    momento: 'am',
    frecuencia: 'Cada mañana, sí o sí',
    orden: 5,
  },
  limpiadorGrasa: {
    id: 'limpiadorGrasa',
    nombre: 'CeraVe Gel Limpiador Espumoso',
    categoria: 'Limpieza',
    descripcion: 'Quita la grasa sin resecar, con niacinamida y ceramidas. Sin perfume.',
    tags: ['limpieza', 'grasa', 'acne', 'poros'],
    url: 'https://farmaciajimenez.com/nuestras-marcas/cerave/cerave-gel-limpiador-espumoso-473-ml',
    tienda: 'Farmacia Jiménez',
    alternativa: { nombre: 'A-Derma Biology AC Gel Limpiador Purificante', descripcion: 'Gel de farmacia para piel grasa o con granitos, sin jabón agresivo.', tienda: 'Farmacia Jiménez', url: 'https://farmaciajimenez.com/nuestras-marcas/ducray/a-derma/a-derma-phys-ac-gel-limpiador-purificante-400-ml' },
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 1,
  },
  azelaico: {
    id: 'azelaico',
    nombre: 'The Ordinary Azelaic Acid Suspension 10%',
    categoria: 'Tratamiento',
    descripcion: 'Ácido azelaico para rojeces, granitos y manchas. Apto en el embarazo.',
    tags: ['tratamiento', 'rojeces', 'manchas', 'marcas', 'acne', 'embarazo'],
    url: 'https://theordinary.com/es-es/azelaic-acid-suspension-10-exfoliator-100407.html',
    tienda: 'Web de The Ordinary',
    momento: 'pm',
    frecuencia: 'Cada noche (empieza en días alternos)',
    orden: 2,
  },
  calmante: {
    id: 'calmante',
    nombre: 'SKIN1004 Madagascar Centella Ampoule',
    categoria: 'Tratamiento',
    descripcion: 'Sérum de centella asiática casi puro, sin perfume: calma rojeces e irritación.',
    tags: ['tratamiento', 'sensible', 'rojeces', 'afeitado'],
    url: 'https://eu.lookfantastic.com/p/15555881/',
    tienda: 'Lookfantastic',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 2,
  },
  peptidos: {
    id: 'peptidos',
    nombre: 'The Ordinary Multi-Peptide + HA Serum',
    categoria: 'Tratamiento',
    descripcion: 'Varios péptidos y ácido hialurónico para firmeza y líneas finas. Suave, apto en el embarazo.',
    tags: ['tratamiento', 'edad', 'firmeza', 'embarazo', 'sensible'],
    url: 'https://theordinary.com/es-es/multi-peptide-ha-serum-100613.html',
    tienda: 'Web de The Ordinary',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 2,
  },
  aha: {
    id: 'aha',
    nombre: 'The Ordinary Lactic Acid 5% + HA',
    categoria: 'Tratamiento',
    descripcion: 'El exfoliante más suave: ácido láctico al 5 % para textura y luminosidad.',
    tags: ['tratamiento', 'textura', 'luz', 'marcas'],
    url: 'https://theordinary.com/es-es/lactic-acid-5-ha-exfoliator-100427.html',
    tienda: 'Web de The Ordinary',
    momento: 'pm',
    frecuencia: '1-2 noches/sem',
    orden: 3,
  },
  contorno: {
    id: 'contorno',
    nombre: 'The Ordinary Caffeine Solution 5% + EGCG',
    categoria: 'Contorno',
    descripcion: 'Cafeína al 5 % para bolsas e hinchazón del contorno de ojos.',
    tags: ['contorno', 'ojeras'],
    url: 'https://theordinary.com/es-es/caffeine-solution-5-egcg-eye-serum-100412.html',
    tienda: 'Web de The Ordinary',
    momento: 'ambos',
    frecuencia: 'Mañana y noche, a toquecitos',
    orden: 3,
  },
  postAfeitado: {
    id: 'postAfeitado',
    nombre: 'NIVEA MEN Sensitive Bálsamo After Shave',
    categoria: 'Afeitado',
    descripcion: 'Sin alcohol, con manzanilla: calma el ardor y la rojez del afeitado.',
    tags: ['afeitado', 'sensible'],
    url: 'https://www.nivea.es',
    tienda: 'Web de NIVEA',
    momento: 'am',
    frecuencia: 'Después de afeitarte',
    orden: 3,
  },
  ceramidas: {
    id: 'ceramidas',
    nombre: 'CeraVe Crema Hidratante',
    categoria: 'Hidratación',
    descripcion: 'La crema de ceramidas de referencia, sin perfume. Para cara y cuerpo.',
    tags: ['hidratacion', 'sensible', 'rojeces', 'descamacion', 'seca'],
    url: 'https://farmaciajimenez.com/nuestras-marcas/cerave/cerave-crema-hidratante-340-ml',
    tienda: 'Farmacia Jiménez',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 4,
  },
  spfMineral: {
    id: 'spfMineral',
    nombre: 'Avène Fluido Mineral SPF50+',
    categoria: 'Protección',
    descripcion: 'Solo filtros minerales y sin perfume: para piel muy sensible, rosácea o embarazo.',
    tags: ['proteccion', 'sensible', 'rojeces', 'embarazo'],
    url: 'https://farma2go.com/fr/products/avene-fluide-solaire-mineral-spf-50-40ml',
    tienda: 'Farma2Go',
    momento: 'am',
    frecuencia: 'Cada mañana y renueva cada 2 h al sol',
    orden: 5,
  },
  parches: {
    id: 'parches',
    nombre: 'COSRX Acne Pimple Master Patch',
    categoria: 'Extra',
    descripcion: 'Parches de hidrocoloide en tres tamaños: protegen el granito y evitan tocarlo.',
    tags: ['acne', 'extra'],
    url: 'https://www.cosrx.com/products/acne-pimple-master-patch',
    tienda: 'Web de COSRX',
    momento: 'pm',
    frecuencia: 'Solo cuando salga un granito',
    orden: 6,
  },
};

export const getProducto = (id: string): Producto | undefined => productos[id];
