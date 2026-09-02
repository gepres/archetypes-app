import { Archetype, ArchetypeId, DimensionId, DimensionInfo, GenderMode, ArchetypeNarrativeVariant } from '../types';
import { CORE_ARCHETYPES } from './archetypes/archetypesCore';
import { RELATIONAL_ARCHETYPES } from './archetypes/archetypesRelational';
import { TRANSFORMATIONAL_ARCHETYPES } from './archetypes/archetypesTransformational';

export const DIMENSIONS: Record<DimensionId, DimensionInfo> = {
  mente: {
    id: 'mente',
    name: 'Mente & Trascendencia',
    subtitle: 'Claridad, Discernimiento y Sabiduría Interior',
    description: 'La dimensión que rige la comprensión profunda, la visión anticipatoria, el mundo interior y la conexión con el misterio existencial.',
    color: '#3B82F6',
    archetypes: ['mago', 'sabio', 'sacerdote', 'mistico'],
  },
  accion: {
    id: 'accion',
    name: 'Acción & Coraje',
    subtitle: 'Dirección, Disciplina y Transformación',
    description: 'La dimensión que impulsa el avance, la superación de obstáculos, la defensa de límites sagrados y la disrupción liberadora.',
    color: '#EF4444',
    archetypes: ['guerrero', 'heroe', 'rebelde', 'explorador'],
  },
  corazon: {
    id: 'corazon',
    name: 'Corazón & Conexión',
    subtitle: 'Empatía, Afecto, Sanación y Alegría',
    description: 'La dimensión que nutre los vínculos, celebra la belleza sensible, repara las heridas emocionales y desarticula la rigidez con el juego.',
    color: '#10B981',
    archetypes: ['amante', 'cuidador', 'bufon', 'sanador'],
  },
  construccion: {
    id: 'construccion',
    name: 'Construcción & Soberanía',
    subtitle: 'Estructura, Legado, Dignidad y Totalidad',
    description: 'La dimensión que materializa proyectos duraderos, ordena el reino vital, habita la dignidad soberana e integra todas las facetas del ser.',
    color: '#D6A84F',
    archetypes: ['rey', 'padre', 'creador', 'constructor', 'soberano', 'integrador'],
  },
};

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  ...CORE_ARCHETYPES,
  ...RELATIONAL_ARCHETYPES,
  ...TRANSFORMATIONAL_ARCHETYPES,
};

export const ARCHETYPES_LIST: Archetype[] = Object.values(ARCHETYPES);

/**
 * Returns the archetype adapted to the selected gender narrative.
 * If gender is 'female', returns feminine naming, questions, descriptions and exercises.
 * If gender is 'male', returns masculine naming, questions, descriptions and exercises.
 * If gender is 'universal' or undefined, returns the universal/gender-neutral balanced version.
 */
