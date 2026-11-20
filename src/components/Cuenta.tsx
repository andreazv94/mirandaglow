import { useEffect, useState } from 'react';
import { fases, questions, type Answers } from './quiz-logic';
import { borrarCrema, leerCremas, type Crema } from '../lib/cremas';
import { revisarRutina } from '../lib/rutina';

type Estado = {
  usuario: { email: string; nombre: string | null; creado: number } | null;
  google?: boolean;
  email?: boolean;
  sinConexion?: boolean;
};
type Ciclo = { inicio: string; duracion: number };

declare global {
  interface Window { MGCuenta?: { estado: Promise<Estado>; salir: () => Promise<void>; olvidarLocal: () => void; subirAhora: () => void } }
}

const ERRORES: Record<string, string> = {
  'sin-consentimiento': 'Para crear tu cuenta tienes que aceptar que guardemos tus datos de piel. Marca la casilla y vuelve a intentarlo.',
  google: 'No hemos podido entrar con Google. Vuelve a intentarlo.',
  'google-no-disponible': 'El acceso con Google aún no está activado. Vuelve muy pronto.',
  'enlace-caducado': 'Este enlace ya se ha usado o ha caducado. Pide uno nuevo.',
  espera: 'Ya te hemos enviado un enlace hace un momento. Espera un minuto y mira también en spam.',
  email: 'Revisa el email: parece que tiene algún error.',
  'email-fallo': 'No hemos podido enviar el email. Prueba con Google o vuelve a intentarlo en un rato.',
  'email-no-disponible': 'El acceso por email aún no está activado. Entra con Google.',
  servidor: 'Algo ha fallado por nuestra parte. Vuelve a intentarlo.',
};

