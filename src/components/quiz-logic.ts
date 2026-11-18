// ============================================================
//  LÓGICA DEL TEST DE PIEL
// ============================================================
//  Aquí están las preguntas y el motor que monta la rutina.
//  Está separado del componente visual (Quiz.tsx) para poder
//  cambiar preguntas o reglas sin tocar el diseño.
//
//  Las respuestas nunca salen del navegador: no se guardan ni
//  se envían a ningún servidor.
// ============================================================

import { productos, type Producto } from '../data/productos';

export type Answers = Record<string, string | string[] | undefined>;
export type Opt = { t: string; v: string; s?: string };
export type Question = {
  id: string;
  q: string;
  help?: string;
  multi?: boolean;
  max?: number;
  opts: Opt[];
  /** Solo se muestra si devuelve true (preguntas condicionales). */
  when?: (a: Answers) => boolean;
};

const one = (a: Answers, id: string) => a[id] as string | undefined;
const many = (a: Answers, id: string) => (a[id] as string[] | undefined) || [];

const conCiclo = (a: Answers) =>
  one(a, 'sexo') !== 'hombre' && ['regular', 'irregular'].includes(one(a, 'hormonas') || '');

// ---------- Preguntas ----------
export const questions: Question[] = [
  { id: 'sexo', q: '¿Con qué te identificas?', help: 'Las hormonas influyen en la piel. Lo usamos solo para afinar la rutina.', opts: [
    { t: 'Mujer', v: 'mujer' },
    { t: 'Hombre', v: 'hombre' },
    { t: 'Prefiero no decirlo', v: 'nd' },
  ]},
  { id: 'edad', q: '¿Qué edad tienes?', opts: [
    { t: 'Menos de 18', v: '15', s: 'Rutina sencilla y suave' },
    { t: '18–24', v: '20' },
    { t: '25–34', v: '30' },
    { t: '35–44', v: '40' },
    { t: '45–54', v: '50' },
    { t: '55 o más', v: '60' },
  ]},
  { id: 'tipo', q: '¿Cómo notas tu piel al final del día?', opts: [
    { t: 'Tirante y seca', v: 'seca', s: 'Sin brillos, a veces se descama' },
    { t: 'Brillante por todas partes', v: 'grasa', s: 'Poros visibles, sobre todo en la zona T' },
    { t: 'Brillos en la zona T, normal en mejillas', v: 'mixta', s: 'Lo más común' },
    { t: 'Equilibrada', v: 'normal', s: 'Cómoda casi siempre' },
  ]},
  { id: 'sensible', q: '¿Tu piel reacciona con facilidad?', opts: [
    { t: 'Mucho: pica, escuece o se enrojece', v: 'muy', s: 'Piel hiperreactiva' },
    { t: 'A veces, según el producto', v: 'algo' },
    { t: 'No, tolera casi todo', v: 'no' },
    { t: 'No lo sé', v: 'ns' },
  ]},
  { id: 'problemas', q: '¿Qué te gustaría mejorar?', multi: true, max: 4, help: 'Elige hasta 4. Empieza por lo que más te preocupa.', opts: [
    { t: 'Granitos y acné', v: 'acne' },
    { t: 'Puntos negros y poros', v: 'poros' },
    { t: 'Rojeces o rosácea', v: 'rojeces' },
    { t: 'Manchas de sol o melasma', v: 'manchas' },
    { t: 'Marcas y cicatrices de granitos', v: 'marcas' },
    { t: 'Arrugas y líneas', v: 'lineas' },
    { t: 'Falta de firmeza', v: 'firmeza' },
    { t: 'Ojeras y bolsas', v: 'ojeras' },
    { t: 'Piel apagada', v: 'luz' },
    { t: 'Textura irregular', v: 'textura' },
    { t: 'Tirantez aunque tenga brillos', v: 'deshidratacion', s: 'Piel deshidratada' },
    { t: 'Descamación o zonas ásperas', v: 'descamacion' },
    { t: 'Irritación por afeitado o depilación', v: 'afeitado' },
  ]},
  { id: 'sol', q: '¿Cómo reacciona tu piel al sol?', opts: [
    { t: 'Me quemo siempre', v: 'I', s: 'Piel muy clara, a menudo con pecas' },
    { t: 'Me quemo y luego me bronceo', v: 'II' },
    { t: 'Me bronceo con facilidad', v: 'III' },
    { t: 'Casi nunca me quemo', v: 'IV', s: 'Piel morena u oscura' },
  ]},
  { id: 'lunares', q: '¿Tienes muchos lunares?', opts: [
    { t: 'Sí, muchos', v: 'muchos', s: 'Más de 50 por todo el cuerpo' },
    { t: 'Alguno ha cambiado de forma, tamaño o color', v: 'cambio' },
    { t: 'Unos pocos', v: 'pocos' },
  ]},
  { id: 'hormonas', q: '¿En qué momento hormonal estás?', help: 'Opcional. Cambia los ingredientes que te recomendamos.',
    when: (a) => one(a, 'sexo') !== 'hombre', opts: [
    { t: 'Tengo la regla de forma regular', v: 'regular' },
    { t: 'Tengo la regla, pero irregular', v: 'irregular' },
    { t: 'Tomo anticonceptivos hormonales', v: 'anticonceptivos' },
    { t: 'Estoy embarazada o buscando embarazo', v: 'embarazo' },
    { t: 'Estoy dando el pecho', v: 'lactancia' },
    { t: 'Perimenopausia o menopausia', v: 'menopausia' },
    { t: 'Prefiero no decirlo', v: 'nd' },
  ]},
  { id: 'fase', q: '¿En qué fase de tu ciclo estás ahora?', help: 'Cuenta desde el primer día de tu última regla.',
    when: conCiclo, opts: [
    { t: 'Con la regla', v: 'menstrual', s: 'Días 1–5 aprox.' },
    { t: 'Justo después de la regla', v: 'folicular', s: 'Días 6–12 aprox.' },
    { t: 'A mitad de ciclo', v: 'ovulacion', s: 'Días 13–16 aprox.' },
    { t: 'La semana antes de la regla', v: 'lutea', s: 'Días 17–28 aprox.' },
    { t: 'No lo sé', v: 'ns' },
  ]},
  { id: 'experiencia', q: '¿Cuánta experiencia tienes con el skincare?', opts: [
    { t: 'Empiezo de cero', v: 'novata', s: 'Mejor una rutina simple' },
    { t: 'Lo básico: limpio e hidrato', v: 'media' },
    { t: 'Uso activos (ácidos, retinol…)', v: 'avanzada' },
  ]},
  { id: 'tiempo', q: '¿Cuánto tiempo quieres dedicarle al día?', opts: [
    { t: 'Lo mínimo, 3–4 pasos', v: 'corta' },
    { t: 'Una rutina completa', v: 'completa' },
  ]},
  { id: 'spf', q: '¿Usas protector solar a diario?', opts: [
    { t: 'Sí, cada día', v: 'si' },
    { t: 'Solo en verano o en la playa', v: 'verano' },
    { t: 'Casi nunca', v: 'no' },
  ]},
];

