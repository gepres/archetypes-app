import { ARCHETYPES, getArchetypeName, getArchetype, withDe } from '../data/archetypesData';
import { ARCHETYPE_DRIVES, getDimensionTension } from '../data/archetypePairs';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../data/questionsData';
import {
  AnswerEvidence,
  ArchetypeId,
  ArchetypeScore,
  AssessmentAnswer,
  AssessmentResult,
  CompositeProfile,
  DimensionId,
  GenderMode,
} from '../types';

export function calculateAssessmentResult(
  answers: AssessmentAnswer[],
  testType: 'full' | 'quick' = 'full',
  gender: GenderMode = 'male'
): AssessmentResult {
  const activeQuestions = testType === 'quick'
    ? QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id))
    : QUESTIONS_DATA;

  // Track raw and max possible scores per archetype (18 archetypes)
  const rawScores: Record<ArchetypeId, number> = {
    rey: 0,
    guerrero: 0,
    mago: 0,
    sabio: 0,
    sacerdote: 0,
    amante: 0,
    padre: 0,
    cuidador: 0,
    bufon: 0,
    explorador: 0,
    creador: 0,
    heroe: 0,
    rebelde: 0,
    sanador: 0,
    constructor: 0,
    soberano: 0,
    mistico: 0,
    integrador: 0,
  };

  const maxPossibleScores: Record<ArchetypeId, number> = {
    rey: 0,
    guerrero: 0,
    mago: 0,
    sabio: 0,
    sacerdote: 0,
    amante: 0,
    padre: 0,
    cuidador: 0,
    bufon: 0,
    explorador: 0,
    creador: 0,
    heroe: 0,
    rebelde: 0,
    sanador: 0,
    constructor: 0,
    soberano: 0,
    mistico: 0,
    integrador: 0,
  };

  // Map answers for quick lookup
  const answerMap = new Map<number, number>();
  answers.forEach(a => answerMap.set(a.questionId, a.value));

  // Compute accumulated weighted scores
  activeQuestions.forEach(q => {
    const userVal = answerMap.get(q.id) ?? 3; // default neutral if unselected
    q.weights.forEach(w => {
      if (rawScores[w.archetypeId] !== undefined) {
        rawScores[w.archetypeId] += userVal * w.weight;
        maxPossibleScores[w.archetypeId] += 5 * w.weight;
      }
    });
  });

  // Calculate normalized percentage (0 - 100)
  const normalizedScores: Record<ArchetypeId, number> = {
    rey: 0,
    guerrero: 0,
    mago: 0,
    sabio: 0,
    sacerdote: 0,
    amante: 0,
    padre: 0,
    cuidador: 0,
    bufon: 0,
    explorador: 0,
    creador: 0,
    heroe: 0,
    rebelde: 0,
    sanador: 0,
    constructor: 0,
    soberano: 0,
    mistico: 0,
    integrador: 0,
  };

  // El orden se decide con la puntuación sin redondear: redondeada, dos arquetipos distintos
  // empatan a menudo y el desempate lo hacía el orden en que están declarados en los datos.
  const exactScores = {} as Record<ArchetypeId, number>;

  (Object.keys(rawScores) as ArchetypeId[]).forEach(id => {
    const max = maxPossibleScores[id] || 1;
    const min = max / 5;
    const scoreVal = rawScores[id];
    exactScores[id] = ((scoreVal - min) / (max - min)) * 100;
    const percentage = Math.round(exactScores[id]);
    normalizedScores[id] = Math.max(10, Math.min(98, percentage));
  });

  // Create ranking array with gender-adapted names
  const ranking: ArchetypeScore[] = (Object.keys(normalizedScores) as ArchetypeId[])
    .map(id => {
      const arch = getArchetype(id, gender);
      return {
        archetypeId: id,
        name: arch.name,
        emoji: arch.emoji,
        rawScore: rawScores[id],
        normalizedScore: normalizedScores[id],
        rank: 0,
        dimension: arch.dimension,
      };
    })
    .sort((a, b) => exactScores[b.archetypeId] - exactScores[a.archetypeId]);

  ranking.forEach((item, index) => {
    item.rank = index + 1;
  });

  const dominantArchetype = ranking[0];
  const top3 = ranking.slice(0, 3);
  const top5 = ranking.slice(0, 5);

  // Suggested development archetypes (balanced complement from lowest scores)
  const developmentCandidates = ranking.slice(-3).reverse();
  const developmentArchetypes = developmentCandidates;

  // Calculate Dimension Scores (0 - 100) across 4 pillars
  const dimensionScores: Record<DimensionId, number> = {
    mente: Math.round(
      (normalizedScores.mago +
        normalizedScores.sabio +
        normalizedScores.sacerdote +
        normalizedScores.mistico) /
        4
    ),
    accion: Math.round(
      (normalizedScores.guerrero +
        normalizedScores.heroe +
        normalizedScores.rebelde +
        normalizedScores.explorador) /
        4
    ),
    corazon: Math.round(
      (normalizedScores.amante +
        normalizedScores.cuidador +
        normalizedScores.bufon +
        normalizedScores.sanador) /
        4
    ),
    construccion: Math.round(
      (normalizedScores.rey +
        normalizedScores.padre +
        normalizedScores.creador +
        normalizedScores.constructor +
        normalizedScores.soberano +
        normalizedScores.integrador) /
        6
    ),
  };

  // Generate composite profile
  const compositeProfile = generateCompositeProfile(ranking, dimensionScores, gender);

  const evidence: Partial<Record<ArchetypeId, AnswerEvidence[]>> = {};
  top3.forEach(item => {
    evidence[item.archetypeId] = collectEvidence(item.archetypeId, activeQuestions, answerMap);
  });

  return {
    id: `eval-${Date.now()}`,
    date: new Date().toISOString(),
    title: `Mapa Arquetípico - ${dominantArchetype.name}`,
    type: testType,
    scores: normalizedScores,
    ranking,
    dominantArchetype,
    top3,
    top5,
    developmentArchetypes,
    dimensionScores,
    compositeProfile,
    evidence,
  };
}

