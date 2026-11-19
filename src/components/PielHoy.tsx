import { useEffect, useState } from 'react';
import { buscarCiudad, consejos, nivelUV, tiempoEn, type Lugar, type Tiempo } from '../lib/tiempo';

const K = 'mirandaglow.lugar'; // el mismo que usa la app

export default function PielHoy() {
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [tiempo, setTiempo] = useState<Tiempo | null>(null);
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState<'inicio' | 'cargando' | 'listo' | 'error'>('inicio');
  const [error, setError] = useState('');

  async function cargar(l: Lugar) {
    setEstado('cargando');
    try {
      const t = await tiempoEn(l.lat, l.lon);
      setLugar(l); setTiempo(t); setEstado('listo');
      try { localStorage.setItem(K, JSON.stringify(l)); } catch {}
    } catch {
      setError('No hemos podido consultar el tiempo ahora mismo. Prueba de nuevo en un rato.');
      setEstado('error');
    }
  }

  useEffect(() => {
    try {
      const g = localStorage.getItem(K);
      if (g) cargar(JSON.parse(g));
    } catch {}
  }, []);

  function usarUbicacion() {
    if (!navigator.geolocation) { setError('Tu navegador no permite usar la ubicación. Escribe tu ciudad.'); setEstado('error'); return; }
    setEstado('cargando');
    navigator.geolocation.getCurrentPosition(
      (p) => cargar({ nombre: 'tu zona', lat: p.coords.latitude, lon: p.coords.longitude }),
      () => { setError('No nos has dado permiso para usar tu ubicación. Puedes escribir tu ciudad.'); setEstado('error'); },
      { maximumAge: 3600_000, timeout: 10_000 },
    );
  }
  async function porCiudad(e: React.FormEvent) {
    e.preventDefault();
    if (!ciudad.trim()) return;
    setEstado('cargando');
    try {
      const l = await buscarCiudad(ciudad.trim());
      if (!l) { setError(`No encontramos "${ciudad}". Prueba con el nombre de la ciudad sin abreviar.`); setEstado('error'); return; }
      cargar(l);
    } catch { setError('No hemos podido buscar la ciudad. Prueba de nuevo.'); setEstado('error'); }
  }
  function cambiar() {
    try { localStorage.removeItem(K); } catch {}
    setLugar(null); setTiempo(null); setEstado('inicio');
  }

  const lista = tiempo ? consejos(tiempo) : [];

  return (
    <div className="ph">
      {estado !== 'listo' && (
        <div className="ph-pedir">
          <p>Dinos dónde estás y te decimos cómo cuidar tu piel según el tiempo que hace hoy: sol, viento, frío, sequedad, contaminación y polen.</p>
          <div className="ph-acciones">
            <button className="btn" onClick={usarUbicacion} disabled={estado === 'cargando'}>
              {estado === 'cargando' ? 'Consultando…' : 'Usar mi ubicación'}
            </button>
            <form onSubmit={porCiudad} className="ph-form">
              <label htmlFor="ph-ciudad" className="sr">Tu ciudad</label>
              <input id="ph-ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="o escribe tu ciudad" />
              <button className="btn ghost" type="submit" disabled={estado === 'cargando'}>Ver</button>
            </form>
          </div>
          {estado === 'error' && <p className="ph-error">{error}</p>}
          <p className="ph-priv">Tu ubicación se queda en tu navegador. Solo enviamos la zona aproximada al servicio del tiempo.</p>
        </div>
      )}

      {estado === 'listo' && tiempo && lugar && (
        <div className="ph-res">
          <div className="ph-datos">
            <p className="ph-lugar">Hoy en {lugar.nombre}</p>
            <p className="ph-temp">{tiempo.temp}°</p>
            <dl>
              <div><dt>UV máx.</dt><dd>{String(tiempo.uvMax).replace('.', ',')} ({nivelUV(tiempo.uvMax)})</dd></div>
              <div><dt>Viento</dt><dd>{tiempo.viento} km/h</dd></div>
              <div><dt>Humedad</dt><dd>{tiempo.humedad} %</dd></div>
              {tiempo.aqi != null && <div><dt>Aire</dt><dd>{tiempo.aqi <= 40 ? 'bueno' : tiempo.aqi <= 60 ? 'moderado' : 'malo'}</dd></div>}
            </dl>
            <button className="ph-cambiar" onClick={cambiar}>Cambiar ubicación</button>
          </div>
          <ul className="ph-consejos">
            {lista.map((c) => (
              <li key={c.titulo} className={`ph-${c.nivel}`}>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
