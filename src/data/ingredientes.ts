// ============================================================
//  BASE DE INGREDIENTES (INCI)
// ============================================================
//  La usa el lector de ingredientes (/ingredientes).
//  - n:      nombre INCI tal y como aparece en los envases
//  - alias:  otras formas de escribirlo (en minúsculas)
//  - tipo:   para qué está en la fórmula
//  - que:    explicación corta, en lenguaje claro
//  - avisos: solo los que tienen respaldo; sin alarmismo
//
//  Criterio: información general y prudente. Ante la duda, no
//  se marca nada. Para añadir un ingrediente, copia uno parecido.
// ============================================================

export type Tipo =
  | 'activo' | 'exfoliante' | 'antioxidante' | 'hidratante' | 'emoliente' | 'calmante'
  | 'filtro' | 'conservante' | 'perfume' | 'limpiador' | 'textura' | 'color' | 'base';

export type Ingrediente = {
  n: string;
  alias?: string[];
  tipo: Tipo;
  que: string;
  /** evitar: no se recomienda en embarazo/lactancia · consultar: pregunta a tu médica */
  embarazo?: 'evitar' | 'consultar';
  /** Alérgeno de perfume que la ley obliga a declarar */
  alergeno?: boolean;
  /** Puede molestar a pieles sensibles o reactivas */
  sensible?: string;
  /** Puede obstruir poros en pieles con tendencia acneica */
  poros?: boolean;
  /** Pide protección solar mientras lo usas */
  sol?: boolean;
};

export const tipoTxt: Record<Tipo, string> = {
  activo: 'Activo', exfoliante: 'Exfoliante', antioxidante: 'Antioxidante', hidratante: 'Hidratante',
  emoliente: 'Emoliente', calmante: 'Calmante', filtro: 'Filtro solar', conservante: 'Conservante',
  perfume: 'Perfume', limpiador: 'Limpiador', textura: 'Textura', color: 'Color', base: 'Base',
};

const SENS_ACIDO = 'Exfolia: si tu piel es sensible, empieza 1–2 veces por semana.';
const SENS_PERFUME = 'El perfume es una de las causas más frecuentes de irritación y alergia en cosmética.';
const ALERGENO = (n: string, alias: string[] = []): Ingrediente => ({
  n, alias, tipo: 'perfume', alergeno: true,
  que: 'Componente del perfume que la ley obliga a declarar porque puede dar alergia a algunas personas.',
  sensible: SENS_PERFUME,
});