/** Cuántas respuestas se guardan como *por qué te salió* para cada arquetipo. */
const EVIDENCE_PER_ARCHETYPE = 2;

/**
 * Las respuestas que más empujaron a un arquetipo hacia arriba: las afirmaciones que lo
 * puntúan y con las que la persona estuvo de acuerdo (4 o 5), de más a menos peso. Si no
 * hay ninguna, la lista sale vacía y la pantalla no inventa un motivo.
 */
function collectEvidence(
  archetypeId: ArchetypeId,
  questions: typeof QUESTIONS_DATA,
  answerMap: Map<number, number>
): AnswerEvidence[] {
  return questions
    .map(q => {
      const weight = q.weights.find(w => w.archetypeId === archetypeId)?.weight ?? 0;
      const value = answerMap.get(q.id) ?? 0;
      return { questionId: q.id, value, weight };
    })
    .filter(e => e.weight > 0 && e.value >= 4)
    .sort((x, y) => y.value * y.weight - x.value * x.weight || y.weight - x.weight)
    .slice(0, EVIDENCE_PER_ARCHETYPE)
    .map(({ questionId, value }) => ({ questionId, value }));
}

/**
 * Re-adapts an existing AssessmentResult to a new gender perspective without losing scores.
 */
export function adaptAssessmentResultToGender(
  result: AssessmentResult,
  gender: GenderMode = 'male'
): AssessmentResult {
  const dominantId = result.dominantArchetype.archetypeId;

  const ranking = result.ranking.map(item => {
    const arch = getArchetype(item.archetypeId, gender);
    return {
      ...item,
      name: arch.name,
      emoji: arch.emoji,
      dimension: arch.dimension,
    };
  });

  // Solo los campos de una puntuación. Antes se copiaba aquí el arquetipo entero, con sus
  // tres variantes, y el resultado guardado engordaba cada vez que cambiaba la perspectiva.
  const { archetypeId, rawScore, normalizedScore, rank } = result.dominantArchetype;
  const dominantArch = getArchetype(dominantId, gender);
  const dominantArchetype: ArchetypeScore = {
    archetypeId,
    name: dominantArch.name,
    emoji: dominantArch.emoji,
    rawScore,
    normalizedScore,
    rank,
    dimension: dominantArch.dimension,
  };

  const top3 = result.top3.map(item => {
    const arch = getArchetype(item.archetypeId, gender);
    return {
      ...item,
      name: arch.name,
      emoji: arch.emoji,
      dimension: arch.dimension,
    };
  });

  const top5 = (result.top5 || []).map(item => {
    const arch = getArchetype(item.archetypeId, gender);
    return {
      ...item,
      name: arch.name,
      emoji: arch.emoji,
      dimension: arch.dimension,
    };
  });

  const developmentArchetypes = (result.developmentArchetypes || ranking.slice(-3).reverse()).map(item => {
    const arch = getArchetype(item.archetypeId, gender);
    return {
      ...item,
      name: arch.name,
      emoji: arch.emoji,
      dimension: arch.dimension,
    };
  });

  const compositeProfile = generateCompositeProfile(ranking, result.dimensionScores, gender);

  return {
    ...result,
    title: `Mapa Arquetípico - ${dominantArchetype.name}`,
    dominantArchetype,
    ranking,
    top3,
    top5,
    developmentArchetypes,
    compositeProfile,
  };
}

