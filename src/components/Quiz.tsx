import { useState } from 'react';
import { productos } from '../data/productos';

// ---------- Datos del cuestionario ----------
type Opt = { t: string; v: string; s?: string };
type Q = { q: string; multi?: boolean; opts: Opt[] };

const questions: Q[] = [
  { q: '¿Cómo notas tu piel al final del día?', opts: [
    { t: 'Tirante y seca', v: 'seca', s: 'Sin brillos, a veces descamación' },
    { t: 'Brillante por todas partes', v: 'grasa', s: 'Sobre todo en la zona T' },
    { t: 'Brillos en T, normal en mejillas', v: 'mixta', s: 'Lo más común' },
    { t: 'Equilibrada, ni seca ni grasa', v: 'normal', s: 'Cómoda casi siempre' },
  ]},
  { q: '¿Qué te gustaría mejorar?', multi: true, opts: [
    { t: 'Granitos y acné', v: 'acne' },
    { t: 'Manchas y tono desigual', v: 'manchas' },
    { t: 'Líneas y firmeza', v: 'edad' },
    { t: 'Luminosidad general', v: 'luz' },
    { t: 'Poros y brillos', v: 'poros' },
    { t: 'Sequedad y tirantez', v: 'sequedad' },
  ]},
  { q: '¿Tu piel reacciona con facilidad?', opts: [
    { t: 'Sí, se irrita y enrojece', v: 'sensible', s: 'Necesita fórmulas suaves' },
    { t: 'A veces, según el producto', v: 'algo' },
    { t: 'No, tolera casi todo', v: 'resistente' },
    { t: 'No estoy segura', v: 'ns' },
  ]},
  { q: '¿Cuánta experiencia tienes con el skincare?', opts: [
    { t: 'Empiezo de cero', v: 'novata', s: 'Mejor rutina simple' },
    { t: 'Lo básico: limpio e hidrato', v: 'media' },
    { t: 'Uso activos (ácidos, retinol…)', v: 'avanzada' },
  ]},
  { q: '¿Cuánto tiempo quieres dedicarle al día?', opts: [
    { t: 'Lo mínimo, 2–3 pasos', v: 'corta' },
    { t: 'Una rutina completa', v: 'completa' },
    { t: 'Me da igual, quiero resultados', v: 'max' },
  ]},
  { q: '¿Usas protección solar a diario?', opts: [
    { t: 'Sí, cada día', v: 'si' },
    { t: 'Solo en verano', v: 'verano' },
    { t: 'Casi nunca', v: 'no' },
  ]},
  { q: '¿Qué rango de edad tienes?', opts: [
    { t: 'Menos de 25', v: '20' },
    { t: '25–35', v: '30' },
    { t: '35–45', v: '40' },
    { t: '45 o más', v: '50' },
  ]},
  { q: '¿Qué presupuesto manejas por producto?', opts: [
    { t: 'Económico (hasta 15€)', v: 'low' },
    { t: 'Medio (15–35€)', v: 'mid' },
    { t: 'Sin límite, calidad ante todo', v: 'high' },
  ]},
];

const P = productos;

