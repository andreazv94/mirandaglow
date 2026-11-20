// ============================================================
//  Rutina: qué activos lleva cada crema y si chocan entre ellas.
//  Lo usan "Mis cremas" (avisos) y el comparador.
// ============================================================
import { analizarLista, type Ingrediente } from '../data/ingredientes';

type Fila = { pos: number; texto: string; ing?: Ingrediente };

const RETINOIDE = /retin|adapalene|tretinoin/i;
const PHA = new Set(['Gluconolactone', 'Lactobionic Acid']);
const VITC = new Set(['Ascorbic Acid', '3-O-Ethyl Ascorbic Acid']);
const BARRERA = /ceramide|cholesterol|phytosphingosine|squalane|niacinamide|panthenol|madecassoside|centella/i;
/** Lo que distingue a una crema (no la glicerina, un aceite cualquiera o el perfume). */
export const esClave = (i: Ingrediente) =>
  !GENERICOS.has(i.n) && i.tipo !== 'perfume' && !i.alergeno && (i.tipo !== 'emoliente' || BARRERA.test(i.n)) &&
  !['base', 'textura', 'conservante', 'color'].includes(i.tipo);
const GENERICOS = new Set(['Glycerin', 'Butylene Glycol', 'Propanediol', 'Propylene Glycol', 'Pentylene Glycol', 'Caprylyl Glycol', 'Hexylene Glycol', '1,2-Hexanediol', 'Dipropylene Glycol', 'Sorbitol', 'Ethylhexylglycerin', 'Tocopherol', 'Citric Acid', 'Sodium Hydroxide']);

export type Clasif = {
  filas: Fila[];
  retinoides: string[];
  exfoliantes: string[]; // AHA/BHA (los PHA, muy suaves, no cuentan)
  peroxido: boolean;
  vitc: string[];
  perfume: string[];
  filtro: boolean;
  /** Lo que "hace algo" (no base, textura, conservante ni color) */
  funcionales: Ingrediente[];
};

export function filasDe(inci: string): Fila[] {
  return analizarLista(inci).map((f, i) => ({ pos: i + 1, ...f }));
}

export function clasificar(inci: string): Clasif {
  const filas = filasDe(inci);
  const ings = filas.map((f) => f.ing).filter(Boolean) as Ingrediente[];
  const u = (l: Ingrediente[]) => [...new Set(l.map((i) => i.n))];
  return {
    filas,
    retinoides: u(ings.filter((i) => RETINOIDE.test(i.n))),
    exfoliantes: u(ings.filter((i) => i.tipo === 'exfoliante' && !PHA.has(i.n))),
    peroxido: ings.some((i) => i.n === 'Benzoyl Peroxide'),
    vitc: u(ings.filter((i) => VITC.has(i.n))),
    perfume: u(ings.filter((i) => i.tipo === 'perfume' || i.alergeno)),
    filtro: ings.some((i) => i.tipo === 'filtro'),
    funcionales: ings.filter((i) => !['base', 'textura', 'conservante', 'color'].includes(i.tipo)),
  };
}

export type Perfil = { piel?: string | null; sensible?: boolean; atopica?: boolean; embarazo?: boolean; menor?: boolean };
export type Aviso = { nivel: 'rojo' | 'naranja' | 'info'; titulo: string; texto: string; cremas: string[] };

const y = (l: string[]) => (l.length <= 1 ? l.join('') : `${l.slice(0, -1).join(', ')} y ${l.at(-1)}`);

