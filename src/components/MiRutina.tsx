import { useEffect, useMemo, useState } from 'react';
import { anadirCrema, borrarCrema, cambiarPaso, leerCremas, type Crema, type Paso } from '../lib/cremas';
import { PASOS, adivinarPaso, planificar, type Paso2 } from '../lib/miRutina';
import { revisarRutina } from '../lib/rutina';

const nombrePaso = (p: Paso) => PASOS.find((x) => x.v === p)?.t ?? p;
const leer = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };

function Columna({ t, l, vacio }: { t: string; l: Paso2[]; vacio: string }) {
  return (
    <section className="mr-col" aria-label={t}>
      <h2>{t}</h2>
      {l.length ? (
        <ol>
          {l.map((x) => (
            <li key={x.c.id}>
              <span className="mr-paso">{nombrePaso(x.paso)}</span>
              <b>{x.c.nombre}</b>
              {x.cuando && <span className="mr-cuando">{x.cuando}</span>}
              {x.nota && <small>{x.nota}</small>}
            </li>
          ))}
        </ol>
      ) : <p className="mr-vacio">{vacio}</p>}
    </section>
  );
}

export default function MiRutina() {
  const [cremas, setCremas] = useState<Crema[]>([]);
  const [o, setO] = useState<{ menor?: boolean; embarazo?: boolean; sensible?: boolean; atopica?: boolean }>({});
  const [nombre, setNombre] = useState('');
  const [inci, setInci] = useState('');
  const [listo, setListo] = useState(false);
  useEffect(() => {
    setCremas(leerCremas());
    const p = leer<Record<string, unknown>>('mirandaglow.perfil', {});
    const a = leer<Record<string, unknown>>('mirandaglow.answers.v2', {});
    const uno = (v: unknown) => (Array.isArray(v) ? v[0] : v);
    setO({
      menor: !!p.menor || uno(a.edad) === '15',
      embarazo: !!p.embarazo || ['embarazo', 'lactancia'].includes(String(uno(a.hormonas))),
      sensible: !!p.sensible || uno(a.sensible) === 'muy',
      atopica: !!p.atopica,
    });
    setListo(true);
  }, []);
  const plan = useMemo(() => planificar(cremas, o), [cremas, o]);
  const choques = useMemo(() => (cremas.length > 1 ? revisarRutina(cremas.filter((c) => c.paso !== 'otro'), o).filter((x) => x.nivel !== 'info' && !(x.titulo.startsWith('Falta protector') && cremas.some((c) => (c.paso || adivinarPaso(c.nombre, c.inci)) === 'protector'))) : []), [cremas, o]);

  function paso(id: string, p: Paso) { cambiarPaso(id, p); setCremas(leerCremas()); }
  function quitar(id: string) { borrarCrema(id); setCremas(leerCremas()); }
  function anadir(e: React.FormEvent) {
    e.preventDefault();
    if (inci.trim().length < 10 && nombre.trim().length < 2) return;
    anadirCrema({ nombre: nombre.trim() || 'Crema sin nombre', inci: inci.trim() });
    setNombre(''); setInci(''); setCremas(leerCremas());
  }

  if (!listo) return <div style={{ minHeight: 300 }} />;
  return (
    <div className="mr">
      <section className="mr-mis" aria-labelledby="mr-m">
        <h2 id="mr-m">Lo que tienes</h2>
        {cremas.length ? (
          <ul>
            {cremas.map((c) => (
              <li key={c.id}>
                <b>{c.nombre}</b>
                <label>
                  <span className="sr-only">Para qué la usas</span>
                  <select value={c.paso || adivinarPaso(c.nombre, c.inci)} onChange={(e) => paso(c.id, e.target.value as Paso)}>
                    {PASOS.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
                  </select>
                </label>
                <button type="button" className="mr-x" aria-label={`Quitar ${c.nombre}`} onClick={() => quitar(c.id)}>Quitar</button>
              </li>
            ))}
          </ul>
        ) : <p className="mr-vacio">Aún no tienes cremas guardadas. Añade las que usas aquí abajo o desde el <a href="/ingredientes">lector</a>.</p>}
        <p className="mr-ayuda">Hemos adivinado para qué es cada una. Si no acertamos, cámbialo en el desplegable.</p>
        <form className="mr-add" onSubmit={anadir}>
          <input aria-label="Nombre de la crema" placeholder="Nombre (ej. Gel limpiador CeraVe)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <textarea aria-label="Ingredientes" rows={2} placeholder="Pega sus ingredientes (opcional, pero así revisamos los activos)" value={inci} onChange={(e) => setInci(e.target.value)} />
          <button className="btn ghost">Añadir</button>
        </form>
      </section>

      {cremas.length > 0 && (
        <>
          {(plan.avisos.length > 0 || choques.length > 0) && (
            <div className="mr-avisos" role="note">
              {plan.avisos.map((t) => <p key={t}>{t}</p>)}
              {choques.map((a) => <p key={a.titulo}><b>{a.titulo}.</b> {a.texto}</p>)}
            </div>
          )}
          <div className="mr-dos">
            <Columna t="Mañana" l={plan.manana} vacio="Nada por la mañana todavía." />
            <Columna t="Noche" l={plan.noche} vacio="Nada por la noche todavía." />
          </div>
          {plan.semana && (
            <section className="mr-sem" aria-labelledby="mr-s">
              <h2 id="mr-s">Tus noches de la semana</h2>
              <ul>{plan.semana.map((d) => <li key={d.dia} className={d.t.startsWith('Descanso') ? 'des' : ''}><span>{d.dia}</span>{d.t}</li>)}</ul>
              <p className="mr-ayuda">Si la piel se te irrita, quita una noche. Si la toleras bien tras un mes, puedes sumar una.</p>
            </section>
          )}
          {plan.falta.length > 0 && (
            <section className="mr-falta" aria-labelledby="mr-f">
              <h2 id="mr-f">Te falta</h2>
              <ul>{plan.falta.map((t) => <li key={t}>{t}</li>)}</ul>
              <p><a href="/alternativas">Mira alternativas baratas</a> o <a href="/test">haz el test</a> para saber qué tipo te va.</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
