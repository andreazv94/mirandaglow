import type { RoutineMoment } from './types';

export type AppProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  moment: 'am' | 'pm' | 'both';
  frequency: string;
  order: number;
};

export const products: AppProduct[] = [
  { id:'limpiador', name:'Gel limpiador suave', category:'Limpieza', description:'Limpia sin resecar y respeta la barrera cutánea.', tags:['limpieza','todos'], moment:'both', frequency:'Mañana y noche', order:1 },
  { id:'limpiadorSeca', name:'Bálsamo limpiador nutritivo', category:'Limpieza', description:'Limpieza en crema ideal para pieles secas o sensibles.', tags:['limpieza','seca','sensible'], moment:'both', frequency:'Mañana y noche', order:1 },
  { id:'vitC', name:'Sérum de vitamina C', category:'Tratamiento', description:'Aporta luminosidad y unifica el tono. Antioxidante de día.', tags:['tratamiento','manchas','luz','edad'], moment:'am', frequency:'Cada mañana', order:2 },
  { id:'niacin', name:'Sérum de niacinamida 10%', category:'Tratamiento', description:'Controla los brillos, afina poros y calma rojeces.', tags:['tratamiento','acne','poros','manchas'], moment:'both', frequency:'Una vez al día', order:2 },
  { id:'hialu', name:'Sérum de ácido hialurónico', category:'Tratamiento', description:'Hidratación profunda que rellena y suaviza. Sobre piel húmeda.', tags:['tratamiento','sequedad','seca'], moment:'both', frequency:'Mañana y noche', order:2 },
  { id:'retinol', name:'Retinol encapsulado 0,3%', category:'Tratamiento', description:'Renueva la piel y suaviza líneas. Introdúcelo poco a poco.', tags:['tratamiento','edad'], moment:'pm', frequency:'Empieza 2 noches/sem', order:3 },
  { id:'bha', name:'Exfoliante con ácido salicílico', category:'Tratamiento', description:'Desobstruye poros y reduce granitos.', tags:['tratamiento','acne','poros'], moment:'pm', frequency:'2-3 noches/sem', order:3 },
  { id:'hidra', name:'Crema hidratante ligera', category:'Hidratación', description:'Sella la hidratación sin sensación grasa.', tags:['hidratacion','todos'], moment:'both', frequency:'Mañana y noche', order:4 },
  { id:'hidraRica', name:'Crema nutritiva reparadora', category:'Hidratación', description:'Textura rica para pieles secas o maduras.', tags:['hidratacion','seca','edad'], moment:'both', frequency:'Mañana y noche', order:4 },
  { id:'spf', name:'Protector solar facial SPF50', category:'Protección', description:'El paso antiedad más importante. Último paso de la mañana.', tags:['proteccion','todos'], moment:'am', frequency:'Cada mañana, sí o sí', order:5 },
];

export const matchesGoal = (product: AppProduct, goal: string) => product.tags.includes(goal);
export const matchesSkin = (product: AppProduct, skinType: string) => product.tags.includes(skinType) || product.tags.includes('todos');
export const forMoment = (product: AppProduct, moment: RoutineMoment) => product.moment === 'both' || product.moment === moment;
