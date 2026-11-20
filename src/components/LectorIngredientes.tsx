import { useEffect, useMemo, useRef, useState } from 'react';
import { PIELES, paraTuPiel, type Piel } from '../lib/paraTuPiel';
import { anadirCrema, leerCremas } from '../lib/cremas';
import EscanerCodigo from './EscanerCodigo';
import { compartirTarjeta } from '../lib/tarjeta';
import { analizarLista, limpiarOCR, tipoTxt, type Ingrediente, type Tipo } from '../data/ingredientes';
import { fichaDeInci } from '../data/fichas';

// Lista de ejemplo: un sérum inventado, no una marca real.
const EJEMPLO =
  'Aqua, Glycerin, Niacinamide, Butylene Glycol, Propanediol, Sodium Hyaluronate, Panthenol, Phenoxyethanol, Carbomer, Sodium Hydroxide, Alcohol Denat., Parfum, Rosa Canina Fruit Oil, Ethylhexylglycerin, Linalool, Limonene.';

type Fila = { pos: number; texto: string; ing?: Ingrediente };
type Punto = { titulo: string; texto: string; quien?: string[] };

// Qué hace cada tipo, dicho en corto
const HACE: Partial<Record<Tipo, string>> = {
  activo: 'Trata', exfoliante: 'Exfolia', antioxidante: 'Protege y da luz', hidratante: 'Hidrata',
  calmante: 'Calma', emoliente: 'Suaviza y nutre', filtro: 'Protege del sol', limpiador: 'Limpia',
};

/**
 * Prepara la foto para leerla mejor: la letra de las etiquetas es diminuta,
 * así que la agrandamos, la pasamos a gris y subimos el contraste.
 */
async function prepararFoto(file: File): Promise<HTMLCanvasElement | File> {
  try {
    const img = await createImageBitmap(file);
    // fotos pequeñas: hasta ×3; fotos enormes del móvil: como mucho 3200 px de ancho
    const escala = img.width < 2400 ? Math.min(3, 2400 / img.width) : Math.min(1, 3200 / img.width);
    const w = Math.round(img.width * escala);
    const h = Math.round(img.height * escala);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h);
    const px = d.data;
    // gris + histograma para estirar el contraste (ignorando el 1 % de cada extremo)
    const hist = new Uint32Array(256);
    for (let i = 0; i < px.length; i += 4) {
      const g = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) | 0;
      px[i] = g; hist[g]++;
    }
    const total = w * h; let acc = 0; let lo = 0; let hi = 255;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > total * 0.01) { lo = v; break; } }
    acc = 0;
    for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > total * 0.01) { hi = v; break; } }
    const r = Math.max(1, hi - lo);
    for (let i = 0; i < px.length; i += 4) {
      const g = Math.min(255, Math.max(0, ((px[i] - lo) * 255) / r));
      px[i] = px[i + 1] = px[i + 2] = g;
    }
    ctx.putImageData(d, 0, 0);
    return c;
  } catch {
    return file;
  }
}

