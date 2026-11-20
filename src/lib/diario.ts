export type Entrada = { g: 0 | 1 | 2 | 3; f: string[]; n?: string };
export type Diario = Record<string, Entrada>; // clave: AAAA-MM-DD
export type Ciclo = { inicio: string; duracion?: number };

export const FACTORES: { id: string; t: string; ventana: number }[] = [
  { id: 'gym', t: 'Entreno o sudé mucho', ventana: 2 },
  { id: 'whey', t: 'Proteína o batido', ventana: 3 },
  { id: 'sueno', t: 'Dormí mal', ventana: 2 },
  { id: 'estres', t: 'Estrés', ventana: 3 },
  { id: 'lacteos', t: 'Muchos lácteos', ventana: 3 },
  { id: 'dulce', t: 'Mucho dulce', ventana: 3 },
  { id: 'alcohol', t: 'Alcohol', ventana: 2 },
  { id: 'maquillaje', t: 'Maquillaje todo el día', ventana: 2 },
  { id: 'nueva', t: 'Crema nueva', ventana: 4 },
  { id: 'tocar', t: 'Me toqué o reventé granitos', ventana: 2 },
];
export const NIVELES = ['Ninguno', 'Alguno', 'Bastantes', 'Muchos'] as const;
export const FASES: Record<string, string> = { menstrual: 'Regla', folicular: 'Después de la regla', ovulacion: 'Ovulación', lutea: 'Antes de la regla' };

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const masDias = (s: string, n: number) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };

export function faseEn(c: Ciclo | null | undefined, dia: string): string | null {
  if (!c?.inicio) return null;
  const dur = Math.min(40, Math.max(21, c.duracion || 28));
  const p = Math.floor((new Date(dia + 'T12:00:00').getTime() - new Date(c.inicio + 'T12:00:00').getTime()) / 864e5);
  if (p < 0) return null;
  const d = (p % dur) + 1, ov = dur - 14;
  return d <= 5 ? 'menstrual' : d < ov - 1 ? 'folicular' : d <= ov + 2 ? 'ovulacion' : 'lutea';
}

export type Patron = { id: string; t: string; con: number; sin: number; n: number; fuerza: number };
const media = (l: number[]) => l.reduce((a, b) => a + b, 0) / l.length;

/** Compara los granitos de los días que siguen a cada factor con los demás días. Solo pistas, no causas. */
export function patrones(d: Diario, ciclo?: Ciclo | null) {
  const dias = Object.keys(d).sort();
  const res: { factores: Patron[]; fases: { f: string; t: string; m: number; n: number }[]; total: number; mediaGen: number } = { factores: [], fases: [], total: dias.length, mediaGen: dias.length ? media(dias.map((x) => d[x].g)) : 0 };
  if (dias.length < 10) return res;
  for (const F of FACTORES) {
    const con: number[] = [], sin: number[] = [];
    let veces = 0;
    for (const dia of dias) {
      if (d[dia].f.includes(F.id)) veces++;
      let expuesto = false;
      for (let k = 0; k <= F.ventana && !expuesto; k++) expuesto = !!d[masDias(dia, -k)]?.f.includes(F.id);
      (expuesto ? con : sin).push(d[dia].g);
    }
    if (veces >= 3 && con.length >= 3 && sin.length >= 3) {
      const a = media(con), b = media(sin);
      res.factores.push({ id: F.id, t: F.t, con: a, sin: b, n: veces, fuerza: a - b });
    }
  }
  res.factores.sort((a, b) => b.fuerza - a.fuerza);
  if (ciclo?.inicio) {
    const por: Record<string, number[]> = {};
    for (const dia of dias) { const f = faseEn(ciclo, dia); if (f) (por[f] ||= []).push(d[dia].g); }
    res.fases = Object.entries(por).filter(([, l]) => l.length >= 2).map(([f, l]) => ({ f, t: FASES[f], m: media(l), n: l.length }));
    res.fases.sort((a, b) => ['menstrual', 'folicular', 'ovulacion', 'lutea'].indexOf(a.f) - ['menstrual', 'folicular', 'ovulacion', 'lutea'].indexOf(b.f));
  }
  return res;
}