/** Revisa todas tus cremas juntas: lo que no conviene mezclar o duplicar. */
export function revisarRutina(cremas: { nombre: string; inci: string }[], p: Perfil = {}): Aviso[] {
  const c = cremas.map((x) => ({ nombre: x.nombre, k: clasificar(x.inci) }));
  const con = (f: (k: Clasif) => boolean) => c.filter((x) => f(x.k)).map((x) => x.nombre);
  const ret = con((k) => k.retinoides.length > 0);
  const exf = con((k) => k.exfoliantes.length > 0);
  const per = con((k) => k.peroxido);
  const vitc = con((k) => k.vitc.length > 0);
  const perf = con((k) => k.perfume.length > 0);
  const fuertes = con((k) => k.retinoides.length > 0 || k.exfoliantes.length > 0 || k.peroxido);
  const sol = con((k) => k.filtro);
  const a: Aviso[] = [];

  if (p.embarazo && ret.length)
    a.push({ nivel: 'rojo', titulo: 'Retinoides en el embarazo', texto: 'No se recomiendan durante el embarazo ni la lactancia. Apártalas y consulta a tu médica.', cremas: ret });
  if (p.menor && fuertes.length)
    a.push({ nivel: 'rojo', titulo: 'Activos fuertes antes de los 18', texto: 'A tu edad no hacen falta retinol ni ácidos exfoliantes, y pueden irritar. Con limpiador suave, hidratante y protector solar basta.', cremas: fuertes });
  if (ret.length > 1)
    a.push({ nivel: 'naranja', titulo: 'Retinoide por duplicado', texto: `${y(ret)} llevan retinoides. Con uno es suficiente: dos a la vez solo suman irritación.`, cremas: ret });
  if (exf.length > 1)
    a.push({ nivel: 'naranja', titulo: 'Dos exfoliantes', texto: `${y(exf)} exfolian. Usa solo uno, 2 o 3 noches por semana.`, cremas: exf });
  const retExf = ret.length && exf.some((n) => !ret.includes(n)) ? [...new Set([...ret, ...exf])] : [];
  if (retExf.length)
    a.push({ nivel: 'naranja', titulo: 'Retinoide y ácidos, en noches distintas', texto: 'Juntos la misma noche irritan mucho. Alterna: una noche uno, otra noche el otro, y alguna noche de descanso.', cremas: retExf });
  if (per.length && ret.length)
    a.push({ nivel: 'naranja', titulo: 'Peróxido de benzoilo y retinoide', texto: 'Mejor en momentos distintos (por ejemplo, peróxido por la mañana y retinoide por la noche), salvo que te lo haya pautado tu dermatóloga junto.', cremas: [...new Set([...per, ...ret])] });
  if (vitc.length && fuertes.some((n) => !vitc.includes(n)))
    a.push({ nivel: 'info', titulo: 'Vitamina C por la mañana', texto: 'Deja la vitamina C para la mañana y los retinoides o ácidos para la noche: cada uno funciona mejor así.', cremas: vitc });
  if (fuertes.length >= 3)
    a.push({ nivel: 'naranja', titulo: 'Muchos activos a la vez', texto: `Tienes ${fuertes.length} cremas con activos fuertes. Introduce uno cada vez y deja 4–6 semanas para ver si funciona.`, cremas: fuertes });
  if ((p.sensible || p.atopica) && perf.length >= 2)
    a.push({ nivel: 'naranja', titulo: 'Perfume en varias cremas', texto: `Con tu piel, el perfume es de lo que más reacciones da y aquí se suma en ${perf.length} productos. Busca versiones sin perfume para lo que usas a diario.`, cremas: perf });
  if (fuertes.length && !sol.length)
    a.push({ nivel: 'naranja', titulo: 'Falta protector solar', texto: 'Con retinoides o ácidos la piel es más sensible al sol. Guarda también tu protector para tenerlo controlado.', cremas: fuertes });
  return a;
}

// ---------- Comparar dos cremas ----------
export type Comparacion = {
  comunes: { n: string; posA: number; posB: number; ing: Ingrediente }[];
  soloA: Ingrediente[];
  soloB: Ingrediente[];
  parecido: number; // 0–1, sobre lo que "hace algo"
};

export function comparar(a: string, b: string): Comparacion {
  const A = clasificar(a), B = clasificar(b);
  const posDe = (k: Clasif) => {
    const m = new Map<string, number>();
    for (const f of k.filas) if (f.ing && !m.has(f.ing.n)) m.set(f.ing.n, f.pos);
    return m;
  };
  const pa = posDe(A), pb = posDe(B);
  const fa = new Map(A.funcionales.map((i) => [i.n, i]));
  const fb = new Map(B.funcionales.map((i) => [i.n, i]));
  const comunes = [...fa.values()].filter((i) => fb.has(i.n)).map((i) => ({ n: i.n, posA: pa.get(i.n)!, posB: pb.get(i.n)!, ing: i }));
  comunes.sort((x, z) => x.posA + x.posB - (z.posA + z.posB));
  const soloA = [...fa.values()].filter((i) => !fb.has(i.n));
  const soloB = [...fb.values()].filter((i) => !fa.has(i.n));
  // El parecido se mide en lo que distingue a una crema: activos, calmantes, antioxidantes,
  // filtros e hidratantes "estrella". La glicerina o un aceite cualquiera los lleva casi todo.
  const clave = esClave;
  let ka = [...fa.values()].filter(clave).map((i) => i.n), kb = [...fb.values()].filter(clave).map((i) => i.n);
  if (!ka.length && !kb.length) { ka = [...fa.keys()]; kb = [...fb.keys()]; }
  const sa = new Set(ka), union = new Set([...ka, ...kb]).size;
  const comun = kb.filter((n) => sa.has(n)).length;
  return { comunes, soloA, soloB, parecido: union ? comun / union : 0 };
}
