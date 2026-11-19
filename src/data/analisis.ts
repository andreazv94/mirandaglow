// ============================================================
//  ANÁLISIS DE CREMAS
// ============================================================
//  Una entrada por producto. La lista INCI se analiza con el mismo
//  lector de la web (src/data/ingredientes.ts) al construir la página,
//  así que el veredicto por tipo de piel se calcula solo.
//
//  Reglas:
//  - La lista de ingredientes, copiada tal cual de la fuente.
//  - Siempre fuente + fecha de comprobación. Las marcas cambian
//    fórmulas: el aviso "mira tu envase" sale en cada página.
//  - Hechos y explicación; nada de "es mala" o "es tóxica".
//  - Nadie nos paga por aparecer. Si un día hay enlace de afiliado,
//    va en `comprar` y la página lo indica.
// ============================================================

export type Analisis = {
  slug: string;
  nombre: string;
  marca: string;
  /** Qué es: crema hidratante, protector solar… */
  tipo: string;
  /** Frase corta para tarjetas y la descripción de Google */
  resumen: string;
  claves: string[];
  inci: string;
  fuentes: { texto: string; url: string }[];
  comprobado: string; // AAAA-MM-DD
  bueno: string[];
  mejorable: string[];
  comoUsar: string[];
  /** Nota sobre la fórmula (versiones, países…) */
  nota?: string;
  /** Enlace de compra (afiliado). Si no hay, no se muestra nada. */
  comprar?: string;
  imagen?: string;
};

