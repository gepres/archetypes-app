import { ARCHETYPES } from '../data/archetypesData';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../data/questionsData';
import {
  ArchetypeId,
  ArchetypeScore,
  AssessmentAnswer,
  AssessmentResult,
  CompositeProfile,
  DimensionId,
} from '../types';

export function calculateAssessmentResult(
  answers: AssessmentAnswer[],
  testType: 'full' | 'quick' = 'full'
): AssessmentResult {
  const activeQuestions = testType === 'quick'
    ? QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id))
    : QUESTIONS_DATA;

  // Track raw and max possible scores per archetype
  const rawScores: Record<ArchetypeId, number> = {
    rey: 0,
    guerrero: 0,
    mago: 0,
    amante: 0,
    padre: 0,
    cuidador: 0,
    bufon: 0,
    explorador: 0,
    creador: 0,
    sabio: 0,
    heroe: 0,
    rebelde: 0,
  };

  const maxPossibleScores: Record<ArchetypeId, number> = {
    rey: 0,
    guerrero: 0,
    mago: 0,
    amante: 0,
    padre: 0,
    cuidador: 0,
    bufon: 0,
    explorador: 0,
    creador: 0,
    sabio: 0,
    heroe: 0,
    rebelde: 0,
  };

  // Map answers for quick lookup
  const answerMap = new Map<number, number>();
  answers.forEach(a => answerMap.set(a.questionId, a.value));

  // Compute accumulated weighted scores
  activeQuestions.forEach(q => {
    const userVal = answerMap.get(q.id) ?? 3; // default neutral if unselected
    q.weights.forEach(w => {
      rawScores[w.archetypeId] += userVal * w.weight;
      maxPossibleScores[w.archetypeId] += 5 * w.weight;
    });
  });

  // Calculate normalized percentage (0 - 100)
  const normalizedScores: Record<ArchetypeId, number> = {
    rey: 0,
    guerrero: 0,
    mago: 0,
    amante: 0,
    padre: 0,
    cuidador: 0,
    bufon: 0,
    explorador: 0,
    creador: 0,
    sabio: 0,
    heroe: 0,
    rebelde: 0,
  };

  (Object.keys(rawScores) as ArchetypeId[]).forEach(id => {
    const max = maxPossibleScores[id] || 1;
    // Scale from min possible (1*weight) to max possible (5*weight)
    const min = max / 5;
    const scoreVal = rawScores[id];
    const percentage = Math.round(((scoreVal - min) / (max - min)) * 100);
    normalizedScores[id] = Math.max(10, Math.min(98, percentage));
  });

  // Create ranking array
  const ranking: ArchetypeScore[] = (Object.keys(normalizedScores) as ArchetypeId[])
    .map(id => ({
      archetypeId: id,
      name: ARCHETYPES[id].name,
      emoji: ARCHETYPES[id].emoji,
      rawScore: rawScores[id],
      normalizedScore: normalizedScores[id],
      rank: 0,
      dimension: ARCHETYPES[id].dimension,
    }))
    .sort((a, b) => b.normalizedScore - a.normalizedScore);

  ranking.forEach((item, index) => {
    item.rank = index + 1;
  });

  const dominantArchetype = ranking[0];
  const top3 = ranking.slice(0, 3);
  const top5 = ranking.slice(0, 5);

  // Suggested development archetypes (balanced complement from lowest scores or counter-weights)
  const developmentCandidates = ranking.slice(-3).reverse();
  const developmentArchetypes = developmentCandidates;

  // Calculate Dimension Scores (0 - 100)
  const dimensionScores: Record<DimensionId, number> = {
    mente: Math.round((normalizedScores.mago + normalizedScores.sabio) / 2),
    accion: Math.round(
      (normalizedScores.guerrero +
        normalizedScores.heroe +
        normalizedScores.rebelde +
        normalizedScores.explorador) /
        4
    ),
    corazon: Math.round(
      (normalizedScores.amante + normalizedScores.cuidador + normalizedScores.bufon) / 3
    ),
    construccion: Math.round(
      (normalizedScores.rey + normalizedScores.padre + normalizedScores.creador) / 3
    ),
  };

  // Generate composite profile
  const compositeProfile = generateCompositeProfile(ranking, dimensionScores);

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

