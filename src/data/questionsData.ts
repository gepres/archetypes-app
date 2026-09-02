import { Question } from '../types';

export const QUESTIONS_DATA: Question[] = [
  // MENTE: Sabio / Mago / Comprensión / Análisis / Patrones
  {
    id: 1,
    text: "Cuando aparece un problema difícil, mi primer impulso es detenerme a comprender la raíz oculta antes de reaccionar.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "sabio", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Resolución de Problemas"
  },
  {
    id: 2,
    text: "Disfruto desarmar ideas complejas, estudiar filosofías o analizar cómo funcionan las cosas en su nivel más fundamental.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "mago", weight: 2 },
      { archetypeId: "explorador", weight: 1 }
    ],
    scenarioCategory: "Aprendizaje y Filosofía"
  },
  {
    id: 3,
    text: "Suelo percibir conexiones, tendencias o patrones invisibles en las personas o sistemas que otros pasan por alto.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Intuición y Estrategia"
  },
  {
    id: 4,
    text: "Prefiero basarme en datos objetivos y argumentos lógicos verificables antes que dejarme llevar por emociones del momento.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "guerrero", weight: 1 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Toma de Decisiones"
  },
  {
    id: 5,
    text: "Me fascina encontrar soluciones ingeniosas o tecnológicas que transformen por completo una situación que parecía bloqueada.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "rebelde", weight: 1 }
    ],
    scenarioCategory: "Innovación y Cambio"
  },
  {
    id: 6,
    text: "Valoro enormemente la honestidad intelectual y no dudo en cuestionar mis propias creencias si encuentro evidencia contraria.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "explorador", weight: 2 },
      { archetypeId: "rebelde", weight: 1 }
    ],
    scenarioCategory: "Verdad y Criterio"
  },
  {
    id: 7,
    text: "En momentos de caos colectivo, tiendo a ser la voz fría y analítica que aclara el panorama sin perder la compostura.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Gestión de Crisis"
  },
  {
    id: 8,
    text: "Me apasiona el conocimiento estratégico: entender la psicología humana y las dinámicas de poder para prever desenlaces.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Estrategia Humana"
  },
  {
    id: 9,
    text: "A menudo me pierdo durante horas reflexionando sobre el sentido de la existencia, la ética y las grandes preguntas humanas.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "amante", weight: 1 },
      { archetypeId: "explorador", weight: 1 }
    ],
    scenarioCategory: "Contemplación"
  },
  {
    id: 10,
    text: "Me gusta actuar como un catalizador discreto que ayuda a otros a desbloquear su potencial o transformar su mentalidad.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "cuidador", weight: 1 }
    ],
    scenarioCategory: "Transformación Personal"
  },
  {
    id: 11,
    text: "Evito emitir juicios apresurados sobre las personas; primero intento entender el contexto y los motivos de fondo.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "cuidador", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Juicio y Comprensión"
  },
  {
    id: 12,
    text: "Me atraen las herramientas, métodos o disciplinas que permiten optimizar el rendimiento de la mente y los proyectos.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "guerrero", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Optimización"
  },
  {
    id: 13,
    text: "Disfruto sintetizar grandes volúmenes de lectura o estudio en principios concisos y aplicables.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Síntesis y Claridad"
  },
  {
    id: 14,
    text: "Cuando alguien me plantea una situación complicada, busco la 'palanca invisible' que puede cambiar todo con el menor esfuerzo.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Eficacia Estratégica"
  },
  {
    id: 15,
    text: "Considero que la ignorancia y el autoengaño son las mayores causas del sufrimiento y la decadencia individual.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "rebelde", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Valores Filosóficos"
  },

  // ACCIÓN: Guerrero / Héroe / Rebelde / Explorador
  {
    id: 16,
    text: "Prefiero pasar a la acción y corregir sobre la marcha antes que quedarme inmóvil esperando tener certeza absoluta.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "heroe", weight: 2 },
      { archetypeId: "explorador", weight: 2 }
    ],
    scenarioCategory: "Iniciativa y Acción"
  },
  {
    id: 17,
    text: "Cuando una norma o tradición establecida me parece injusta o absurda, no dudo en desafiarla abiertamente.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "rebelde", weight: 3 },
      { archetypeId: "explorador", weight: 2 },
      { archetypeId: "heroe", weight: 1 }
    ],
    scenarioCategory: "Desafío a la Autoridad"
  },
  {
    id: 18,
    text: "Tengo la capacidad de sostener una disciplina férrea y tolerar el cansancio físico o mental para alcanzar una meta.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "heroe", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Fuerza de Voluntad"
  },
  {
    id: 19,
    text: "Siento una profunda necesidad periódica de alejarme de la rutina cotidiana y explorar lugares o caminos desconocidos.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "explorador", weight: 3 },
      { archetypeId: "rebelde", weight: 2 },
      { archetypeId: "amante", weight: 1 }
    ],
    scenarioCategory: "Búsqueda y Aventura"
  },
  {
    id: 20,
    text: "Me crezco ante las dificultades; cuando los demás se rinden, encuentro una fuerza interior para empujar hacia adelante.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "heroe", weight: 3 },
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "padre", weight: 1 }
    ],
    scenarioCategory: "Resiliencia Heroica"
  },
  {
    id: 21,
    text: "No temo poner límites tajantes o decir 'no' cuando alguien intenta sobrepasar mi dignidad o mi tiempo.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "rebelde", weight: 1 }
    ],
    scenarioCategory: "Límites Personales"
  },
  {
    id: 22,
    text: "Me aburre profundamente la vida convencional y predecible; necesito sentir que estoy conquistando mi propia independencia.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "explorador", weight: 3 },
      { archetypeId: "rebelde", weight: 3 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Autonomía"
  },
  {
    id: 23,
    text: "Estoy dispuesto a asumir sacrificios personales significativos si con ello defiendo una causa justa o protejo a mi gente.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "heroe", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "cuidador", weight: 1 }
    ],
    scenarioCategory: "Nobleza y Sacrificio"
  },
  {
    id: 24,
    text: "Detesto la hipocresía social y prefiero ser criticado por decir mi verdad antes que encajar a costa de mi autenticidad.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "rebelde", weight: 3 },
      { archetypeId: "guerrero", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Autenticidad Radical"
  },
  {
    id: 25,
    text: "Mantengo la calma y la determinación en situaciones de confrontación directa o negociación tensa.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Firmeza y Templanza"
  },
  {
    id: 26,
    text: "Me siento atraído por viajar solo o sumergirme en experiencias donde deba valerme exclusivamente por mis propios medios.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "explorador", weight: 3 },
      { archetypeId: "sabio", weight: 1 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Autosuficiencia"
  },
  {
    id: 27,
    text: "Concibo mi vida como una gran travesía donde cada caída es una prueba necesaria para forjar mi carácter.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "heroe", weight: 3 },
      { archetypeId: "explorador", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Visión Existencial"
  },
  {
    id: 28,
    text: "Disfruto romper con lo obsoleto y provocar un cambio radical en sistemas que se han vuelto acomodados o corruptos.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "rebelde", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Transformación Disruptiva"
  },
  {
    id: 29,
    text: "Cuando me comprometo con una meta deportiva, profesional o personal, no admito excusas de mí mismo.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "heroe", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Exigencia Personal"
  },
  {
    id: 30,
    text: "Siento una profunda curiosidad por lo que hay más allá de las fronteras físicas, culturales o de pensamiento de mi entorno.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "explorador", weight: 3 },
      { archetypeId: "sabio", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Apertura al Mundo"
  },

  // CORAZÓN: Amante / Cuidador / Bufón
  {
    id: 31,
    text: "Me conmueve profundamente la belleza del arte, la naturaleza, la música o una conversación sincera y vulnerable.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "cuidador", weight: 1 }
    ],
    scenarioCategory: "Sensibilidad Estética"
  },
  {
    id: 32,
    text: "Tengo una habilidad natural para percibir cuándo alguien cercano está sufriendo y ofrecerle mi apoyo sin juzgarlo.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 3 },
      { archetypeId: "amante", weight: 2 },
      { archetypeId: "padre", weight: 1 }
    ],
    scenarioCategory: "Empatía Activa"
  },
  {
    id: 33,
    text: "Utilizo el humor y la risa espontánea para desinflar momentos solemnes, aliviar la tensión y conectar con la gente.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "amante", weight: 1 },
      { archetypeId: "rebelde", weight: 1 }
    ],
    scenarioCategory: "Humor y Ligereza"
  },
  {
    id: 34,
    text: "Vivo mis vínculos afectivos y pasiones con intensidad total; prefiero la profundidad íntima a las relaciones superficiales.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "cuidador", weight: 1 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Intimidad Afectiva"
  },
  {
    id: 35,
    text: "Encuentro una satisfacción profunda al ser útil y facilitar la vida de otros de manera práctica y desinteresada.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "heroe", weight: 1 }
    ],
    scenarioCategory: "Servicio y Altruismo"
  },
  {
    id: 36,
    text: "No me tomo a mí mismo demasiado en serio; puedo reírme de mis propios tropiezos y debilidades con total naturalidad.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "sabio", weight: 2 },
      { archetypeId: "explorador", weight: 1 }
    ],
    scenarioCategory: "Autoaceptación Lúdica"
  },
  {
    id: 37,
    text: "Valoro enormemente los placeres sensoriales de la vida: una buena comida, una copa con calma, el tacto y el descanso pleno.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "bufon", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Disfrute Sensorial"
  },
  {
    id: 38,
    text: "Estoy dispuesto a posponer mis propios planes si un ser querido o compañero necesita ayuda urgente o escucha.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "amante", weight: 1 }
    ],
    scenarioCategory: "Disponibilidad Afectiva"
  },
  {
    id: 39,
    text: "Disfruto el juego libre, la improvisación y desafiar la excesiva rigidez de los ambientes acartonados.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "explorador", weight: 1 }
    ],
    scenarioCategory: "Espontaneidad"
  },
  {
    id: 40,
    text: "Considero que la vulnerabilidad y la capacidad de expresar emociones auténticas son signos de verdadera madurez.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "cuidador", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Madurez Emocional"
  },
  {
    id: 41,
    text: "Suelo estar atento al bienestar físico y anímico de las personas que me rodean en una casa o equipo de trabajo.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Protección Comunitaria"
  },
  {
    id: 42,
    text: "Tengo facilidad para romper el hielo en grupos desconocidos y hacer que la gente se sienta relajada y alegre.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "amante", weight: 2 },
      { archetypeId: "cuidador", weight: 1 }
    ],
    scenarioCategory: "Conexión Social"
  },
  {
    id: 43,
    text: "Me mueve una pasión casi devocional por mis proyectos o amores; no concibo hacer las cosas a medias tintas.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "heroe", weight: 1 }
    ],
    scenarioCategory: "Pasión Vital"
  },
  {
    id: 44,
    text: "Me resulta fácil postergar el juicio moral y brindar consuelo a alguien que cometió un error grave.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 3 },
      { archetypeId: "amante", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Compasión y Perdón"
  },
  {
    id: 45,
    text: "Creo firmemente que el juego y la capacidad de asombro son indispensables para no envejecer por dentro.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "amante", weight: 1 }
    ],
    scenarioCategory: "Filosofía del Juego"
  },

  // CONSTRUCCIÓN: Rey / Padre / Creador
  {
    id: 46,
    text: "Siento la responsabilidad natural de organizar grupos, fijar metas claras y coordinar esfuerzos para que las cosas funcionen.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Liderazgo y Estructura"
  },
  {
    id: 47,
    text: "Tengo una constante necesidad de materializar ideas originales: escribir, diseñar, programar, construir o emprender.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "creador", weight: 3 },
      { archetypeId: "mago", weight: 2 },
      { archetypeId: "explorador", weight: 1 }
    ],
    scenarioCategory: "Manifestación Creativa"
  },
  {
    id: 48,
    text: "Me preocupo profundamente por el futuro de las nuevas generaciones y por transmitir enseñanzas éticas y prácticas.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "sabio", weight: 2 }
    ],
    scenarioCategory: "Mentoría y Legado"
  },
  {
    id: 49,
    text: "Cuando surge un conflicto entre personas con posturas enfrentadas, busco acuerdos justos y estables para el bien común.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Arbitraje y Justicia"
  },
  {
    id: 50,
    text: "No me basta con tener buenas ideas abstractas; necesito verlas convertidas en obras tangibles, estéticas y bien terminadas.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "creador", weight: 3 },
      { archetypeId: "guerrero", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Maestría y Obra"
  },
  {
    id: 51,
    text: "Disfruto aconsejar a personas más jóvenes o con menos experiencia, ayudándoles a descubrir y confiar en sus capacidades.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "cuidador", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Formación Humana"
  },
  {
    id: 52,
    text: "Pienso habitualmente a 5, 10 o 20 años vista: qué estructuras, patrimonio o instituciones sólidas quiero dejar cimentadas.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Visión a Largo Plazo"
  },
  {
    id: 53,
    text: "Me obsesiona la originalidad y la estética en todo lo que produzco; detesto las soluciones genéricas o de baja calidad.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "creador", weight: 3 },
      { archetypeId: "amante", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Criterio Estético"
  },
  {
    id: 54,
    text: "Sé cuándo contener con paciencia y cuándo exigir con firmeza para que alguien asuma su propia madurez.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Exigencia Formativa"
  },
  {
    id: 55,
    text: "En un equipo, asumo con serenidad la responsabilidad final si las cosas salen mal, protegiendo a quienes confiaron en mí.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "heroe", weight: 2 },
      { archetypeId: "padre", weight: 2 }
    ],
    scenarioCategory: "Responsabilidad Soberana"
  },
  {
    id: 56,
    text: "Encuentro belleza y estado de flujo total cuando paso horas dando forma a un proyecto artesanal, artístico o intelectual.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "creador", weight: 3 },
      { archetypeId: "amante", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Estado de Flujo"
  },
  {
    id: 57,
    text: "Me alegra ver que quienes he formado o apoyado me superan en talento y alcanzan sus propios triunfos con autonomía.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "cuidador", weight: 1 }
    ],
    scenarioCategory: "Generosidad Formativa"
  },
  {
    id: 58,
    text: "Suelo evaluar las situaciones buscando cómo ordenar prioridades, optimizar recursos y crear estabilidad duradera.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "sabio", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Orden y Estabilidad"
  },
  {
    id: 59,
    text: "Tengo facilidad para reinventar formatos o combinar disciplinas distintas en creaciones totalmente novedosas.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "creador", weight: 3 },
      { archetypeId: "mago", weight: 2 },
      { archetypeId: "rebelde", weight: 2 }
    ],
    scenarioCategory: "Innovación Cruzada"
  },
  {
    id: 60,
    text: "Considero que mi valor como ser humano se mide por la solidez de lo que construyo y por el espacio de seguridad que brindo a los míos.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "creador", weight: 2 }
    ],
    scenarioCategory: "Propósito de Vida"
  }
];

// Quick test selection (24 high-signal balanced questions, 2 per archetype)
export const QUICK_QUESTION_IDS = [
  1, 2, 3, 6, // Mente (Mago, Sabio)
  16, 17, 18, 19, 20, 21, 22, 28, // Acción (Guerrero, Héroe, Rebelde, Explorador)
  31, 32, 33, 34, 35, 36, // Corazón (Amante, Cuidador, Bufón)
  46, 47, 48, 49, 50, 52 // Construcción (Rey, Padre, Creador)
];

export const LIKERT_OPTIONS = [
  { value: 1, label: "Nada parecido a mí", short: "1" },
  { value: 2, label: "Poco parecido a mí", short: "2" },
  { value: 3, label: "Neutral / A veces", short: "3" },
  { value: 4, label: "Bastante parecido a mí", short: "4" },
  { value: 5, label: "Muy parecido a mí", short: "5" },
];
