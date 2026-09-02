import { ARCHETYPES, getArchetypeName, getArchetype } from '../data/archetypesData';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../data/questionsData';
import {
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

  (Object.keys(rawScores) as ArchetypeId[]).forEach(id => {
    const max = maxPossibleScores[id] || 1;
    const min = max / 5;
    const scoreVal = rawScores[id];
    const percentage = Math.round(((scoreVal - min) / (max - min)) * 100);
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
    .sort((a, b) => b.normalizedScore - a.normalizedScore);

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
  };
}

/**
 * Re-adapts an existing AssessmentResult to a new gender perspective without losing scores.
 */
export function adaptAssessmentResultToGender(
  result: AssessmentResult,
  gender: GenderMode = 'male'
): AssessmentResult {
  const dominantId = result.dominantArchetype.archetypeId;
  const dominantArchetype = {
    ...result.dominantArchetype,
    ...getArchetype(dominantId, gender),
    normalizedScore: result.dominantArchetype.normalizedScore,
    rawScore: result.dominantArchetype.rawScore,
  };

  const ranking = result.ranking.map(item => {
    const arch = getArchetype(item.archetypeId, gender);
    return {
      ...item,
      name: arch.name,
      emoji: arch.emoji,
      dimension: arch.dimension,
    };
  });

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

function generateCompositeProfile(
  ranking: ArchetypeScore[],
  dimensionScores: Record<DimensionId, number>,
  gender: GenderMode = 'male'
): CompositeProfile {
  const top1 = ranking[0].archetypeId;
  const top2 = ranking[1].archetypeId;
  const top3 = ranking[2].archetypeId;
  const topIds = [top1, top2, top3];

  const name1 = getArchetypeName(top1, gender);
  const name2 = getArchetypeName(top2, gender);
  const name3 = getArchetypeName(top3, gender);

  const topNames = `${name1} + ${name2} + ${name3}`;

  let title = gender === 'female' ? "La Estratega Consciente" : "El Estratega Consciente";
  let synthesis = `Tu mapa refleja una configuración singular donde ${name1} lidera tu psique, fuertemente respaldada por la energía de ${name2} y ${name3}.`;
  let strengths: string[] = [];
  let risksAndShadows: string[] = [];

  // Determine synthesis theme based on prominent top 3 combination
  if (topIds.includes('mago') && (topIds.includes('creador') || topIds.includes('constructor'))) {
    title = gender === 'female' ? "La Alquimista Creadora" : "El Alquimista Creador";
    synthesis = `Tu perfil combina una marcada inclinación hacia la comprensión de patrones profundos, la invención creativa y la materialización de soluciones innovadoras. Tiendes a conectar ideas dispares y transformar conceptos abstractos en realidades tangibles.`;
    strengths = [
      "Pensamiento sistémico y visión estratégica anticipatoria",
      "Alta capacidad de innovación y expresión técnica/artística",
      "Curiosidad insaciable y aprendizaje autónomo acelerado",
      "Habilidad para destrabar problemas complejos con soluciones no convencionales"
    ];
    risksAndShadows = [
      "Tendencia a la dispersión y a comenzar múltiples proyectos sin cerrarlos",
      "Aislamiento intelectual o parálisis por sobreanálisis perfeccionista",
      "Dificultad para sostener tareas rutinarias de administración cotidiana"
    ];
  } else if ((topIds.includes('rey') || topIds.includes('soberano')) && (topIds.includes('guerrero') || topIds.includes('padre'))) {
    title = gender === 'female' ? "La Soberana Protectora" : "El Soberano Protector";
    synthesis = `Tu configuración proyecta una fuerte presencia organizadora, orientada al orden ético, la disciplina y la custodia del bienestar colectivo. Buscas construir estabilidad duradera y asumir la responsabilidad final de tus proyectos y vínculos.`;
    strengths = [
      "Autoridad moral serena y capacidad de contención en crisis",
      "Foco en resultados sostenibles y visión de largo plazo",
      "Firmeza para establecer límites claros y resolver desacuerdos",
      "Compromiso generoso con la formación y desarrollo de tu entorno"
    ];
    risksAndShadows = [
      "Exceso de carga sobre los propios hombros e incapacidad para delegar",
      "Rigidez ante imprevistos o resistencia a la ligereza y el descanso",
      "Riesgo de frialdad emocional o autoritarismo reactivo bajo estrés"
    ];
  } else if ((topIds.includes('amante') || topIds.includes('sanador')) && (topIds.includes('cuidador') || topIds.includes('bufon'))) {
    title = gender === 'female' ? "La Conectora Compasiva" : "El Conector Compasivo";
    synthesis = `Tu mapa está profundamente arraigado en la dimensión del Corazón. Posees una sensibilidad humana excepcional, calidez para sostener a otros en momentos vulnerables y una capacidad innata para sanar y enriquecer los vínculos afectivos.`;
    strengths = [
      "Empatía profunda y escucha activa sin prejuicios",
      "Habilidad para armonizar ambientes tensos y reparar heridas relacionales",
      "Apreciación de la belleza estética y disfrute del presente",
      "Autenticidad emocional que genera confianza inmediata"
    ];
    risksAndShadows = [
      "Tendencia al autosacrificio y dificultad para decir 'no'",
      "Vulnerabilidad a la codependencia o a tomar las cargas ajenas como propias",
      "Evitación del conflicto necesario por miedo a dañar la armonía"
    ];
  } else if (topIds.includes('guerrero') && (topIds.includes('heroe') || topIds.includes('rebelde'))) {
    title = gender === 'female' ? "La Guerrera Transformadora" : "El Forjador Transformador";
    synthesis = `Tu motor principal es la superación de desafíos, el coraje activo y la conquista de metas exigentes. Encuentras tu identidad en la disciplina noble, la defensa de la justicia y la disrupción liberadora frente a lo obsoleto.`;
    strengths = [
      "Fuerza de voluntad extraordinaria y alta tolerancia a la incomodidad",
      "Capacidad de actuar con rapidez y decisión en situaciones críticas",
      "Lealtad incondicional a tus principios y a quienes defiendes",
      "Orientación a la excelencia y a superar los propios límites"
    ];
    risksAndShadows = [
      "Adicción a la adrenalina del conflicto o incapacidad de frenar",
      "Juicio severo hacia la debilidad propia o la lentitud ajena",
      "Dificultad para aceptar la vulnerabilidad y la ternura sin defensas"
    ];
  } else if (topIds.includes('sacerdote') || topIds.includes('mistico') || topIds.includes('integrador')) {
    title = gender === 'female' ? "La Tejedora del Misterio y la Totalidad" : "El Guardián del Misterio y la Totalidad";
    synthesis = `Tu mapa refleja una búsqueda profunda de sentido, contemplación y síntesis holística. Te mueves con soltura entre lo visible y lo invisible, buscando armonizar los opuestos y vivir desde un centro sereno e incorruptible.`;
    strengths = [
      "Percepción intuitiva sutil y serenidad existencial profunda",
      "Capacidad de sintetizar polaridades y mediar en conflictos complejos",
      "Alineación con valores trascendentes y respeto por lo sagrado",
      "Presencia de paz que disuelve la agitación colectiva"
    ];
    risksAndShadows = [
      "Desconexión ocasional de las demandas prácticas y materiales cotidianas",
      "Aislamiento místico o incomodidad con el ruido del mundo",
      "Dificultad para comunicar verdades intuitivas a mentes puramente racionales"
    ];
  } else {
    // Dynamic Title
    title = `${gender === 'female' ? 'La Integradora' : 'El Integrador'} ${name1}`;
    synthesis = `Tu perfil integra de forma dinámica la fuerza de ${name1} con la versatilidad de ${name2} y la presencia de ${name3}. Manifiestas un balance singular entre tus impulsos reflexivos, afectivos y de acción.`;
    strengths = [
      `Capacidad de liderar desde las virtudes nucleares del arquetipo ${name1}`,
      `Complementariedad táctica aportada por ${name2}`,
      `Flexibilidad para responder a diversos desafíos sin quedar atrapado en un solo rol`,
      "Claridad para navegar entre la reflexión interior y el impacto exterior"
    ];
    risksAndShadows = [
      "Tensión interna entre diferentes prioridades y formas de operar",
      "Posible oscilación entre la exigencia de acción y el repliegue reflexivo",
      "Necesidad de consolidar un eje central para evitar desgaste de energía"
    ];
  }

  // Determine development archetypes based on lowest scores
  const lowestArchetype1 = ranking[ranking.length - 1].archetypeId;
  const lowestArchetype2 = ranking[ranking.length - 2].archetypeId;

  const lowArch1 = getArchetype(lowestArchetype1, gender);
  const lowArch2 = getArchetype(lowestArchetype2, gender);

  const developmentArchetypes = [
    {
      archetypeId: lowestArchetype1,
      name: lowArch1.name,
      reason: `Integrar a ${lowArch1.name} te permitirá equilibrar tu energía dominante, aportando ${lowArch1.concepts.slice(0, 3).join(', ')}.`,
      activationPractice: lowArch1.developmentExercises[0]?.actionStep || "Practicar conscientemente su pregunta central."
    },
    {
      archetypeId: lowestArchetype2,
      name: lowArch2.name,
      reason: `${lowArch2.name} actúa como un contrapeso saludable frente a los riesgos de tu sombra arquetípica.`,
      activationPractice: lowArch2.developmentExercises[0]?.actionStep || "Explorar sus ejercicios de reflexión."
    }
  ];

  return {
    archetypeKey: `${top1}-${top2}-${top3}`,
    title,
    archetypeCombination: topNames,
    synthesis,
    strengths,
    risksAndShadows,
    developmentArchetypes,
  };
}