/** El 1.º y el 2.º se dan por empatados si los separa esta distancia o menos (en puntos de 0 a 100). */
export const TIE_MAX_GAP = 1;

/**
 * Un mapa no tiene polo claro si el primero apenas supera al del medio. Calibrado con
 * simulaciones: salta con respuestas planas (todo igual) y con quien dice «sí» a casi todo, y
 * no salta nunca con perfiles marcados ni con respuestas al azar.
 */
export const FLAT_MAX_SPREAD = 5;

function generateCompositeProfile(
  ranking: ArchetypeScore[],
  _dimensionScores: Record<DimensionId, number>,
  gender: GenderMode = 'male'
): CompositeProfile {
  const [first, second, third] = ranking;
  const middle = ranking[Math.floor(ranking.length / 2) - 1];
  const a = getArchetype(first.archetypeId, gender);
  const b = getArchetype(second.archetypeId, gender);
  const c = getArchetype(third.archetypeId, gender);

  const archetypeKey = `${a.id}-${b.id}-${c.id}`;
  const archetypeCombination = `${a.name} + ${b.name} + ${c.name}`;

  // Si nada destaca, no se inventa una identidad: se dice.
  const isFlat = first.normalizedScore - middle.normalizedScore <= FLAT_MAX_SPREAD;
  if (isFlat) {
    return {
      archetypeKey,
      title: 'Un mapa sin un polo claro',
      archetypeCombination,
      synthesis:
        'Tus respuestas puntúan parecido en casi todas las figuras: ninguna destaca lo bastante como para ponerle nombre. ' +
        'Puede ser un momento de equilibrio, o que hayas respondido casi todo igual. ' +
        'Si vuelves a responder pensando en situaciones concretas de las últimas semanas, el mapa se dibuja mejor.',
      strengths: [],
      risksAndShadows: [],
      developmentArchetypes: [],
      isFlat: true,
      isTie: false,
    };
  }

  // El perfil se nombra por la pareja que lo encabeza: 153 combinaciones en vez de seis
  // títulos fijos, y cada una dice algo de esas dos figuras y no de cualquiera.
  const isTie = first.normalizedScore - second.normalizedScore <= TIE_MAX_GAP;
  const head = isTie
    ? `${a.name} y ${b.name} comparten el primer puesto de tu mapa`
    : `${a.name} y ${b.name} encabezan tu mapa`;

  const developmentArchetypes = ranking
    .slice(-2)
    .reverse()
    .map(low => {
      const arch = getArchetype(low.archetypeId, gender);
      return {
        archetypeId: arch.id,
        name: arch.name,
        // Puntuar poco no es una carencia que haya que corregir: es lo que menos apareció.
        reason: `${arch.name} apareció poco en tus respuestas. Si quieres aprender a ${ARCHETYPE_DRIVES[arch.id]}, puede ser un buen lugar para explorar.`,
        activationPractice: arch.developmentExercises[0]?.actionStep || 'Lee su ficha y quédate con una sola pregunta.',
      };
    });

  return {
    archetypeKey,
    title: `${a.name} + ${b.name}`,
    archetypeCombination,
    synthesis: `${head}, con ${c.name} detrás. Una parte de ti quiere ${ARCHETYPE_DRIVES[a.id]}; otra, ${ARCHETYPE_DRIVES[b.id]}.`,
    strengths: [`Fuerza ${withDe(a.name)}: ${a.strength}`, `Fuerza ${withDe(b.name)}: ${b.strength}`],
    risksAndShadows: [`Sombra ${withDe(a.name)}: ${a.shadow}`, `Sombra ${withDe(b.name)}: ${b.shadow}`],
    developmentArchetypes,
    pair: [a.id, b.id],
    tension: getDimensionTension(a.dimension, b.dimension),
    isTie,
    isFlat: false,
  };
}
