import { useEffect, useRef, useState } from 'react';
import { descargarIcs } from '../lib/ics';

type Lugar = { nombre: string; lat: number; lon: number };
type Datos = { lugar?: Lugar; puesto?: number; hora?: string };
type Hora = { h: number; uv: number };
const K = 'mirandaglow.sol';
const leer = (): Datos => { try { return JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch { return {}; } };
const r2 = (n: number) => Math.round(n * 100) / 100; // ~1 km: no hace falta más precisión

const NIVEL = (uv: number) =>
  uv < 3 ? { t: 'Bajo', c: '#9FD6B4', x: 'Si vas a estar poco rato fuera, con tu hidratante basta. Si pasas horas al aire libre, protector igualmente.' }
  : uv < 6 ? { t: 'Moderado', c: '#F3D46B', x: 'Protector solar en cara, cuello y orejas. Gafas de sol a mediodía.' }
  : uv < 8 ? { t: 'Alto', c: '#F2A65A', x: 'Protector SPF 30 o más, sombra en las horas centrales, gorra y gafas. Renueva cada 2 horas si estás fuera.' }
  : uv < 11 ? { t: 'Muy alto', c: '#E0606F', x: 'SPF 50, evita el sol de las horas centrales, ropa que cubra y renueva cada 2 horas o después de sudar o bañarte.' }
  : { t: 'Extremo', c: '#9B59B6', x: 'Evita el sol en las horas centrales. SPF 50, ropa, gorra y gafas. La piel se quema en pocos minutos.' };

export default function SolDiario() {
  const [d, setD] = useState<Datos>({});
  const [busca, setBusca] = useState('');
  const [opciones, setOpciones] = useState<Lugar[]>([]);
  const [horas, setHoras] = useState<Hora[] | null>(null);
  const [estado, setEstado] = useState('');
  const [ahora, setAhora] = useState(Date.now());
  const [hora, setHora] = useState('08:30');
  const aviso = useRef<number>();

  useEffect(() => { const x = leer(); setD(x); if (x.hora) setHora(x.hora); if (x.lugar) cargar(x.lugar); }, []);
  useEffect(() => { const t = setInterval(() => setAhora(Date.now()), 30000); return () => clearInterval(t); }, []);
  const guardar = (x: Datos) => { setD(x); try { localStorage.setItem(K, JSON.stringify(x)); } catch {} };

  async function cargar(l: Lugar) {
    setEstado('Cargando el índice UV…'); setHoras(null);
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${l.lat}&longitude=${l.lon}&hourly=uv_index&timezone=auto&forecast_days=1`;
      const j = await (await fetch(u)).json();
      setHoras(j.hourly.time.map((t: string, i: number) => ({ h: Number(t.slice(11, 13)), uv: j.hourly.uv_index[i] ?? 0 })));
      setEstado('');
    } catch { setEstado('No hemos podido cargar el índice UV. Prueba de nuevo en un rato.'); }
  }
  function elegir(l: Lugar) { const x = { ...d, lugar: l }; guardar(x); setOpciones([]); setBusca(''); cargar(l); }
  function miUbicacion() {
    if (!navigator.geolocation) return setEstado('Tu navegador no permite usar la ubicación. Busca tu ciudad.');
    setEstado('Buscando dónde estás…');
    navigator.geolocation.getCurrentPosition(
      (p) => elegir({ nombre: 'Tu ubicación', lat: r2(p.coords.latitude), lon: r2(p.coords.longitude) }),
      () => setEstado('No nos has dado permiso. Busca tu ciudad.'),
      { maximumAge: 3600e3, timeout: 10000 },
    );
  }
  async function buscar(ev: React.FormEvent) {
    ev.preventDefault();
    if (busca.trim().length < 2) return;
    setEstado('Buscando…');
    try {
      const j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca.trim())}&count=5&language=es`)).json();
      const l: Lugar[] = (j.results || []).map((r: any) => ({ nombre: [r.name, r.admin1, r.country].filter(Boolean).join(', '), lat: r2(r.latitude), lon: r2(r.longitude) }));
      setOpciones(l); setEstado(l.length ? '' : 'No encontramos esa ciudad.');
    } catch { setEstado('No se ha podido buscar. Prueba de nuevo.'); }
  }

  function mePuse() {
    const t = Date.now(); setAhora(t); guardar({ ...d, puesto: t });
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }
  // Aviso a las 2 horas, mientras la página siga abierta
  useEffect(() => {
    clearTimeout(aviso.current);
    if (!d.puesto) return;
    const falta = d.puesto + 2 * 3600e3 - Date.now();
    if (falta <= 0) return;
    aviso.current = window.setTimeout(() => {
      try { if ('Notification' in window && Notification.permission === 'granted') new Notification('Toca renovar el protector', { body: 'Han pasado 2 horas. Si estás al aire libre, vuelve a ponértelo.', icon: '/img/logo.png' }); } catch {}
      setAhora(Date.now());
    }, falta);
    return () => clearTimeout(aviso.current);
  }, [d.puesto]);

  function recordatorio() {
    const [hh, mm] = hora.split(':').map(Number);
    const ini = new Date(); ini.setHours(hh, mm, 0, 0); if (ini.getTime() < Date.now()) ini.setDate(ini.getDate() + 1);
    descargarIcs({ titulo: 'Protector solar', texto: 'Dos dedos de protector en cara y cuello, también si está nublado.', url: 'https://mirandaglow.com/sol', inicio: ini, minutos: 5, repetir: 'DAILY', nombreArchivo: 'protector-solar.ics' });
    guardar({ ...d, hora });
    setEstado('Ábrelo para añadirlo a tu calendario: te avisará cada día.');
  }

  const dia = horas?.filter((x) => x.h >= 6 && x.h <= 21) ?? [];
  const max = dia.reduce((m, x) => Math.max(m, x.uv), 0);
  const altas = dia.filter((x) => x.uv >= 3);
  const nv = NIVEL(max);
  const hAhora = new Date().getHours();
  const uvAhora = dia.find((x) => x.h === hAhora)?.uv;
  const resto = d.puesto ? Math.min(2 * 3600e3, d.puesto + 2 * 3600e3 - ahora) : 0;
  const hhmm = (ms: number) => { const m = Math.ceil(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };

  return (
    <div className="sd">
      <section className="sd-lugar" aria-labelledby="sd-l">
        <h2 id="sd-l" className="sr-only">Dónde estás</h2>
        <div className="sd-fila">
          <button type="button" className="btn" onClick={miUbicacion}>Usar mi ubicación</button>
          <form onSubmit={buscar} className="sd-busca">
            <input aria-label="Buscar ciudad" placeholder="o busca tu ciudad" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <button className="btn ghost">Buscar</button>
          </form>
        </div>
        {opciones.length > 0 && <ul className="sd-ops">{opciones.map((o) => <li key={o.nombre + o.lat}><button type="button" onClick={() => elegir(o)}>{o.nombre}</button></li>)}</ul>}
        {estado && <p className="sd-estado" role="status">{estado}</p>}
      </section>

      {horas && (
        <section className="sd-uv" aria-labelledby="sd-u">
          <p className="sd-donde">{d.lugar?.nombre} · hoy</p>
          <div className="sd-cab">
            <div className="sd-num" style={{ background: nv.c }}><b>{Math.round(max)}</b><span>UV máx.</span></div>
            <div>
              <h2 id="sd-u">Índice UV {nv.t.toLowerCase()}</h2>
              <p>{altas.length ? `Protégete entre las ${altas[0].h}:00 y las ${altas[altas.length - 1].h + 1}:00.` : 'Hoy el sol pega poco.'}{uvAhora !== undefined && ` Ahora mismo: ${Math.round(uvAhora)}.`}</p>
            </div>
          </div>
          <p className="sd-consejo">{nv.x}</p>
          <div className="sd-barras" role="img" aria-label={`UV por horas: ${dia.map((x) => `${x.h}h ${Math.round(x.uv)}`).join(', ')}`}>
            {dia.map((x) => (
              <div key={x.h} className={x.h === hAhora ? 'ya' : ''}>
                <i style={{ height: `${Math.max(3, (x.uv / Math.max(max, 6)) * 100)}%`, background: NIVEL(x.uv).c }} />
                <small>{x.h}</small>
              </div>
            ))}
          </div>
          <p className="sd-fuente">Datos: <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a>. Previsión orientativa.</p>
        </section>
      )}

      <section className="sd-caja" aria-labelledby="sd-c">
        <h2 id="sd-c">¿Cuánto me pongo?</h2>
        <div className="sd-dedos">
          <p><b>Dos dedos de protector</b> (una línea a lo largo del índice y el corazón) para cara y cuello. Con menos, el SPF real se queda en la mitad o menos. Orejas y nuca también.</p>
        </div>
      </section>

      <section className="sd-caja" aria-labelledby="sd-r">
        <h2 id="sd-r">Renovar</h2>
        {resto > 0 ? (
          <p>Te lo pusiste {2 * 3600e3 - resto < 60000 ? 'ahora mismo' : `hace ${hhmm(2 * 3600e3 - resto)}`}. <b>Renueva en {hhmm(resto)}</b> si sigues al aire libre.{('Notification' in globalThis) && typeof Notification !== 'undefined' && Notification.permission === 'granted' ? ' Te avisaremos si dejas esta página abierta.' : ''}</p>
        ) : d.puesto ? <p><b>Ya toca renovar</b> si estás al aire libre, o después de bañarte o sudar.</p>
          : <p>Si vas a estar fuera, renueva cada 2 horas y después de bañarte o sudar. En la oficina, con ponértelo por la mañana basta.</p>}
        <button type="button" className="btn ghost" onClick={mePuse}>Me lo acabo de poner</button>
      </section>

      <section className="sd-caja" aria-labelledby="sd-a">
        <h2 id="sd-a">Que no se te olvide</h2>
        <p>Un recordatorio diario en tu calendario. Sin email ni apps.</p>
        <div className="sd-fila">
          <label>Cada día a las <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></label>
          <button type="button" className="btn ghost" onClick={recordatorio}>Añadir al calendario</button>
        </div>
      </section>
    </div>
  );
}