export const analisis: Analisis[] = [
  {
    slug: 'nivea-creme-lata-azul',
    nombre: 'Nivea Creme (lata azul)',
    marca: 'Nivea',
    tipo: 'Crema hidratante multiuso',
    resumen: 'Una crema rica y protectora, muy buena para piel seca y zonas ásperas. Lleva perfume con varios alérgenos declarados.',
    claves: [
      'Es una crema de "aceite por fuera": protege mucho y evita que la piel pierda agua.',
      'Brilla en piel seca, manos, codos y talones, y en días de frío o viento.',
      'Para la cara con brillos o granitos suele ser demasiado pesada.',
      'Lleva perfume y 7 alérgenos declarados: no es la mejor para piel sensible o atópica.',
    ],
    inci:
      'Aqua, Paraffinum Liquidum, Cera Microcristallina, Glycerin, Lanolin Alcohol (Eucerit®), Paraffin, Panthenol, Magnesium Sulfate, Decyl Oleate, Octyldodecanol, Aluminum Stearates, Citric Acid, Magnesium Stearate, Limonene, Geraniol, Hydroxycitronellal, Linalool, Citronellol, Benzyl Benzoate, Cinnamyl Alcohol, Parfum',
    fuentes: [
      { texto: 'Nivea (web oficial, ficha de NIVEA Creme lata)', url: 'https://nivea.co.za/products/nivea-creme-tin-150ml-60010510006300147.html' },
      { texto: 'Druni (lista en español del pack NIVEA Creme 150 ml)', url: 'https://www.druni.es/lata-100-anos-azul-nivea-pack-body-clasicos' },
    ],
    comprobado: '2026-11-19',
    bueno: [
      'Muy protectora: el aceite mineral, la parafina y la cera forman una capa que frena la pérdida de agua. Es lo que necesita la piel seca o agrietada.',
      'Glicerina y pantenol (provitamina B5) hidratan y calman.',
      'El aceite mineral cosmético está muy purificado y es de los ingredientes que menos alergias dan. No "ahoga" la piel.',
      'Muy barata y dura mucho.',
    ],
    mejorable: [
      'Lleva perfume y siete alérgenos que la ley obliga a declarar (limonene, geraniol, linalool…). Si tienes la piel sensible o atópica, mejor una sin perfume.',
      'El alcohol de lanolina (Eucerit®) puede dar alergia a algunas personas con eccema.',
      'En cara con brillos o granitos puede resultar pesada.',
    ],
    comoUsar: [
      'En cuerpo, manos, codos, rodillas y talones: después de la ducha, con la piel aún algo húmeda.',
      'En la cara, si la tienes seca: por la noche, en poca cantidad.',
      'En días de viento o frío: una capa fina en mejillas y nariz antes de salir.',
    ],
  },
  {
    slug: 'cerave-crema-hidratante',
    nombre: 'CeraVe Crema Hidratante',
    marca: 'CeraVe',
    tipo: 'Crema hidratante de cara y cuerpo',
    resumen: 'Ceramidas, colesterol, glicerina y ácido hialurónico sin perfume. Una de las opciones más completas para piel seca, sensible o atópica.',
    claves: [
      'Lleva 3 ceramidas, colesterol y fitoesfingosina: los mismos tipos de grasas que forman la barrera de la piel.',
      'No lleva perfume: buena opción para piel sensible y atópica.',
      'Textura rica: perfecta en piel seca; en piel grasa puede dejar brillo.',
      'Sirve para cara y cuerpo, también en niños.',
    ],
    inci:
      'Aqua/Water, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Dimethicone, Phenoxyethanol, Behentrimonium Methosulfate, Potassium Phosphate, Ethylhexylglycerin, Sodium Lauroyl Lactylate, Disodium EDTA, Dipotassium Phosphate, Ceramide NP, Ceramide AP, Phytosphingosine, Cholesterol, Xanthan Gum, Carbomer, Sodium Hyaluronate, Tocopherol, Ceramide EOP',
    fuentes: [
      { texto: 'Farmacia Eva Contreras (ficha de CeraVe Crema Hidratante 340 g)', url: 'https://www.farmaciaevacontreras.com/producto/cerave-crema-hidratante-340-ml/' },
    ],
    comprobado: '2026-11-19',
    nota: 'Por debajo del 1 % las marcas pueden ordenar los ingredientes como quieran, así que verás el mismo listado en otro orden según el envase.',
    bueno: [
      'Ceramidas + colesterol + fitoesfingosina: ayudan a reparar la barrera de la piel, que es justo lo que falla en la piel seca y atópica.',
      'Glicerina (segunda en la lista) y ácido hialurónico para retener agua.',
      'Vaselina y aceites ligeros que protegen sin ser tan pesados como un bálsamo.',
      'Sin perfume ni aceites esenciales.',
    ],
    mejorable: [
      'Las ceramidas van al final de la lista: hay poca cantidad, como en casi todas las cremas.',
      'En piel grasa o con muchos granitos puede resultar pesada en la cara. Hay versiones más ligeras de la misma marca.',
      'No tiene "activos" para manchas o arrugas: es una buena hidratante, no un tratamiento.',
    ],
    comoUsar: [
      'Mañana y noche como hidratante, sobre la piel limpia.',
      'Por la mañana, siempre con protector solar encima.',
      'Si usas retinol o ácidos, es una buena crema para calmar la piel después.',
    ],
  },
  {
    slug: 'la-roche-posay-cicaplast-baume-b5',
    nombre: 'La Roche-Posay Cicaplast Baume B5+',
    marca: 'La Roche-Posay',
    tipo: 'Bálsamo reparador',
    resumen: 'Un bálsamo para piel irritada o dañada: pantenol, centella, madecasósido y zinc, sin perfume. Para rescatar la piel, no para el día a día en piel grasa.',
    claves: [
      'Es un bálsamo "de rescate": para piel irritada, rojeces, labios agrietados o después de pasarte con los ácidos.',
      'Pantenol, centella y madecasósido calman; la manteca de karité y las siliconas protegen.',
      'Sin perfume: apto para piel sensible y atópica.',
      'Textura rica y puede dejar un velo blanco: en piel grasa, solo en zonas concretas.',
    ],
    inci:
      'Water, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii Butter, Panthenol, Zea Mays Starch, Propanediol, Butylene Glycol, Cetyl PEG/PPG-10/1 Dimethicone, Trihydroxystearin, Centella Asiatica Leaf Extract, Polymnia Sonchifolia Root Juice, Zinc Gluconate, Madecassoside, Manganese Gluconate, Alpha-Glucan Oligosaccharide, Silica, Aluminum Hydroxide, Magnesium Sulfate, Mannose, Capryloyl Glycine, Caprylyl Glycol, Vitreoscilla Ferment, Citric Acid, Trisodium Ethylenediamine Disuccinate, Lactobacillus, Acetylated Glycol Stearate, Maltodextrin, Polyglyceryl-4 Isostearate, Tocopherol, Pentaerythrityl Tetra-Di-T-Butyl Hydroxyhydrocinnamate, CI 77891',
    fuentes: [
      { texto: 'Skinsort (versión europea de Cicaplast Baume B5+)', url: 'https://skinsort.com/products/la-roche-posay/cicaplast-baume-b5/europe' },
      { texto: 'La Roche-Posay (web oficial: 5 % de pantenol)', url: 'https://www.laroche-posay.us/our-products/body/body-lotion/cicaplast-balm-b5-uv-with-spf-50-set-cicabalmcicabalmuvset.html' },
    ],
    comprobado: '2026-11-19',
    nota: 'La fórmula cambia según el país (la de Estados Unidos, por ejemplo, es distinta). Esta es la versión europea.',
    bueno: [
      'Pantenol al 5 %, según la marca: calma y ayuda a reparar.',
      'Centella asiática y madecasósido, dos calmantes con buena fama en piel irritada.',
      'Siliconas y karité forman una capa que protege mientras la piel se recupera.',
      'Sin perfume. Lleva un complejo de azúcares y fermentos pensado para la flora de la piel.',
    ],
    mejorable: [
      'Textura densa: deja la piel brillante y, a veces, un velo blanco (lleva dióxido de titanio como pigmento).',
      'No es una hidratante para todos los días en piel grasa o mixta.',
      'Si una herida está abierta, infectada o no mejora, toca médico, no bálsamo.',
    ],
    comoUsar: [
      'En zonas irritadas o agrietadas, 1–2 veces al día.',
      'Por la noche, como última capa, si un activo te ha irritado.',
      'En labios cortados y alrededor de la nariz cuando estás resfriada.',
    ],
  },
  {
    slug: 'isdin-fusion-water-magic-spf-50',
    nombre: 'ISDIN Fusion Water MAGIC SPF 50',
    marca: 'ISDIN',
    tipo: 'Protector solar facial',
    resumen: 'Protector solar muy ligero, con buenos filtros de amplio espectro. Ideal para piel mixta o grasa; lleva perfume.',
    claves: [
      'Textura acuosa y ligera: no deja blanco ni sensación grasa.',
      'Combina 5 filtros, entre ellos algunos de los más eficaces y estables que hay en Europa.',
      'Muy bueno para piel mixta y grasa, y bajo el maquillaje.',
      'Lleva perfume: si tu piel es sensible o atópica, hay opciones sin perfume.',
    ],
    inci:
      'Aqua (Water), Dibutyl Adipate, Propanediol, Ethylhexyl Salicylate, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Dimethicone, Butyl Methoxydibenzoylmethane, Phenylbenzimidazole Sulfonic Acid, Silica, Diisopropyl Sebacate, Arginine, Pentylene Glycol, Hydroxyacetophenone, Lauryl PEG/PPG-18/18 Methicone, VP/Eicosene Copolymer, Polysorbate 60, Dimethicone/Vinyl Dimethicone Crosspolymer, Glycerin, Caprylyl Glycol, Hydrated Silica, Tocopheryl Acetate, PEG-10 Dimethicone, Tetrasodium Glutamate Diacetate, Parfum (Fragrance), Sclerotium Gum, Sodium Hyaluronate, Porphyridium Cruentum Extract, Xanthan Gum, Citric Acid',
    fuentes: [
      { texto: 'ISDIN (web oficial, apartado «Composición»)', url: 'https://www.isdin.com/es-AR/producto/fotoprotector-isdin/magic-spf-50' },
      { texto: 'Skinsort (misma lista, verificada)', url: 'https://skinsort.com/products/isdin/fusion-water-magic-spf-50' },
    ],
    comprobado: '2026-11-19',
    nota: 'La lista oficial más completa que hemos encontrado es la de la web de ISDIN para Argentina. Coincide con la de Skinsort; aun así, mira tu envase.',
    bueno: [
      'Filtros de amplio espectro: Tinosorb S (bis-ethylhexyloxyphenol methoxyphenyl triazine) y ethylhexyl triazone son muy estables; la avobenzona protege frente a UVA.',
      'Base de agua con siliconas y sílice: tacto seco y poco brillo.',
      'Algo de hidratación (glicerina, ácido hialurónico) y antioxidantes (vitamina E, microalga).',
    ],
    mejorable: [
      'Lleva perfume.',
      'En piel muy seca se puede quedar corto: ponte antes tu hidratante.',
      'Como todos los protectores, solo protege si usas suficiente (unos dos dedos para cara y cuello) y lo repites.',
    ],
    comoUsar: [
      'Último paso de la rutina de mañana, antes del maquillaje.',
      'Cantidad: dos dedos (índice y corazón) para cara y cuello.',
      'Repite cada 2 horas si estás al sol, y después de bañarte o sudar.',
    ],
  },
  {
    slug: 'deliplus-gel-facial-hidrata-acido-hialuronico',
    nombre: 'Deliplus Gel facial Hidrata con ácido hialurónico',
    marca: 'Deliplus (Mercadona)',
    tipo: 'Gel hidratante para piel normal y grasa',
    resumen: 'Un gel con fórmula corta y eficaz para hidratar sin grasa: ácido hialurónico, glicerina y un complejo de xilitol. Lleva perfume y colorante.',
    claves: [
      'Fórmula corta: casi todo lo que lleva sirve para retener agua en la piel.',
      'Sin aceites: ideal para piel grasa, mixta, verano y debajo del protector solar.',
      'Para piel seca se queda corto: le falta "grasa" que proteja.',
      'Lleva perfume y un colorante azul que solo da color.',
    ],
    inci:
      'Water, Propanediol, Glycerin, Sodium Hyaluronate, Xylitol, Xylitylglucoside, Anhydroxylitol, Caprylyl Glycol, Polysorbate 20, Carbomer, Sodium Polyacrylate Starch, Sodium Benzoate, Sodium Hydroxide, Parfum, CI 42090',
    fuentes: [
      { texto: 'Skinsort (ficha de Deliplus Gel Facial Ácido Hialurónico Hidrata)', url: 'https://skinsort.com/products/deliplus/gel-facial-acido-hialuronico-hidrata-pieles' },
    ],
    comprobado: '2026-11-19',
    nota: 'Mercadona no publica la lista en su web. Esta sale de Skinsort; compárala con tu envase, porque las marcas blancas cambian de fabricante y de fórmula.',
    bueno: [
      'Propanediol, glicerina y ácido hialurónico: hidratantes de los que más funcionan.',
      'Xilitol, xylitylglucoside y anhydroxylitol: un trío que ayuda a la piel a retener su propia agua.',
      'Sin aceites ni siliconas: no deja brillo.',
      'Muy barato para lo que ofrece.',
    ],
    mejorable: [
      'Lleva perfume.',
      'Lleva colorante azul (CI 42090), que no aporta nada a la piel.',
      'En piel seca o en invierno, ponle encima algo más nutritivo.',
    ],
    comoUsar: [
      'Mañana y noche sobre la piel limpia.',
      'Por la mañana, protector solar encima.',
      'En piel seca: úsalo como primera capa y una crema más rica encima.',
    ],
  },
];

export const analisisPorSlug = (s: string) => analisis.find((a) => a.slug === s);