export const visibleQuestions = (a: Answers) => questions.filter((q) => !q.when || q.when(a));

// ---------- Textos de apoyo ----------
export const fases: Record<string, { nombre: string; dias: string; piel: string; consejo: string }> = {
  menstrual: {
    nombre: 'Menstruación', dias: 'Días 1–5',
    piel: 'Los estrógenos y la progesterona están bajos: la piel suele estar más seca, apagada y sensible.',
    consejo: 'Hidratación y calma. Deja los exfoliantes para la semana que viene y no estrenes productos.',
  },
  folicular: {
    nombre: 'Fase folicular', dias: 'Días 6–12',
    piel: 'Suben los estrógenos: la piel está más hidratada, luminosa y tolera mejor los activos.',
    consejo: 'Buen momento para exfoliar o introducir un activo nuevo.',
  },
  ovulacion: {
    nombre: 'Ovulación', dias: 'Días 13–16',
    piel: 'La piel suele estar en su mejor momento, aunque puede empezar a producir algo más de grasa.',
    consejo: 'Mantén la rutina y no te olvides del protector solar.',
  },
  lutea: {
    nombre: 'Fase lútea (premenstrual)', dias: 'Días 17–28',
    piel: 'Sube la progesterona: más sebo, poros más visibles y es cuando suelen salir granitos en mandíbula y barbilla.',
    consejo: 'Limpieza a fondo por la noche y un activo para los poros. Ten a mano parches para los granitos.',
  },
};

