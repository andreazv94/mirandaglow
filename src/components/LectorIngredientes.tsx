import { useMemo, useState } from 'react';
import { buscar, separar, tipoTxt, type Ingrediente, type Tipo } from '../data/ingredientes';
import { fichaDeInci } from '../data/fichas';

// Lista de ejemplo: un sérum inventado, no una marca real.
const EJEMPLO =
  'Aqua, Glycerin, Niacinamide, Butylene Glycol, Propanediol, Sodium Hyaluronate, Panthenol, Phenoxyethanol, Carbomer, Sodium Hydroxide, Alcohol Denat., Parfum, Rosa Canina Fruit Oil, Ethylhexylglycerin, Linalool, Limonene.';

type Fila = { pos: number; texto: string; ing?: Ingrediente };
const UTILES: Tipo[] = ['activo', 'exfoliante', 'antioxidante', 'hidratante', 'calmante', 'emoliente', 'filtro'];

export default function LectorIngredientes() {
  const [texto, setTexto] = useState('');
  const [analizado, setAnalizado] = useState('');
  const [embarazo, setEmbarazo] = useState(false);
  const [sensible, setSensible] = useState(false);
  const [granitos, setGranitos] = useState(false);

  const filas: Fila[] = useMemo(
    () => separar(analizado).map((t, i) => ({ pos: i + 1, texto: t, ing: buscar(t) })),
    [analizado],
  );
  const total = filas.length;
  const conocidos = filas.filter((f) => f.ing);

  function analizar(t = texto) {
    setAnalizado(t);
    setTimeout(() => document.getElementById('lx-res')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ---------- Lo que hace ----------
  const porTipo = new Map<Tipo, Fila[]>();
  for (const f of conocidos) {
    if (!UTILES.includes(f.ing!.tipo)) continue;
    const l = porTipo.get(f.ing!.tipo) || [];
    if (!l.some((x) => x.ing!.n === f.ing!.n)) l.push(f);
    porTipo.set(f.ing!.tipo, l);
  }
  const arriba = Math.max(5, Math.ceil(total / 3)); // primeros puestos: más cantidad

  // ---------- Avisos ----------
  type Aviso = { nivel: 'alto' | 'medio' | 'info'; titulo: string; texto: string; quien: string[] };
  const avisos: Aviso[] = [];
  const nombres = (l: Fila[]) => [...new Set(l.map((f) => f.ing!.n))];

  const emb = conocidos.filter((f) => f.ing!.embarazo);
  if (emb.length) {
    const evitar = emb.filter((f) => f.ing!.embarazo === 'evitar');
    avisos.push({
      nivel: embarazo ? 'alto' : 'info',
      titulo: 'Embarazo y lactancia',
      texto: evitar.length
        ? 'Lleva ingredientes que no se recomiendan durante el embarazo ni la lactancia.'
        : 'Lleva ingredientes que conviene consultar con tu médica o matrona si estás embarazada o das el pecho.',
      quien: nombres(emb),
    });
  }
  const perfume = conocidos.filter((f) => f.ing!.tipo === 'perfume' || f.ing!.alergeno);
  if (perfume.length)
    avisos.push({
      nivel: sensible ? 'alto' : 'medio',
      titulo: 'Lleva perfume',
      texto: 'El perfume no aporta nada a la piel y es de las causas más frecuentes de irritación y alergia. Si tu piel es sensible, mejor un producto sin él.',
      quien: nombres(perfume),
    });
  const alcohol = filas.filter((f) => f.ing?.n === 'Alcohol Denat.');
  if (alcohol.length)
    avisos.push({
      nivel: alcohol[0].pos <= 5 ? (sensible ? 'alto' : 'medio') : 'info',
      titulo: alcohol[0].pos <= 5 ? 'Mucho alcohol' : 'Lleva algo de alcohol',
      texto: alcohol[0].pos <= 5
        ? `Está en el puesto ${alcohol[0].pos}: hay bastante cantidad y puede resecar o irritar.`
        : 'Va en la parte baja de la lista, así que hay poca cantidad. Normalmente no es un problema.',
      quien: ['Alcohol Denat.'],
    });
  const otrosSens = conocidos.filter((f) => f.ing!.sensible && f.ing!.tipo !== 'perfume' && !f.ing!.alergeno && f.ing!.n !== 'Alcohol Denat.');
  if (otrosSens.length && sensible)
    avisos.push({
      nivel: 'medio',
      titulo: 'Para piel sensible',
      texto: [...new Set(otrosSens.map((f) => f.ing!.sensible))].join(' '),
      quien: nombres(otrosSens),
    });
  const poros = conocidos.filter((f) => f.ing!.poros);
  if (poros.length && granitos)
    avisos.push({
      nivel: 'medio',
      titulo: 'Si tienes granitos',
      texto: 'Lleva ingredientes que en algunas pieles con tendencia acneica pueden obstruir los poros. No le pasa a todo el mundo: si notas más granitos, sospecha de ellos.',
      quien: nombres(poros),
    });
  const sol = conocidos.filter((f) => f.ing!.sol);
  if (sol.length)
    avisos.push({
      nivel: 'info',
      titulo: 'Usa protector solar',
      texto: 'Lleva ingredientes que hacen la piel más sensible al sol. Úsalo mejor por la noche y protégete de día.',
      quien: nombres(sol),
    });
  const orden = { alto: 0, medio: 1, info: 2 };
  avisos.sort((a, b) => orden[a.nivel] - orden[b.nivel]);

  return (
    <div className="lx">
      <div className="lx-form">
        <label htmlFor="lx-text" className="lx-label">Pega aquí la lista de ingredientes</label>
        <textarea
          id="lx-text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Aqua, Glycerin, Niacinamide, …"
          rows={6}
        />
        <p className="lx-help">La encontrarás detrás del envase o en la web de la tienda, normalmente como «Ingredientes» o «INCI».</p>

        <fieldset className="lx-checks">
          <legend>Si quieres, cuéntanos tu caso para destacar lo que te afecta</legend>
          <label><input type="checkbox" checked={embarazo} onChange={(e) => setEmbarazo(e.target.checked)} /> Estoy embarazada o dando el pecho</label>
          <label><input type="checkbox" checked={sensible} onChange={(e) => setSensible(e.target.checked)} /> Tengo la piel sensible</label>
          <label><input type="checkbox" checked={granitos} onChange={(e) => setGranitos(e.target.checked)} /> Me salen granitos con facilidad</label>
        </fieldset>

        <div className="lx-actions">
          <button className="btn" onClick={() => analizar()} disabled={!texto.trim()}>Analizar ingredientes</button>
          <button className="btn ghost" onClick={() => { setTexto(EJEMPLO); analizar(EJEMPLO); }}>Probar con un ejemplo</button>
        </div>
      </div>

      {total > 0 && (
        <div id="lx-res" className="lx-res">
          <h2>Lo que lleva este producto</h2>
          <p className="lx-sum">
            {total} ingredientes. Conocemos {conocidos.length}
            {conocidos.length < total ? `; de ${total - conocidos.length} todavía no tenemos información.` : '.'}
          </p>

          {avisos.length > 0 ? (
            <div className="lx-avisos">
              {avisos.map((a) => (
                <div key={a.titulo} className={`lx-aviso lx-${a.nivel}`}>
                  <h3>{a.titulo}</h3>
                  <p>{a.texto}</p>
                  <p className="lx-quien">{a.quien.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="lx-aviso lx-ok"><h3>Nada que destacar</h3><p>No vemos perfume, ingredientes a evitar en el embarazo ni nada que suela dar problemas.</p></div>
          )}

          {porTipo.size > 0 && (
            <div className="lx-hace">
              <h3>Para qué sirve</h3>
              <dl>
                {UTILES.filter((t) => porTipo.has(t)).map((t) => (
                  <div key={t}>
                    <dt>{tipoTxt[t]}</dt>
                    <dd>
                      {porTipo.get(t)!.map((f, i) => (
                        <span key={f.ing!.n}>
                          {i > 0 && ', '}{f.ing!.n}
                          {(t === 'activo' || t === 'exfoliante' || t === 'antioxidante') && (
                            <em>{f.pos <= arriba ? ' (puesto ' + f.pos + ': buena cantidad)' : ' (puesto ' + f.pos + ': poca cantidad)'}</em>
                          )}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <h3 className="lx-tabla-h">Ingrediente por ingrediente</h3>
          <ol className="lx-tabla">
            {filas.map((f) => (
              <li key={f.pos} className={f.ing ? '' : 'lx-desc'}>
                <span className="lx-pos">{f.pos}</span>
                <div>
                  <p className="lx-n">
                    {f.ing && fichaDeInci(f.ing.n)
                      ? <a href={`/ingredientes/${fichaDeInci(f.ing.n)!.slug}`}>{f.ing.n}</a>
                      : f.ing ? f.ing.n : f.texto}
                    {f.ing && <span className="lx-tipo">{tipoTxt[f.ing.tipo]}</span>}
                  </p>
                  <p className="lx-que">{f.ing ? f.ing.que : 'Todavía no lo tenemos en nuestra base. Lo iremos añadiendo.'}</p>
                  {f.ing && (f.ing.embarazo || f.ing.alergeno || f.ing.sensible || f.ing.poros || f.ing.sol) && (
                    <p className="lx-flags">
                      {f.ing.embarazo === 'evitar' && <span className="f-emb">Evitar en el embarazo</span>}
                      {f.ing.embarazo === 'consultar' && <span className="f-emb">Consultar en el embarazo</span>}
                      {f.ing.alergeno && <span className="f-perf">Alérgeno de perfume</span>}
                      {f.ing.sensible && !f.ing.alergeno && <span className="f-sens">Piel sensible</span>}
                      {f.ing.poros && <span className="f-sens">Puede obstruir poros</span>}
                      {f.ing.sol && <span className="f-sol">Protégete del sol</span>}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <p className="lx-nota">
            Los ingredientes se ordenan de más a menos cantidad hasta llegar al 1&nbsp;%; a partir de ahí pueden ir en cualquier orden.
            Este lector no conoce las concentraciones exactas ni sustituye la consulta con una dermatóloga. No guardamos lo que pegas.
          </p>
        </div>
      )}
    </div>
  );
}
