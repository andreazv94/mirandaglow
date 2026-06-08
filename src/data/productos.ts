// ============================================================
//  BIBLIOTECA CENTRAL DE PRODUCTOS
// ============================================================
//  Este es el ÚNICO sitio donde viven los productos y sus
//  enlaces de afiliado. Si cambias de programa o se rompe un
//  enlace, lo tocas aquí y se actualiza en TODA la web
//  (quiz, artículos del blog, guías...).
//
//  Cada producto tiene:
//   - id:        identificador único (lo usas en el quiz y en MDX)
//   - nombre, categoria, descripcion, precio: para mostrar
//   - tags:      para que el motor del quiz lo seleccione
//   - url:       TU enlace de afiliado (rastreado)
//   - tienda:    de dónde viene la comisión (Sephora, Amazon...)
// ============================================================

export type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  tags: string[];
  url: string;
  tienda: string;
};

export const productos: Record<string, Producto> = {
  limpiador: {
    id: 'limpiador',
    nombre: 'Gel limpiador suave',
    categoria: 'Paso 1 · Limpieza',
    descripcion: 'Limpia sin resecar y respeta la barrera cutánea.',
    precio: '12€',
    tags: ['limpieza', 'todos'],
    url: 'https://ejemplo.com/?aff=TU_ID', // ← sustituye por tu enlace real
    tienda: 'Amazon',
  },
  limpiadorSeca: {
    id: 'limpiadorSeca',
    nombre: 'Bálsamo limpiador nutritivo',
    categoria: 'Paso 1 · Limpieza',
    descripcion: 'Limpieza en crema ideal para pieles secas o sensibles.',
    precio: '16€',
    tags: ['limpieza', 'seca', 'sensible'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
  },
  vitC: {
    id: 'vitC',
    nombre: 'Sérum de vitamina C',
    categoria: 'Paso 2 · Tratamiento AM',
    descripcion: 'Aporta luminosidad y unifica el tono por la mañana.',
    precio: '24€',
    tags: ['tratamiento', 'manchas', 'luz', 'edad'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
  },
  niacin: {
    id: 'niacin',
    nombre: 'Sérum de niacinamida 10%',
    categoria: 'Paso 2 · Tratamiento',
    descripcion: 'Controla los brillos, afina poros y calma rojeces.',
    precio: '15€',
    tags: ['tratamiento', 'acne', 'poros', 'manchas'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Amazon',
  },
  hialu: {
    id: 'hialu',
    nombre: 'Sérum de ácido hialurónico',
    categoria: 'Paso 2 · Tratamiento',
    descripcion: 'Hidratación profunda que rellena y suaviza.',
    precio: '18€',
    tags: ['tratamiento', 'sequedad', 'seca'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
  },
  retinol: {
    id: 'retinol',
    nombre: 'Retinol encapsulado 0,3%',
    categoria: 'Paso 3 · Tratamiento PM',
    descripcion: 'Estimula la renovación celular y suaviza líneas. Solo de noche.',
    precio: '28€',
    tags: ['tratamiento', 'edad'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
  },
  bha: {
    id: 'bha',
    nombre: 'Exfoliante con ácido salicílico',
    categoria: 'Paso 2 · Tratamiento',
    descripcion: 'Desobstruye poros y reduce granitos. 2–3 veces por semana.',
    precio: '14€',
    tags: ['tratamiento', 'acne', 'poros'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Amazon',
  },
  hidra: {
    id: 'hidra',
    nombre: 'Crema hidratante ligera',
    categoria: 'Paso 4 · Hidratación',
    descripcion: 'Sella la hidratación sin sensación grasa.',
    precio: '19€',
    tags: ['hidratacion', 'todos'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Amazon',
  },
  hidraRica: {
    id: 'hidraRica',
    nombre: 'Crema nutritiva reparadora',
    categoria: 'Paso 4 · Hidratación',
    descripcion: 'Textura rica para pieles secas o maduras.',
    precio: '26€',
    tags: ['hidratacion', 'seca', 'edad'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
  },
  spf: {
    id: 'spf',
    nombre: 'Protector solar facial SPF50',
    categoria: 'Paso 5 · Protección AM',
    descripcion: 'El paso antiedad más importante. Cada mañana, sí o sí.',
    precio: '20€',
    tags: ['proteccion', 'todos'],
    url: 'https://ejemplo.com/?aff=TU_ID',
    tienda: 'Sephora',
  },
};

export const getProducto = (id: string): Producto | undefined => productos[id];
