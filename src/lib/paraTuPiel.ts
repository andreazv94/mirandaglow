// ============================================================
//  "Para tu piel": cómo sentaría una fórmula según el tipo de piel.
//  Orientativo. Se basa en qué ingredientes hay y en qué puesto van
//  (los primeros son los que más cantidad tienen).
// ============================================================
import type { Ingrediente } from '../data/ingredientes';

export type Piel = 'seca' | 'grasa' | 'mixta' | 'normal' | 'sensible';
export const PIELES: { v: Piel; t: string }[] = [
  { v: 'seca', t: 'Seca' }, { v: 'grasa', t: 'Grasa' }, { v: 'mixta', t: 'Mixta' }, { v: 'normal', t: 'Normal' },
  { v: 'sensible', t: 'Atópica o sensible' },
];
export type Punto = { ok: boolean; t: string };
export type Resumen = { tono: 'bien' | 'matices' | 'corta'; titulo: string; textura: string; puntos: Punto[] };

type Fila = { pos: number; ing?: Ingrediente };

// Aceites y mantecas que dan una textura rica
const RICOS = new Set([
  'Butyrospermum Parkii Butter', 'Cera Alba', 'Petrolatum', 'Paraffinum Liquidum', 'Lanolin', 'Cocos Nucifera Oil',
  'Olea Europaea Fruit Oil', 'Ricinus Communis Seed Oil', 'Prunus Amygdalus Dulcis Oil', 'Glycine Soja Oil',
  'Helianthus Annuus Seed Oil', 'Hydrogenated Castor Oil', 'Cetyl Esters',
]);
const BARRERA = new Set(['Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Cholesterol', 'Niacinamide', 'Panthenol', 'Urea', 'Squalane', 'Carthamus Tinctorius Seed Oil']);
const GRASA_Y_GRANITOS = new Set(['Niacinamide', 'Salicylic Acid', 'Zinc PCA', 'Azelaic Acid']);
const FUERTES = new Set(['Salicylic Acid', 'Glycolic Acid', 'Lactic Acid', 'Mandelic Acid', 'Retinol', 'Retinal', 'Benzoyl Peroxide']);
const SULFATOS = new Set(['Sodium Lauryl Sulfate', 'Sodium Laureth Sulfate']);
const ARCILLAS = new Set(['Kaolin', 'Bentonite']);

const lista = (l: Ingrediente[], n = 3) => {
  const u = [...new Set(l.map((i) => i.n))];
  return u.slice(0, n).join(', ') + (u.length > n ? '…' : '');
};

