import type { Archetype, ArchetypeId, DimensionId, DimensionInfo } from '../model';
import { CORE_ARCHETYPES } from './archetypes.core.data';
import { RELATIONAL_ARCHETYPES } from './archetypes.relational.data';
import { TRANSFORMATIONAL_ARCHETYPES } from './archetypes.transformational.data';

/**
 * Las cuatro dimensiones cardinales y quien habita cada una.
 *
 * Esta lista es la fuente de la que salen los recorridos: el orden del grafico de
 * resultados, el reparto de las puntuaciones y el agrupado de la enciclopedia.
 * Anadir un arquetipo aqui es lo que lo hace aparecer en todas partes; olvidarlo
 * lo deja existiendo pero invisible.
 */
export const DIMENSIONS: Record<DimensionId, DimensionInfo> = {
  mente: {
    id: 'mente',
    name: 'Mente & Trascendencia',
    subtitle: 'Claridad, Discernimiento y Sabiduría Interior',
    description:
      'La dimensión que rige la comprensión profunda, la visión anticipatoria, el mundo interior y la conexión con el misterio existencial.',
    color: '#3B82F6',
    archetypes: ['mago', 'sabio', 'sacerdote', 'mistico'],
  },
  accion: {
    id: 'accion',
    name: 'Acción & Coraje',
    subtitle: 'Dirección, Disciplina y Transformación',
    description:
      'La dimensión que impulsa el avance, la superación de obstáculos, la defensa de límites sagrados y la disrupción liberadora.',
    color: '#EF4444',
    archetypes: ['guerrero', 'heroe', 'rebelde', 'explorador'],
  },
  corazon: {
    id: 'corazon',
    name: 'Corazón & Conexión',
    subtitle: 'Empatía, Afecto, Sanación y Alegría',
    description:
      'La dimensión que nutre los vínculos, celebra la belleza sensible, repara las heridas emocionales y desarticula la rigidez con el juego.',
    color: '#10B981',
    archetypes: ['amante', 'cuidador', 'bufon', 'sanador'],
  },
  construccion: {
    id: 'construccion',
    name: 'Construcción & Soberanía',
    subtitle: 'Estructura, Legado, Dignidad y Totalidad',
    description:
      'La dimensión que materializa proyectos duraderos, ordena el reino vital, habita la dignidad soberana e integra todas las facetas del ser.',
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

/** Todos los identificadores, en el orden en que estan declarados. */
export const ARCHETYPE_IDS = Object.keys(ARCHETYPES) as ArchetypeId[];

/**
 * Los identificadores recorridos dimension a dimension.
 *
 * Lo usa quien necesita un orden con sentido -el grafico de resultados, la
 * enciclopedia- en vez del orden de declaracion.
 */
export const ARCHETYPE_IDS_BY_DIMENSION: ArchetypeId[] = (
  ['mente', 'accion', 'corazon', 'construccion'] as DimensionId[]
).flatMap(d => DIMENSIONS[d].archetypes);
