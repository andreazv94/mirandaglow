import { useEffect, useState } from 'react';
import { descargarIcs } from '../lib/ics';

const ZONAS = ['Cara, orejas y cuello', 'Cuero cabelludo (con ayuda o secador)', 'Pecho y tripa (bajo el pecho también)', 'Brazos, axilas, manos y uñas', 'Espalda y nuca (con dos espejos o con ayuda)', 'Glúteos y genitales', 'Piernas, plantas de los pies y entre los dedos'];
type Datos = { ultima?: string; dia?: number };
const K = 'mirandaglow.lunares';
const leer = (): Datos => { try { return JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch { return {}; } };
const fecha = (s: string) => new Date(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Lunares() {
  const [hechas, setHechas] = useState<boolean[]>(ZONAS.map(() => false));
  const [d, setD] = useState<Datos>({});
  const [dia, setDia] = useState(1);
  const [ok, setOk] = useState('');
  useEffect(() => { const x = leer(); setD(x); if (x.dia) setDia(x.dia); }, []);
  const guardar = (x: Datos) => { setD(x); try { localStorage.setItem(K, JSON.stringify(x)); } catch {} };
  const todas = hechas.every(Boolean);
  const dias = d.ultima ? Math.floor((Date.now() - new Date(d.ultima).getTime()) / 864e5) : null;

  function terminar() {
    guardar({ ...d, ultima: new Date().toISOString().slice(0, 10) });
    setHechas(ZONAS.map(() => false));
    setOk('Revisión apuntada. ¡Hasta el mes que viene!');
  }
  function recordatorio() {
    const hoy = new Date();
    const ini = new Date(hoy.getFullYear(), hoy.getMonth() + (hoy.getDate() >= dia ? 1 : 0), dia, 20, 0);
    descargarIcs({ titulo: 'Revisa tus lunares', texto: 'Cinco minutos delante del espejo: busca cambios con la regla ABCDE.', url: 'https://mirandaglow.com/lunares', inicio: ini, repetir: 'MONTHLY', nombreArchivo: 'revisa-tus-lunares.ics' });
    guardar({ ...d, dia });
    setOk('Ábrelo para añadirlo a tu calendario: te avisará cada mes.');
  }

  return (
    <div className="lu">
      <div className="lu-estado">
        {dias === null ? <p>Aún no has apuntado ninguna revisión.</p>
          : <p>Tu última revisión fue el <b>{fecha(d.ultima!)}</b>{dias > 40 ? '. Ya toca otra.' : dias === 0 ? ' (hoy).' : ` (hace ${dias} ${dias === 1 ? 'día' : 'días'}).`}</p>}
      </div>
      <ol className="lu-zonas">
        {ZONAS.map((z, i) => (
          <li key={z}>
            <label className={hechas[i] ? 'on' : ''}>
              <input type="checkbox" checked={hechas[i]} onChange={(e) => setHechas(hechas.map((h, j) => (j === i ? e.target.checked : h)))} />
              {z}
            </label>
          </li>
        ))}
      </ol>
      <div className="lu-acc">
        <button className="btn" disabled={!todas} onClick={terminar}>{todas ? 'Apuntar revisión de hoy' : `Te quedan ${hechas.filter((h) => !h).length} zonas`}</button>
      </div>
      <div className="lu-rec">
        <h3>Que te lo recuerde cada mes</h3>
        <p>Descarga un recordatorio para tu calendario. No te pedimos el email ni nada.</p>
        <div className="lu-fila">
          <label>El día <select value={dia} onChange={(e) => setDia(Number(e.target.value))}>{Array.from({ length: 28 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select> de cada mes, a las 20:00</label>
          <button className="btn ghost" onClick={recordatorio}>Añadir al calendario</button>
        </div>
      </div>
      {ok && <p className="lu-ok" role="status">{ok}</p>}
    </div>
  );
}