const leerJSON = <T,>(k: string, def: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; }
};
const escribirJSON = (k: string, v: unknown) => {
  try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

// Texto de una respuesta del test
function respuesta(a: Answers, id: string): string | undefined {
  const q = questions.find((x) => x.id === id);
  const v = a[id];
  if (!q || !v) return;
  const l = (Array.isArray(v) ? v : [v]).map((x) => q.opts.find((o) => o.v === x)?.t).filter(Boolean);
  return l.join(', ') || undefined;
}

// Fase del ciclo para hoy
function faseHoy(c: Ciclo) {
  const hoy = new Date(); hoy.setHours(12, 0, 0, 0);
  const ini = new Date(c.inicio + 'T12:00:00');
  const dur = Math.min(40, Math.max(21, c.duracion || 28));
  const pasados = Math.floor((hoy.getTime() - ini.getTime()) / 864e5);
  if (pasados < 0) return null;
  const dia = (pasados % dur) + 1;
  const ov = dur - 14; // la ovulación suele ser 14 días antes de la siguiente regla
  const f = dia <= 5 ? 'menstrual' : dia < ov - 1 ? 'folicular' : dia <= ov + 2 ? 'ovulacion' : 'lutea';
  const proxima = new Date(ini.getTime() + (Math.floor(pasados / dur) + 1) * dur * 864e5);
  return { dia, dur, f, proxima };
}
const fechaCorta = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

export default function Cuenta() {
  const [estado, setEstado] = useState<Estado | undefined>();
  const [consiento, setConsiento] = useState(false);
  const [email, setEmail] = useState('');
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [perfil, setPerfil] = useState<Record<string, unknown> | null>(null);
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [cremas, setCremas] = useState<Crema[]>([]);
  const [borrar, setBorrar] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const err = q.get('error');
    const motivo = q.get('motivo');
    if (err) setAviso({ tipo: 'error', texto: (ERRORES[err] || ERRORES.servidor) + (motivo ? ` (código: ${motivo.replace(/[^a-z_-]/gi, '')})` : '') });
    if (q.get('borrada')) setAviso({ tipo: 'ok', texto: 'Tu cuenta y todos tus datos se han borrado.' });
    if (q.get('bienvenida')) setAviso({ tipo: 'ok', texto: 'Ya estás dentro. Lo que tenías en este navegador se ha guardado en tu cuenta.' });
    setToken(q.get('token'));
    if (err || q.get('bienvenida') || q.get('borrada')) history.replaceState(null, '', '/cuenta' + location.hash);

    let vivo = true;
    const esperar = () => {
      if (window.MGCuenta) window.MGCuenta.estado.then((e) => vivo && setEstado(e));
      else setTimeout(esperar, 50);
    };
    esperar();
    return () => { vivo = false; };
  }, []);

  // Datos de este navegador (ya juntados con la cuenta si la hay)
  useEffect(() => {
    if (estado === undefined) return;
    setAnswers(leerJSON<Answers | null>('mirandaglow.answers.v2', null));
    setPerfil(leerJSON('mirandaglow.perfil', null));
    setCiclo(leerJSON<Ciclo | null>('mirandaglow.ciclo', null));
    setCremas(leerCremas());
  }, [estado]);

  const dentro = !!estado?.usuario;

  async function pedirEnlace(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true); setAviso(null);
    const r = await fetch('/api/auth/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, consentimiento: consiento }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : { error: 'servidor' };
    setEnviando(false);
    if (r?.ok) {
      if (d.enlace) { location.href = d.enlace; return; } // solo en pruebas locales
      setAviso({ tipo: 'ok', texto: `Te hemos enviado un enlace a ${email}. Ábrelo en este mismo navegador. Si no llega en un par de minutos, mira en spam.` });
    } else setAviso({ tipo: 'error', texto: ERRORES[d.error] || ERRORES.servidor });
  }

  async function usarEnlace() {
    setEnviando(true);
    const r = await fetch('/api/auth/email/entrar', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : { error: 'servidor' };
    if (r?.ok) { location.replace('/cuenta?bienvenida=1'); return; }
    setEnviando(false); setToken(null);
    history.replaceState(null, '', '/cuenta');
    setAviso({ tipo: 'error', texto: ERRORES[d.error] || ERRORES.servidor });
  }

  function guardarCiclo(c: Ciclo | null) {
    setCiclo(c); escribirJSON('mirandaglow.ciclo', c); window.MGCuenta?.subirAhora();
  }
  function quitarCrema(id: string) {
    borrarCrema(id); setCremas(leerCremas()); window.MGCuenta?.subirAhora();
  }
  async function salir() {
    await window.MGCuenta?.salir();
    location.replace('/cuenta');
  }
  async function borrarCuenta() {
    const r = await fetch('/api/cuenta', { method: 'DELETE' }).catch(() => null);
    if (r?.ok) { window.MGCuenta?.olvidarLocal(); location.replace('/cuenta?borrada=1'); }
    else setAviso({ tipo: 'error', texto: ERRORES.servidor });
  }
  function olvidarAqui() {
    window.MGCuenta?.olvidarLocal();
    try { localStorage.removeItem('mirandaglow.lugar'); } catch {}
    location.reload();
  }

  if (estado === undefined) return <p className="cu-cargando">Cargando…</p>;

  // ---------- Entrar con el enlace del email ----------
  if (token && !dentro) {
    return (
      <div className="cu-caja cu-centro">
        <h2>Entrar en Miranda Glow</h2>
        <p>Pulsa el botón para terminar de entrar en tu cuenta.</p>
        <button className="btn" onClick={usarEnlace} disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </div>
    );
  }

  const fh = ciclo ? faseHoy(ciclo) : null;
  const avisos = cremas.length ? revisarRutina(cremas, {
    sensible: !!perfil?.sensible || answers?.sensible === 'muy',
    atopica: !!perfil?.atopica,
    embarazo: !!perfil?.embarazo || answers?.hormonas === 'embarazo' || answers?.hormonas === 'lactancia',
    menor: answers?.edad === '15',
  }) : [];
  const conCiclo = answers?.sexo !== 'hombre';
  const nombreTipo = respuesta(answers || {}, 'tipo');

  return (
    <div className="cu">
      {aviso && <p className={`cu-aviso cu-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}

      {/* ---------- Arriba: dentro / fuera ---------- */}
      {dentro ? (
        <div className="cu-hola">
          <div>
            <h2>Hola{estado.usuario!.nombre ? `, ${estado.usuario!.nombre}` : ''}</h2>
            <p>Todo se guarda en tu cuenta ({estado.usuario!.email}) y lo tienes en la web y en la app.</p>
          </div>
          <button className="btn ghost" onClick={salir}>Salir</button>
        </div>
      ) : (
        <div className="cu-opciones">
          <div className="cu-op">
            <h2>Sin cuenta</h2>
            <p>Es como lo estás usando ahora. Tu test, tu piel y tus cremas se guardan solo en este navegador. Si cambias de móvil o lo borras, se pierden.</p>
            <a className="cu-link" href="#mi-piel">Ver lo que tengo guardado aquí</a>
          </div>
          <div className="cu-op cu-op-cuenta">
            <h2>Con cuenta</h2>
            <p>Lo mismo, pero guardado: entras desde cualquier móvil u ordenador, en la web y en la app. Lo que ya tienes aquí pasa a tu cuenta.</p>

            <label className="cu-consent">
              <input type="checkbox" checked={consiento} onChange={(e) => setConsiento(e.target.checked)} />
              <span>Acepto que Miranda Glow guarde mis datos de piel y salud (tipo de piel, ciclo, embarazo, sensibilidades) para personalizar mis recomendaciones. Puedo descargarlos o borrarlos cuando quiera. <a href="/privacidad#cuenta">Más información</a>.</span>
            </label>
            <p className="cu-nota">Si ya tienes cuenta, no hace falta marcarla.</p>

            {estado.google ? (
              <a className="cu-google" href={`/api/auth/google?consentimiento=${consiento ? 1 : 0}`}>
                <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.9-6.2C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-10l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>
                Entrar con Google
              </a>
            ) : (
              <p className="cu-nota">El acceso con Google se activa muy pronto.</p>
            )}

            {estado.email ? (
              <form className="cu-email" onSubmit={pedirEnlace}>
                <label htmlFor="cu-email">O te enviamos un enlace por email, sin contraseña</label>
                <div>
                  <input id="cu-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
                  <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviarme el enlace'}</button>
                </div>
              </form>
            ) : (
              <p className="cu-nota">El acceso con un enlace por email llega muy pronto.</p>
            )}
            {estado.sinConexion && <p className="cu-nota">No hay conexión: vuelve a intentarlo cuando la tengas.</p>}
          </div>
        </div>
      )}

      {/* ---------- Mi piel ---------- */}
      <section className="cu-sec" id="mi-piel">
        <h2>Mi piel</h2>
        {answers && nombreTipo ? (
          <>
            <dl className="cu-dl">
              <div><dt>Tipo</dt><dd>{nombreTipo}</dd></div>
              {respuesta(answers, 'sensible') && <div><dt>Sensibilidad</dt><dd>{respuesta(answers, 'sensible')}</dd></div>}
              {respuesta(answers, 'problemas') && <div><dt>Quiero mejorar</dt><dd>{respuesta(answers, 'problemas')}</dd></div>}
              {respuesta(answers, 'edad') && <div><dt>Edad</dt><dd>{respuesta(answers, 'edad')}</dd></div>}
              {respuesta(answers, 'hormonas') && <div><dt>Momento hormonal</dt><dd>{respuesta(answers, 'hormonas')}</dd></div>}
              {perfil && (perfil.atopica as boolean) && <div><dt>Además</dt><dd>Piel atópica</dd></div>}
            </dl>
            <div className="cu-acciones">
              <a className="btn" href="/app/routine">Ver mi rutina</a>
              <a className="btn ghost" href="/test">Repetir el test</a>
            </div>
          </>
        ) : (
          <div className="cu-vacio">
            <p>Aún no has hecho el test. Son 2 minutos y te damos una rutina para tu piel.</p>
            <a className="btn" href="/test">Hacer el test</a>
          </div>
        )}
      </section>

      {/* ---------- Mi ciclo ---------- */}
      {conCiclo && (
        <section className="cu-sec" id="ciclo">
          <h2>Mi ciclo</h2>
          <p className="cu-intro">Opcional. Las hormonas cambian la piel a lo largo del mes: con la fecha de tu última regla te decimos en qué fase estás cada día.</p>
          {ciclo ? (
            <>
              {fh && (
                <div className={`cu-fase cu-f-${fh.f}`}>
                  <p className="cu-dia">Día {fh.dia} de {fh.dur}</p>
                  <h3>{fases[fh.f].nombre}</h3>
                  <p>{fases[fh.f].piel}</p>
                  <p><b>Hoy:</b> {fases[fh.f].consejo}</p>
                  <p className="cu-nota">Próxima regla, aproximadamente: {fechaCorta(fh.proxima)}.</p>
                </div>
              )}
              <div className="cu-ciclo-form">
                <label>Primer día de tu última regla
                  <input type="date" value={ciclo.inicio} max={new Date().toISOString().slice(0, 10)} onChange={(e) => e.target.value && guardarCiclo({ ...ciclo, inicio: e.target.value })} />
                </label>
                <label>Tu ciclo suele durar
                  <span className="cu-num"><input type="number" min={21} max={40} value={ciclo.duracion} onChange={(e) => guardarCiclo({ ...ciclo, duracion: Number(e.target.value) || 28 })} /> días</span>
                </label>
                <button className="cu-link" onClick={() => guardarCiclo(null)}>Dejar de seguir mi ciclo</button>
              </div>
            </>
          ) : (
            <div className="cu-ciclo-form">
              <label>Primer día de tu última regla
                <input type="date" max={new Date().toISOString().slice(0, 10)} onChange={(e) => e.target.value && guardarCiclo({ inicio: e.target.value, duracion: 28 })} />
              </label>
              <p className="cu-nota">Si tomas anticonceptivos hormonales, estás embarazada o en la menopausia, las fases no se aplican igual.</p>
            </div>
          )}
        </section>
      )}

      {/* ---------- Mis cremas ---------- */}
      <section className="cu-sec" id="cremas">
        <h2>Mis cremas</h2>
        {avisos.length > 0 && (
          <div className="cu-avisos">
            <h3>Tu rutina, revisada</h3>
            <ul>
              {avisos.map((a) => (
                <li key={a.titulo} className={`cu-av-${a.nivel}`}>
                  <b>{a.titulo}</b>
                  <p>{a.texto}</p>
                  <small>{a.cremas.join(' · ')}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cremas.length > 0 && avisos.length === 0 && <p className="cu-ok-rutina">Hemos revisado tus cremas juntas: no vemos choques entre ellas.</p>}
        {cremas.length ? (
          <ul className="cu-cremas">
            {cremas.map((c) => (
              <li key={c.id}>
                <i className={`cu-luz cu-luz-${c.veredicto || 'gris'}`} aria-hidden="true" />
                <div>
                  <b>{c.nombre}</b>
                  <small>Guardada el {new Date(c.fecha + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</small>
                </div>
                <a href={`/ingredientes?crema=${c.id}`}>Ver análisis</a>
                <a href={`/comparar?ca=${c.id}`}>Comparar</a>
                <button className="cu-link" onClick={() => quitarCrema(c.id)} aria-label={`Quitar ${c.nombre}`}>Quitar</button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="cu-vacio">
            <p>Analiza las cremas que tienes en casa y guárdalas aquí para saber cuáles te van bien.</p>
            <a className="btn" href="/ingredientes">Analizar una crema</a>
          </div>
        )}
      </section>

      {/* ---------- Mis datos ---------- */}
      <section className="cu-sec cu-datos">
        <h2>Mis datos</h2>
        {dentro ? (
          <>
            <p>Puedes descargar todo lo que tenemos guardado de ti o borrar tu cuenta. Si la borras, se elimina todo y no se puede recuperar.</p>
            <div className="cu-acciones">
              <a className="btn ghost" href="/api/exportar" download>Descargar mis datos</a>
              {!borrar ? (
                <button className="btn ghost cu-peligro" onClick={() => setBorrar(true)}>Borrar mi cuenta</button>
              ) : (
                <span className="cu-confirmar">
                  ¿Seguro? Se borra todo.
                  <button className="btn cu-rojo" onClick={borrarCuenta}>Sí, borrar todo</button>
                  <button className="cu-link" onClick={() => setBorrar(false)}>No</button>
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <p>Sin cuenta, todo está solo en este navegador: no lo vemos ni lo guardamos en ningún servidor.</p>
            <button className="btn ghost" onClick={olvidarAqui}>Borrar mis datos de este navegador</button>
          </>
        )}
      </section>
    </div>
  );
}
