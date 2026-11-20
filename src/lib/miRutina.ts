// ============================================================
//  Mi rutina: ordena las cremas que ya tienes en mañana y noche.
//  Adivina para qué es cada una (por el nombre y los ingredientes)
//  y la persona puede corregirlo.
// ============================================================
import type { Crema, Paso } from './cremas';
import { clasificar } from './rutina';

export const PASOS: { v: Paso; t: string }[] = [
  { v: 'limpiador', t: 'Limpiador' },
  { v: 'tonico', t: 'Tónico o esencia' },
  { v: 'serum', t: 'Sérum' },
  { v: 'contorno', t: 'Contorno de ojos' },
  { v: 'hidratante', t: 'Crema hidratante' },
  { v: 'aceite', t: 'Aceite o bálsamo' },
  { v: 'protector', t: 'Protector solar' },
  { v: 'otro', t: 'No la uso en la cara' },
];
const ORDEN: Paso[] = ['limpiador', 'tonico', 'serum', 'contorno', 'hidratante', 'aceite', 'protector'];

export function adivinarPaso(nombre: string, inci: string): Paso {
  const n = nombre.toLowerCase();
  if (/spf|solar|sun ?screen|fotoprot|protector|fusion water|uv /.test(n)) return 'protector';
  if (/limpia|cleans|espuma|micelar|jab[oó]n|wash|desmaquill/.test(n)) return 'limpiador';
  if (/contorno|eye|ojos/.test(n)) return 'contorno';
  if (/t[oó]nic|toner|esencia|essence/.test(n)) return 'tonico';
  if (/s[ée]rum|booster|ampoll|solution|soluci[oó]n|concentrad|gotas/.test(n)) return 'serum';
  if (/aceite|\boil\b/.test(n)) return 'aceite';
  if (/crema|cream|cr[eè]me|b[aá]lsamo|baume|hidratante|moistur|lotion|loci[oó]n|emulsi/.test(n)) return 'hidratante';
  const k = clasificar(inci);
  if (k.filtro) return 'protector';
  const top = k.filas.slice(0, 6);
  if (top.some((f) => f.ing?.tipo === 'limpiador')) return 'limpiador';
  const grasas = top.filter((f) => f.ing?.tipo === 'emoliente').length;
  if (grasas === 0 && k.funcionales.some((i) => ['activo', 'exfoliante', 'antioxidante'].includes(i.tipo))) return 'serum';
  return 'hidratante';
}

export type Paso2 = { c: Crema; paso: Paso; cuando?: string; nota?: string };
export type Plan = {
  manana: Paso2[];
  noche: Paso2[];
  semana?: { dia: string; t: string }[];
  falta: string[];
  avisos: string[];
};

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function planificar(cremas: Crema[], o: { menor?: boolean; embarazo?: boolean } = {}): Plan {
  const items = cremas.map((c) => {
    const paso = c.paso || adivinarPaso(c.nombre, c.inci);
    const k = clasificar(c.inci);
    return { c, paso, k, ret: k.retinoides.length > 0, exf: k.exfoliantes.length > 0 || k.peroxido, vitc: k.vitc.length > 0 };
  }).filter((x) => x.paso !== 'otro');
  const avisos: string[] = [];
  let usables = items;
  if (o.embarazo && items.some((x) => x.ret)) { avisos.push('Hemos sacado de tu rutina lo que lleva retinoides: no se recomiendan en el embarazo ni la lactancia.'); usables = usables.filter((x) => !x.ret); }
  if (o.menor && items.some((x) => x.ret || x.exf)) { avisos.push('Antes de los 18 no hacen falta retinoides ni ácidos exfoliantes: los hemos dejado fuera.'); usables = usables.filter((x) => !x.ret && !x.exf); }
  const ord = (l: typeof usables) => [...l].sort((a, b) => ORDEN.indexOf(a.paso) - ORDEN.indexOf(b.paso));

  const ret = usables.filter((x) => x.ret);
  const exf = usables.filter((x) => x.exf && !x.ret);
  // Un solo retinoide y un solo exfoliante en la rutina
  const r0 = ret[0], e0 = exf[0];
  if (ret.length > 1) avisos.push(`Tienes ${ret.length} productos con retinoides: usa solo uno (${r0.c.nombre}).`);
  if (exf.length > 1) avisos.push(`Tienes ${exf.length} exfoliantes: con uno basta (${e0.c.nombre}).`);

  let cuandoR = '', cuandoE = '';
  let semana: Plan['semana'];
  if (r0 && e0) {
    cuandoR = 'Lunes y jueves'; cuandoE = 'Miércoles y sábado';
    semana = DIAS.map((d, i) => ({ dia: d, t: [0, 3].includes(i) ? r0.c.nombre : [2, 5].includes(i) ? e0.c.nombre : 'Descanso: solo hidratar' }));
  } else if (r0) {
    cuandoR = 'Lunes, miércoles y viernes (al empezar)';
    semana = DIAS.map((d, i) => ({ dia: d, t: [0, 2, 4].includes(i) ? r0.c.nombre : 'Descanso: solo hidratar' }));
  } else if (e0) {
    cuandoE = 'Lunes, miércoles y viernes';
    semana = DIAS.map((d, i) => ({ dia: d, t: [0, 2, 4].includes(i) ? e0.c.nombre : 'Descanso: solo hidratar' }));
  }

  const fueraNoche = new Set([...ret.slice(1), ...exf.slice(1)].map((x) => x.c.id));
  const manana: Paso2[] = [], noche: Paso2[] = [];
  for (const x of ord(usables)) {
    if (fueraNoche.has(x.c.id)) continue;
    const fuerte = x.ret || x.exf;
    if (x.paso === 'protector') { manana.push({ c: x.c, paso: x.paso, nota: 'El último paso. Dos dedos para cara y cuello.' }); continue; }
    if (x.paso === 'aceite') { noche.push({ c: x.c, paso: x.paso, nota: 'Al final, para sellar.' }); continue; }
    if (fuerte) { noche.push({ c: x.c, paso: x.paso, cuando: x === r0 ? cuandoR : cuandoE, nota: x.ret ? 'Sobre la piel seca, una cantidad como un guisante.' : undefined }); continue; }
    if (x.vitc) { manana.push({ c: x.c, paso: x.paso, nota: 'La vitamina C rinde más por la mañana, debajo del protector.' }); continue; }
    if (x.paso === 'limpiador') { manana.push({ c: x.c, paso: x.paso, nota: 'Por la mañana basta con agua si tienes la piel seca.' }); noche.push({ c: x.c, paso: x.paso }); continue; }
    manana.push({ c: x.c, paso: x.paso }); noche.push({ c: x.c, paso: x.paso });
  }
  const tiene = (p: Paso) => usables.some((x) => x.paso === p);
  const falta: string[] = [];
  if (!tiene('protector')) falta.push('Protector solar: es lo que más previene manchas y arrugas, y es imprescindible si usas retinoides o ácidos.');
  if (!tiene('limpiador')) falta.push('Un limpiador suave para la noche.');
  if (!tiene('hidratante')) falta.push('Una crema hidratante.');
  else if (usables.filter((x) => x.paso === 'hidratante').every((x) => x.ret || x.exf)) falta.push('Una hidratante sencilla para las noches de descanso: la que tienes lleva activos fuertes.');
  return { manana, noche, semana, falta, avisos };
}