export function getArchetype(id: ArchetypeId, gender: GenderMode = 'male'): Archetype {
  const base = ARCHETYPES[id];
  if (!base) return ARCHETYPES.rey;

  const variantKey = gender === 'female' ? 'feminine' : gender === 'male' ? 'masculine' : 'universal';
  const variant = base.variants?.[variantKey] || base.variants?.universal;

  const resolvedName = variant?.name || (gender === 'female' ? base.feminineName : gender === 'male' ? base.masculineName : base.universalName);

  // Adapt synergies to display partner names matching gender perspective
  const adaptedSynergies = (base.synergies || []).map(syn => {
    const partnerName = getArchetypeName(syn.partnerId, gender);
    let desc = syn.description || '';
    if (gender === 'female') {
      desc = desc
        .replace(/\bEl Rey\b/g, 'La Reina')
        .replace(/\bEl Guerrero\b/g, 'La Guerrera')
        .replace(/\bEl Mago\b/g, 'La Maga')
        .replace(/\bEl Sabio\b/g, 'La Sabia')
        .replace(/\bEl Sacerdote\b/g, 'La Sacerdotisa')
        .replace(/\bEl Amante\b/g, 'La Amante')
        .replace(/\bEl Padre\/Madre\b/g, 'La Madre')
        .replace(/\bEl Padre\b/g, 'La Madre')
        .replace(/\bEl Cuidador\b/g, 'La Cuidadora')
        .replace(/\bEl Bufón\b/g, 'La Bufona')
        .replace(/\bEl Explorador\b/g, 'La Exploradora')
        .replace(/\bEl Creador\b/g, 'La Creadora')
        .replace(/\bEl Héroe\b/g, 'La Heroína')
        .replace(/\bEl Rebelde\b/g, 'La Rebelde')
        .replace(/\bEl Sanador\b/g, 'La Sanadora')
        .replace(/\bEl Constructor\b/g, 'La Constructora')
        .replace(/\bEl Soberano\b/g, 'La Soberana')
        .replace(/\bEl Místico\b/g, 'La Mística')
        .replace(/\bEl Integrador\b/g, 'La Integradora');
    } else if (gender === 'male') {
      desc = desc
        .replace(/\bPadre\/Madre\b/g, 'El Padre')
        .replace(/\bRey\/Reina\b/g, 'El Rey')
        .replace(/\bGuerrero\/Guerrera\b/g, 'El Guerrero')
        .replace(/\bMago\/Maga\b/g, 'El Mago');
    }
    return {
      ...syn,
      description: desc,
    };
  });

  return {
    ...base,
    name: resolvedName,
    characterTitle: variant?.characterTitle || base.characterTitle,
    centralQuestion: variant?.centralQuestion || base.centralQuestion,
    shortDescription: variant?.shortDescription || base.shortDescription,
    fullDescription: variant?.fullDescription || base.fullDescription,
    mantra: variant?.mantra || base.mantra,
    strength: variant?.strength || base.strength,
    shadow: variant?.shadow || base.shadow,
    shadowDescription: variant?.shadowDescription || base.shadowDescription,
    shadowAntidote: variant?.shadowAntidote || base.shadowAntidote,
    domains: variant?.domains || base.domains,
    balancedBehavior: variant?.balancedBehavior || base.balancedBehavior,
    unbalancedBehavior: variant?.unbalancedBehavior || base.unbalancedBehavior,
    reflectionQuestions: variant?.reflectionQuestions || base.reflectionQuestions,
    developmentExercises: variant?.developmentExercises || base.developmentExercises,
    synergies: adaptedSynergies,
  };
}

/**
 * Returns the specific narrative variant layer for deep reading and prompts.
 */
export function getArchetypeNarrative(id: ArchetypeId, gender: GenderMode = 'male'): ArchetypeNarrativeVariant {
  const base = ARCHETYPES[id] || ARCHETYPES.rey;
  const variantKey = gender === 'female' ? 'feminine' : gender === 'male' ? 'masculine' : 'universal';
  return base.variants?.[variantKey] || base.variants?.universal || {
    name: base.name,
    centralQuestion: base.centralQuestion,
    shortDescription: base.shortDescription,
    fullDescription: base.fullDescription,
    mantra: base.mantra,
    strength: base.strength,
    shadow: base.shadow,
    shadowDescription: base.shadowDescription,
    shadowAntidote: base.shadowAntidote,
    domains: base.domains,
    balancedBehavior: base.balancedBehavior,
    unbalancedBehavior: base.unbalancedBehavior,
    reflectionQuestions: base.reflectionQuestions,
    developmentExercises: base.developmentExercises,
  };
}

/**
 * Quick helper to get the display name for an archetype ID according to gender.
 */
export function getArchetypeName(id: ArchetypeId, gender: GenderMode = 'male'): string {
  const arch = ARCHETYPES[id];
  if (!arch) return id;
  if (gender === 'female') return arch.feminineName || arch.name;
  if (gender === 'male') return arch.masculineName || arch.name;
  return arch.universalName || arch.name;
}

/**
 * Returns all 18 archetypes mapped to the current gender narrative.
 */
export function getArchetypeList(gender: GenderMode = 'male'): Archetype[] {
  return (Object.keys(ARCHETYPES) as ArchetypeId[]).map((id) => getArchetype(id, gender));
}
