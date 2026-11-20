import { useEffect, useMemo, useState } from 'react';
import { FACTORES, FASES, NIVELES, faseEn, iso, patrones, type Ciclo, type Diario, type Entrada } from '../lib/diario';

const K = 'mirandaglow.diario';
const COL = ['#DDF1E7', '#F6E3B4', '#F2B48A', '#E0606F'];
const leer = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
const largo = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

export default function DiarioGranitos() {
  const [d, setD] = useState<Diario>({});
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [dia, setDia] = useState(iso(new Date()));
  const [ok, setOk] = useState('');
  useEffect(() => { setD(leer<Diario>(K, {})); setCiclo(leer<Ciclo | null>('mirandaglow.ciclo', null)); }, []);
  const e: Entrada = d[dia] ?? { g: 0, f: [] };
  const existe = !!d[dia];
  function guardar(n: Entrada) {
    const x = { ...d, [dia]: n }; setD(x);
    try { localStorage.setItem(K, JSON.stringify(x)); } catch {}
    setOk('Guardado');
    setTimeout(() => setOk(''), 1500);
  }
  function borrar() { const x = { ...d }; delete x[dia]; setD(x); try { localStorage.setItem(K, JSON.stringify(x)); } catch {} }
  const p = useMemo(() => patrones(d, ciclo), [d, ciclo]);
  const ult = useMemo(() => Array.from({ length: 35 }, (_, i) => { const x = new Date(); x.setDate(x.getDate() - 34 + i); return iso(x); }), []);
  const fase = faseEn(ciclo, dia);
  const claros = p.factores.filter((f) => f.fuerza >= 0.5);

  return (
    <div className="dg">
      <section className="dg-hoy" aria-labelledby="dg-h">
        <div className="dg-dia">
          <h2 id="dg-h">{dia === iso(new Date()) ? 'Hoy' : largo(dia)}</h2>
          <input type="date" aria-label="Cambiar de día" value={dia} max={iso(new Date())} onChange={(x) => x.target.value && setDia(x.target.value)} />
        </div>
        {fase && <p className="dg-fase">Fase del ciclo: {FASES[fase]}</p>}
        <p className="dg-lab" id="dg-g">¿Cuántos granitos nuevos o inflamados?</p>
        <div className="dg-niv" role="radiogroup" aria-labelledby="dg-g">
          {NIVELES.map((t, i) => (
            <button key={t} type="button" role="radio" aria-checked={existe && e.g === i} className={existe && e.g === i ? 'on' : ''} style={{ ['--c' as string]: COL[i] }} onClick={() => guardar({ ...e, g: i as Entrada['g'] })}>{t}</button>
          ))}
        </div>
        <p className="dg-lab" id="dg-f">¿Ha pasado algo de esto?</p>
        <div className="dg-fac" role="group" aria-labelledby="dg-f">
          {FACTORES.map((f) => {
            const on = e.f.includes(f.id);
            return <label key={f.id} className={on ? 'on' : ''}><input type="checkbox" checked={on} onChange={() => guardar({ ...e, f: on ? e.f.filter((x) => x !== f.id) : [...e.f, f.id] })} />{f.t}</label>;
          })}
        </div>
        <input className="dg-nota" aria-label="Nota" placeholder="Nota (opcional): dónde, qué cambiaste…" value={e.n ?? ''} onChange={(x) => guardar({ ...e, n: x.target.value })} />
        <div className="dg-pie"><span role="status">{ok}</span>{existe && <button type="button" className="dg-borrar" onClick={borrar}>Borrar este día</button>}</div>
      </section>

      <section aria-labelledby="dg-m">
        <h2 id="dg-m">Últimas 5 semanas</h2>
        <div className="dg-mapa">
          {ult.map((x) => (
            <button key={x} type="button" title={`${largo(x)}: ${d[x] ? NIVELES[d[x].g] : 'sin apuntar'}`} aria-label={`${largo(x)}: ${d[x] ? NIVELES[d[x].g] : 'sin apuntar'}`} className={x === dia ? 'sel' : ''} style={{ background: d[x] ? COL[d[x].g] : undefined }} onClick={() => setDia(x)}>{Number(x.slice(8))}</button>
          ))}
        </div>
        <p className="dg-ley">{NIVELES.map((t, i) => <span key={t}><i style={{ background: COL[i] }} />{t}</span>)}</p>
      </section>

      <section className="dg-pat" aria-labelledby="dg-p">
        <h2 id="dg-p">Tus patrones</h2>
        {p.total < 10 ? (
          <p>Llevas {p.total} {p.total === 1 ? 'día' : 'días'} apuntados. A partir de 10 empezamos a buscar patrones; con un mes o más son más fiables.</p>
        ) : (
          <>
            {claros.length ? (
              <ul className="dg-ul">
                {claros.map((f) => (
                  <li key={f.id}><b>{f.t}</b>: en los días siguientes tienes más granitos ({NIVELES[Math.round(f.con)].toLowerCase()} frente a {NIVELES[Math.round(f.sin)].toLowerCase()} el resto). Lo has apuntado {f.n} veces.</li>
                ))}
              </ul>
            ) : <p>De momento no vemos que nada de lo que apuntas vaya unido a más granitos. Sigue apuntando.</p>}
            {p.fases.length > 1 && (
              <div className="dg-fases">
                <h3>Según tu ciclo</h3>
                {p.fases.map((f) => (
                  <div key={f.f} className="dg-barra"><span>{f.t}</span><i style={{ width: `${Math.max(4, (f.m / 3) * 100)}%` }} /><small>{f.n} días</small></div>
                ))}
              </div>
            )}
            {!ciclo && <p className="dg-nota-p">Si apuntas tu ciclo en <a href="/cuenta#ciclo">Mi cuenta</a>, también verás si los granitos van con tu regla.</p>}
            <p className="dg-nota-p">Son pistas, no causas: que dos cosas coincidan no significa que una provoque la otra. Si quieres probar, quita una sola cosa durante 3 o 4 semanas y mira si cambia. Si el acné te preocupa o deja marcas, habla con tu médico.</p>
          </>
        )}
      </section>
    </div>
  );
}
