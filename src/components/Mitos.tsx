import { useMemo, useState } from 'react';
import { mitos } from '../data/mitos';

const V = { falso: 'Falso', depende: 'Depende', cierto: 'Cierto' } as const;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const temas = [...new Set(mitos.map((m) => m.tema))];

export default function Mitos() {
  const [q, setQ] = useState('');
  const [tema, setTema] = useState('');
  const lista = useMemo(() => {
    const n = norm(q.trim());
    return mitos.filter((m) => (!tema || m.tema === tema) && (!n || norm(m.mito + ' ' + m.resp).includes(n)));
  }, [q, tema]);
  return (
    <div className="mt">
      <div className="mt-buscar">
        <input type="search" aria-label="Buscar un mito" placeholder="Busca: protector, chocolate, colágeno…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-temas" role="group" aria-label="Temas">
          <button type="button" aria-pressed={!tema} className={!tema ? 'on' : ''} onClick={() => setTema('')}>Todos</button>
          {temas.map((t) => <button type="button" key={t} aria-pressed={tema === t} className={tema === t ? 'on' : ''} onClick={() => setTema(tema === t ? '' : t)}>{t}</button>)}
        </div>
      </div>
      <p className="mt-n" role="status">{lista.length === mitos.length ? `${mitos.length} mitos` : `${lista.length} de ${mitos.length}`}</p>
      {lista.length === 0 && <p className="mt-vacio">No lo tenemos todavía. Prueba con otra palabra.</p>}
      <ul className="mt-lista">
        {lista.map((m) => (
          <li key={m.id} id={m.id} className={`mt-${m.v}`}>
            <span className="mt-v">{V[m.v]}</span>
            <h2>{m.mito}</h2>
            <p>{m.resp}</p>
            <p className="mt-pie">
              Fuente: <a href={m.fuente[1]} target="_blank" rel="noopener">{m.fuente[0]}</a>
              {m.lee && <> · <a href={`/blog/${m.lee}`}>Leer más</a></>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