export default function LectorIngredientes() {
  const [texto, setTexto] = useState('');
  const [analizado, setAnalizado] = useState('');
  const [embarazo, setEmbarazo] = useState(false);
  const [sensible, setSensible] = useState(false);
  const [granitos, setGranitos] = useState(false);
  const [ocr, setOcr] = useState<{ estado: 'no' | 'leyendo' | 'error'; pct: number; foto?: string }>({ estado: 'no', pct: 0 });
  const [verTexto, setVerTexto] = useState(false);
  const [piel, setPiel] = useState<Piel | null>(null);
  const [desdeTest, setDesdeTest] = useState(false);
  const visor = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const [atopica, setAtopica] = useState(false);
  const listo = useRef(false);

  // Tu piel: lo último que marcaste aquí o, si no, tus respuestas del test (todo se queda en tu navegador)
  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem('mirandaglow.perfil') || 'null');
      if (g) {
        setPiel(g.piel ?? null); setSensible(!!g.sensible); setAtopica(!!g.atopica); setGranitos(!!g.granitos); setEmbarazo(!!g.embarazo);
      } else {
        const a = JSON.parse(localStorage.getItem('mirandaglow.answers.v2') || '{}');
        if (['seca', 'grasa', 'mixta', 'normal'].includes(a.tipo)) { setPiel(a.tipo); setDesdeTest(true); }
        if (a.sensible === 'muy') setSensible(true);
        if (a.hormonas === 'embarazo' || a.hormonas === 'lactancia') setEmbarazo(true);
        if (Array.isArray(a.problemas) && a.problemas.includes('acne')) setGranitos(true);
      }
    } catch {}
    listo.current = true;
  }, []);
  useEffect(() => {
    if (!listo.current) return;
    try { localStorage.setItem('mirandaglow.perfil', JSON.stringify({ piel, sensible, atopica, granitos, embarazo })); } catch {}
  }, [piel, sensible, atopica, granitos, embarazo]);

  function elegirPiel(v: Piel) {
    setPiel(piel === v ? null : v); // pulsar otra vez la quita
    setDesdeTest(false);
  }
  const delicada = sensible || atopica;

  const filas: Fila[] = useMemo(
    () => analizarLista(analizado).map((f, i) => ({ pos: i + 1, ...f })),
    [analizado],
  );
  const total = filas.length;
  const conocidos = filas.filter((f) => f.ing);

  const [nombreCrema, setNombreCrema] = useState('');
  const [escaner, setEscaner] = useState(false);
  type Prod = { estado: 'buscando' | 'ok' | 'sin-inci' | 'no' | 'error'; ean: string; nombre?: string; marca?: string; cantidad?: string; url?: string };
  const [prod, setProd] = useState<Prod | null>(null);

  // Código de barras → ingredientes (nuestro servidor pregunta a Open Beauty Facts)
  async function buscarCodigo(ean: string) {
    setEscaner(false);
    setOcr({ estado: 'no', pct: 0 });
    setProd({ estado: 'buscando', ean });
    try {
      const r = await fetch(`/api/codigo/${ean}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      if (d.encontrado && d.inci) {
        setProd({ estado: 'ok', ean, nombre: d.nombre, marca: d.marca, cantidad: d.cantidad, url: d.url });
        setNombreCrema([d.marca, d.nombre].filter(Boolean).join(' ').slice(0, 80));
        setTexto(d.inci); setVerTexto(false); analizar(d.inci);
      } else setProd({ estado: d.encontrado ? 'sin-inci' : 'no', ean, nombre: d.nombre, marca: d.marca });
    } catch {
      setProd({ estado: 'error', ean });
    }
  }
  const [guardada, setGuardada] = useState<string | null>(null);

  // /ingredientes?crema=ID abre una crema guardada
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const lista = q.get('lista');
    if (lista) { setTexto(lista); setVerTexto(true); analizar(lista); return; }
    const id = q.get('crema');
    const c = id && leerCremas().find((x) => x.id === id);
    if (c) { setTexto(c.inci); setVerTexto(true); setNombreCrema(c.nombre); setGuardada(c.id); analizar(c.inci); }
  }, []);

  const [compartiendo, setCompartiendo] = useState<string | null>(null);
  async function compartir() {
    setCompartiendo('Preparando la imagen…');
    const rasgos = [piel, sensible && 'sensible', atopica && 'atópica', granitos && 'con granitos'].filter(Boolean) as string[];
    const nombre = (prod?.estado === 'ok' && [prod.marca, prod.nombre].filter(Boolean).join(' ')) || nombreCrema.trim() || 'Mi crema';
    const r = await compartirTarjeta({
      titulo: nombre,
      subtitulo: !resumen && rasgos.length ? `Para piel ${rasgos.join(', ')}` : undefined,
      color: veredicto.c === 'verde' ? 'verde' : veredicto.c === 'naranja' ? 'naranja' : veredicto.c === 'rojo' ? 'rojo' : 'gris',
      veredicto: resumen ? resumen.titulo : veredicto.t,
      puntos: resumen ? resumen.puntos : [...rojo, ...naranja].slice(0, 4).map((x) => ({ ok: false, t: x.titulo })),
    }).catch(() => 'error');
    setCompartiendo(r === 'descargada' ? 'Imagen descargada: súbela a tus redes.' : r === 'error' ? 'No se ha podido crear la imagen.' : null);
  }

  function guardarCrema() {
    const c = anadirCrema({ nombre: nombreCrema.trim() || 'Crema sin nombre', inci: analizado, veredicto: veredicto.c });
    setGuardada(c.id);
  }

  function analizar(t = texto) {
    setGuardada(null);
    setAnalizado(t);
    setTimeout(() => document.getElementById('lx-res')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  async function leerFoto(file: File) {
    // La foto solo se muestra aquí, en tu navegador; no se sube a ningún servidor.
    if (ocr.foto) URL.revokeObjectURL(ocr.foto);
    setProd(null);
    const url = URL.createObjectURL(file);
    setOcr({ estado: 'leyendo', pct: 0, foto: url });
    try {
      // Todo ocurre en el navegador: la foto no se sube a ningún sitio.
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        workerPath: '/ocr/worker.min.js',
        corePath: '/ocr',
        langPath: '/ocr',
        gzip: false,
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setOcr((o) => ({ ...o, pct: Math.round(m.progress * 100) }));
        },
      });
      const { data } = await worker.recognize(await prepararFoto(file));
      await worker.terminate();
      const limpio = limpiarOCR(data.text);
      setTexto(limpio);
      setOcr({ estado: 'no', pct: 100, foto: url });
      setVerTexto(true);
      if (limpio) analizar(limpio);
    } catch {
      setOcr({ estado: 'error', pct: 0, foto: url });
    }
  }

  // ---------- Resumen tipo semáforo ----------
  const nombres = (l: Fila[]) => [...new Set(l.map((f) => f.ing!.n))];
  const verde: Punto[] = [];
  const naranja: Punto[] = [];
  const rojo: Punto[] = [];

  const porTipo = new Map<Tipo, Fila[]>();
  for (const f of conocidos) {
    const l = porTipo.get(f.ing!.tipo) || [];
    if (!l.some((x) => x.ing!.n === f.ing!.n)) l.push(f);
    porTipo.set(f.ing!.tipo, l);
  }
  const arriba = Math.max(5, Math.ceil(total / 3));
  for (const t of ['activo', 'exfoliante', 'antioxidante', 'filtro', 'hidratante', 'calmante', 'emoliente'] as Tipo[]) {
    const l = porTipo.get(t);
    if (!l) continue;
    const fuertes = t === 'activo' || t === 'exfoliante' || t === 'antioxidante';
    const poco = fuertes && l.every((f) => f.pos > arriba);
    verde.push({
      titulo: HACE[t]!,
      texto: l.map((f) => f.ing!.n).join(', ') + (poco ? (l.length > 1 ? ' (en poca cantidad: van al final)' : ' (en poca cantidad: va al final)') : ''),
    });
  }

  const emb = conocidos.filter((f) => f.ing!.embarazo);
  if (emb.length) {
    const evitar = emb.some((f) => f.ing!.embarazo === 'evitar');
    const p = { titulo: evitar ? 'No recomendado en el embarazo' : 'Consultar en el embarazo', texto: evitar ? 'Lleva ingredientes que no se recomiendan si estás embarazada o das el pecho.' : 'Pregunta a tu médica si estás embarazada o das el pecho.', quien: nombres(emb) };
    (embarazo ? rojo : naranja).push(p);
  }
  const perfume = conocidos.filter((f) => f.ing!.tipo === 'perfume' || f.ing!.alergeno);
  if (perfume.length) (delicada ? rojo : naranja).push({ titulo: 'Lleva perfume', texto: 'No aporta nada a la piel y puede irritar o dar alergia.', quien: nombres(perfume) });
  const alcohol = filas.find((f) => f.ing?.n === 'Alcohol Denat.');
  if (alcohol && alcohol.pos <= 5) (delicada ? rojo : naranja).push({ titulo: 'Mucho alcohol', texto: `Va en el puesto ${alcohol.pos}: puede resecar.` });
  const poros = conocidos.filter((f) => f.ing!.poros);
  if (poros.length) (granitos ? rojo : naranja).push({ titulo: 'Puede obstruir poros', texto: 'En pieles con granitos, algunas personas reaccionan.', quien: nombres(poros) });
  const otros = conocidos.filter((f) => f.ing!.sensible && f.ing!.tipo !== 'perfume' && !f.ing!.alergeno && f.ing!.n !== 'Alcohol Denat.');
  if (otros.length && delicada) naranja.push({ titulo: 'Puede molestar a piel sensible', texto: [...new Set(otros.map((f) => f.ing!.sensible))].join(' '), quien: nombres(otros) });
  const sol = conocidos.filter((f) => f.ing!.sol);
  if (sol.length) naranja.push({ titulo: 'Usa protector solar', texto: 'Hace la piel más sensible al sol: mejor por la noche.', quien: nombres(sol) });

  const veredicto = rojo.length
    ? { c: 'rojo', t: 'Para ti, mejor otro producto', d: 'Lleva algo que no te conviene según lo que nos has contado.' }
    : naranja.length
      ? { c: 'naranja', t: 'Bien, con algún pero', d: 'Hace cosas útiles, pero hay algo que conviene vigilar.' }
      : { c: 'verde', t: 'Sin nada que destacar', d: 'No vemos ingredientes problemáticos en lo que conocemos.' };

  const resumen = paraTuPiel(filas, piel, { sensible, atopica, granitos },
    rojo.map((r) => ({ ok: false, t: `${r.titulo}${r.quien ? ` (${r.quien.slice(0, 3).join(', ')})` : ''}: según lo que has marcado, no te conviene.` })));

  const Col = ({ c, titulo, l, vacio }: { c: string; titulo: string; l: Punto[]; vacio: string }) => (
    <div className={`lx-col lx-${c}`}>
      <h3><i />{titulo}</h3>
      {l.length ? (
        <ul>{l.map((p) => (
          <li key={p.titulo}><b>{p.titulo}</b><span>{p.texto}</span>{p.quien && <small>{p.quien.join(', ')}</small>}</li>
        ))}</ul>
      ) : <p className="lx-vacio">{vacio}</p>}
    </div>
  );

  return (
    <div className="lx">
      <div className="lx-form">
        <div className="lx-entrada">
          <div className="lx-dos">
            <button className="lx-foto lx-esc" onClick={() => setEscaner(true)} disabled={prod?.estado === 'buscando'}>
              <span className="lx-barras" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
              <b>{prod?.estado === 'buscando' ? 'Buscando el producto…' : 'Escanear el código de barras'}</b>
              <small>lo más rápido, si el producto es conocido</small>
            </button>
            <button className="lx-foto" onClick={() => input.current?.click()} disabled={ocr.estado === 'leyendo'}>
              <span className="lx-cam" aria-hidden="true" />
              <b>{ocr.estado === 'leyendo' ? `Leyendo la etiqueta… ${ocr.pct} %` : 'Foto de la lista de ingredientes'}</b>
              <small>funciona con cualquier crema</small>
            </button>
          </div>
          {escaner && <EscanerCodigo onCodigo={buscarCodigo} onCerrar={() => setEscaner(false)} />}
          {prod && prod.estado !== 'ok' && prod.estado !== 'buscando' && (
            <div className="lx-aviso-cod" role="status">
              <p>
                {prod.estado === 'no' && <><b>Aún no conocemos este producto</b> (código {prod.ean}). </>}
                {prod.estado === 'sin-inci' && <><b>{[prod.marca, prod.nombre].filter(Boolean).join(' ') || 'Conocemos este producto'}</b>, pero nos falta su lista de ingredientes. </>}
                {prod.estado === 'error' && <><b>No hemos podido buscarlo ahora.</b> Revisa la conexión o vuelve a intentarlo. </>}
                {prod.estado !== 'error' && 'Hazle una foto a la lista de ingredientes y lo analizamos igual.'}
              </p>
              {prod.estado !== 'error'
                ? <button className="btn" onClick={() => input.current?.click()}>Hacer la foto</button>
                : <button className="btn" onClick={() => buscarCodigo(prod.ean)}>Reintentar</button>}
            </div>
          )}
          <input ref={input} type="file" accept="image/*" capture="environment" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) leerFoto(f); e.target.value = ''; }} />
          {ocr.estado === 'leyendo' && <div className="lx-bar"><i style={{ width: `${ocr.pct}%` }} /></div>}
          {ocr.estado === 'error' && <p className="lx-err">No hemos podido leer la foto. Prueba con más luz, de cerca y sin reflejos, o pega el texto.</p>}
          <div className="lx-alt">
            <button className="lx-link" onClick={() => setVerTexto(!verTexto)}>{verTexto ? 'Ocultar el texto' : 'Pegar la lista como texto'}</button>
            <button className="lx-link" onClick={() => { setTexto(EJEMPLO); setVerTexto(true); analizar(EJEMPLO); }}>Ver un ejemplo</button>
          </div>
        </div>

        {verTexto && (
          <div className="lx-texto">
            <label htmlFor="lx-text">Ingredientes {ocr.foto && '(revisa que se hayan leído bien)'}</label>
            <textarea id="lx-text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Aqua, Glycerin, Niacinamide, …" rows={5} />
            <button className="btn" onClick={() => analizar()} disabled={!texto.trim()}>Analizar</button>
          </div>
        )}

        <div className="lx-perfil" id="lx-perfil">
          <div className="lx-fila">
            <span id="lx-tipo-t">Tu piel</span>
            <div className="lx-seg" role="radiogroup" aria-labelledby="lx-tipo-t">
              {PIELES.map((x) => (
                <button key={x.v} type="button" role="radio" aria-checked={piel === x.v} className={piel === x.v ? 'on' : ''} onClick={() => elegirPiel(x.v)}>{x.t}</button>
              ))}
            </div>
          </div>
          <div className="lx-fila lx-chips" role="group" aria-labelledby="lx-ademas-t">
            <span id="lx-ademas-t">Además</span>
            <label className={sensible ? 'on' : ''} title="Pica, escuece o se enrojece con facilidad"><input type="checkbox" checked={sensible} onChange={(e) => setSensible(e.target.checked)} />Sensible</label>
            <label className={atopica ? 'on' : ''} title="Dermatitis atópica: seca, con picor y brotes"><input type="checkbox" checked={atopica} onChange={(e) => setAtopica(e.target.checked)} />Atópica</label>
            <label className={granitos ? 'on' : ''}><input type="checkbox" checked={granitos} onChange={(e) => setGranitos(e.target.checked)} />Granitos</label>
            <label className={embarazo ? 'on' : ''}><input type="checkbox" checked={embarazo} onChange={(e) => setEmbarazo(e.target.checked)} />Embarazo o lactancia</label>
          </div>
          <p className="lx-ayuda">
            {desdeTest ? 'Lo hemos cogido de tu test. ' : ''}Puedes marcar varias. ¿No sabes tu tipo de piel? <a href="/test">Haz el test</a>.
          </p>
        </div>
      </div>

      {total > 0 && (
        <div id="lx-res" className="lx-res">
          <div className={`lx-ver lx-v-${veredicto.c}`}>
            {ocr.foto
              ? <button type="button" className="lx-mini" onClick={() => visor.current?.showModal()} aria-label="Ver tu foto en grande"><img src={ocr.foto} alt="" /><span className="lx-luz lx-luz-s"><i /><i /><i /></span></button>
              : <span className="lx-luz"><i /><i /><i /></span>}
            <div>
              {prod?.estado === 'ok' && (
                <p className="lx-prod">
                  <b>{[prod.marca, prod.nombre].filter(Boolean).join(' · ') || `Código ${prod.ean}`}</b>{prod.cantidad && ` · ${prod.cantidad}`}
                </p>
              )}
              <h2>{veredicto.t}</h2><p>{veredicto.d}</p>
              {prod?.estado === 'ok' && (
                <small className="lx-priv">Ingredientes de <a href={prod.url} target="_blank" rel="noopener">Open Beauty Facts</a> (base de datos abierta, licencia ODbL). Compáralos con tu envase: las fórmulas cambian.</small>
              )}
              {ocr.foto && <small className="lx-priv">{conocidos.length} ingredientes leídos de tu foto. Solo se ve en tu móvil: no la guardamos.</small>}
            </div>
          </div>

          {ocr.foto && (
            <dialog ref={visor} className="lx-visor" aria-label="Tu foto de la etiqueta"
              onClick={(e) => { if (e.target === e.currentTarget) visor.current?.close(); }}>
              <figure>
                <img src={ocr.foto} alt="Tu foto de la etiqueta" />
                <button type="button" className="lx-cerrar" onClick={() => visor.current?.close()} aria-label="Cerrar">×</button>
              </figure>
            </dialog>
          )}

          <section className={`lx-piel ${resumen ? `lx-p-${resumen.tono}` : ''}`} aria-labelledby="lx-piel-t">
            <div className="lx-piel-cab">
              <h3 id="lx-piel-t">{resumen ? resumen.titulo : 'Para tu piel'}</h3>
              <a className="lx-cambiar" href="#lx-perfil">{resumen ? 'Cambiar mi piel' : 'Elegir mi piel'}</a>
            </div>
            {resumen ? (
              <>
                <p className="lx-textura">{resumen.textura}</p>
                <ul className="lx-puntos">
                  {resumen.puntos.map((x) => <li key={x.t} className={x.ok ? 'si' : 'ojo'}><i aria-hidden="true">{x.ok ? '✓' : '!'}</i>{x.t}</li>)}
                </ul>
              </>
            ) : (
              <p className="lx-textura">Marca arriba cómo es tu piel y te decimos cómo te sentaría.</p>
            )}
          </section>

          <div className="lx-cols">
            <Col c="verde" titulo="Lo que hace" l={verde} vacio="No reconocemos activos ni hidratantes en la lista." />
            <Col c="naranja" titulo="A vigilar" l={naranja} vacio="Nada que vigilar." />
            <Col c="rojo" titulo="No te conviene" l={rojo} vacio={embarazo || delicada || granitos ? 'Nada para tu caso.' : 'Marca arriba tu caso para verlo.'} />
          </div>

          <details className="lx-det">
            <summary>Ingrediente por ingrediente ({conocidos.length} de {total} reconocidos)</summary>
            <ol className="lx-tabla">
              {filas.map((f) => {
                const ficha = f.ing && fichaDeInci(f.ing.n);
                return (
                  <li key={f.pos} className={f.ing ? '' : 'lx-desc'}>
                    <span className="lx-pos">{f.pos}</span>
                    <div>
                      <p className="lx-n">
                        {ficha ? <a href={`/ingredientes/${ficha.slug}`}>{f.ing!.n}</a> : f.ing ? f.ing.n : f.texto}
                        {f.ing && <span className="lx-tipo">{tipoTxt[f.ing.tipo]}</span>}
                      </p>
                      <p className="lx-que">{f.ing ? f.ing.que : 'No lo tenemos todavía en nuestra base.'}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </details>

          <div className="lx-acc">
            <button className="btn" onClick={compartir} disabled={compartiendo === 'Preparando la imagen…'}>Compartir resultado</button>
            <a className="btn ghost" href={`/comparar?lista=${encodeURIComponent(analizado)}`}>Comparar con otra crema</a>
            {compartiendo && <span role="status">{compartiendo}</span>}
          </div>

          <div className="lx-guardar">
            {guardada ? (
              <p><b>Guardada en tus cremas.</b> <a href="/cuenta#cremas">Ver mis cremas</a></p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); guardarCrema(); }}>
                <label htmlFor="lx-nombre">¿La tienes en casa? Guárdala para tenerla a mano</label>
                <div>
                  <input id="lx-nombre" value={nombreCrema} onChange={(e) => setNombreCrema(e.target.value)} placeholder="Nombre, p. ej. Crema hidratante de noche" maxLength={80} />
                  <button className="btn" type="submit">Guardar en mis cremas</button>
                </div>
              </form>
            )}
          </div>

          <p className="lx-nota">Orientativo: no conocemos las concentraciones exactas. Los ingredientes van de más a menos cantidad hasta el 1 %. No guardamos tus fotos; la lista solo se guarda si pulsas «Guardar».</p>
        </div>
      )}
    </div>
  );
}
