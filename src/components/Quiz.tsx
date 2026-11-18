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
        <div className="rb-head"><h3>{titulo}</h3></div>
        {lista.map((p, i) => (
          <a key={p.id} className="prod" href={p.url} target="_blank" rel="sponsored nofollow noopener">
            <span className="stepn">{p.orden === 6 ? 'Extra' : i + 1}</span>
            <span className="pinfo">
              <span className="cat">{p.categoria}{p.natural && <span className="nat-badge">natural</span>}</span>
              <b>{p.nombre}</b>
              <span className="d">{p.descripcion}</span>
              <span className="freq">{p.frecuencia}</span>
            </span>
            <span className="price">{p.precio}<small>Ver en {p.tienda}</small></span>
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
          <div key={x.texto} className="aviso medico"><b>Importante</b><p>{x.texto}</p></div>
        ))}

        <Bloque titulo="Por la mañana" icono="" lista={manana} />
        <Bloque titulo="Por la noche" icono="" lista={noche} />

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

        <p className="privacidad">Tus respuestas no salen de tu navegador: no las enviamos a ningún servidor. Esta rutina es orientativa y no sustituye la consulta con una dermatóloga.</p>

        <div className="app-cta">
          <b>Sigue tu rutina cada día</b>
          <p>Guárdala en la app: marca los pasos, sigue tu racha y mira qué activo toca cada noche. Se guarda solo en este dispositivo.</p>
          <button className="btn" onClick={() => {
            try { localStorage.setItem('mirandaglow.answers.v2', JSON.stringify(answers)); } catch {}
            window.location.href = '/app/routine';
          }}>Abrir mi rutina en la app</button>
        </div>

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
      {Q.help && <div className="multi-hint">{Q.help}</div>}
      {Q.multi && !Q.help && <div className="multi-hint">Puedes elegir varias opciones.</div>}
      <div className="opts">
        {Q.opts.map((o) => {
          const isSel = Q.multi ? ((sel as string[]) || []).includes(o.v) : sel === o.v;
          const lleno = Q.multi && Q.max !== undefined && nSel >= Q.max && !isSel;
          return (
            <button key={o.v} className={`opt${isSel ? ' sel' : ''}${lleno ? ' off' : ''}`} onClick={() => pick(o.v)}>
              <span className="lbl"><b>{o.t}</b>{o.s && <small>{o.s}</small>}</span>
              {isSel && <span className="check">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="q-nav">
        {current > 0 && <button className="link-back" onClick={() => setCurrent(current - 1)}>← Anterior</button>}
        {Q.multi && <button className="btn" onClick={nextQ} disabled={nSel === 0}>{isLast ? 'Ver mi rutina' : `Continuar${Q.max ? ` (${nSel}/${Q.max})` : ''}`}</button>}
      </div>
      {current === 0 && <p className="privacidad">Tus respuestas no salen de tu navegador: no las guardamos ni las enviamos.</p>}
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .q-stage,.q-result{max-width:720px;margin:0 auto}
      .progress{height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:28px}
      .progress i{display:block;height:100%;background:var(--acento);transition:width .3s ease}
      .q-count{font-size:.92rem;color:var(--ink-soft);margin-bottom:10px}
      .q-stage h2,.q-result h2{font-size:clamp(1.7rem,3.6vw,2.4rem);margin-bottom:12px}
      .multi-hint{font-size:.95rem;color:var(--ink-soft);margin-bottom:22px}
      .q-stage h2 + .opts{margin-top:24px}
      .opts{display:grid;gap:10px;grid-template-columns:1fr 1fr}
      .opt{background:var(--white);border:1.5px solid var(--line);border-radius:var(--radius);padding:16px 18px;cursor:pointer;text-align:left;font-size:1rem;display:flex;align-items:center;gap:12px;position:relative;font-family:inherit;color:var(--ink)}
      .opt:hover{border-color:var(--ink)}
      .opt.sel{border-color:var(--acento);background:var(--acento-tint)}
      .opt.off{opacity:.45}
      .opt .lbl b{display:block;font-weight:600}
      .opt .lbl small{display:block;color:var(--ink-soft);font-size:.88rem;margin-top:2px}
      .opt .check{margin-left:auto;color:var(--acento);font-weight:700}
      .q-nav{margin-top:28px;display:flex;align-items:center;gap:20px}
      .q-nav .btn[disabled]{opacity:.45;cursor:not-allowed}
      .link-back{background:none;border:none;color:var(--ink-soft);cursor:pointer;font-size:.95rem;text-decoration:underline;font-family:inherit}
      .perfil{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
      .badge{display:inline-block;background:var(--white);border:1px solid var(--line);color:var(--ink);padding:4px 10px;border-radius:var(--radius);font-size:.88rem}
      .q-result .sub{color:var(--ink-soft);margin-bottom:28px}
      .privacidad{margin-top:24px;font-size:.88rem;color:var(--ink-soft)}
      .aviso{border-radius:var(--radius);padding:14px 18px;margin-bottom:14px;background:var(--white);border:1px solid var(--line);font-size:.97rem;line-height:1.55;color:var(--ink-soft)}
      .aviso.medico{background:#FBF5EC;border-color:#EBD6B4;border-left:3px solid var(--ambar);color:#3A3326}
      .aviso.medico b{display:block;color:var(--ambar);margin-bottom:2px}
      .rutina-bloque{margin:34px 0}
      .rb-head h3{font-size:1.35rem;margin-bottom:12px}
      .prod{display:grid;grid-template-columns:44px 1fr auto;gap:16px;align-items:start;background:var(--white);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;margin-bottom:8px;text-decoration:none;color:var(--ink)}
      .prod:hover{border-color:var(--ink)}
      .prod .stepn{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--acento);color:var(--acento);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem}
      .prod .cat{display:block;font-size:.85rem;color:var(--ink-soft)}
      .nat-badge{margin-left:8px;color:var(--salvia)}
      .prod .pinfo b{display:block;font-weight:600;font-size:1.06rem;margin:1px 0 2px}
      .prod .d{display:block;font-size:.93rem;color:var(--ink-soft);line-height:1.45}
      .freq{display:inline-block;margin-top:8px;font-size:.84rem;color:var(--ink);background:var(--paper);border:1px solid var(--line);padding:2px 8px;border-radius:4px}
      .prod .price{font-weight:600;text-align:right;white-space:nowrap}
      .prod .price small{display:block;font-weight:500;font-size:.85rem;color:var(--acento)}
      .semana,.ciclo{margin:34px 0}
      .semana h3,.ciclo h3{font-size:1.35rem;margin-bottom:6px}
      .sub-s{font-size:.95rem;color:var(--ink-soft);margin-bottom:14px}
      .semana-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
      .dia{background:var(--white);border:1px solid var(--line);border-radius:var(--radius);padding:10px 8px;font-size:.82rem;line-height:1.35}
      .dia small{display:block;color:var(--ink-soft);font-size:.78rem;margin-bottom:4px}
      .dia.rest{background:transparent;color:var(--ink-soft)}
      .ciclo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0}
      .fase{background:var(--white);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;font-size:.93rem;line-height:1.5;color:var(--ink-soft)}
      .fase small{font-size:.84rem}
      .fase b{display:block;color:var(--ink);font-size:1.05rem;margin:2px 0 6px}
      .fase .fc{margin-top:6px;color:var(--ink)}
      .fase.actual{border:1.5px solid var(--acento);background:var(--acento-tint)}
      .rutina-tip{background:var(--white);border:1px solid var(--line);border-radius:var(--radius);padding:18px 22px;font-size:.97rem;color:var(--ink-soft);line-height:1.6}
      .rutina-tip b{color:var(--ink)}
      .rutina-tip ul{margin:8px 0 0 18px;padding:0}
      .rutina-tip li{margin-bottom:6px}
      .app-cta{margin-top:28px;background:var(--ink);color:#F0F6F7;border-radius:var(--radius);padding:26px}
      .app-cta b{font-size:1.25rem}
      .app-cta p{color:#C3D6D9;font-size:.97rem;margin:6px 0 16px}
      .app-cta .btn{background:#A9D8DC;border-color:#A9D8DC;color:var(--ink)}
      .app-cta .btn:hover{background:#fff;border-color:#fff}
      @media(max-width:640px){.opts{grid-template-columns:1fr}.prod{grid-template-columns:36px 1fr}.prod .price{grid-column:2;text-align:left}.semana-grid{grid-template-columns:repeat(2,1fr)}.ciclo-grid{grid-template-columns:1fr}}
    ` }} />
  );
}
