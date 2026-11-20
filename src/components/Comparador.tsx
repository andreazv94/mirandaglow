import { useEffect, useMemo, useState } from 'react';
import { comparar, clasificar, esClave } from '../lib/rutina';
import type { Ingrediente } from '../data/ingredientes';
import { paraTuPiel, type Piel } from '../lib/paraTuPiel';
import { leerCremas, type Crema } from '../lib/cremas';
import { tipoTxt } from '../data/ingredientes';
import { analisis } from '../data/analisis';
import { alternativaPorSlug } from '../data/alternativas';
import EscanerCodigo from './EscanerCodigo';
import { compartirTarjeta } from '../lib/tarjeta';

type Lado = { nombre: string; inci: string; precio: string; ml: string };
const vacio: Lado = { nombre: '', inci: '', precio: '', ml: '' };
type Perfil = { piel?: Piel | null; sensible?: boolean; atopica?: boolean; granitos?: boolean };

const num = (s: string) => { const n = parseFloat(s.replace(',', '.')); return isFinite(n) && n > 0 ? n : 0; };
const eur = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

function Hueco({ letra, lado, set, cremas }: { letra: 'A' | 'B'; lado: Lado; set: (l: Lado) => void; cremas: Crema[] }) {
  const [esc, setEsc] = useState(false);
  const [msg, setMsg] = useState('');
  async function porCodigo(ean: string) {
    setEsc(false); setMsg('Buscando…');
    try {
      const d = await (await fetch(`/api/codigo/${ean}`)).json();
      if (d.encontrado && d.inci) { set({ ...lado, nombre: [d.marca, d.nombre].filter(Boolean).join(' '), inci: d.inci }); setMsg(''); }
      else setMsg('No conocemos ese producto. Pega su lista de ingredientes.');
    } catch { setMsg('No se ha podido buscar. Pega la lista de ingredientes.'); }
  }
  function elegir(v: string) {
    if (v.startsWith('c:')) { const c = cremas.find((x) => x.id === v.slice(2)); if (c) set({ ...lado, nombre: c.nombre, inci: c.inci }); }
    if (v.startsWith('a:')) { const a = analisis.find((x) => x.slug === v.slice(2)); if (a) set({ ...lado, nombre: a.nombre, inci: a.inci }); }
  }
  return (
    <div className="cp-hueco">
      <p className="cp-letra">Crema {letra}</p>
      <input className="cp-nombre" aria-label={`Nombre de la crema ${letra}`} placeholder="Nombre (opcional)" value={lado.nombre} onChange={(e) => set({ ...lado, nombre: e.target.value })} />
      <div className="cp-fuentes">
        <select aria-label={`Elegir crema ${letra}`} value="" onChange={(e) => elegir(e.target.value)}>
          <option value="">Elegir una crema…</option>
          {cremas.length > 0 && <optgroup label="Mis cremas">{cremas.map((c) => <option key={c.id} value={`c:${c.id}`}>{c.nombre}</option>)}</optgroup>}
          <optgroup label="Analizadas en Miranda Glow">{analisis.map((a) => <option key={a.slug} value={`a:${a.slug}`}>{a.nombre}</option>)}</optgroup>
        </select>
        <button type="button" className="btn ghost" onClick={() => setEsc(true)}>Escanear código</button>
      </div>
      <textarea aria-label={`Ingredientes de la crema ${letra}`} rows={5} placeholder="O pega aquí la lista de ingredientes (INCI)" value={lado.inci} onChange={(e) => set({ ...lado, inci: e.target.value })} />
      {msg && <p className="cp-msg" role="status">{msg}</p>}
      <div className="cp-precio">
        <label>Precio <span><input inputMode="decimal" value={lado.precio} onChange={(e) => set({ ...lado, precio: e.target.value })} placeholder="12,95" /> €</span></label>
        <label>Tamaño <span><input inputMode="decimal" value={lado.ml} onChange={(e) => set({ ...lado, ml: e.target.value })} placeholder="50" /> ml</span></label>
      </div>
      {esc && <EscanerCodigo onCodigo={porCodigo} onCerrar={() => setEsc(false)} />}
    </div>
  );
}

