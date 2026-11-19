import { useMemo, useRef, useState } from 'react';
import { buscarAprox, limpiarOCR, separar, tipoTxt, type Ingrediente, type Tipo } from '../data/ingredientes';
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

export default function LectorIngredientes() {
  const [texto, setTexto] = useState('');
  const [analizado, setAnalizado] = useState('');
  const [embarazo, setEmbarazo] = useState(false);
  const [sensible, setSensible] = useState(false);
  const [granitos, setGranitos] = useState(false);
  const [ocr, setOcr] = useState<{ estado: 'no' | 'leyendo' | 'error'; pct: number; foto?: string }>({ estado: 'no', pct: 0 });
  const [verTexto, setVerTexto] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const filas: Fila[] = useMemo(
    () => separar(analizado).map((t, i) => ({ pos: i + 1, texto: t, ing: buscarAprox(t) })),
    [analizado],
  );
  const total = filas.length;
  const conocidos = filas.filter((f) => f.ing);

  function analizar(t = texto) {
    setAnalizado(t);
    setTimeout(() => document.getElementById('lx-res')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  async function leerFoto(file: File) {
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
      const { data } = await worker.recognize(file);
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
      texto: l.map((f) => f.ing!.n).join(', ') + (poco ? ' (en poca cantidad: van al final)' : ''),
    });
  }

  const emb = conocidos.filter((f) => f.ing!.embarazo);
  if (emb.length) {
    const evitar = emb.some((f) => f.ing!.embarazo === 'evitar');
    const p = { titulo: evitar ? 'No recomendado en el embarazo' : 'Consultar en el embarazo', texto: evitar ? 'Lleva ingredientes que no se recomiendan si estás embarazada o das el pecho.' : 'Pregunta a tu médica si estás embarazada o das el pecho.', quien: nombres(emb) };
    (embarazo ? rojo : naranja).push(p);
  }
  const perfume = conocidos.filter((f) => f.ing!.tipo === 'perfume' || f.ing!.alergeno);
  if (perfume.length) (sensible ? rojo : naranja).push({ titulo: 'Lleva perfume', texto: 'No aporta nada a la piel y puede irritar o dar alergia.', quien: nombres(perfume) });
  const alcohol = filas.find((f) => f.ing?.n === 'Alcohol Denat.');
  if (alcohol && alcohol.pos <= 5) (sensible ? rojo : naranja).push({ titulo: 'Mucho alcohol', texto: `Va en el puesto ${alcohol.pos}: puede resecar.` });
  const poros = conocidos.filter((f) => f.ing!.poros);
  if (poros.length) (granitos ? rojo : naranja).push({ titulo: 'Puede obstruir poros', texto: 'En pieles con granitos, algunas personas reaccionan.', quien: nombres(poros) });
  const otros = conocidos.filter((f) => f.ing!.sensible && f.ing!.tipo !== 'perfume' && !f.ing!.alergeno && f.ing!.n !== 'Alcohol Denat.');
  if (otros.length && sensible) naranja.push({ titulo: 'Puede molestar a piel sensible', texto: [...new Set(otros.map((f) => f.ing!.sensible))].join(' '), quien: nombres(otros) });
  const sol = conocidos.filter((f) => f.ing!.sol);
  if (sol.length) naranja.push({ titulo: 'Usa protector solar', texto: 'Hace la piel más sensible al sol: mejor por la noche.', quien: nombres(sol) });

  const veredicto = rojo.length
    ? { c: 'rojo', t: 'Para ti, mejor otro producto', d: 'Lleva algo que no te conviene según lo que nos has contado.' }
    : naranja.length
      ? { c: 'naranja', t: 'Bien, con algún pero', d: 'Hace cosas útiles, pero hay algo que conviene vigilar.' }
      : { c: 'verde', t: 'Sin nada que destacar', d: 'No vemos ingredientes problemáticos en lo que conocemos.' };

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
          <button className="lx-foto" onClick={() => input.current?.click()} disabled={ocr.estado === 'leyendo'}>
            <span className="lx-cam" aria-hidden="true" />
            <b>{ocr.estado === 'leyendo' ? `Leyendo la etiqueta… ${ocr.pct} %` : 'Hacer una foto a la etiqueta'}</b>
            <small>o subir una foto de la lista de ingredientes</small>
          </button>
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

        <div className="lx-chips" role="group" aria-label="Tu caso">
          <span>Para mí:</span>
          <label className={embarazo ? 'on' : ''}><input type="checkbox" checked={embarazo} onChange={(e) => setEmbarazo(e.target.checked)} />Embarazo o lactancia</label>
          <label className={sensible ? 'on' : ''}><input type="checkbox" checked={sensible} onChange={(e) => setSensible(e.target.checked)} />Piel sensible</label>
          <label className={granitos ? 'on' : ''}><input type="checkbox" checked={granitos} onChange={(e) => setGranitos(e.target.checked)} />Granitos</label>
        </div>
      </div>

      {total > 0 && (
        <div id="lx-res" className="lx-res">
          <div className={`lx-ver lx-v-${veredicto.c}`}>
            <span className="lx-luz"><i /><i /><i /></span>
            <div><h2>{veredicto.t}</h2><p>{veredicto.d}</p></div>
          </div>

          <div className="lx-cols">
            <Col c="verde" titulo="Lo que hace" l={verde} vacio="No reconocemos activos ni hidratantes en la lista." />
            <Col c="naranja" titulo="A vigilar" l={naranja} vacio="Nada que vigilar." />
            <Col c="rojo" titulo="No te conviene" l={rojo} vacio={embarazo || sensible || granitos ? 'Nada para tu caso.' : 'Marca arriba tu caso para verlo.'} />
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

          <p className="lx-nota">Orientativo: no conocemos las concentraciones exactas. Los ingredientes van de más a menos cantidad hasta el 1 %. No guardamos tus fotos ni tu texto.</p>
        </div>
      )}
    </div>
  );
}
