import { ARCHETYPES, ARCHETYPES_LIST, DIMENSIONS } from '../domain/archetypes/archetypes.data';
import { INITIAL_CHALLENGES } from '../domain/challenges/challenges.data';
import type {
  Archetype,
  ArchetypeId,
  AssessmentResult,
  Challenge,
  DimensionId,
  DimensionInfo,
} from '../domain/model';

/** Un arquetipo con sus sinergias ya resueltas a arquetipos de verdad. */
export interface ArchetypeDossier {
  archetype: Archetype;
  dimension: DimensionInfo;
  synergies: {
    partner: Archetype;
    title: string;
    description: string;
    keyword: string;
  }[];
  challenges: Challenge[];
}

/**
 * La ficha completa de un arquetipo.
 *
 * En el dominio, una sinergia guarda el identificador del arquetipo companero,
 * no el arquetipo entero. Eso esta bien para los datos, pero obliga a cada
 * vista a buscar el companero por su cuenta, y esa busqueda aparecia repetida
 * en varios componentes. Aqui se resuelve una vez.
 */
export function buildArchetypeDossier(id: ArchetypeId): ArchetypeDossier {
  const archetype = ARCHETYPES[id];

  return {
    archetype,
    dimension: DIMENSIONS[archetype.dimension],
    synergies: archetype.synergies.map(synergy => ({
      partner: ARCHETYPES[synergy.partnerId],
      title: synergy.title,
      description: synergy.description,
      keyword: synergy.synergyKeyword,
    })),
    challenges: INITIAL_CHALLENGES.filter(challenge => challenge.archetypeId === id),
  };
}

/** Los arquetipos de una dimension. */
export function archetypesOfDimension(dimensionId: DimensionId): Archetype[] {
  return DIMENSIONS[dimensionId].archetypes.map(id => ARCHETYPES[id]);
}

/**
 * Retos sugeridos a partir de un resultado.
 *
 * Se ofrecen los de los arquetipos de desarrollo —los que el test señala como
 * menos presentes— en vez de los del dominante. Reforzar lo que ya es fuerte
 * no mueve a nadie; el trabajo esta en lo que falta.
 */
export function suggestChallenges(result: AssessmentResult, limit = 6): Challenge[] {
  const developmentIds = result.developmentArchetypes.map(score => score.archetypeId);
  const byDevelopmentPriority = (a: Challenge, b: Challenge) =>
    developmentIds.indexOf(a.archetypeId) - developmentIds.indexOf(b.archetypeId);

  return INITIAL_CHALLENGES.filter(challenge => developmentIds.includes(challenge.archetypeId))
    .sort(byDevelopmentPriority)
    .slice(0, limit);
}

/** Todos los arquetipos, para listados y selectores. */
export function listArchetypes(): Archetype[] {
  return ARCHETYPES_LIST;
}