export default function Comparador() {
  const [A, setA] = useState<Lado>(vacio);
  const [B, setB] = useState<Lado>(vacio);
  const [cremas, setCremas] = useState<Crema[]>([]);
  const [perfil, setPerfil] = useState<Perfil>({});
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const cs = leerCremas(); setCremas(cs);
    try {
      const p = JSON.parse(localStorage.getItem('mirandaglow.perfil') || 'null');
      const ans = JSON.parse(localStorage.getItem('mirandaglow.answers.v2') || '{}');
      setPerfil(p || { piel: ['seca', 'grasa', 'mixta', 'normal'].includes(ans.tipo) ? ans.tipo : null, sensible: ans.sensible === 'muy' });
    } catch {}
    const q = new URLSearchParams(location.search);
    const lista = q.get('lista');
    const a = q.get('a') && analisis.find((x) => x.slug === q.get('a'));
    const b = q.get('b') && analisis.find((x) => x.slug === q.get('b'));
    const c = q.get('ca') && cs.find((x) => x.id === q.get('ca'));
    if (lista) setA({ ...vacio, nombre: 'Tu crema', inci: lista });
    if (a) setA({ ...vacio, nombre: a.nombre, inci: a.inci });
    if (c) setA({ ...vacio, nombre: c.nombre, inci: c.inci });
    if (b) setB({ ...vacio, nombre: b.nombre, inci: b.inci });
    const al = q.get('alt') && alternativaPorSlug(q.get('alt')!);
    if (al) { setA({ ...vacio, nombre: `${al.caro.marca} ${al.caro.nombre}`, inci: al.caro.inci }); setB({ ...vacio, nombre: `${al.barato.marca} ${al.barato.nombre}`, inci: al.barato.inci }); }
  }, []);

  const listo = A.inci.trim().length > 10 && B.inci.trim().length > 10;
  const r = useMemo(() => (listo ? comparar(A.inci, B.inci) : null), [A.inci, B.inci, listo]);
  const kA = useMemo(() => (listo ? clasificar(A.inci) : null), [A.inci, listo]);
  const kB = useMemo(() => (listo ? clasificar(B.inci) : null), [B.inci, listo]);
  const nA = A.nombre.trim() || 'Crema A', nB = B.nombre.trim() || 'Crema B';
  const tienePerfil = !!(perfil.piel || perfil.sensible || perfil.atopica || perfil.granitos);
  const pA = kA && tienePerfil ? paraTuPiel(kA.filas, perfil.piel ?? null, perfil) : undefined;
  const pB = kB && tienePerfil ? paraTuPiel(kB.filas, perfil.piel ?? null, perfil) : undefined;
  const texA = kA && paraTuPiel(kA.filas, 'normal')?.textura.split(':')[0];
  const texB = kB && paraTuPiel(kB.filas, 'normal')?.textura.split(':')[0];
  const ppA = num(A.precio) && num(A.ml) ? (num(A.precio) / num(A.ml)) * 100 : 0;
  const ppB = num(B.precio) && num(B.ml) ? (num(B.precio) / num(B.ml)) * 100 : 0;

  const frase = !r ? '' : r.parecido >= 0.6 ? 'Hacen cosas muy parecidas' : r.parecido >= 0.3 ? 'Se parecen en parte' : 'Son cremas distintas';
  const pct = r ? Math.round(r.parecido * 100) : 0;
  const barata = ppA && ppB ? (ppA < ppB ? { n: nA, ahorro: 1 - ppA / ppB } : ppB < ppA ? { n: nB, ahorro: 1 - ppB / ppA } : null) : null;
  const clave = (i: Ingrediente) => esClave(i);

  async function compartir() {
    if (!r) return;
    const puntos = [
      { ok: true, t: `Comparten ${r.comunes.filter((c) => clave(c.ing)).length} ${r.comunes.filter((c) => clave(c.ing)).length === 1 ? 'ingrediente clave' : 'ingredientes clave'}` },
      ...(r.soloA.filter(clave).length ? [{ ok: false, t: `Solo ${nA}: ${r.soloA.filter(clave).slice(0, 3).map((i) => i.n).join(', ')}` }] : []),
      ...(r.soloB.filter(clave).length ? [{ ok: false, t: `Solo ${nB}: ${r.soloB.filter(clave).slice(0, 3).map((i) => i.n).join(', ')}` }] : []),
      ...(barata ? [{ ok: true, t: `${barata.n} sale un ${Math.round(barata.ahorro * 100)} % más barata por ml` }] : []),
    ];
    const res = await compartirTarjeta({ titulo: `${nA} vs ${nB}`, veredicto: `${frase} (${pct} %)`, color: r.parecido >= 0.6 ? 'verde' : r.parecido >= 0.3 ? 'naranja' : 'gris', puntos }).catch(() => 'error');
    setAviso(res === 'descargada' ? 'Imagen descargada: súbela a tus redes.' : res === 'error' ? 'No se ha podido crear la imagen.' : '');
  }

  const Lista = ({ l }: { l: Ingrediente[] }) =>
    l.length ? <ul className="cp-ul">{l.map((i) => <li key={i.n} className={clave(i) ? 'k' : ''}>{i.n} <small>{tipoTxt[i.tipo as keyof typeof tipoTxt]}</small></li>)}</ul> : <p className="cp-nada">Nada que destacar.</p>;

  return (
    <div className="cp">
      <div className="cp-dos">
        <Hueco letra="A" lado={A} set={setA} cremas={cremas} />
        <Hueco letra="B" lado={B} set={setB} cremas={cremas} />
      </div>

      {!listo && <p className="cp-ayuda">Pon las dos cremas (de tus cremas guardadas, de nuestros análisis, escaneando el código o pegando la lista) y verás en qué se parecen.</p>}

      {r && kA && kB && (
        <section className="cp-res" aria-live="polite">
          <div className="cp-cab">
            <div className="cp-medidor" role="img" aria-label={`Parecido: ${pct} %`}><i style={{ width: `${Math.max(pct, 3)}%` }} /></div>
            <h2>{frase}</h2>
            <p>Comparten el {pct} % de lo que distingue a cada crema (activos, calmantes, antioxidantes, filtros e hidratantes clave).</p>
            {barata && <p className="cp-precio-res"><b>{barata.n}</b> sale un {Math.round(barata.ahorro * 100)} % más barata por ml ({eur(Math.min(ppA, ppB))} frente a {eur(Math.max(ppA, ppB))} cada 100 ml).</p>}
          </div>

          <div className="cp-tabla" role="table" aria-label="Comparación">
            <div role="row" className="cp-fila cp-th"><span role="columnheader" /><span role="columnheader">{nA}</span><span role="columnheader">{nB}</span></div>
            <div role="row" className="cp-fila"><span role="rowheader">Textura</span><span role="cell">{texA}</span><span role="cell">{texB}</span></div>
            <div role="row" className="cp-fila"><span role="rowheader">Perfume</span><span role="cell">{kA.perfume.length ? 'Sí' : 'No'}</span><span role="cell">{kB.perfume.length ? 'Sí' : 'No'}</span></div>
            <div role="row" className="cp-fila"><span role="rowheader">Activos fuertes</span><span role="cell">{[...kA.retinoides, ...kA.exfoliantes].join(', ') || 'No'}</span><span role="cell">{[...kB.retinoides, ...kB.exfoliantes].join(', ') || 'No'}</span></div>
            {ppA > 0 || ppB > 0 ? <div role="row" className="cp-fila"><span role="rowheader">Precio cada 100 ml</span><span role="cell">{ppA ? eur(ppA) : '—'}</span><span role="cell">{ppB ? eur(ppB) : '—'}</span></div> : null}
            {tienePerfil && <div role="row" className="cp-fila"><span role="rowheader">Para tu piel</span><span role="cell">{pA?.titulo.replace(/ para piel.*$/, '')}</span><span role="cell">{pB?.titulo.replace(/ para piel.*$/, '')}</span></div>}
          </div>
          {!tienePerfil && <p className="cp-nada">Marca tu tipo de piel en el <a href="/ingredientes">lector</a> y aquí verás cuál te va mejor.</p>}

          <div className="cp-tres">
            <div><h3>Lo que comparten</h3>
              {r.comunes.length ? <ul className="cp-ul">{r.comunes.map((c) => <li key={c.n} className={clave(c.ing) ? 'k' : ''}>{c.n} <small>puesto {c.posA} y {c.posB}</small></li>)}</ul> : <p className="cp-nada">Casi nada.</p>}
            </div>
            <div><h3>Solo en {nA}</h3><Lista l={r.soloA} /></div>
            <div><h3>Solo en {nB}</h3><Lista l={r.soloB} /></div>
          </div>
          <p className="cp-nota">En negrita, lo que más cuenta. El puesto dice cuánta cantidad lleva: cuanto más arriba en la lista, más. Orientativo: dos fórmulas parecidas pueden llevar cantidades distintas.</p>
          <div className="cp-acc">
            <button className="btn" onClick={compartir}>Compartir comparación</button>
            {aviso && <span role="status">{aviso}</span>}
          </div>
        </section>
      )}
    </div>
  );
}
