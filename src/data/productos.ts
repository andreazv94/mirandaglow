// ============================================================
//  BIBLIOTECA CENTRAL DE PRODUCTOS
// ============================================================
//  Este es el ÚNICO sitio donde viven los productos y sus
//  enlaces de afiliado. Si cambias de programa o se rompe un
//  enlace, lo tocas aquí y se actualiza en TODA la web.
//
//  Cada producto tiene:
//   - id:          identificador único (lo usas en el quiz y en MDX)
//   - nombre, categoria, descripcion, precio: para mostrar
//   - tags:        para que el motor del quiz lo seleccione
//   - url:         TU enlace de afiliado (rastreado)
//   - tienda:      de dónde viene la comisión (Sephora, Amazon...)
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
  precio: string;
  tags: string[];
  url: string;
  tienda: string;
  momento: Momento;
  frecuencia: string;
  orden: number;
  imagen?: string;
  natural?: boolean; // true si es de cosmética natural / ingredientes naturales
};

export const productos: Record<string, Producto> = {
  limpiador: {
    id: 'limpiador',
    nombre: 'Gel limpiador suave',
    categoria: 'Limpieza',
    descripcion: 'Limpia sin resecar y respeta la barrera cutánea.',
    precio: '12€',
    tags: ['limpieza', 'todos'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Amazon',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 1,
  },
  limpiadorSeca: {
    id: 'limpiadorSeca',
    nombre: 'Bálsamo limpiador nutritivo',
    categoria: 'Limpieza',
    descripcion: 'Limpieza en crema ideal para pieles secas o sensibles.',
    precio: '16€',
    tags: ['limpieza', 'seca', 'sensible'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 1,
    natural: true,
  },
  vitC: {
    id: 'vitC',
    nombre: 'Sérum de vitamina C',
    categoria: 'Tratamiento',
    descripcion: 'Aporta luminosidad y unifica el tono. Antioxidante de día.',
    precio: '24€',
    tags: ['tratamiento', 'manchas', 'luz', 'edad'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
    momento: 'am',
    frecuencia: 'Cada mañana',
    orden: 2,
  },
  niacin: {
    id: 'niacin',
    nombre: 'Sérum de niacinamida 10%',
    categoria: 'Tratamiento',
    descripcion: 'Controla los brillos, afina poros y calma rojeces.',
    precio: '15€',
    tags: ['tratamiento', 'acne', 'poros', 'manchas'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Amazon',
    momento: 'ambos',
    frecuencia: 'Una vez al día',
    orden: 2,
  },
  hialu: {
    id: 'hialu',
    nombre: 'Sérum de ácido hialurónico',
    categoria: 'Tratamiento',
    descripcion: 'Hidratación profunda que rellena y suaviza. Sobre piel húmeda.',
    precio: '18€',
    tags: ['tratamiento', 'sequedad', 'seca'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 2,
    natural: true,
  },
  retinol: {
    id: 'retinol',
    nombre: 'Retinol encapsulado 0,3%',
    categoria: 'Tratamiento',
    descripcion: 'Renueva la piel y suaviza líneas. Introdúcelo poco a poco.',
    precio: '28€',
    tags: ['tratamiento', 'edad'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
    momento: 'pm',
    frecuencia: 'Empieza 2 noches/sem',
    orden: 3,
  },
  bha: {
    id: 'bha',
    nombre: 'Exfoliante con ácido salicílico',
    categoria: 'Tratamiento',
    descripcion: 'Desobstruye poros y reduce granitos.',
    precio: '14€',
    tags: ['tratamiento', 'acne', 'poros'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Amazon',
    momento: 'pm',
    frecuencia: '2-3 noches/sem',
    orden: 3,
  },
  hidra: {
    id: 'hidra',
    nombre: 'Crema hidratante ligera',
    categoria: 'Hidratación',
    descripcion: 'Sella la hidratación sin sensación grasa.',
    precio: '19€',
    tags: ['hidratacion', 'todos'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Amazon',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 4,
  },
  hidraRica: {
    id: 'hidraRica',
    nombre: 'Crema nutritiva reparadora',
    categoria: 'Hidratación',
    descripcion: 'Textura rica para pieles secas o maduras.',
    precio: '26€',
    tags: ['hidratacion', 'seca', 'edad'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
    momento: 'ambos',
    frecuencia: 'Mañana y noche',
    orden: 4,
    natural: true,
  },
  spf: {
    id: 'spf',
    nombre: 'Protector solar facial SPF50',
    categoria: 'Protección',
    descripcion: 'El paso antiedad más importante. Último paso de la mañana.',
    precio: '20€',
    tags: ['proteccion', 'todos'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
    momento: 'am',
    frecuencia: 'Cada mañana, sí o sí',
    orden: 5,
  },
};

export const getProducto = (id: string): Producto | undefined => productos[id];
