import { useState } from 'react';
import { buildRoutine, fases, visibleQuestions, type Answers } from './quiz-logic';
import type { Producto } from '../data/productos';

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const qs = visibleQuestions(answers);
  const Q = qs[Math.min(current, qs.length - 1)];

  function advance(next: Answers) {
    const list = visibleQuestions(next);
    if (current < list.length - 1) setCurrent(current + 1);
    else setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function pick(v: string) {
    const next = { ...answers };
    if (Q.multi) {
      const arr = (next[Q.id] as string[]) || [];
      if (arr.includes(v)) next[Q.id] = arr.filter((x) => x !== v);
      else if (!Q.max || arr.length < Q.max) next[Q.id] = [...arr, v];
      setAnswers(next);
    } else {
      next[Q.id] = v;
      setAnswers(next);
      advance(next);
    }
  }
  function nextQ() {
    const sel = (answers[Q.id] as string[]) || [];
    if (Q.multi && sel.length === 0) return;
    advance(answers);
  }
  function restart() { setCurrent(0); setAnswers({}); setDone(false); }

  if (done) {
    const res = buildRoutine(answers);
    const { rutina } = res;
    const manana = rutina.filter((p) => p.momento === 'am' || p.momento === 'ambos').sort((a, b) => a.orden - b.orden);
    const noche = rutina.filter((p) => p.momento === 'pm' || p.momento === 'ambos').sort((a, b) => a.orden - b.orden);
    const fase = res.fase && fases[res.fase];

    const Bloque = ({ titulo, icono, lista }: { titulo: string; icono: string; lista: Producto[] }) => (
      <div className="rutina-bloque">
        <div className="rb-head"><span className="rb-ico">{icono}</span><h3>{titulo}</h3></div>
        {lista.map((p, i) => (
          <a key={p.id} className="prod" href={p.url} target="_blank" rel="sponsored nofollow noopener">
            <span className="stepn"><small>{p.orden === 6 ? 'EXTRA' : 'PASO'}</small><b>{p.orden === 6 ? '+' : i + 1}</b></span>
            <span className="pinfo">
              <span className="cat">{p.categoria}{p.natural && <span className="nat-badge">🌿 Natural</span>}</span>
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
        <div className="perfil">{res.perfil.map((t) => <span key={t} className="badge">{t}</span>)}</div>
        <h2>Tu rutina personalizada</h2>
        <p className="sub">Sigue el orden de cada paso. Los productos se abren en su tienda.</p>

        {res.avisos.filter((x) => x.tipo === 'medico').map((x) => (
          <div key={x.texto} className="aviso medico"><b>⚕ Importante</b><p>{x.texto}</p></div>
        ))}

        <Bloque titulo="Rutina de mañana" icono="☀" lista={manana} />
        <Bloque titulo="Rutina de noche" icono="☾" lista={noche} />

        {res.semana && (
          <div className="semana">
            <h3>Tu semana de activos de noche</h3>
            <p className="sub-s">No mezcles exfoliantes y retinol la misma noche. Repártelos así:</p>
            <div className="semana-grid">
              {res.semana.map((d) => (
                <div key={d.dia} className={`dia${d.activo === 'Solo hidratar' ? ' rest' : ''}`}>
                  <small>{d.dia}</small><span>{d.activo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {fase && (
          <div className="ciclo">
            <h3>Tu piel en este momento del ciclo</h3>
            <div className="ciclo-grid">
              {Object.entries(fases).map(([k, f]) => (
                <div key={k} className={`fase${k === res.fase ? ' actual' : ''}`}>
                  <small>{f.dias}</small>
                  <b>{f.nombre}{k === res.fase && ' · ahora'}</b>
                  <p>{f.piel}</p>
                  <p className="fc">{f.consejo}</p>
                </div>
              ))}
            </div>
            <p className="sub-s">Tu rutina está pensada para la fase en la que estás. Repite el test cuando cambies de fase.</p>
          </div>
        )}

        {res.avisos.filter((x) => x.tipo === 'info').map((x) => (
          <div key={x.texto} className="aviso"><p>{x.texto}</p></div>
        ))}

        <div className="rutina-tip">
          <b>Consejos para ti</b>
          <ul>{res.consejos.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>

        <p className="privacidad">🔒 Tus respuestas no salen de tu navegador: no las guardamos ni las enviamos. Esta rutina es orientativa y no sustituye la consulta con una dermatóloga.</p>

        <button className="btn ghost" onClick={restart} style={{ marginTop: 24 }}>Repetir el test</button>
        <Styles />
      </div>
    );
  }

  const sel = answers[Q.id];
  const nSel = Q.multi ? ((sel as string[]) || []).length : 0;
  const isLast = current === qs.length - 1;
  return (
    <div className="q-stage">
      <div className="progress"><i style={{ width: `${((current + 1) / qs.length) * 100}%` }} /></div>
      <div className="q-count">Pregunta {current + 1} de {qs.length}</div>
      <h2>{Q.q}</h2>
      {Q.help && <div className="multi-hint">✦ {Q.help}</div>}
      {Q.multi && !Q.help && <div className="multi-hint">✦ Puedes elegir varias opciones</div>}
      <div className="opts">
        {Q.opts.map((o) => {
          const isSel = Q.multi ? ((sel as string[]) || []).includes(o.v) : sel === o.v;
          const lleno = Q.multi && Q.max !== undefined && nSel >= Q.max && !isSel;
          return (
            <button key={o.v} className={`opt${isSel ? ' sel' : ''}${lleno ? ' off' : ''}`} onClick={() => pick(o.v)}>
              <span className="ic" /><span className="lbl"><b>{o.t}</b>{o.s && <small>{o.s}</small>}</span>
              {isSel && <span className="check">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="q-nav">
        {current > 0 && <button className="link-back" onClick={() => setCurrent(current - 1)}>← Anterior</button>}
        {Q.multi && <button className="btn" onClick={nextQ} disabled={nSel === 0}>{isLast ? 'Ver mi rutina ✦' : `Continuar →${Q.max ? ` (${nSel}/${Q.max})` : ''}`}</button>}
      </div>
      {current === 0 && <p className="privacidad">🔒 Tus respuestas no salen de tu navegador: no las guardamos ni las enviamos.</p>}
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
      .nat-badge{display:inline-block;margin-left:8px;background:#E8F3E4;color:#4f7a3e;padding:2px 8px;border-radius:100px;letter-spacing:.04em;font-size:.7rem}
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
      .opt.off{opacity:.45}
      .q-nav .btn[disabled]{opacity:.5;cursor:not-allowed}
      .perfil{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:18px}
      .perfil .badge{margin-bottom:0}
      .privacidad{margin-top:26px;font-size:.82rem;color:var(--ink-soft)}
      .aviso{text-align:left;border-radius:14px;padding:16px 20px;margin-bottom:16px;background:#fff;border:1px solid var(--line);font-size:.92rem;line-height:1.6;color:var(--ink-soft)}
      .aviso.medico{background:#FFF6EC;border-color:#F2D3AE}
      .aviso.medico b{display:block;color:#9a5a17;margin-bottom:4px}
      .rutina-tip ul{margin:8px 0 0 18px;padding:0}
      .rutina-tip li{margin-bottom:6px}
      .semana,.ciclo{text-align:left;margin-bottom:34px}
      .semana h3,.ciclo h3{font-family:'Fraunces',serif;font-weight:500;font-size:1.4rem;margin-bottom:6px}
      .sub-s{font-size:.9rem;color:var(--ink-soft);margin-bottom:14px}
      .semana-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
      .dia{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 8px;font-size:.78rem;line-height:1.35}
      .dia small{display:block;color:var(--accent-deep);letter-spacing:.06em;text-transform:uppercase;font-size:.66rem;margin-bottom:4px}
      .dia.rest{background:var(--bg-deep);color:var(--ink-soft)}
      .ciclo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:12px 0}
      .fase{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px;font-size:.88rem;line-height:1.5;color:var(--ink-soft)}
      .fase small{color:var(--accent-deep);letter-spacing:.08em;text-transform:uppercase;font-size:.7rem}
      .fase b{display:block;color:var(--ink);font-family:'Fraunces',serif;font-weight:500;font-size:1.05rem;margin:2px 0 6px}
      .fase .fc{margin-top:6px;color:var(--ink)}
      .fase.actual{border-color:var(--accent-deep);box-shadow:0 0 0 3px rgba(95,182,196,.30);background:var(--bg-deep)}
      @media(max-width:640px){.semana-grid{grid-template-columns:repeat(2,1fr)}.ciclo-grid{grid-template-columns:1fr}}
    `}</style>
  );
}