export const ingredientes: Ingrediente[] = [
  // ---------- Base y agua ----------
  { n: 'Aqua', alias: ['water', 'eau', 'agua', 'aqua/water', 'water/aqua'], tipo: 'base', que: 'Agua. Suele ser el ingrediente principal y sirve de base para disolver el resto.' },
  { n: 'Aloe Barbadensis Leaf Juice', alias: ['aloe barbadensis leaf extract', 'aloe vera'], tipo: 'calmante', que: 'Jugo de aloe vera. Hidrata y refresca.' },
  { n: 'Rosa Damascena Flower Water', alias: ['rose water'], tipo: 'base', que: 'Agua de rosas. Aporta aroma; puede molestar a pieles muy sensibles.', sensible: 'Lleva aroma natural.' },

  // ---------- Hidratantes ----------
  { n: 'Glycerin', alias: ['glycerine'], tipo: 'hidratante', que: 'Glicerina. Atrae el agua a la piel. Uno de los hidratantes más eficaces y mejor tolerados.' },
  { n: 'Sodium Hyaluronate', tipo: 'hidratante', que: 'Ácido hialurónico en forma de sal. Retiene agua y deja la piel jugosa.' },
  { n: 'Hyaluronic Acid', tipo: 'hidratante', que: 'Ácido hialurónico. Retiene agua en la superficie de la piel.' },
  { n: 'Hydrolyzed Hyaluronic Acid', alias: ['hydrolyzed sodium hyaluronate'], tipo: 'hidratante', que: 'Hialurónico de molécula pequeña. Hidrata algo más en profundidad.' },
  { n: 'Sodium Hyaluronate Crosspolymer', tipo: 'hidratante', que: 'Hialurónico que forma una película hidratante duradera.' },
  { n: 'Panthenol', alias: ['d-panthenol', 'dexpanthenol', 'provitamin b5'], tipo: 'calmante', que: 'Provitamina B5. Hidrata, calma y ayuda a reparar la piel.' },
  { n: 'Urea', tipo: 'hidratante', que: 'Hidrata mucho y, en concentraciones altas, suaviza zonas ásperas.' },
  { n: 'Betaine', tipo: 'hidratante', que: 'Hidratante suave de origen vegetal (remolacha).' },
  { n: 'Sodium PCA', tipo: 'hidratante', que: 'Parte del factor de hidratación natural de la piel.' },
  { n: 'Trehalose', tipo: 'hidratante', que: 'Azúcar que ayuda a retener la hidratación.' },
  { n: 'Propanediol', tipo: 'hidratante', que: 'Hidratante y disolvente suave. Ayuda a que la fórmula se extienda bien.' },
  { n: 'Butylene Glycol', tipo: 'hidratante', que: 'Hidratante y disolvente muy habitual. Bien tolerado.' },
  { n: 'Pentylene Glycol', tipo: 'hidratante', que: 'Hidratante que además ayuda a conservar la fórmula.' },
  { n: 'Propylene Glycol', tipo: 'hidratante', que: 'Hidratante y disolvente. Bien tolerado en general; a algunas pieles muy reactivas les escuece.', sensible: 'En pieles muy reactivas puede escocer.' },
  { n: 'Caprylyl Glycol', tipo: 'hidratante', que: 'Hidratante que refuerza los conservantes.' },
  { n: '1,2-Hexanediol', alias: ['1,2 hexanediol', 'hexanediol'], tipo: 'hidratante', que: 'Hidratante que ayuda a conservar la fórmula. Muy usado en cosmética coreana.' },
  { n: 'Sorbitol', tipo: 'hidratante', que: 'Azúcar hidratante.' },
  { n: 'Allantoin', tipo: 'calmante', que: 'Calma y suaviza la piel irritada.' },

  // ---------- Barrera y emolientes ----------
  { n: 'Ceramide NP', alias: ['ceramide 3'], tipo: 'emoliente', que: 'Ceramida: lípido propio de la piel. Refuerza la barrera.' },
  { n: 'Ceramide AP', alias: ['ceramide 6 ii'], tipo: 'emoliente', que: 'Ceramida: refuerza la barrera de la piel.' },
  { n: 'Ceramide EOP', alias: ['ceramide 1'], tipo: 'emoliente', que: 'Ceramida: refuerza la barrera de la piel.' },
  { n: 'Cholesterol', tipo: 'emoliente', que: 'Lípido natural de la piel. Junto a las ceramidas, repara la barrera.' },
  { n: 'Phytosphingosine', tipo: 'emoliente', que: 'Ayuda a formar ceramidas y tiene efecto calmante.' },
  { n: 'Squalane', tipo: 'emoliente', que: 'Aceite ligero muy parecido al de la piel. Suaviza sin engrasar.' },
  { n: 'Caprylic/Capric Triglyceride', alias: ['caprylic capric triglyceride'], tipo: 'emoliente', que: 'Aceite ligero derivado del coco. Suaviza y da buena textura.' },
  { n: 'Dimethicone', tipo: 'emoliente', que: 'Silicona. Da tacto sedoso y protege sin obstruir los poros.' },
  { n: 'Cyclopentasiloxane', alias: ['cyclomethicone'], tipo: 'textura', que: 'Silicona volátil que se evapora y deja tacto seco.' },
  { n: 'Butyrospermum Parkii Butter', alias: ['butyrospermum parkii (shea) butter', 'shea butter'], tipo: 'emoliente', que: 'Manteca de karité. Nutre pieles secas.' },
  { n: 'Simmondsia Chinensis Seed Oil', alias: ['jojoba oil', 'simmondsia chinensis (jojoba) seed oil'], tipo: 'emoliente', que: 'Aceite de jojoba. Ligero, se parece al sebo de la piel.' },
  { n: 'Argania Spinosa Kernel Oil', alias: ['argan oil'], tipo: 'emoliente', que: 'Aceite de argán. Nutre y suaviza.' },
  { n: 'Rosa Canina Fruit Oil', alias: ['rosa canina seed oil', 'rosa rubiginosa seed oil', 'rosehip oil'], tipo: 'emoliente', que: 'Aceite de rosa mosqueta. Nutre. Si aparece al final de la lista, hay muy poco.' },
  { n: 'Cocos Nucifera Oil', alias: ['coconut oil', 'cocos nucifera (coconut) oil'], tipo: 'emoliente', que: 'Aceite de coco. Nutre, pero es denso.', poros: true },
  { n: 'Isopropyl Myristate', tipo: 'emoliente', que: 'Emoliente que da tacto ligero.', poros: true },
  { n: 'Isopropyl Palmitate', tipo: 'emoliente', que: 'Emoliente que da tacto ligero.', poros: true },
  { n: 'Lanolin', tipo: 'emoliente', que: 'Grasa de la lana de oveja. Muy nutritiva.', sensible: 'Puede dar alergia a algunas personas.' },
  { n: 'Petrolatum', alias: ['vaseline', 'petroleum jelly'], tipo: 'emoliente', que: 'Vaselina. Forma una capa que evita que la piel pierda agua. Muy eficaz en piel seca.' },
  { n: 'Paraffinum Liquidum', alias: ['mineral oil'], tipo: 'emoliente', que: 'Aceite mineral. Protege y evita la pérdida de agua.' },
  { n: 'Cetearyl Alcohol', tipo: 'textura', que: 'Alcohol graso. No reseca: da cuerpo a las cremas y suaviza.' },
  { n: 'Cetyl Alcohol', tipo: 'textura', que: 'Alcohol graso. No reseca: da cuerpo y suavidad.' },
  { n: 'Stearyl Alcohol', tipo: 'textura', que: 'Alcohol graso. No reseca: da cuerpo y suavidad.' },
  { n: 'Behenyl Alcohol', tipo: 'textura', que: 'Alcohol graso. Da textura cremosa.' },
  { n: 'Tocopherol', alias: ['vitamin e', 'tocopheryl acetate'], tipo: 'antioxidante', que: 'Vitamina E. Antioxidante que también protege la fórmula.' },

  // ---------- Activos ----------
  { n: 'Niacinamide', alias: ['nicotinamide', 'vitamin b3'], tipo: 'activo', que: 'Vitamina B3. Regula la grasa, mejora manchas y rojeces y refuerza la barrera. Muy bien tolerada.' },
  { n: 'Retinol', tipo: 'activo', que: 'Derivado de la vitamina A. Renueva la piel y mejora arrugas, textura y manchas.', embarazo: 'evitar', sensible: 'Puede irritar al principio: empieza 2 noches por semana.', sol: true },
  { n: 'Retinal', alias: ['retinaldehyde'], tipo: 'activo', que: 'Retinoide más potente que el retinol.', embarazo: 'evitar', sensible: 'Puede irritar: introdúcelo poco a poco.', sol: true },
  { n: 'Retinyl Palmitate', tipo: 'activo', que: 'Retinoide suave.', embarazo: 'evitar', sol: true },
  { n: 'Retinyl Retinoate', tipo: 'activo', que: 'Retinoide de nueva generación.', embarazo: 'evitar', sol: true },
  { n: 'Hydroxypinacolone Retinoate', alias: ['granactive retinoid'], tipo: 'activo', que: 'Retinoide de nueva generación, algo mejor tolerado.', embarazo: 'evitar', sol: true },
  { n: 'Bakuchiol', tipo: 'activo', que: 'Extracto vegetal que se usa como alternativa suave al retinol.' },
  { n: 'Azelaic Acid', tipo: 'activo', que: 'Ácido azelaico. Calma rojeces, mejora granitos y aclara manchas. Apto en el embarazo.' },
  { n: 'Potassium Azeloyl Diglycinate', tipo: 'activo', que: 'Derivado del ácido azelaico, más suave.' },
  { n: 'Tranexamic Acid', tipo: 'activo', que: 'Ácido tranexámico. Ayuda con manchas y melasma.' },
  { n: 'Alpha-Arbutin', alias: ['alpha arbutin', 'arbutin'], tipo: 'activo', que: 'Aclarante de manchas.', embarazo: 'consultar' },
  { n: 'Kojic Acid', tipo: 'activo', que: 'Ácido kójico. Aclarante de manchas.', sensible: 'Puede irritar pieles sensibles.' },
  { n: 'Hydroquinone', tipo: 'activo', que: 'Despigmentante potente. En la UE solo está permitido en medicamentos con receta, no en cosméticos.', embarazo: 'evitar', sensible: 'Irritante: solo con supervisión médica.' },
  { n: 'Glycyrrhiza Glabra Root Extract', alias: ['licorice root extract', 'dipotassium glycyrrhizate'], tipo: 'calmante', que: 'Extracto de regaliz. Calma y ayuda a unificar el tono.' },
  { n: 'Caffeine', tipo: 'activo', que: 'Cafeína. Descongestiona; habitual en contornos de ojos.' },
  { n: 'Zinc PCA', tipo: 'activo', que: 'Ayuda a regular la grasa.' },
  { n: 'Sulfur', tipo: 'activo', que: 'Azufre. Ayuda con granitos.', sensible: 'Puede resecar.' },
  { n: 'Benzoyl Peroxide', tipo: 'activo', que: 'Peróxido de benzoilo, tratamiento del acné. En la UE es un medicamento.', sensible: 'Reseca e irrita; además decolora la ropa.' },
  { n: 'Adapalene', tipo: 'activo', que: 'Retinoide para el acné. Es un medicamento con receta.', embarazo: 'evitar', sol: true },
  { n: 'Palmitoyl Tripeptide-1', tipo: 'activo', que: 'Péptido. Ayuda a la firmeza.' },
  { n: 'Palmitoyl Tetrapeptide-7', tipo: 'activo', que: 'Péptido. Ayuda a la firmeza y calma.' },
  { n: 'Palmitoyl Pentapeptide-4', alias: ['matrixyl'], tipo: 'activo', que: 'Péptido. Ayuda a suavizar arrugas.' },
  { n: 'Acetyl Hexapeptide-8', alias: ['argireline', 'acetyl hexapeptide-3'], tipo: 'activo', que: 'Péptido que suaviza las líneas de expresión.' },
  { n: 'Copper Tripeptide-1', alias: ['copper peptide'], tipo: 'activo', que: 'Péptido de cobre. Ayuda a reparar y a la firmeza.' },
  { n: 'Adenosine', tipo: 'activo', que: 'Ayuda a suavizar arrugas. Muy usado en cosmética coreana.' },

  // ---------- Vitamina C y antioxidantes ----------
  { n: 'Ascorbic Acid', alias: ['l-ascorbic acid', 'vitamin c'], tipo: 'antioxidante', que: 'Vitamina C pura. Da luz, ayuda con manchas y protege del daño solar. Mejor por la mañana.', sensible: 'A concentraciones altas puede escocer.' },
  { n: 'Sodium Ascorbyl Phosphate', tipo: 'antioxidante', que: 'Vitamina C estable y suave.' },
  { n: 'Ascorbyl Glucoside', tipo: 'antioxidante', que: 'Vitamina C estable y suave.' },
  { n: '3-O-Ethyl Ascorbic Acid', alias: ['ethyl ascorbic acid'], tipo: 'antioxidante', que: 'Vitamina C estable.' },
  { n: 'Tetrahexyldecyl Ascorbate', tipo: 'antioxidante', que: 'Vitamina C soluble en aceite, suave.' },
  { n: 'Magnesium Ascorbyl Phosphate', tipo: 'antioxidante', que: 'Vitamina C estable y suave.' },
  { n: 'Ferulic Acid', tipo: 'antioxidante', que: 'Antioxidante que potencia la vitamina C.' },
  { n: 'Resveratrol', tipo: 'antioxidante', que: 'Antioxidante de la uva.' },
  { n: 'Camellia Sinensis Leaf Extract', alias: ['green tea extract'], tipo: 'antioxidante', que: 'Extracto de té verde. Antioxidante y calmante.' },

  // ---------- Exfoliantes ----------
  { n: 'Salicylic Acid', alias: ['bha', 'beta hydroxy acid'], tipo: 'exfoliante', que: 'Ácido salicílico. Limpia el poro por dentro: ideal para puntos negros y granitos.', embarazo: 'consultar', sensible: SENS_ACIDO, sol: true },
  { n: 'Glycolic Acid', tipo: 'exfoliante', que: 'Ácido glicólico. Exfolia en superficie y da luz.', sensible: 'Es el ácido más potente: puede irritar.', sol: true },
  { n: 'Lactic Acid', tipo: 'exfoliante', que: 'Ácido láctico. Exfolia y además hidrata. Más suave que el glicólico.', sensible: SENS_ACIDO, sol: true },
  { n: 'Mandelic Acid', tipo: 'exfoliante', que: 'Ácido mandélico. Exfoliante suave, bueno para pieles sensibles o con granitos.', sol: true },
  { n: 'Gluconolactone', alias: ['pha'], tipo: 'exfoliante', que: 'PHA: exfoliante muy suave que también hidrata.' },
  { n: 'Lactobionic Acid', tipo: 'exfoliante', que: 'PHA: exfoliante muy suave.' },
  { n: 'Citric Acid', tipo: 'base', que: 'Ajusta la acidez (pH) de la fórmula. En pequeña cantidad no exfolia.' },

  // ---------- Calmantes ----------
  { n: 'Centella Asiatica Extract', alias: ['centella asiatica leaf extract', 'cica'], tipo: 'calmante', que: 'Centella asiática. Calma y ayuda a reparar.' },
  { n: 'Madecassoside', tipo: 'calmante', que: 'Activo de la centella. Calma rojeces.' },
  { n: 'Asiaticoside', tipo: 'calmante', que: 'Activo de la centella. Calma y repara.' },
  { n: 'Bisabolol', alias: ['alpha-bisabolol'], tipo: 'calmante', que: 'Activo de la camomila. Calma.' },
  { n: 'Avena Sativa Kernel Flour', alias: ['colloidal oatmeal', 'avena sativa kernel extract'], tipo: 'calmante', que: 'Avena. Calma el picor y la sequedad.' },
  { n: 'Beta-Glucan', tipo: 'calmante', que: 'Calma e hidrata.' },
  { n: 'Ectoin', tipo: 'calmante', que: 'Protege y calma la piel sensible.' },
  { n: 'Chamomilla Recutita Flower Extract', alias: ['chamomile extract'], tipo: 'calmante', que: 'Extracto de camomila. Calmante.' },

  // ---------- Filtros solares ----------
  { n: 'Zinc Oxide', alias: ['ci 77947'], tipo: 'filtro', que: 'Filtro mineral. Protege de UVA y UVB; suele tolerarse bien en pieles sensibles.' },
  { n: 'Titanium Dioxide', tipo: 'filtro', que: 'Filtro mineral (o pigmento blanco si aparece como CI 77891).' },
  { n: 'Ethylhexyl Methoxycinnamate', alias: ['octinoxate'], tipo: 'filtro', que: 'Filtro UVB.' },
  { n: 'Octocrylene', tipo: 'filtro', que: 'Filtro UVB.', sensible: 'Puede dar alergia a algunas personas.' },
  { n: 'Butyl Methoxydibenzoylmethane', alias: ['avobenzone'], tipo: 'filtro', que: 'Filtro UVA.' },
  { n: 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine', alias: ['bemotrizinol', 'tinosorb s'], tipo: 'filtro', que: 'Filtro moderno de amplio espectro (UVA y UVB), muy estable.' },
  { n: 'Methylene Bis-Benzotriazolyl Tetramethylbutylphenol', alias: ['tinosorb m'], tipo: 'filtro', que: 'Filtro de amplio espectro.' },
  { n: 'Ethylhexyl Triazone', tipo: 'filtro', que: 'Filtro UVB.' },
  { n: 'Diethylamino Hydroxybenzoyl Hexyl Benzoate', alias: ['uvinul a plus'], tipo: 'filtro', que: 'Filtro UVA.' },
  { n: 'Homosalate', tipo: 'filtro', que: 'Filtro UVB. La UE ha limitado su concentración.' },
  { n: 'Ethylhexyl Salicylate', alias: ['octisalate'], tipo: 'filtro', que: 'Filtro UVB.' },
  { n: 'Benzophenone-3', alias: ['oxybenzone'], tipo: 'filtro', que: 'Filtro UV antiguo. La UE ha limitado su uso.', sensible: 'Puede dar alergia.' },

  // ---------- Conservantes ----------
  { n: 'Phenoxyethanol', tipo: 'conservante', que: 'Conservante muy habitual. Evita que crezcan bacterias y hongos. Seguro en las cantidades permitidas.' },
  { n: 'Ethylhexylglycerin', tipo: 'conservante', que: 'Refuerza los conservantes e hidrata un poco.' },
  { n: 'Sodium Benzoate', tipo: 'conservante', que: 'Conservante suave.' },
  { n: 'Potassium Sorbate', tipo: 'conservante', que: 'Conservante suave.' },
  { n: 'Benzoic Acid', tipo: 'conservante', que: 'Conservante.' },
  { n: 'Dehydroacetic Acid', alias: ['sodium dehydroacetate'], tipo: 'conservante', que: 'Conservante.' },
  { n: 'Chlorphenesin', tipo: 'conservante', que: 'Conservante.' },
  { n: 'Methylparaben', tipo: 'conservante', que: 'Parabeno. Conservante eficaz; los que se usan hoy en cosmética son seguros en las cantidades permitidas.' },
  { n: 'Propylparaben', tipo: 'conservante', que: 'Parabeno. La UE limita su cantidad y está permitido en esos niveles.' },
  { n: 'Ethylparaben', tipo: 'conservante', que: 'Parabeno. Conservante permitido.' },
  { n: 'Methylisothiazolinone', tipo: 'conservante', que: 'Conservante muy alergénico. En la UE solo se permite en productos que se aclaran.', sensible: 'Causa frecuente de alergia de contacto.' },
  { n: 'Methylchloroisothiazolinone', tipo: 'conservante', que: 'Conservante muy alergénico. Solo se permite en productos que se aclaran.', sensible: 'Causa frecuente de alergia de contacto.' },
  { n: 'DMDM Hydantoin', tipo: 'conservante', que: 'Conservante que libera pequeñas cantidades de formaldehído.', sensible: 'Puede dar alergia.' },

  // ---------- Textura, pH y estabilidad ----------
  { n: 'Carbomer', tipo: 'textura', que: 'Espesante que da textura de gel.' },
  { n: 'Xanthan Gum', tipo: 'textura', que: 'Espesante natural.' },
  { n: 'Sodium Hydroxide', tipo: 'base', que: 'Ajusta el pH. En el producto final queda neutralizado.' },
  { n: 'Tromethamine', tipo: 'base', que: 'Ajusta el pH.' },
  { n: 'Disodium EDTA', alias: ['tetrasodium edta'], tipo: 'base', que: 'Estabiliza la fórmula para que dure más.' },
  { n: 'Tetrasodium Glutamate Diacetate', tipo: 'base', que: 'Estabilizante biodegradable.' },
  { n: 'Sodium Phytate', tipo: 'base', que: 'Estabilizante de origen vegetal.' },
  { n: 'Glyceryl Stearate', tipo: 'textura', que: 'Emulsionante: mezcla agua y aceite.' },
  { n: 'PEG-100 Stearate', tipo: 'textura', que: 'Emulsionante.' },
  { n: 'Polysorbate 20', tipo: 'textura', que: 'Emulsionante que ayuda a disolver aceites.' },
  { n: 'Polysorbate 80', tipo: 'textura', que: 'Emulsionante.' },
  { n: 'Cetearyl Olivate', tipo: 'textura', que: 'Emulsionante derivado del aceite de oliva.' },
  { n: 'Sorbitan Olivate', tipo: 'textura', que: 'Emulsionante derivado del aceite de oliva.' },
  { n: 'Hydroxyethylcellulose', tipo: 'textura', que: 'Espesante derivado de la celulosa.' },
  { n: 'Sodium Polyacrylate', tipo: 'textura', que: 'Espesante.' },
  { n: 'Silica', tipo: 'textura', que: 'Polvo que matifica y da tacto seco.' },
  { n: 'Talc', tipo: 'textura', que: 'Polvo que absorbe la grasa.' },
  { n: 'Mica', alias: ['ci 77019'], tipo: 'color', que: 'Mineral que da brillo o luz.' },
  { n: 'CI 77891', tipo: 'color', que: 'Pigmento blanco (dióxido de titanio).' },
  { n: 'CI 77491', alias: ['ci 77492', 'ci 77499', 'iron oxides'], tipo: 'color', que: 'Óxidos de hierro: pigmentos. En protectores con color ayudan contra la luz visible.' },

  // ---------- Limpiadores ----------
  { n: 'Sodium Laureth Sulfate', tipo: 'limpiador', que: 'Limpiador espumoso eficaz.', sensible: 'Puede resecar si se usa en la cara a diario.' },
  { n: 'Sodium Lauryl Sulfate', tipo: 'limpiador', que: 'Limpiador muy potente.', sensible: 'Reseca e irrita con facilidad en la cara.' },
  { n: 'Cocamidopropyl Betaine', tipo: 'limpiador', que: 'Limpiador suave derivado del coco.' },
  { n: 'Coco-Glucoside', tipo: 'limpiador', que: 'Limpiador muy suave de origen vegetal.' },
  { n: 'Decyl Glucoside', tipo: 'limpiador', que: 'Limpiador muy suave de origen vegetal.' },
  { n: 'Lauryl Glucoside', tipo: 'limpiador', que: 'Limpiador suave de origen vegetal.' },
  { n: 'Sodium Cocoyl Isethionate', tipo: 'limpiador', que: 'Limpiador suave, típico de los syndet (jabones sin jabón).' },
  { n: 'Sodium Lauroyl Sarcosinate', tipo: 'limpiador', que: 'Limpiador suave.' },

  // ---------- Alcohol ----------
  { n: 'Alcohol Denat.', alias: ['alcohol denat', 'alcohol', 'sd alcohol', 'ethanol', 'sd alcohol 40'], tipo: 'base', que: 'Alcohol. Da sensación de frescor y ayuda a que el producto se seque rápido.', sensible: 'Si va entre los primeros ingredientes, puede resecar e irritar.' },
  { n: 'Benzyl Alcohol', tipo: 'conservante', que: 'Conservante y componente del perfume que hay que declarar.', alergeno: true },

  // ---------- Perfume y alérgenos ----------
  { n: 'Parfum', alias: ['fragrance', 'perfume', 'aroma'], tipo: 'perfume', que: 'Perfume. Puede ser una mezcla de decenas de sustancias que no se detallan.', sensible: SENS_PERFUME },
  ALERGENO('Linalool'), ALERGENO('Limonene', ['d-limonene']), ALERGENO('Citronellol'), ALERGENO('Geraniol'),
  ALERGENO('Citral'), ALERGENO('Eugenol'), ALERGENO('Coumarin'), ALERGENO('Benzyl Benzoate'),
  ALERGENO('Benzyl Salicylate'), ALERGENO('Hexyl Cinnamal'), ALERGENO('Cinnamal'), ALERGENO('Farnesol'),
  ALERGENO('Hydroxycitronellal'), ALERGENO('Amyl Cinnamal'), ALERGENO('Isoeugenol'), ALERGENO('Alpha-Isomethyl Ionone'),
  ALERGENO('Cinnamyl Alcohol'), ALERGENO('Anise Alcohol'), ALERGENO('Benzyl Cinnamate'),
  { n: 'Butylphenyl Methylpropional', alias: ['lilial'], tipo: 'perfume', alergeno: true, que: 'Componente de perfume prohibido en la UE desde 2022. Si lo ves, el producto es antiguo o no es europeo.', embarazo: 'evitar', sensible: SENS_PERFUME },

  // ---------- Aceites esenciales ----------
  { n: 'Lavandula Angustifolia Oil', alias: ['lavender oil'], tipo: 'perfume', que: 'Aceite esencial de lavanda. Aporta aroma.', sensible: 'Los aceites esenciales irritan con frecuencia las pieles sensibles.' },
  { n: 'Citrus Aurantium Bergamia Peel Oil', alias: ['bergamot oil'], tipo: 'perfume', que: 'Aceite esencial de bergamota.', sensible: 'Puede manchar la piel con el sol.', sol: true },
  { n: 'Citrus Limon Peel Oil', alias: ['lemon peel oil'], tipo: 'perfume', que: 'Aceite esencial de limón.', sensible: 'Puede irritar y sensibilizar al sol.', sol: true },
  { n: 'Mentha Piperita Oil', alias: ['peppermint oil'], tipo: 'perfume', que: 'Aceite esencial de menta. Da frescor.', sensible: 'Puede irritar.' },
  { n: 'Menthol', tipo: 'perfume', que: 'Mentol. Da sensación de frescor.', sensible: 'Puede irritar pieles sensibles.' },
  { n: 'Eucalyptus Globulus Leaf Oil', alias: ['eucalyptus oil'], tipo: 'perfume', que: 'Aceite esencial de eucalipto.', sensible: 'Puede irritar.' },
  { n: 'Melaleuca Alternifolia Leaf Oil', alias: ['tea tree oil'], tipo: 'activo', que: 'Aceite de árbol de té. Algo de efecto sobre granitos.', sensible: 'Puede irritar y dar alergia, sobre todo si está oxidado.' },
];

// ---------- Búsqueda ----------
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').replace(/\*+/g, '').trim();

const indice = new Map<string, Ingrediente>();
for (const i of ingredientes) {
  indice.set(norm(i.n), i);
  for (const a of i.alias || []) indice.set(norm(a), i);
}

export function buscar(nombre: string): Ingrediente | undefined {
  const k = norm(nombre);
  if (indice.has(k)) return indice.get(k);
  // "Aqua (Water)", "Butyrospermum Parkii (Shea) Butter"…
  const sinParentesis = norm(k.replace(/\(.*?\)/g, ' '));
  if (indice.has(sinParentesis)) return indice.get(sinParentesis);
  const dentro = k.match(/\((.*?)\)/)?.[1];
  if (dentro && indice.has(norm(dentro))) return indice.get(norm(dentro));
  // "Water/Aqua/Eau"
  for (const parte of k.split('/')) if (indice.has(norm(parte))) return indice.get(norm(parte));
  return undefined;
}

/** Separa una lista INCI pegada (comas, puntos y comas, saltos de línea o "•"). */
export function separar(texto: string): string[] {
  return texto
    .replace(/^\s*(ingredients|ingredientes|inci)\s*:/i, '')
    .replace(/(\d),(\d)/g, '$1‚$2') // protege "1,2-Hexanediol"
    .split(/[,;\n•·]|\s\|\s/)
    .map((s) => s.replace(/‚/g, ',').replace(/\.$/, '').trim())
    .filter((s) => s.length > 1 && s.length < 90);
}

// ---------- Búsqueda aproximada (para fotos con errores de lectura) ----------
function distancia(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

/** Como buscar(), pero tolera 1–2 letras mal leídas en nombres largos. */
export function buscarAprox(nombre: string): Ingrediente | undefined {
  const exacto = buscar(nombre);
  if (exacto) return exacto;
  const k = norm(nombre.replace(/\(.*?\)/g, ' '));
  if (k.length < 6) return undefined;
  const max = k.length >= 12 ? 2 : 1;
  let mejor: Ingrediente | undefined; let md = max + 1;
  for (const [clave, ing] of indice) {
    const dd = distancia(k, clave);
    if (dd < md) { md = dd; mejor = ing; }
  }
  return md <= max ? mejor : undefined;
}

/** Limpia el texto que sale de una foto: une palabras cortadas y quita lo que no es la lista. */
export function limpiarOCR(t: string): string {
  let s = t.replace(/-\s*\n\s*/g, '').replace(/\s*\n\s*/g, ' ');
  const i = s.search(/(ingredients|ingredientes|inci)\s*[:.]/i);
  if (i >= 0) s = s.slice(i).replace(/^(ingredients|ingredientes|inci)\s*[:.]\s*/i, '');
  return s.replace(/\s{2,}/g, ' ').trim();
}