/** extra: avisos que ya salen en el semáforo y que también cuentan aquí (p. ej. perfume en piel sensible). */
export function paraTuPiel(filas: Fila[], piel: Piel, extra: Punto[] = []): Resumen | undefined {
  const con = filas.filter((f) => f.ing) as { pos: number; ing: Ingrediente }[];
  if (!con.length) return;
  const corte = Math.max(6, Math.ceil(filas.length / 3)); // "parte alta" de la lista
  const arriba = con.filter((f) => f.pos <= corte).map((f) => f.ing);
  const todos = con.map((f) => f.ing);
  const hay = (s: Set<string>) => todos.filter((i) => s.has(i.n));

  const hidr = todos.filter((i) => i.tipo === 'hidratante');
  const emolArriba = arriba.filter((i) => i.tipo === 'emoliente' || RICOS.has(i.n));
  const ricosArriba = arriba.filter((i) => RICOS.has(i.n));
  const textura = ricosArriba.length >= 1 && emolArriba.length >= 3 ? 'rica' : emolArriba.length === 0 ? 'ligera' : 'media';
  const barrera = hay(BARRERA);
  const granitos = hay(GRASA_Y_GRANITOS);
  const poros = todos.filter((i) => i.poros);
  const fuertes = hay(FUERTES);
  const alcohol = con.find((f) => f.ing.n === 'Alcohol Denat.' && f.pos <= 5);
  const sulfatos = hay(SULFATOS);
  const arcilla = hay(ARCILLAS);

  const p: Punto[] = [];
  const texturaTxt = {
    rica: 'Textura rica: lleva aceites o mantecas entre los primeros ingredientes.',
    media: 'Textura media: algo de aceite, sin ser pesada.',
    ligera: 'Textura ligera: casi sin aceites.',
  }[textura];

  if (piel === 'seca') {
    if (hidr.length >= 2) p.push({ ok: true, t: `Hidrata: retiene agua en la piel (${lista(hidr)}).` });
    if (textura === 'rica') p.push({ ok: true, t: 'Nutre: los aceites y mantecas son justo lo que le falta a la piel seca.' });
    if (textura === 'ligera') p.push({ ok: false, t: 'Muy ligera para ti: si notas tirantez, pon encima una crema más nutritiva.' });
    if (barrera.length) p.push({ ok: true, t: `Ayuda a reparar la barrera (${lista(barrera)}).` });
    if (alcohol) p.push({ ok: false, t: 'El alcohol va muy arriba: puede resecarte más.' });
    if (sulfatos.length) p.push({ ok: false, t: 'Lleva sulfatos: limpian fuerte y te puede tirar la piel.' });
    if (arcilla.length) p.push({ ok: false, t: 'Lleva arcilla, que absorbe grasa: no la uses a diario.' });
  } else if (piel === 'grasa' || piel === 'mixta') {
    if (piel === 'grasa') {
      if (textura === 'ligera') p.push({ ok: true, t: 'No debería dejarte brillos.' });
      if (textura === 'rica') p.push({ ok: false, t: 'Puede dejarte brillos. Mejor por la noche o solo en zonas secas.' });
    } else {
      if (textura === 'rica') p.push({ ok: false, t: 'Algo rica para la zona T: úsala en mejillas y pon poca en frente, nariz y barbilla.' });
      if (textura === 'ligera') p.push({ ok: true, t: 'Va bien en toda la cara. Si las mejillas tiran, añade algo más nutritivo solo ahí.' });
      if (textura === 'media') p.push({ ok: true, t: 'Suele ir bien en piel mixta.' });
    }
    if (hidr.length) p.push({ ok: true, t: textura === 'rica' ? `Hidrata (${lista(hidr)}).` : `Hidrata sin engrasar: la piel con brillos también necesita agua (${lista(hidr)}).` });
    if (granitos.length) p.push({ ok: true, t: `Ayuda a controlar grasa y granitos (${lista(granitos)}).` });
    if (poros.length) p.push({ ok: false, t: `Puede obstruir poros en algunas pieles (${lista(poros)}).` });
    if (alcohol) p.push({ ok: false, t: 'Mucho alcohol: seca al momento, pero la piel puede producir más grasa después.' });
  } else if (piel === 'sensible') {
    const calma = todos.filter((i) => i.tipo === 'calmante' && !i.sensible);
    const molesta = todos.filter((i) => i.sensible && i.tipo !== 'perfume' && !i.alergeno && i.n !== 'Alcohol Denat.');
    const perfume = todos.filter((i) => i.tipo === 'perfume' || i.alergeno);
    if (perfume.length && !extra.some((e) => e.t.startsWith('Lleva perfume')))
      p.push({ ok: false, t: `Lleva perfume (${lista(perfume)}): es de lo que más reacciones da en piel atópica o sensible.` });
    if (alcohol) p.push({ ok: false, t: 'El alcohol va muy arriba: puede escocer y resecar.' });
    if (sulfatos.length) p.push({ ok: false, t: 'Lleva sulfatos: limpian fuerte y pueden irritar.' });
    if (molesta.length) p.push({ ok: false, t: `Puede molestarte: ${lista(molesta)}.` });
    if (barrera.length) p.push({ ok: true, t: `Ayuda a reparar la barrera, que en tu piel es más débil (${lista(barrera)}).` });
    if (calma.length) p.push({ ok: true, t: `Calma (${lista(calma)}).` });
    if (textura === 'rica') p.push({ ok: true, t: 'Nutritiva: protege una piel que pierde agua con facilidad.' });
    if (textura === 'ligera') p.push({ ok: false, t: 'Muy ligera: en brotes suele hacer falta algo más nutritivo.' });
    const hidrSuave = hidr.filter((i) => !i.sensible);
    if (hidrSuave.length && p.length < 5) p.push({ ok: true, t: `Hidrata (${lista(hidrSuave)}).` });
  } else {
    if (hidr.length) p.push({ ok: true, t: `Hidrata (${lista(hidr)}).` });
    if (barrera.length) p.push({ ok: true, t: `Cuida la barrera (${lista(barrera)}).` });
    if (textura === 'rica') p.push({ ok: true, t: 'Nutritiva: ideal en invierno o por la noche.' });
    if (alcohol) p.push({ ok: false, t: 'El alcohol va muy arriba: puede resecar.' });
    if (sulfatos.length) p.push({ ok: false, t: 'Lleva sulfatos: limpian fuerte.' });
  }
  if (fuertes.length) p.push({ ok: false, t: piel === 'sensible'
    ? `Lleva activos fuertes (${lista(fuertes)}): en piel atópica o sensible, pregunta antes a tu dermatóloga.`
    : `Lleva activos fuertes (${lista(fuertes)}): empieza 2–3 noches por semana y usa protector solar.` });

  p.unshift(...extra);
  const malos = p.filter((x) => !x.ok).length;
  const buenos = p.length - malos;
  const nombre = { seca: 'piel seca', grasa: 'piel grasa', mixta: 'piel mixta', normal: 'piel normal', sensible: 'piel atópica o sensible' }[piel];
  let tono: Resumen['tono'] = malos === 0 && buenos > 0 ? 'bien' : buenos === 0 && malos > 0 ? 'corta' : 'matices';
  // lo que más pesa: la textura
  if (piel === 'grasa' && textura === 'rica') tono = 'corta';
  if (piel === 'seca' && textura === 'ligera' && hidr.length < 2) tono = 'corta';
  if (piel === 'sensible' && (alcohol || fuertes.length || todos.some((i) => i.tipo === 'perfume' || i.alergeno))) tono = 'corta';
  const titulo = {
    bien: `Buena opción para ${nombre}`,
    matices: `Puede ir bien para ${nombre}, con matices`,
    corta: `No es lo ideal para ${nombre}`,
  }[tono];
  if (!p.length) p.push({ ok: true, t: 'Nada en especial a favor ni en contra para tu tipo de piel.' });
  // en piel sensible, primero lo que conviene vigilar
  return { tono, titulo, textura: texturaTxt, puntos: p.slice(0, piel === 'sensible' ? 6 : 5) };
}
