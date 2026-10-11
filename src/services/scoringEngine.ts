import { ARCHETYPES, getArchetypeName, getArchetype, withDe } from '../data/archetypesData';
import { ARCHETYPE_DRIVES, getDimensionTension } from '../data/archetypePairs';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../data/questionsData';
import {
  AnswerEvidence,
  ArchetypeId,
  ArchetypeScore,
  AssessmentAnswer,
  AssessmentResult,
  CabezaMapa,
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

  // El orden se decide con la puntuación sin redondear: redondeada, dos arquetipos distintos
  // empatan a menudo y el desempate lo hacía el orden en que están declarados en los datos.
  const exactScores = {} as Record<ArchetypeId, number>;
  (Object.keys(rawScores) as ArchetypeId[]).forEach(id => {
    const max = maxPossibleScores[id] || 1;
    const min = max / 5;
    exactScores[id] = ((rawScores[id] - min) / (max - min)) * 100;
  });

  return resultadoDesdePuntuaciones(exactScores, rawScores, testType, gender, id =>
    collectEvidence(id, activeQuestions, answerMap)
  );
}

/**
 * Del mapa de puntuaciones (0–100 sin redondear) al resultado: ranking, dimensiones, perfil y
 * «por qué te salió». Común a los dos tests: el de frases y el de dilemas solo difieren en cómo
 * se calculan las puntuaciones.
 */
