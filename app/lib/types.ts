export type SkinType = 'seca' | 'grasa' | 'mixta' | 'normal';
export type Sensitivity = 'sensible' | 'algo' | 'resistente';
export type Experience = 'novata' | 'media' | 'avanzada';
export type Goal = 'acne' | 'manchas' | 'edad' | 'luz' | 'sequedad';
export type RoutineMoment = 'am' | 'pm';

export type SkinProfile = {
  skinType: SkinType;
  goals: Goal[];
  sensitivity: Sensitivity;
  experience: Experience;
};

export type RoutineStep = {
  productId: string;
  reason: string;
  moment: RoutineMoment;
  order: number;
  frequency: string;
};
