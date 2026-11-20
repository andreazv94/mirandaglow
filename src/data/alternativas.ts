// ============================================================
//  ALTERNATIVAS BARATAS ("DUPES")
// ============================================================
//  Una pareja por página: la crema cara y una más barata que hace
//  algo parecido. Las listas INCI vienen de fuentes públicas (enlace
//  y fecha). El parecido se calcula con el mismo comparador de la web.
//  Nada de "es igual": decimos en qué se parecen y en qué no.
// ============================================================
import { analisisPorSlug } from './analisis';

export type Producto = { nombre: string; marca: string; inci: string; fuente: { texto: string; url: string } };
export type Alternativa = {
  slug: string;
  tipo: string;
  caro: Producto;
  barato: Producto;
  /** si: hace prácticamente lo mismo · casi: lo principal sí, con diferencias · no */
  veredicto: 'si' | 'casi' | 'no';
  resumen: string;
  iguales: string[];
  diferencias: string[];
  /** Cuándo puede merecer la pena la cara */
  merece: string[];
  comprobado: string;
};

const nivea = analisisPorSlug('nivea-creme-lata-azul')!;

export const alternativas: Alternativa[] = [
  {
    slug: 'alternativa-barata-creme-de-la-mer',
    tipo: 'Crema hidratante rica',
    caro: {
      nombre: 'Crème de la Mer', marca: 'La Mer',
      inci: 'Algae Extract, Paraffinum Liquidum, Petrolatum, Glycerin, Isohexadecane, Microcrystalline Wax, Lanolin Alcohol, Citrus Aurantifolia Leaf Extract, Sesamum Indicum Seed Oil, Eucalyptus Globulus Leaf Oil, Sesamum Indicum Seed Powder, Medicago Sativa Seed Powder, Helianthus Annuus Seedcake, Prunus Amygdalus Dulcis Seed Meal, Sodium Gluconate, Potassium Gluconate, Copper Gluconate, Calcium Gluconate, Glycine, Zinc Gluconate, Magnesium Sulfate, Paraffin, Tocopheryl Succinate, Niacin, Water, Beta-Carotene, Decyl Oleate, Aluminum Distearate, Octyldodecanol, Citric Acid, Cyanocobalamin, Magnesium Stearate, Panthenol, Limonene, Geraniol, Linalool, Hydroxycitronellal, Citronellol, Benzyl Salicylate, Citral, Sodium Benzoate, Alcohol Denat., Parfum',
      fuente: { texto: 'SkinSort: La Mer Crème de la Mer', url: 'https://skinsort.com/products/la-mer/blue-heart-creme-de-la-mer' },
    },
    barato: { nombre: nivea.nombre, marca: nivea.marca, inci: nivea.inci, fuente: nivea.fuentes[0] },
    veredicto: 'casi',
    resumen: 'La base es casi la misma: aceite mineral, glicerina, ceras y alcohol de lanolina. La Mer añade un extracto de algas y algunos aceites y vitaminas; la lata azul cuesta muchísimo menos.',
    iguales: [
      'Las dos son cremas oclusivas: aceite mineral (Paraffinum Liquidum), cera microcristalina, parafina y glicerina para que la piel no pierda agua. La Mer añade además vaselina (Petrolatum).',
      'Las dos llevan alcohol de lanolina, pantenol, sulfato de magnesio, ácido cítrico y perfume con alérgenos (limonene, linalool, citronellol…).',
      'Textura muy rica: van bien a piel seca y en invierno, y pueden ser pesadas para piel grasa o con granitos.',
    ],
    diferencias: [
      'La Mer empieza por "Algae Extract", su famoso caldo de algas. El nombre INCI no dice qué algas ni cuánto, y no hay estudios publicados independientes que demuestren que hace más que una buena crema oclusiva.',
      'La Mer añade aceites (sésamo, eucalipto), polvos de semillas y vitaminas (niacina, B12, betacaroteno) en pequeña cantidad.',
      'La Mer lleva algo de alcohol al final de la lista; la lata azul no.',
    ],
    merece: ['Si te encanta su textura y su olor y el precio no te importa. Por resultados en la piel, una crema oclusiva barata hace casi lo mismo.'],
    comprobado: '2026-11-20',
  },
  {
    slug: 'alternativa-barata-skinceuticals-ce-ferulic',
    tipo: 'Sérum de vitamina C',
    caro: {
      nombre: 'C E Ferulic', marca: 'SkinCeuticals',
      inci: 'Aqua, Ethoxydiglycol, Ascorbic Acid, Glycerin, Propylene Glycol, Laureth-23, Phenoxyethanol, Tocopherol, Triethanolamine, Ferulic Acid, Panthenol, Sodium Hyaluronate',
      fuente: { texto: 'Myer: SkinCeuticals C E Ferulic', url: 'https://catalogues.myer.com.au/p/skinceuticals-c-e-ferulic' },
    },
    barato: {
      nombre: '20% Vitamin C + E Ferulic Acid Serum', marca: 'Timeless',
      inci: 'Water, Ethoxydiglycol, Ascorbic Acid, Propylene Glycol, Tocopherol, Polysorbate 80, Panthenol, Ferulic Acid, Sodium Hyaluronate, Benzyl Alcohol, Dehydroacetic Acid',
      fuente: { texto: 'Lanshin: Timeless 20% Vitamin C + E Ferulic Acid', url: 'https://lanshin.com/products/20-vitamin-c-e-ferulic-acid-serum' },
    },
    veredicto: 'si',
    resumen: 'Las dos usan la misma combinación con más estudios detrás: vitamina C pura (ácido ascórbico), vitamina E y ácido ferúlico, con casi los mismos ingredientes de apoyo.',
    iguales: [
      'Vitamina C pura (Ascorbic Acid) + vitamina E (Tocopherol) + ácido ferúlico: la fórmula que se estudió para proteger del daño del sol junto al protector.',
      'Las dos usan etoxidiglicol para ayudar a que la vitamina C penetre, y llevan pantenol y ácido hialurónico.',
      'Ninguna lleva perfume.',
    ],
    diferencias: [
      'SkinCeuticals lleva 15 % de vitamina C; Timeless anuncia 20 %. Más no es siempre mejor: el 20 % puede picar más en piel sensible.',
      'Cambian los conservantes: fenoxietanol en SkinCeuticals; alcohol bencílico y ácido deshidroacético en Timeless.',
      'La vitamina C pura se oxida: si se pone marrón oscuro, ha perdido eficacia. Pasa con las dos.',
    ],
    merece: ['Si tienes piel sensible y el 20 % te pica, el 15 % de SkinCeuticals puede tolerarse mejor. También hay alternativas al 10–15 %.'],
    comprobado: '2026-11-20',
  },
  {
    slug: 'alternativa-barata-paulas-choice-bha-2',
    tipo: 'Exfoliante con ácido salicílico',
    caro: {
      nombre: 'Skin Perfecting 2% BHA Liquid Exfoliant', marca: "Paula's Choice",
      inci: 'Water, Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA, Phenoxyethanol',
      fuente: { texto: "SkinSort: Paula's Choice 2% BHA (UE)", url: 'https://skinsort.com/products/paula-s-choice/skin-perfecting-2-bha-liquid-exfoliant/eu?view=list' },
    },
    barato: {
      nombre: 'Salicylic Acid 2% Solution', marca: 'The Ordinary',
      inci: 'Aqua, Saccharide Isomerate, Cocamidopropyl Dimethylamine, Salicylic Acid, Hydroxyethylcellulose, Polysorbate 20, Citric Acid, Sodium Citrate, Sodium Hydroxide, Phenoxyethanol, Chlorphenesin',
      fuente: { texto: 'Myer: The Ordinary Salicylic Acid 2% Solution', url: 'https://catalogues.myer.com.au/p/the-ordinary-salicylic-acid-2-solution-30ml' },
    },
    veredicto: 'si',
    resumen: 'Las dos llevan un 2 % de ácido salicílico, el máximo habitual en cosmética, para limpiar poros y puntos negros. Cambia la textura y algún ingrediente de apoyo.',
    iguales: [
      '2 % de ácido salicílico (BHA): exfolia por dentro del poro, ayuda con puntos negros, poros y granitos.',
      'Ninguna lleva perfume ni alcohol secante.',
      'Se usan igual: unas noches por semana al empezar, sin juntarlas con retinol o ácidos fuertes la misma noche, y protector solar de día.',
    ],
    diferencias: [
      "Paula's Choice es líquido como un tónico y lleva extracto de té verde (calmante).",
      'The Ordinary es un sérum algo más espeso y lleva sacárido isomerato (hidratante).',
      "Los tamaños son distintos: Paula's Choice suele venderse en 118 ml y The Ordinary en 30 ml. Compara el precio por ml en el comparador.",
    ],
    merece: ['Si prefieres textura de tónico para aplicar con algodón, o si The Ordinary te deja sensación pegajosa.'],
    comprobado: '2026-11-20',
  },
  {
    slug: 'alternativa-barata-paulas-choice-niacinamida-10',
    tipo: 'Sérum de niacinamida',
    caro: {
      nombre: '10% Niacinamide Booster', marca: "Paula's Choice",
      inci: 'Water, Niacinamide, Acetyl Glucosamine, Ascorbyl Glucoside, Butylene Glycol, Phospholipids, Sodium Hyaluronate, Allantoin, Boerhavia Diffusa Root Extract, Glycerin, Dipotassium Glycyrrhizate, Glycyrrhiza Glabra Root Extract, Ubiquinone, Epigallocatechin Gallate, Beta-Glucan, Panthenol, Carnosine, Genistein, Citric Acid, Sodium Citrate, Sodium Hydroxide, Xanthan Gum, Disodium EDTA, Ethylhexylglycerin, Phenoxyethanol',
      fuente: { texto: "SkinSort: Paula's Choice 10% Niacinamide Booster", url: 'https://skinsort.com/products/paula-s-choice/10-niacinamide-booster' },
    },
    barato: {
      nombre: 'Niacinamide 10% + Zinc 1%', marca: 'The Ordinary',
      inci: 'Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin',
      fuente: { texto: 'Beauty Master List: The Ordinary Niacinamide 10% + Zinc 1%', url: 'https://beautymasterlist.com/products/the-ordinary/niacinamide-10-zinc-1' },
    },
    veredicto: 'casi',
    resumen: 'El protagonista es el mismo: 10 % de niacinamida. Paula\'s Choice la rodea de muchos extras calmantes y antioxidantes; The Ordinary añade zinc para la grasa.',
    iguales: [
      '10 % de niacinamida: ayuda con poros, brillos, marcas de granitos y tono desigual, y refuerza la barrera.',
      'Las dos son sérums acuosos sin perfume, para mañana y noche.',
    ],
    diferencias: [
      "Paula's Choice añade acetil glucosamina, un derivado de vitamina C, regaliz y otros antioxidantes en pequeña cantidad.",
      'The Ordinary añade zinc PCA (1 %), útil en piel grasa.',
      'Con el 10 %, algunas pieles notan rojez o picor. Si te pasa, busca una niacinamida al 4–5 %.',
    ],
    merece: ['Si tienes manchas o tono apagado y quieres los extras antioxidantes en el mismo bote. Para poros y brillos, The Ordinary basta.'],
    comprobado: '2026-11-20',
  },
  {
    slug: 'alternativa-barata-vichy-mineral-89',
    tipo: 'Sérum hidratante con ácido hialurónico',
    caro: {
      nombre: 'Minéral 89 Sérum', marca: 'Vichy',
      inci: 'Aqua, Propanediol, Glycerin, PEG/PPG/Polybutylene Glycol-8/5/3 Glycerin, Methyl Gluceth-20, Citric Acid, Hydroxyacetophenone, Sodium Hyaluronate, Biosaccharide Gum-1, Butylene Glycol, Caprylyl Glycol, Carbomer, Maltodextrin',
      fuente: { texto: 'McGrocer: Vichy Minéral 89 (50 ml)', url: 'https://mcgrocer.ca/products/vichy-minral-89-hyaluronic-acid-daily-hydrating-booster-serum-50ml' },
    },
    barato: {
      nombre: 'Hyaluronic Acid 2% + B5', marca: 'The Ordinary',
      inci: 'Water, Sodium Hyaluronate, Propanediol, Pentylene Glycol, Hydrolyzed Hyaluronic Acid, Sodium Hyaluronate Crosspolymer, Phospholipids, Sphingolipids, Panthenol, Ahnfeltiopsis Concinna Extract, Glycerin, Polysorbate 20, Citric Acid, Sodium Citrate, P-Anisic Acid, Tocopherol, Trisodium Ethylenediamine Disuccinate, Caprylyl Glycol, Ethoxydiglycol, Ethylhexylglycerin, Hexylene Glycol, Phenoxyethanol, Chlorphenesin',
      fuente: { texto: 'SkinSort: The Ordinary Hyaluronic Acid 2% + B5', url: 'https://skinsort.com/products/the-ordinary/hyaluronic-acid-2-b5' },
    },
    veredicto: 'casi',
    resumen: 'Las dos son sérums de agua que atraen humedad con ácido hialurónico y glicerina. Vichy apuesta por su agua termal y la glicerina; The Ordinary, por varias formas de hialurónico y pantenol.',
    iguales: [
      'Hidratantes de textura ligera: van debajo de la crema, en cualquier tipo de piel.',
      'Ácido hialurónico (Sodium Hyaluronate), glicerina y propanodiol para retener agua.',
      'Ninguna lleva perfume.',
    ],
    diferencias: [
      'En Vichy el "Aqua" es su agua termal volcánica. Es agradable, pero no hay pruebas sólidas de que sus minerales hagan más que el agua normal en un sérum.',
      'The Ordinary pone el hialurónico en segundo lugar y en varias formas, y añade pantenol (vitamina B5) y lípidos.',
      'Vichy lleva más glicerina y espesantes; The Ordinary es más fluido.',
    ],
    merece: ['Si la textura de Vichy te gusta más o te sienta mejor. Por ingredientes, las dos hidratan de forma parecida.'],
    comprobado: '2026-11-20',
  },
];

export const alternativaPorSlug = (s: string) => alternativas.find((a) => a.slug === s);
