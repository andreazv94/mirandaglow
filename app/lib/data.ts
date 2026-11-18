// ============================================================
//  DATOS DE LA APP
// ============================================================
//  La app usa el MISMO motor y catálogo que la web:
//    ../../src/components/quiz-logic.ts  (preguntas + reglas)
//    ../../src/data/productos.ts         (productos y enlaces)
//  Todo se guarda solo en este dispositivo (AsyncStorage /
//  localStorage en web). No se envía nada a ningún servidor.
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildRoutine, type Answers, type Resultado } from '../../src/components/quiz-logic';
import type { Producto } from '../../src/data/productos';

export type { Answers, Resultado, Producto };
export type Moment = 'am' | 'pm';

const K_ANSWERS = 'mirandaglow.answers.v2';
const K_HISTORY = 'mirandaglow.history.v2';
const K_SHELF = 'mirandaglow.shelf.v2';

// ---------- Fechas (hora local) ----------
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// ---------- Respuestas del diagnóstico ----------
export async function loadAnswers(): Promise<Answers | null> {
  const raw = await AsyncStorage.getItem(K_ANSWERS);
  return raw ? (JSON.parse(raw) as Answers) : null;
}
export const saveAnswers = (a: Answers) => AsyncStorage.setItem(K_ANSWERS, JSON.stringify(a));
export const clearAnswers = () => AsyncStorage.removeItem(K_ANSWERS);
export const clearAll = () => AsyncStorage.multiRemove([K_ANSWERS, K_HISTORY, K_SHELF]);

// ---------- Rutina ----------
export type Rutina = { res: Resultado; am: Producto[]; pm: Producto[] };
export function routineFor(a: Answers): Rutina {
  const res = buildRoutine(a);
  const sort = (l: Producto[]) => [...l].sort((x, y) => x.orden - y.orden);
  return {
    res,
    am: sort(res.rutina.filter((p) => p.momento === 'am' || p.momento === 'ambos')),
    pm: sort(res.rutina.filter((p) => p.momento === 'pm' || p.momento === 'ambos' )),
  };
}

// ---------- Historial de pasos hechos ----------
// { '2026-11-18': ['am:limpiador', 'pm:retinol', ...] }
export type History = Record<string, string[]>;
export async function loadHistory(): Promise<History> {
  const raw = await AsyncStorage.getItem(K_HISTORY);
  return raw ? (JSON.parse(raw) as History) : {};
}
export const saveHistory = (h: History) => AsyncStorage.setItem(K_HISTORY, JSON.stringify(h));
export const stepKey = (m: Moment, id: string) => `${m}:${id}`;

const FUERTES = ['retinol', 'aha', 'bha'];

/** Noche de un día concreto: si hay calendario de activos, solo el activo fuerte que toca. */
export function pmFor(r: Rutina, d = new Date()): Producto[] {
  const sem = r.res.semana;
  if (!sem) return r.pm;
  const toca = sem[(d.getDay() + 6) % 7].activo; // 0 = lunes
  return r.pm.filter((p) => !FUERTES.includes(p.id) || p.nombre === toca);
}
export const itemsFor = (r: Rutina, m: Moment, d = new Date()) => (m === 'am' ? r.am : pmFor(r, d));

/** Pasos que cuentan para "rutina completa" ese día (los extras, como los parches, no). */
export const required = (r: Rutina, d = new Date()) => [
  ...r.am.filter((p) => p.orden < 6).map((p) => stepKey('am', p.id)),
  ...pmFor(r, d).filter((p) => p.orden < 6).map((p) => stepKey('pm', p.id)),
];
export const dayComplete = (h: History, r: Rutina, d: Date) => {
  const done = h[dayKey(d)] || [];
  return required(r, d).every((k) => done.includes(k));
};

/** Días seguidos con la rutina completa. Si hoy aún no está hecha, cuenta desde ayer. */
export function streak(h: History, r: Rutina): number {
  let d = new Date();
  if (!dayComplete(h, r, d)) d = addDays(d, -1);
  let n = 0;
  while (n < 3650 && dayComplete(h, r, d)) { n++; d = addDays(d, -1); }
  return n;
}

/** Los últimos 7 días (de más antiguo a hoy) con el % de pasos hechos. */
export function lastWeek(h: History, r: Rutina) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i - 6);
    const req = required(r, d);
    const done = (h[dayKey(d)] || []).filter((k) => req.includes(k)).length;
    return { date: d, pct: req.length ? done / req.length : 0 };
  });
}

// ---------- Estante: productos que ya tiene ----------
export async function loadShelf(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(K_SHELF);
  return raw ? (JSON.parse(raw) as string[]) : [];
}
export const saveShelf = (ids: string[]) => AsyncStorage.setItem(K_SHELF, JSON.stringify([...new Set(ids)]));

// ---------- Cómo aplicar cada paso (modo ritual) ----------
export const howTo: Record<string, string> = {
  Limpieza: 'Masajea unos 30 segundos sobre la piel húmeda y aclara con agua templada. Seca a toquecitos.',
  Tratamiento: 'Dos o tres gotas. Extiende sin frotar y espera un minuto antes del siguiente paso.',
  Contorno: 'Una cantidad como un grano de arroz para los dos ojos. Aplica a toquecitos con el dedo anular, sin arrastrar.',
  Afeitado: 'Después de afeitarte y secar la piel, extiende una capa fina por la zona de la barba.',
  Hidratación: 'Una cantidad como una avellana, de dentro hacia fuera. Incluye el cuello.',
  Protección: 'Dos dedos de producto para cara y cuello. Renuévalo cada 2 horas si te da el sol.',
  Extra: 'Solo si tienes un granito: coloca el parche encima con la piel limpia y seca y déjalo toda la noche.',
};