// ---------- Motor de recomendación ----------
function buildRoutine(answers: (string | string[])[]) {
  const [tipo, objetivosRaw, , , tiempo, , edad] = answers;
  const obj = (objetivosRaw as string[]) || [];
  const has = (v: string) => obj.includes(v);
  let r: typeof P[string][] = [];

  r.push(tipo === 'seca' || has('sequedad') ? P.limpiadorSeca : P.limpiador);

  if (has('acne')) r.push(P.bha, P.niacin);
  if (has('manchas')) r.push(P.vitC, P.niacin);
  if (has('edad')) r.push(P.vitC, P.retinol);
  if (has('luz')) r.push(P.vitC);
  if (has('poros')) r.push(P.niacin);
  if (has('sequedad')) r.push(P.hialu);
  if (r.length <= 1) r.push(P.vitC, P.hialu);

  if ((edad === '40' || edad === '50') && !r.includes(P.retinol)) r.push(P.retinol);
  r.push(tipo === 'seca' || edad === '50' || has('sequedad') ? P.hidraRica : P.hidra);
  r.push(P.spf);

  r = [...new Set(r)];

  if (tiempo === 'corta') {
    const keep = r.filter((p) => p !== P.spf).slice(0, 3);
    r = [...new Set([...keep, P.spf])];
  }
  return r;
}

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>([]);
  const [done, setDone] = useState(false);

  const Q = questions[current];

  function pick(v: string) {
    const next = [...answers];
    if (Q.multi) {
      const arr = (next[current] as string[]) || [];
      next[current] = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      setAnswers(next);
    } else {
      next[current] = v;
      setAnswers(next);
      advance();
    }
  }
  function advance() {
    if (current < questions.length - 1) setCurrent(current + 1);
    else setDone(true);
  }
  function nextQ() {
    if (Q.multi && (!answers[current] || (answers[current] as string[]).length === 0)) return;
    advance();
  }
  function restart() { setCurrent(0); setAnswers([]); setDone(false); }

  if (done) {
    const routine = buildRoutine(answers);
    const tipo = answers[0] as string;
    const tipoTxt: Record<string, string> = { seca: 'Piel seca', grasa: 'Piel grasa', mixta: 'Piel mixta', normal: 'Piel normal' };

    // Reparte la rutina en mañana y noche según el momento de cada producto,
    // y ordena cada bloque por el orden de aplicación (limpieza → ... → SPF).
    const manana = routine.filter((p) => p.momento === 'am' || p.momento === 'ambos').sort((a, b) => a.orden - b.orden);
    const noche = routine.filter((p) => p.momento === 'pm' || p.momento === 'ambos').sort((a, b) => a.orden - b.orden);

    const Bloque = ({ titulo, icono, lista }: { titulo: string; icono: string; lista: typeof routine }) => (
      <div className="rutina-bloque">
        <div className="rb-head"><span className="rb-ico">{icono}</span><h3>{titulo}</h3></div>
        {lista.map((p, i) => (
          <a key={p.id} className="prod" href={p.url} target="_blank" rel="sponsored nofollow noopener">
            <span className="stepn"><small>PASO</small><b>{i + 1}</b></span>
            <span className="pinfo">
              <span className="cat">{p.categoria}</span>
              <b>{p.nombre}</b>
              <span className="d">{p.descripcion}</span>
              <span className="freq">⟳ {p.frecuencia}</span>
            </span>
            <span className="price">{p.precio}<small>Ver en {p.tienda} →</small></span>
          </a>
        ))}
      </div>
    );

    return (
      <div className="q-result">
        <span className="badge">{tipoTxt[tipo] || 'Tu piel'}</span>
        <h2>Tu rutina personalizada</h2>
        <p className="sub">Sigue el orden de cada paso. Los productos se abren en su tienda.</p>

        <Bloque titulo="Rutina de mañana" icono="☀" lista={manana} />
        <Bloque titulo="Rutina de noche" icono="☾" lista={noche} />

        <div className="rutina-tip">
          <b>Consejo:</b> introduce los productos de uno en uno, dejando unos días entre cada nuevo activo, para que tu piel se adapte. Si algo te irrita, espácialo o suspéndelo.
        </div>

        <button className="btn ghost" onClick={restart} style={{ marginTop: 24 }}>Repetir el test</button>
        <Styles />
      </div>
    );
  }

  const sel = answers[current];
  return (
    <div className="q-stage">
      <div className="progress"><i style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      <div className="q-count">Pregunta {current + 1} de {questions.length}</div>
      <h2>{Q.q}</h2>
      {Q.multi && <div className="multi-hint">✦ Puedes elegir varias opciones</div>}
      <div className="opts">
        {Q.opts.map((o) => {
          const isSel = Q.multi ? (sel as string[] || []).includes(o.v) : sel === o.v;
          return (
            <button key={o.v} className={`opt${isSel ? ' sel' : ''}`} onClick={() => pick(o.v)}>
              <span className="ic" /><span className="lbl"><b>{o.t}</b>{o.s && <small>{o.s}</small>}</span>
              {isSel && <span className="check">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="q-nav">
        {current > 0 && <button className="link-back" onClick={() => setCurrent(current - 1)}>← Anterior</button>}
        {Q.multi && <button className="btn" onClick={nextQ}>{current === questions.length - 1 ? 'Ver mi rutina ✦' : 'Continuar →'}</button>}
      </div>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .q-stage,.q-result{max-width:720px;margin:0 auto;text-align:center}
      .progress{height:6px;background:var(--line);border-radius:100px;overflow:hidden;margin-bottom:30px}
      .progress i{display:block;height:100%;background:var(--accent);border-radius:100px;transition:width .4s ease}
      .q-count{font-size:.82rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-deep);margin-bottom:18px}
      .q-stage h2,.q-result h2{font-size:clamp(1.7rem,4vw,2.7rem);margin-bottom:30px}
      .multi-hint{font-size:.85rem;color:var(--accent-deep);margin:-18px 0 22px}
      .opts{display:grid;gap:14px;grid-template-columns:1fr 1fr}
      .opt{background:#fff;border:1.6px solid var(--line);border-radius:16px;padding:22px 20px;cursor:pointer;text-align:left;font-size:1.02rem;transition:all .2s;display:flex;align-items:center;gap:14px;position:relative;font-family:inherit;color:var(--ink)}
      .opt:hover{border-color:var(--accent);transform:translateY(-3px)}
      .opt.sel{border-color:var(--accent-deep);background:var(--bg-deep);box-shadow:0 0 0 3px rgba(95,182,196,.30)}
      .opt .ic{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,var(--sage),var(--accent));flex:none}
      .opt .lbl b{display:block}
      .opt .lbl small{display:block;color:var(--ink-soft);font-size:.84rem;font-weight:300}
      .opt .check{position:absolute;top:12px;right:12px;width:22px;height:22px;border-radius:50%;background:var(--accent-deep);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem}
      .q-nav{margin-top:34px;display:flex;justify-content:center;align-items:center;gap:24px}
      .link-back{background:none;border:none;color:var(--ink-soft);cursor:pointer;font-size:.95rem;text-decoration:underline;font-family:inherit}
      .badge{display:inline-block;background:var(--sage);color:#234;padding:7px 18px;border-radius:100px;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px}
      .q-result .sub{color:var(--ink-soft);margin-bottom:30px}
      .rutina-bloque{text-align:left;margin-bottom:34px}
      .rb-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
      .rb-ico{width:38px;height:38px;border-radius:50%;background:var(--bg-deep);display:flex;align-items:center;justify-content:center;font-size:1.1rem}
      .rb-head h3{font-family:'Fraunces',serif;font-weight:500;font-size:1.4rem}
      .rutina-tip{text-align:left;background:var(--bg-deep);border-radius:14px;padding:18px 22px;font-size:.92rem;color:var(--ink-soft);line-height:1.6}
      .rutina-tip b{color:var(--ink)}
      .freq{display:inline-block;margin-top:8px;font-size:.8rem;color:var(--accent-deep);background:var(--bg-deep);padding:3px 10px;border-radius:100px}
      .prod{display:grid;grid-template-columns:64px 1fr auto;gap:20px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 24px;margin-bottom:14px;text-decoration:none;color:var(--ink);transition:transform .25s}
      .prod:hover{transform:translateX(4px)}
      .prod .stepn{width:64px;height:64px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Fraunces',serif}
      .prod .stepn small{font-size:.6rem;letter-spacing:.1em;opacity:.8}
      .prod .stepn b{font-size:1.5rem}
      .prod .pinfo{text-align:left}
      .prod .cat{display:block;font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-deep)}
      .prod .pinfo b{font-family:'Fraunces',serif;font-weight:500;font-size:1.18rem}
      .prod .d{display:block;font-size:.9rem;color:var(--ink-soft)}
      .prod .price{font-family:'Fraunces',serif;font-size:1.1rem;text-align:right;white-space:nowrap}
      .prod .price small{display:block;font-family:'Outfit',sans-serif;font-size:.72rem;color:var(--accent-deep);text-decoration:none}
      @media(max-width:640px){.opts{grid-template-columns:1fr}.prod{grid-template-columns:52px 1fr}.prod .price{grid-column:2;text-align:left;margin-top:6px}}
    `}</style>
  );
}
