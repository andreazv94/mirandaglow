import { useEffect, useState } from 'react';

type Guia = { titulo: string; tema?: string };
type Rec = { href: string; titulo: string; tipo: string; por: string };
type A = Record<string, string | string[] | undefined>;

const HERR: Record<string, { t: string; d: string }> = {
  '/diario': { t: 'Diario de granitos', d: 'Herramienta' },
  '/sol': { t: 'El sol de hoy', d: 'Herramienta' },
  '/lunares': { t: 'Revisa tus lunares', d: 'Herramienta' },
  '/comparar': { t: 'Comparar cremas', d: 'Herramienta' },
  '/alternativas': { t: 'Alternativas baratas', d: 'Comparativas' },
  '/ingredientes': { t: 'Lector de ingredientes', d: 'Herramienta' },
};

function recomendar(raw: A, g: Record<string, Guia>): Rec[] {
  const pr = Array.isArray(raw.problemas) ? raw.problemas : raw.problemas ? [raw.problemas] : [];
  const a = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])) as Record<string, string | undefined>;
  const out: Rec[] = [];
  const add = (href: string, por: string) => {
    if (out.some((r) => r.href === href)) return;
    if (href.startsWith('/blog/')) { const x = g[href.slice(6)]; if (x) out.push({ href, titulo: x.titulo, tipo: x.tema || 'Guía', por }); }
    else if (HERR[href]) out.push({ href, titulo: HERR[href].t, tipo: HERR[href].d, por });
  };
  if (a.edad === '15') add('/blog/skincare-adolescentes', 'Por tu edad');
  if (a.hormonas === 'embarazo' || a.hormonas === 'lactancia') add('/blog/skincare-embarazo-lactancia', 'Por tu momento hormonal');
  if (a.hormonas === 'menopausia') add('/blog/piel-menopausia', 'Por tu momento hormonal');
  const M: [string, string, string][] = [
    ['acne', '/blog/rutina-piel-acne', 'Porque quieres mejorar los granitos'],
    ['acne', '/diario', 'Para descubrir qué te provoca los granitos'],
    ['cuerpo', '/blog/acne-espalda-pecho-gimnasio', 'Por los granitos en el cuerpo'],
    ['rojeces', '/blog/rutina-rosacea-piel-reactiva', 'Por las rojeces'],
    ['manchas', '/blog/manchas-sol-melasma', 'Por las manchas'],
    ['manchas', '/sol', 'Con manchas, el sol es lo primero'],
    ['marcas', '/blog/marcas-cicatrices-acne', 'Por las marcas de granitos'],
    ['poros', '/blog/rutina-piel-grasa', 'Por los poros y puntos negros'],
    ['lineas', '/blog/rutina-antiedad', 'Por las líneas'],
    ['firmeza', '/blog/rutina-antiedad', 'Por la firmeza'],
    ['ojeras', '/blog/ojeras-y-bolsas', 'Por las ojeras'],
    ['luz', '/blog/vitamina-c-skincare', 'Para una piel con más luz'],
    ['textura', '/blog/como-introducir-activos', 'Por la textura'],
    ['descamacion', '/blog/dermatitis-seborreica', 'Por la descamación'],
    ['afeitado', '/blog/rutina-skincare-hombre', 'Por la irritación del afeitado'],
    ['deshidratacion', '/blog/tipos-de-piel', 'Por la tirantez'],
  ];
  for (const [p, h, por] of M) if (pr.includes(p)) add(h, por);
  if (a.hormonas === 'irregular' || a.hormonas === 'regular' || a.fase) add('/blog/piel-ciclo-menstrual', 'Porque tu piel cambia con el ciclo');
  if (a.spf !== 'si') add('/sol', 'Porque aún no usas protector a diario');
  if (a.lunares === 'cambio') add('/lunares', 'Un lunar que cambia: revísalo y pide cita');
  if (a.lunares === 'muchos' || a.sol === 'I') add('/lunares', 'Por tus lunares o tu piel clara');
  if (a.sensible === 'muy') add('/blog/rutina-rosacea-piel-reactiva', 'Porque tu piel reacciona fácil');
  if (a.experiencia === 'novata') add('/blog/rutina-principiantes', 'Para empezar con buen pie');
  add('/alternativas', 'Antes de gastar en una crema cara');
  add('/comparar', 'Antes de comprar tu próxima crema');
  add('/ingredientes', 'Para revisar lo que ya tienes');
  return out.slice(0, 6);
}

export default function ParaTi({ guias }: { guias: Record<string, Guia> }) {
  const [recs, setRecs] = useState<Rec[] | null>(null);
  useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem('mirandaglow.answers.v2') || '{}');
      if (a && (a.tipo || a.problemas)) setRecs(recomendar(a, guias)); else setRecs([]);
    } catch { setRecs([]); }
  }, []);
  if (recs === null) return <div className="pt-hueco" />;
  if (!recs.length) return (
    <div className="pt-vacio">
      <p>Haz el test de piel (son 2 minutos) y aquí te recomendaremos guías y herramientas para tu piel: tus granitos, tus manchas, tu ciclo, tu afeitado…</p>
      <a className="btn" href="/test">Hacer el test</a>
    </div>
  );
  return (
    <>
      <ul className="pt-lista">
        {recs.map((r) => (
          <li key={r.href}>
            <a href={r.href}>
              <span className="pt-por">{r.por}</span>
              <span className="pt-tit">{r.titulo}</span>
              <span className="pt-tipo">{r.tipo}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="pt-pie">Según tu test. <a href="/test">Repetirlo</a></p>
    </>
  );
}
