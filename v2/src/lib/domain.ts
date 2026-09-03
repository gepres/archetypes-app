/**
 * El unico puente entre V2 y el dominio.
 *
 * V2 no importa de `../src` en ningun otro sitio: todo pasa por aqui. Si algun dia
 * el codigo se mueve a paquetes (la reestructuracion que vive en otra rama), o el
 * nucleo compartido se pone al dia con los 18 arquetipos, solo hay que reapuntar
 * este fichero y V2 no se entera.
 *
 * Hoy apunta al codigo que esta en produccion, que es el que tiene los 18.
 */
export {
  ARCHETYPES,
  ARCHETYPES_LIST,
  DIMENSIONS,
  getArchetype,
  getArchetypeList,
  getArchetypeName,
} from '@v1/data/archetypesData';

export { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '@v1/data/questionsData';

export { calculateAssessmentResult } from '@v1/services/scoringEngine';

export { ArchetypeIllustratedArtwork } from '@v1/components/archetypes/ArchetypeIllustratedArtwork';

export type {
  Archetype,
  ArchetypeId,
  ArchetypeScore,
  AssessmentAnswer,
  AssessmentResult,
  DimensionId,
  GenderMode,
  Question,
} from '@v1/types';