function generateCompositeProfile(
  ranking: ArchetypeScore[],
  dimensionScores: Record<DimensionId, number>
): CompositeProfile {
  const top1 = ranking[0].archetypeId;
  const top2 = ranking[1].archetypeId;
  const top3 = ranking[2].archetypeId;
  const topIds = [top1, top2, top3];

  const topNames = `${ARCHETYPES[top1].name} + ${ARCHETYPES[top2].name} + ${ARCHETYPES[top3].name}`;

  // Composite profile archetype archetypes & archetypal archetype titles
  let title = "El Estratega Consciente";
  let synthesis = `Tu mapa refleja una configuración singular donde ${ARCHETYPES[top1].name} lidera tu psique, fuertemente respaldado por la energía de ${ARCHETYPES[top2].name} y ${ARCHETYPES[top3].name}.`;
  let strengths: string[] = [];
  let risksAndShadows: string[] = [];

  // Determine synthesis theme based on prominent top 3 combination
  if (topIds.includes('mago') && topIds.includes('creador')) {
    title = topIds.includes('explorador') ? "El Arquitecto Pionero" : "El Alquimista Creador";
    synthesis = "Tu perfil combina una marcada inclinación hacia la comprensión de patrones profundos, la invención creativa y la exploración de nuevas posibilidades. Tiendes a conectar ideas dispares, transformar conceptos abstractos en realidades tangibles y desafiar la inercia.";
    strengths = [
      "Pensamiento sistémico y visión estratégica anticipatoria",
      "Alta capacidad de innovación y expresión artística/técnica",
      "Curiosidad insaciable y aprendizaje autónomo acelerado",
      "Habilidad para destrabar problemas complejos con soluciones no convencionales"
    ];
    risksAndShadows = [
      "Tendencia a la dispersión y a comenzar múltiples proyectos sin cerrarlos",
      "Aislamiento intelectual o parálisis por sobreanálisis perfeccionista",
      "Dificultad para sostener tareas rutinarias o de administración cotidiana"
    ];
  } else if (topIds.includes('rey') && (topIds.includes('guerrero') || topIds.includes('padre'))) {
    title = topIds.includes('padre') ? "El Custodio Soberano" : "El Líder Estratégico";
    synthesis = "Tu configuración arquetípica proyecta una fuerte presencia organizadora, orientada al orden ético, la disciplina y la custodia del bienestar colectivo. Buscas construir estabilidad duradera y asumir la responsabilidad final de tus proyectos y vínculos.";
    strengths = [
      "Autoridad moral serena y capacidad de contención en crisis",
      "Foco en resultados sostenibles y visión de largo plazo",
      "Firmeza para establecer límites claros y resolver desacuerdos",
      "Compromiso generoso con la formación de las personas a tu cargo"
    ];
    risksAndShadows = [
      "Exceso de carga sobre los propios hombros e incapacidad para delegar",
      "Rigidez ante imprevistos o resistencia a la ligereza y el descanso",
      "Riesgo de frialdad emocional o autoritarismo reactivo bajo estrés"
    ];
  } else if (topIds.includes('amante') && (topIds.includes('cuidador') || topIds.includes('bufon'))) {
    title = "El Conector Compasivo";
    synthesis = "Tu mapa está profundamente arraigado en la dimensión del Corazón. Posees una sensibilidad humana excepcional, calidez para sostener a otros en momentos vulnerables y una capacidad innata para disfrutar y enriquecer los vínculos afectivos.";
    strengths = [
      "Empatía profunda y escucha activa sin prejuicios",
      "Habilidad para armonizar ambientes tensos y tejer comunidad",
      "Apreciación de la belleza estética y disfrute del presente",
      "Autenticidad emocional que genera confianza inmediata"
    ];
    risksAndShadows = [
      "Tendencia al autosacrificio y dificultad para decir 'no'",
      "Vulnerabilidad a la codependencia o a tomar las cargas ajenas como propias",
      "Evitación del conflicto necesario por miedo a dañar la armonía"
    ];
  } else if (topIds.includes('guerrero') && topIds.includes('heroe')) {
    title = "El Forjador Implacable";
    synthesis = "Tu motor principal es la superación de desafíos, el coraje físico o mental y la conquista de metas exigentes. Encuentras tu identidad en la disciplina de la lucha noble y en la resiliencia frente a cualquier obstáculo.";
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
  } else if (topIds.includes('sabio') && topIds.includes('explorador')) {
    title = "El Filósofo Peregrino";
    synthesis = "Tu camino está guiado por la búsqueda incansable de verdad, autonomía y perspectiva. Prefieres experimentar por ti mismo, desarmar dogmas y cultivar una mirada lúcida sobre la condición humana.";
    strengths = [
      "Independencia de criterio y honestidad intelectual sin compromisos",
      "Capacidad de mantener objetividad y discernimiento ante el ruido social",
      "Adaptabilidad en entornos desconocidos y soledad fecunda",
      "Habilidad para sintetizar experiencias en sabiduría viva"
    ];
    risksAndShadows = [
      "Desconexión emocional o distancia defensiva de los compromisos terrenales",
      "Cinismo sutil o desapego que puede vivirse como desinterés por otros",
      "Riesgo de posponer la acción práctica en nombre de acumular más conocimiento"
    ];
  } else {
    // Balanced Dynamic Title
    title = `El Integrador ${ARCHETYPES[top1].name}`;
    synthesis = `Tu perfil integra de forma dinámica la fuerza de ${ARCHETYPES[top1].name} con la versatilidad de ${ARCHETYPES[top2].name} y la presencia de ${ARCHETYPES[top3].name}. Manifiestas un balance singular entre tus impulsos creativos, analíticos y de acción.`;
    strengths = [
      `Capacidad de liderar desde las virtudes nucleares del ${ARCHETYPES[top1].name}`,
      `Complementariedad táctica aportada por el ${ARCHETYPES[top2].name}`,
      `Flexibilidad para responder a diversos desafíos sin quedar atrapado en un solo rol`,
      "Claridad para navegar entre la reflexión interior y el impacto exterior"
    ];
    risksAndShadows = [
      "Tensión interna entre diferentes prioridades y formas de operar",
      "Posible oscilación entre la exigencia de acción y el repliegue reflexivo",
      "Necesidad de consolidar un eje central para evitar desgaste de energía"
    ];
  }

  // Determine development archetypes based on lowest dimensions & balance needs
  const lowestArchetype1 = ranking[11].archetypeId;
  const lowestArchetype2 = ranking[10].archetypeId;

  const developmentArchetypes = [
    {
      archetypeId: lowestArchetype1,
      name: ARCHETYPES[lowestArchetype1].name,
      reason: `Integrar el ${ARCHETYPES[lowestArchetype1].name} te permitirá equilibrar tu energía dominante, aportando ${ARCHETYPES[lowestArchetype1].concepts.slice(0, 3).join(', ')}.`,
      activationPractice: ARCHETYPES[lowestArchetype1].developmentExercises[0]?.actionStep || "Practicar conscientemente su pregunta central."
    },
    {
      archetypeId: lowestArchetype2,
      name: ARCHETYPES[lowestArchetype2].name,
      reason: `El ${ARCHETYPES[lowestArchetype2].name} actúa como un contrapeso saludable frente a los riesgos de tu sombra arquetípica.`,
      activationPractice: ARCHETYPES[lowestArchetype2].developmentExercises[0]?.actionStep || "Explorar sus ejercicios de reflexión."
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