// ---------- Motor de recomendación ----------
export type Resultado = {
  rutina: Producto[];
  perfil: string[];
  avisos: { tipo: 'medico' | 'info'; texto: string }[];
  consejos: string[];
  semana?: { dia: string; activo: string }[];
  fase?: string;
};

const P = productos;
const FUERTES = ['retinol', 'aha', 'bha'];

export function buildRoutine(todas: Answers): Resultado {
  // Ignora respuestas de preguntas que ya no se muestran (p. ej. si cambió de "Mujer" a "Hombre")
  const vis = new Set(visibleQuestions(todas).map((q) => q.id));
  const a: Answers = Object.fromEntries(Object.entries(todas).filter(([k]) => vis.has(k)));
  const sexo = one(a, 'sexo');
  const edad = Number(one(a, 'edad') || 30);
  const tipo = one(a, 'tipo') || 'normal';
  const sens = one(a, 'sensible');
  const pr = many(a, 'problemas');
  const sol = one(a, 'sol');
  const lunares = one(a, 'lunares');
  const horm = one(a, 'hormonas');
  const fase = conCiclo(a) ? one(a, 'fase') : undefined;
  const exp = one(a, 'experiencia');
  const tiempo = one(a, 'tiempo');
  const spfUso = one(a, 'spf');

  const has = (v: string) => pr.includes(v);
  const embarazo = horm === 'embarazo' || horm === 'lactancia';
  const sensible = sens === 'muy' || has('rojeces');
  const menor = edad < 18;
  const menopausia = horm === 'menopausia' || edad >= 50;
  const tendenciaGrasa = tipo === 'grasa' || tipo === 'mixta' || has('acne') || has('poros');

  // Qué activos están permitidos en este perfil
  const ok = {
    retinol: !embarazo && !menor && sens !== 'muy',
    bha: !embarazo && sens !== 'muy' && (fase !== 'menstrual' || has('acne')),
    aha: !menor && !sensible && fase !== 'menstrual',
    vitC: !sensible,
  };

  const r: Producto[] = [];
  const add = (...ps: (Producto | false | undefined)[]) => ps.forEach((p) => p && r.push(p));

  // 1. Limpieza
  if (tipo === 'seca' || sensible || has('descamacion')) add(P.limpiadorSeca);
  else if (tendenciaGrasa) add(P.limpiadorGrasa);
  else add(P.limpiador);

  // 2. Tratamientos según lo que quiere mejorar
  if (has('acne')) add(P.niacin, ok.bha ? P.bha : P.azelaico, P.parches);
  if (has('poros')) add(P.niacin, ok.bha && P.bha);
  if (has('rojeces')) add(P.azelaico, P.calmante);
  if (has('manchas')) add(ok.vitC ? P.vitC : P.niacin, P.azelaico);
  if (has('marcas')) add(P.azelaico, P.niacin, ok.aha && P.aha);
  if (has('lineas')) add(ok.retinol ? P.retinol : P.peptidos, ok.vitC && P.vitC);
  if (has('firmeza')) add(P.peptidos, ok.retinol && edad >= 30 && P.retinol);
  if (has('ojeras')) add(P.contorno);
  if (has('luz')) add(ok.vitC ? P.vitC : P.niacin, ok.aha && P.aha);
  if (has('textura')) add(ok.aha ? P.aha : P.niacin);
  if (has('deshidratacion')) add(P.hialu);
  if (has('descamacion')) add(P.hialu);
  if (has('afeitado')) add(P.postAfeitado, P.calmante);
  if (sens === 'muy' && !r.includes(P.calmante)) add(P.calmante);

  // Si no ha marcado nada, una base preventiva
  if (r.length === 1) add(ok.vitC ? P.vitC : P.niacin, P.hialu);

  // 3. Ajustes por edad y hormonas
  if (edad >= 35 && ok.retinol && !r.includes(P.retinol) && exp !== 'novata') add(P.retinol);
  if (menopausia) add(P.peptidos, P.hialu);
  if (fase === 'lutea' && tendenciaGrasa) add(ok.bha ? P.bha : P.azelaico);
  if (fase === 'menstrual') add(P.hialu);

  // 4. Hidratación
  if (sensible || has('descamacion')) add(P.ceramidas);
  else if (tipo === 'seca' || menopausia) add(P.hidraRica);
  else add(P.hidra);

  // 5. Protección solar
  add(sensible || embarazo || sol === 'I' ? P.spfMineral : P.spf);

  let rutina = [...new Set(r)];

  // Quien empieza: como mucho un activo fuerte
  if (exp === 'novata') {
    const fuertes = rutina.filter((p) => FUERTES.includes(p.id));
    rutina = rutina.filter((p) => !fuertes.slice(1).includes(p));
  }

  // Rutina corta: limpieza + 2 tratamientos + hidratante + SPF
  if (tiempo === 'corta') {
    const limpieza = rutina.filter((p) => p.orden === 1);
    const trat = rutina.filter((p) => p.orden >= 2 && p.orden <= 3).slice(0, 2);
    const hidra = rutina.filter((p) => p.orden === 4).slice(0, 1);
    const prot = rutina.filter((p) => p.orden === 5);
    const extra = rutina.filter((p) => p.orden === 6);
    rutina = [...limpieza, ...trat, ...hidra, ...prot, ...extra];
  }

  // ---------- Perfil ----------
  const perfil: string[] = [];
  const tipoTxt: Record<string, string> = { seca: 'Piel seca', grasa: 'Piel grasa', mixta: 'Piel mixta', normal: 'Piel normal' };
  perfil.push(tipoTxt[tipo]);
  if (sens === 'muy') perfil.push('Hiperreactiva');
  else if (sens === 'algo') perfil.push('Algo sensible');
  if (sexo === 'mujer') perfil.push('Mujer');
  if (sexo === 'hombre') perfil.push('Hombre');
  const edadTxt: Record<number, string> = { 15: '<18', 20: '18–24', 30: '25–34', 40: '35–44', 50: '45–54', 60: '55+' };
  perfil.push(`${edadTxt[edad]} años`);
  if (fase && fases[fase]) perfil.push(fases[fase].nombre);
  if (horm === 'embarazo') perfil.push('Embarazo');
  if (horm === 'lactancia') perfil.push('Lactancia');
  if (horm === 'menopausia') perfil.push('Menopausia');

  // ---------- Avisos ----------
  const avisos: Resultado['avisos'] = [];
  if (embarazo)
    avisos.push({ tipo: 'medico', texto: 'Hemos quitado el retinol y el ácido salicílico, que se desaconsejan en el embarazo y la lactancia. En su lugar te proponemos ácido azelaico, niacinamida y péptidos. Coméntalo con tu matrona o dermatóloga, sobre todo si usas algún tratamiento.' });
  if (has('rojeces'))
    avisos.push({ tipo: 'medico', texto: 'Si las rojeces no se van, notas calor o te salen granitos sin puntos negros, puede ser rosácea. Tiene tratamiento médico: merece la pena que la valore una dermatóloga.' });
  if (lunares === 'cambio')
    avisos.push({ tipo: 'medico', texto: 'Un lunar que cambia de forma, tamaño o color, sangra o pica tiene que verlo una dermatóloga cuanto antes. Pide cita en tu centro de salud.' });
  else if (lunares === 'muchos' || sol === 'I')
    avisos.push({ tipo: 'medico', texto: 'Con muchos lunares o piel que se quema fácil, conviene una revisión de lunares con la dermatóloga una vez al año y vigilarlos tú misma con la regla ABCDE (asimetría, bordes, color, diámetro y evolución).' });
  if (has('descamacion'))
    avisos.push({ tipo: 'info', texto: 'Si la descamación pica, va y viene o aparece en cejas, nariz o cuero cabelludo, puede ser dermatitis. Una dermatóloga te lo confirma en una consulta.' });
  if (has('manchas'))
    avisos.push({ tipo: 'info', texto: 'El melasma (manchas simétricas en mejillas, frente o labio superior) empeora con el sol y las hormonas. Sin protector solar diario ningún sérum funciona.' });
  if (menor)
    avisos.push({ tipo: 'info', texto: 'A tu edad la piel no necesita retinol ni ácidos fuertes. Si el acné te deja marcas o te agobia, pide cita con tu médico: hay tratamientos que funcionan muy bien.' });
  if (has('acne') && (horm === 'irregular'))
    avisos.push({ tipo: 'info', texto: 'Acné junto con reglas irregulares puede tener un origen hormonal (por ejemplo, ovario poliquístico). Coméntalo con tu ginecóloga o médico de cabecera.' });

  // ---------- Consejos ----------
  const consejos: string[] = [];
  if (spfUso !== 'si')
    consejos.push('El protector solar cada día, también en invierno y nublado, es lo que más previene manchas y arrugas. Sin él, el resto de la rutina rinde mucho menos.');
  if (sexo === 'hombre')
    consejos.push('Si te afeitas, hazlo después de la ducha, a favor del pelo y con cuchilla limpia. Hidrata justo después aunque tengas la piel grasa.');
  if (horm === 'anticonceptivos')
    consejos.push('Algunos anticonceptivos favorecen las manchas en la cara. Si te salen, refuerza el protector solar.');
  if (menopausia)
    consejos.push('Con la bajada de estrógenos la piel pierde agua y firmeza. Hidrata mañana y noche y busca texturas más ricas.');
  if (fase === 'ns' || horm === 'irregular')
    consejos.push('Si apuntas tus reglas en una app, verás en qué días tu piel tiene más granitos o está más seca y podrás repetir el test en cada fase.');
  if (exp === 'novata')
    consejos.push('Empieza solo con limpieza, hidratante y protector solar dos semanas. Después añade los tratamientos de uno en uno.');
  consejos.push('Introduce los productos nuevos de uno en uno, con unos días entre cada uno. Si algo te irrita, espácialo o déjalo.');

  // ---------- Calendario de activos de noche ----------
  const noche = rutina.filter((p) => FUERTES.includes(p.id));
  let semana: Resultado['semana'];
  if (noche.length >= 2) {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const plan = rutina.includes(P.retinol)
      ? ['retinol', 'descanso', 'otro', 'retinol', 'descanso', 'otro', 'descanso']
      : ['bha', 'descanso', 'aha', 'descanso', 'bha', 'descanso', 'descanso'];
    const otros = noche.filter((p) => p.id !== 'retinol');
    let n = 0;
    semana = dias.map((dia, i) => {
      const k = plan[i];
      const prod = k === 'otro' ? otros[n++ % otros.length] : k === 'descanso' ? undefined : P[k];
      return { dia, activo: prod ? prod.nombre : 'Solo hidratar' };
    });
  }

  return { rutina, perfil, avisos, consejos, semana, fase };
}