export function resultadoDesdePuntuaciones(
  exactScores: Record<ArchetypeId, number>,
  rawScores: Record<ArchetypeId, number>,
  testType: 'full' | 'quick',
  gender: GenderMode,
  evidenciaDe: (id: ArchetypeId) => AnswerEvidence[],
  instrumento?: 'dilemas',
  /**
   * Un orden ya decidido por el test (el de dilemas lo decide con comparaciones, no con la
   * puntuación). `cabeza`: quiénes comparten el primer puesto y quiénes el segundo; el perfil
   * usa esos grupos, no la cercanía de los números.
   */
  orden?: { ids: ArchetypeId[]; cabeza: CabezaMapa }
): AssessmentResult {
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

  (Object.keys(exactScores) as ArchetypeId[]).forEach(id => {
    normalizedScores[id] = Math.max(10, Math.min(98, Math.round(exactScores[id])));
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
    .sort((a, b) =>
      orden
        ? orden.ids.indexOf(a.archetypeId) - orden.ids.indexOf(b.archetypeId)
        : exactScores[b.archetypeId] - exactScores[a.archetypeId]
    );

  ranking.forEach((item, index) => {
    item.rank = index + 1;
  });

  const dominantArchetype = ranking[0];
  const top3 = ranking.slice(0, 3);
  const top5 = ranking.slice(0, 5);

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
  const compositeProfile = generateCompositeProfile(ranking, dimensionScores, gender, orden?.cabeza);
  const resueltos = cuantosResueltos(orden?.cabeza);

  const evidence: Partial<Record<ArchetypeId, AnswerEvidence[]>> = {};
  top3.forEach(item => {
    evidence[item.archetypeId] = evidenciaDe(item.archetypeId);
  });

  // Una sola lista de lo que menos apareció para todo (perfil, Mi Mapa, IA), con la regla del
  // perfil: nunca se elige por posición entre figuras empatadas.
  const developmentArchetypes = developmentFromProfile(compositeProfile, ranking);

  return {
    id: `eval-${Date.now()}`,
    date: new Date().toISOString(),
    title: resultTitle(compositeProfile, dominantArchetype.name),
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
    ...(instrumento ? { instrumento } : {}),
    ...(orden ? { cabeza: orden.cabeza } : {}),
    ...(resueltos ? { cabezaResuelta: resueltos } : {}),
  };
}

/** Cuántas respuestas se guardan como *por qué te salió* para cada arquetipo. */
const EVIDENCE_PER_ARCHETYPE = 2;

/**
 * Las respuestas que más empujaron a un arquetipo hacia arriba: las afirmaciones donde ese
 * arquetipo pesa de verdad (2 o 3; con peso 1 solo lo roza, y citarla como motivo no convence)
 * y con las que la persona estuvo de acuerdo (4 o 5), de más a menos peso. Si no hay ninguna,
 * la lista sale vacía y la pantalla no inventa un motivo.
 */
const EVIDENCE_MIN_WEIGHT = 2;

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
    .filter(e => e.weight >= EVIDENCE_MIN_WEIGHT && e.value >= 4)
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

  const compositeProfile = generateCompositeProfile(ranking, result.dimensionScores, gender, leerCabeza(result.cabeza));
  // Se recalcula con la regla de ahora: los resultados guardados traían las tres últimas
  // posiciones, elegidas aunque estuvieran empatadas con otras.
  const developmentArchetypes = developmentFromProfile(compositeProfile, ranking);

  const cabeza = leerCabeza(result.cabeza);
  return {
    ...result,
    // Si venía en la forma de desarrollo (lista de listas), se guarda ya en la buena.
    ...(cabeza ? { cabeza } : {}),
    title: resultTitle(compositeProfile, dominantArchetype.name),
    dominantArchetype,
    ranking,
    top3,
    top5,
    developmentArchetypes,
    compositeProfile,
  };
}

/** Las puntuaciones de lo que menos apareció, en el orden en que las eligió el perfil. */
function developmentFromProfile(profile: CompositeProfile, ranking: ArchetypeScore[]): ArchetypeScore[] {
  return profile.developmentArchetypes
    .map(d => ranking.find(s => s.archetypeId === d.archetypeId))
    .filter((s): s is ArchetypeScore => !!s);
}

/** El título de un resultado: no nombra un dominante si el mapa no lo tiene. */
function resultTitle(profile: CompositeProfile, dominantName: string): string {
  return `Mapa Arquetípico - ${profile.isFlat || profile.isTie ? profile.title : dominantName}`;
}

/** Cuántos puestos de arriba (0, 1 o 2) decidió el test uno a uno: capas de una sola figura. */
function cuantosResueltos(cabeza?: CabezaMapa): 0 | 1 | 2 {
  if (!cabeza || cabeza.primero.length !== 1) return 0;
  return cabeza.segundo.length === 1 ? 2 : 1;
}

/**
 * La cabeza guardada en un resultado. Acepta también la forma de una versión de desarrollo que
 * nunca se publicó (una lista de listas, que Firestore no admite).
 */
function leerCabeza(cabeza: unknown): CabezaMapa | undefined {
  if (Array.isArray(cabeza)) return { primero: cabeza[0] ?? [], segundo: cabeza[1] ?? [] };
  if (cabeza && typeof cabeza === 'object' && Array.isArray((cabeza as CabezaMapa).primero)) {
    const c = cabeza as CabezaMapa;
    return { primero: c.primero, segundo: Array.isArray(c.segundo) ? c.segundo : [] };
  }
  return undefined;
}

/** Dos figuras están a la par si las separa esta distancia o menos (en puntos de 10 a 98). */
export const TIE_MAX_GAP = 1;

/**
 * Un mapa no tiene polo claro si entre la figura que más puntúa y la que menos hay esta
 * distancia o menos. Calibrado con simulaciones: salta siempre con todo igual y casi siempre
 * con casi todo en el centro, y nunca con respuestas al azar, con perfiles marcados ni con un
 * mapa contrastado (una dimensión baja y el resto alto), aunque arriba haya muchos empatados.
 */
export const FLAT_MAX_RANGE = 15;

/**
 * …y además nadie se despega: el primero no saca al segundo más de esto. Un perfil suave pero
 * real (una figura diez puntos por delante en un mapa de poco contraste) no es plano: decir que
 * ninguna destaca sería falso. Coincide con lo que la pantalla explica: uno o dos puntos no
 * significan nada.
 */
export const FLAT_MAX_LEAD = 2;

/** «A», «A y B», «A, B y C». */
export function listNames(names: string[]): string {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

/**
 * Cómo nombrar la cabeza de un mapa en cualquier pantalla, para que ninguna proclame un
 * dominante que las respuestas no sostienen: sin polo claro, varias figuras a la par, o una.
 */
export function getMapLead(
  result: AssessmentResult,
  gender: GenderMode = 'male'
): { kind: 'flat' | 'tie' | 'single'; ids: ArchetypeId[]; label: string } {
  const p = result.compositeProfile;
  if (p.isFlat) return { kind: 'flat', ids: [], label: 'Sin un polo claro' };
  if (p.isTie) {
    const ids = p.tiedLeaders ?? [result.ranking[0].archetypeId, result.ranking[1].archetypeId];
    const label =
      ids.length > 3
        ? `${ids.length} figuras a la par`
        : `${listNames(ids.map(id => getArchetype(id, gender).name))}, a la par`;
    return { kind: 'tie', ids, label };
  }
  const id = result.dominantArchetype.archetypeId;
  return { kind: 'single', ids: [id], label: getArchetype(id, gender).name };
}

function generateCompositeProfile(
  ranking: ArchetypeScore[],
  _dimensionScores: Record<DimensionId, number>,
  gender: GenderMode = 'male',
  /** Los grupos del primer y segundo puesto, si los decidió el test (si no, se deducen de las puntuaciones). */
  cabeza?: CabezaMapa
): CompositeProfile {
  const deIds = (ids: ArchetypeId[] = []) =>
    ids.map(id => ranking.find(s => s.archetypeId === id)).filter((s): s is ArchetypeScore => !!s);
  const [first, second, third] = ranking;
  // Lo más bajo se busca por puntuación, no por posición: en el test por dilemas el orden sale de
  // las comparaciones, y la última posición no tiene por qué ser la de menos puntos.
  const porPuntuacion = [...ranking].sort((x, y) => y.normalizedScore - x.normalizedScore);
  const last = porPuntuacion[porPuntuacion.length - 1];
  const a = getArchetype(first.archetypeId, gender);
  const b = getArchetype(second.archetypeId, gender);
  const c = getArchetype(third.archetypeId, gender);

  const archetypeKey = `${a.id}-${b.id}-${c.id}`;
  const archetypeCombination = `${a.name} + ${b.name} + ${c.name}`;

  // Lo que menos apareció, sin elegir por posición entre figuras que las respuestas no
  // distinguen: se toma desde abajo mientras cada una se separe de la siguiente. Si abajo hay
  // tres o más empatadas, no se recomienda ninguna.
  const lowestIds: ArchetypeId[] = [];
  const grupoDe = (s: ArchetypeScore) => porPuntuacion.filter(x => Math.abs(x.normalizedScore - s.normalizedScore) <= TIE_MAX_GAP);
  // Lo elegido tiene que quedar cerrado: ninguna elegida puede estar empatada con una que se
  // queda fuera (con 10, 11 y 12, elegir 10 y 11 dejaría fuera a 12, empatada con 11).
  const cerrado = (ids: ArchetypeId[]) =>
    ids.every(id => grupoDe(ranking.find(s => s.archetypeId === id)!).every(s => ids.includes(s.archetypeId)));
  const grupoFinal = grupoDe(last).map(s => s.archetypeId).reverse();
  if (grupoFinal.length <= 2 && cerrado(grupoFinal)) {
    lowestIds.push(...grupoFinal);
    if (lowestIds.length === 1) {
      const siguiente = porPuntuacion[porPuntuacion.length - 2].archetypeId;
      if (cerrado([...lowestIds, siguiente])) lowestIds.push(siguiente);
    }
  }
  const developmentArchetypes = lowestIds.map(id => {
    const arch = getArchetype(id, gender);
    return {
      archetypeId: arch.id,
      name: arch.name,
      // Puntuar poco no es una carencia que haya que corregir: es lo que menos apareció.
      reason: `${arch.name} apareció poco en tus respuestas. Si quieres aprender a ${ARCHETYPE_DRIVES[arch.id]}, puede ser un buen lugar para explorar.`,
      activationPractice: arch.developmentExercises[0]?.actionStep || 'Lee su ficha y quédate con una sola pregunta.',
    };
  });
  const loQueMenos = developmentArchetypes.length
    ? ` Lo que sí se ve es lo que menos apareció: ${listNames(developmentArchetypes.map(d => d.name))}.`
    : '';

  // Si todo el mapa cabe en unos pocos puntos y nadie se despega, no se inventa una identidad.
  const range = porPuntuacion[0].normalizedScore - last.normalizedScore;
  if (!cabeza && range <= FLAT_MAX_RANGE && first.normalizedScore - second.normalizedScore <= FLAT_MAX_LEAD) {
    return {
      archetypeKey,
      title: 'Un mapa sin un polo claro',
      archetypeCombination,
      synthesis:
        `Tus respuestas puntúan parecido en todas las figuras: entre la que más y la que menos hay ${range} puntos, poco para ponerle nombre a ninguna. ` +
        'Puede ser un momento de equilibrio, o que hayas respondido casi todo igual. ' +
        'Si vuelves a responder pensando en situaciones concretas de las últimas semanas, el mapa se dibuja mejor.',
      strengths: [],
      risksAndShadows: [],
      developmentArchetypes: [],
      isFlat: true,
      isTie: false,
    };
  }

  // Quiénes comparten el primer puesto. Si son tres o más, las respuestas no distinguen entre
  // ellos: elegir dos por el orden en que están en los datos sería inventar.
  const leaders = cabeza ? deIds(cabeza.primero) : ranking.filter(s => first.normalizedScore - s.normalizedScore <= TIE_MAX_GAP);
  const leaderIds = leaders.map(s => s.archetypeId);

  if (leaders.length >= 3) {
    const names = leaders.map(s => getArchetype(s.archetypeId, gender).name);
    const shown = names.length <= 5 ? listNames(names) : `${names.length} figuras, entre ellas ${listNames(names.slice(0, 3))},`;
    return {
      archetypeKey,
      title: names.length === 3 ? `${listNames(names)}, a la par` : `${names.length} figuras a la par`,
      archetypeCombination,
      synthesis: `${shown} comparten el primer puesto de tu mapa: tus respuestas no distinguen entre ellas.${loQueMenos}`,
      strengths: [],
      risksAndShadows: [],
      developmentArchetypes,
      tiedLeaders: leaderIds,
      isTie: true,
      isFlat: false,
    };
  }

  // Un líder con un mapa casi sin contraste, o con tres o más empatadas detrás: no se inventa
  // una pareja eligiendo a una de ellas por posición. Se nombra al líder y se dice que detrás
  // van a la par. (Con exactamente dos empatadas detrás, la pareja se mantiene y se dice.)
  const segundos =
    cabeza ? deIds(cabeza.segundo) : ranking.slice(1).filter(s => second.normalizedScore - s.normalizedScore <= TIE_MAX_GAP);
  if (leaders.length === 1 && segundos.length >= 2 && (range <= FLAT_MAX_RANGE || segundos.length >= 3)) {
    return {
      archetypeKey,
      title: a.name,
      archetypeCombination: a.name,
      synthesis:
        `${a.name} encabeza tu mapa; detrás, ${segundos.length} figuras van a la par, sin que tus respuestas distingan entre ellas. ` +
        `Lo que más pesa en lo que respondiste es el impulso de ${ARCHETYPE_DRIVES[a.id]}.`,
      strengths: [`Fuerza ${withDe(a.name)}: ${a.strength}`],
      risksAndShadows: [`Sombra ${withDe(a.name)}: ${a.shadow}`],
      developmentArchetypes,
      isTie: false,
      isFlat: false,
    };
  }

  // Un líder con exactamente dos empatadas detrás: no se elige una de las dos para la pareja.
  // Se nombran las dos, con lo que aporta y la sombra de cada una. La tensión solo se dice si
  // las dos son de la misma dimensión; si no, cualquiera de las dos sería arbitraria.
  if (leaders.length === 1 && segundos.length === 2) {
    const [b1, b2] = segundos.map(s => getArchetype(s.archetypeId, gender));
    const tension = b1.dimension === b2.dimension ? getDimensionTension(a.dimension, b1.dimension) : '';
    return {
      archetypeKey,
      title: `${a.name}, con ${b1.name} y ${b2.name}`,
      archetypeCombination: `${a.name} + ${b1.name} + ${b2.name}`,
      synthesis:
        `${a.name} encabeza tu mapa, con ${b1.name} y ${b2.name} a la par detrás. ` +
        `Una parte de ti quiere ${ARCHETYPE_DRIVES[a.id]}; detrás, a la par, ${ARCHETYPE_DRIVES[b1.id]} y ${ARCHETYPE_DRIVES[b2.id]}.`,
      strengths: [a, b1, b2].map(x => `Fuerza ${withDe(x.name)}: ${x.strength}`),
      risksAndShadows: [a, b1, b2].map(x => `Sombra ${withDe(x.name)}: ${x.shadow}`),
      developmentArchetypes,
      companions: [b1.id, b2.id],
      ...(tension ? { tension } : {}),
      isTie: false,
      isFlat: false,
    };
  }

  // El perfil se nombra por la pareja que lo encabeza: 306 combinaciones en vez de seis
  // títulos fijos, y cada una dice algo de esas dos figuras y no de cualquiera.
  const isTie = leaders.length === 2;
  const head = isTie
    ? `${a.name} y ${b.name} comparten el primer puesto de tu mapa`
    : `${a.name} y ${b.name} encabezan tu mapa`;
  // El tercero solo se nombra cuando se distingue del cuarto.
  const cuarto = ranking[3];
  const detras = third.normalizedScore - cuarto.normalizedScore > TIE_MAX_GAP ? `, con ${c.name} detrás` : '';

  return {
    archetypeKey,
    title: `${a.name} + ${b.name}`,
    archetypeCombination,
    synthesis: `${head}${detras}. Una parte de ti quiere ${ARCHETYPE_DRIVES[a.id]}; otra, ${ARCHETYPE_DRIVES[b.id]}.`,
    strengths: [`Fuerza ${withDe(a.name)}: ${a.strength}`, `Fuerza ${withDe(b.name)}: ${b.strength}`],
    risksAndShadows: [`Sombra ${withDe(a.name)}: ${a.shadow}`, `Sombra ${withDe(b.name)}: ${b.shadow}`],
    developmentArchetypes,
    pair: [a.id, b.id],
    tension: getDimensionTension(a.dimension, b.dimension),
    ...(isTie ? { tiedLeaders: leaderIds } : {}),
    isTie,
    isFlat: false,
  };
}
