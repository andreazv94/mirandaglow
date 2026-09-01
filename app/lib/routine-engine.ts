import { products, type AppProduct } from './products';
import type { RoutineMoment, RoutineStep, SkinProfile } from './types';

const universal = (product: AppProduct) => product.tags.includes('todos');

function pick(profile: SkinProfile, moment: RoutineMoment, category: string, preferred: string[] = []) {
  const candidates = products.filter(p => (p.category === category) && (p.moment === 'both' || p.moment === moment));
  const scored = candidates.map(p => {
    let score = universal(p) ? 2 : 0;
    if (p.tags.includes(profile.skinType)) score += 5;
    for (const goal of profile.goals) if (p.tags.includes(goal)) score += 3;
    for (const tag of preferred) if (p.tags.includes(tag)) score += 4;
    if (profile.sensitivity === 'sensible' && p.id === 'limpiadorSeca') score += 4;
    return { p, score };
  }).sort((a,b) => b.score-a.score || a.p.order-b.p.order);
  return scored[0]?.p;
}

function step(product: AppProduct, moment: RoutineMoment, reason: string): RoutineStep {
  return { productId: product.id, reason, moment, order: product.order, frequency: product.frequency };
}

export function generateRoutine(profile: SkinProfile) {
  const am: RoutineStep[] = [];
  const pm: RoutineStep[] = [];
  const cleanserAm = pick(profile, 'am', 'Limpieza');
  const cleanserPm = pick(profile, 'pm', 'Limpieza');
  const moisturizer = pick(profile, 'am', 'Hidratación');
  const spf = products.find(p => p.id === 'spf')!;

  if (cleanserAm) am.push(step(cleanserAm, 'am', 'Limpieza suave para preparar la piel.'));
  if (profile.goals.includes('manchas') || profile.goals.includes('luz') || profile.goals.includes('edad')) {
    const vitC = products.find(p => p.id === 'vitC');
    if (vitC) am.push(step(vitC, 'am', 'Antioxidante de mañana para luminosidad y tono.'));
  } else {
    const hydraSerum = profile.goals.includes('sequedad') || profile.skinType === 'seca' ? products.find(p => p.id === 'hialu') : undefined;
    if (hydraSerum) am.push(step(hydraSerum, 'am', 'Refuerza la hidratación sin complicar la rutina.'));
  }
  if (moisturizer) am.push(step(moisturizer, 'am', 'Mantiene la barrera hidratada.'));
  am.push(step(spf, 'am', 'Protección diaria, especialmente importante con activos.'));

  if (cleanserPm) pm.push(step(cleanserPm, 'pm', 'Retira suciedad y protector solar sin resecar.'));
  const treatment = chooseNightTreatment(profile);
  if (treatment) pm.push(step(treatment, 'pm', treatment.id === 'retinol' ? 'Activo antiedad introducido gradualmente.' : 'Ayuda a mejorar poros e imperfecciones.'));
  if (moisturizer) pm.push(step(moisturizer, 'pm', 'Cierra la rutina y ayuda a recuperar la barrera.'));
  return { am: am.sort((a,b)=>a.order-b.order), pm: pm.sort((a,b)=>a.order-b.order) };
}

function chooseNightTreatment(profile: SkinProfile): AppProduct | undefined {
  if (profile.sensitivity === 'sensible') {
    return profile.goals.includes('acne') ? products.find(p=>p.id==='niacin') : products.find(p=>p.id==='hialu');
  }
  if (profile.goals.includes('edad')) return products.find(p=>p.id==='retinol');
  if (profile.goals.includes('acne')) return products.find(p=>p.id==='bha');
  if (profile.goals.includes('manchas')) return products.find(p=>p.id==='niacin');
  return products.find(p=>p.id==='niacin');
}

export function hasConflict(ids: string[]) {
  return ids.includes('retinol') && ids.includes('bha');
}
