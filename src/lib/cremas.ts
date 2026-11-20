// Mis cremas: las que has analizado y guardado. Se guardan en este
// navegador y, si tienes cuenta, también en ella (ver /js/cuenta.js).
export type Paso = 'limpiador' | 'tonico' | 'serum' | 'contorno' | 'hidratante' | 'aceite' | 'protector' | 'otro';
export type Crema = { id: string; nombre: string; inci: string; fecha: string; veredicto?: string; paso?: Paso };
const K = 'mirandaglow.cremas';

export function leerCremas(): Crema[] {
  try { return JSON.parse(localStorage.getItem(K) || '[]'); } catch { return []; }
}
export function guardarCremas(l: Crema[]) {
  try { localStorage.setItem(K, JSON.stringify(l)); } catch {}
}
export function anadirCrema(c: Omit<Crema, 'id' | 'fecha'>): Crema {
  const nueva = { ...c, id: Math.random().toString(36).slice(2, 10), fecha: new Date().toISOString().slice(0, 10) };
  guardarCremas([nueva, ...leerCremas()]);
  return nueva;
}
export const borrarCrema = (id: string) => guardarCremas(leerCremas().filter((c) => c.id !== id));
export const cambiarPaso = (id: string, paso: Paso) => guardarCremas(leerCremas().map((c) => (c.id === id ? { ...c, paso } : c)));
