// Datos del dominio. Se mantienen en el nucleo, no en la web, porque son el
// producto: el movil y la web tienen que hablar de los mismos dieciocho.
import type { Question } from '../model';

export const QUESTIONS_DATA: Question[] = [
  // ==========================================
  // DIMENSIÓN 1: MENTE & TRASCENDENCIA (15 Preguntas)
  // (Mago, Sabio, Sacerdote, Místico)
  // ==========================================
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
      { archetypeId: "sacerdote", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Intuición y Estrategia"
  },
  {
    id: 4,
    text: "Prefiero basarme en datos objetivos, principios éticos y argumentos lógicos verificables antes que dejarme llevar por emociones del momento.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "soberano", weight: 2 },
      { archetypeId: "constructor", weight: 1 }
    ],
    scenarioCategory: "Toma de Decisiones"
  },
  {
    id: 5,
    text: "Me fascina encontrar soluciones ingeniosas o herramientas innovadoras que transformen por completo una situación bloqueada.",
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
      { archetypeId: "integrador", weight: 1 }
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
      { archetypeId: "soberano", weight: 1 }
    ],
    scenarioCategory: "Gestión de Crisis"
  },
  {
    id: 8,
    text: "Dedico tiempo voluntario al silencio, la meditación o la contemplación para escuchar mi intuición y mi voz interior.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sacerdote", weight: 3 },
      { archetypeId: "mistico", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Mundo Interior"
  },
  {
    id: 9,
    text: "Siento una profunda conexión con el misterio de la vida, el cosmos y la sensación de que todo lo que existe está entrelazado.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mistico", weight: 3 },
      { archetypeId: "sacerdote", weight: 2 },
      { archetypeId: "integrador", weight: 1 }
    ],
    scenarioCategory: "Trascendencia Cósmica"
  },
  {
    id: 10,
    text: "Trato mis decisiones y mis relaciones más íntimas con un sentido de reverencia y respeto por lo sagrado.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sacerdote", weight: 3 },
      { archetypeId: "amante", weight: 2 },
      { archetypeId: "soberano", weight: 1 }
    ],
    scenarioCategory: "Ética Sagrada"
  },
  {
    id: 11,
    text: "En medio de las dificultades cotidianas, logro experimentar una paz de fondo reconociendo el flujo natural de los ciclos cósmicos.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mistico", weight: 3 },
      { archetypeId: "sanador", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Paz Trascendente"
  },
  {
    id: 12,
    text: "A menudo recibo impresiones o corazonadas sutiles que luego resultan ser extraordinariamente acertadas.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sacerdote", weight: 3 },
      { archetypeId: "mago", weight: 2 },
      { archetypeId: "sanador", weight: 1 }
    ],
    scenarioCategory: "Percepción Intuitiva"
  },
  {
    id: 13,
    text: "Me apasiona el conocimiento estratégico: comprender la psicología profunda y las dinámicas invisibles para prever desenlaces.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mago", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Estrategia Psicológica"
  },
  {
    id: 14,
    text: "Busco la verdad esencial más allá de las apariencias y las modas superficiales impuestas por la sociedad.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "soberano", weight: 2 },
      { archetypeId: "mistico", weight: 1 }
    ],
    scenarioCategory: "Autenticidad Mental"
  },
  {
    id: 15,
    text: "Experimento momentos de asombro y gratitud pura ante la inmensidad del universo o la naturaleza.",
    dimensionFocus: "mente",
    weights: [
      { archetypeId: "mistico", weight: 3 },
      { archetypeId: "amante", weight: 2 },
      { archetypeId: "sacerdote", weight: 1 }
    ],
    scenarioCategory: "Asombro Cósmico"
  },

  // ==========================================
  // DIMENSIÓN 2: ACCIÓN & CORAJE (15 Preguntas)
  // (Guerrero, Héroe, Rebelde, Explorador)
  // ==========================================
  {
    id: 16,
    text: "Cuando me comprometo con una meta, mantengo una disciplina rigurosa y no me permito excusas hasta concluirla.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "heroe", weight: 2 },
      { archetypeId: "constructor", weight: 1 }
    ],
    scenarioCategory: "Disciplina y Foco"
  },
  {
    id: 17,
    text: "No tolero que sobrepasen mis límites personales y soy capaz de confrontar directamente a quien pretenda abusar o manipular.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "soberano", weight: 2 },
      { archetypeId: "rebelde", weight: 1 }
    ],
    scenarioCategory: "Firmeza y Límites"
  },
  {
    id: 18,
    text: "Me motiva enormemente enfrentar desafíos difíciles o situaciones de alta presión que ponen a prueba mi temple.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "heroe", weight: 3 },
      { archetypeId: "guerrero", weight: 2 },
      { archetypeId: "explorador", weight: 1 }
    ],
    scenarioCategory: "Superación Personal"
  },
  {
    id: 19,
    text: "Si una regla o estructura se ha vuelto absurda, injusta o sofocante, siento la necesidad imperiosa de desafiarla.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "rebelde", weight: 3 },
      { archetypeId: "explorador", weight: 2 },
      { archetypeId: "heroe", weight: 1 }
    ],
    scenarioCategory: "Disrupción y Revolución"
  },
  {
    id: 20,
    text: "Valoro mi independencia por encima de la comodidad; prefiero abrir caminos nuevos aunque tenga que caminar solo.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "explorador", weight: 3 },
      { archetypeId: "soberano", weight: 2 },
      { archetypeId: "rebelde", weight: 1 }
    ],
    scenarioCategory: "Autonomía y Aventura"
  },
  {
    id: 21,
    text: "Ante una caída o derrota dolorosa, me levanto con mayor determinación y transformo el obstáculo en combustible.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "heroe", weight: 3 },
      { archetypeId: "sanador", weight: 2 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Resiliencia Épica"
  },
  {
    id: 22,
    text: "Prefiero la acción imperfecta e inmediata antes que quedarme atrapado en la duda o la parálisis por análisis.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "heroe", weight: 2 },
      { archetypeId: "constructor", weight: 1 }
    ],
    scenarioCategory: "Iniciativa Rápida"
  },
  {
    id: 23,
    text: "Siento un llamado constante a viajar, explorar territorios desconocidos o experimentar nuevas formas de vivir.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "explorador", weight: 3 },
      { archetypeId: "bufon", weight: 1 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Búsqueda de Horizontes"
  },
  {
    id: 24,
    text: "Digo lo que pienso con honestidad frontal y desprecio las falsas apariencias o la hipocresía social.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "rebelde", weight: 3 },
      { archetypeId: "guerrero", weight: 2 },
      { archetypeId: "soberano", weight: 1 }
    ],
    scenarioCategory: "Verdad Frontal"
  },
  {
    id: 25,
    text: "Tengo la capacidad física y mental de sostener un esfuerzo prolongado cuando la causa realmente lo amerita.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 3 },
      { archetypeId: "constructor", weight: 2 },
      { archetypeId: "heroe", weight: 1 }
    ],
    scenarioCategory: "Resistencia y Entrega"
  },
  {
    id: 26,
    text: "En momentos de crisis extrema, asumo la defensa de los vulnerables y tomo el liderazgo con coraje.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "heroe", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "cuidador", weight: 1 }
    ],
    scenarioCategory: "Protección Valiente"
  },
  {
    id: 27,
    text: "Me resisto a que me encasillen en roles tradicionales y peleo por forjar mi propio destino sin pedir disculpas.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "rebelde", weight: 3 },
      { archetypeId: "soberano", weight: 2 },
      { archetypeId: "explorador", weight: 1 }
    ],
    scenarioCategory: "Liberación de Moldes"
  },
  {
    id: 28,
    text: "Sé cuándo una batalla ya no tiene sentido y tengo la madurez para retirarme sin que mi orgullo sufra.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "guerrero", weight: 2 },
      { archetypeId: "sabio", weight: 3 },
      { archetypeId: "integrador", weight: 2 }
    ],
    scenarioCategory: "Discernimiento Bélico"
  },
  {
    id: 29,
    text: "Abandono la rutina con facilidad si siento que mi vida se ha vuelto monótona o conformista.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "explorador", weight: 3 },
      { archetypeId: "rebelde", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Ruptura de Rutina"
  },
  {
    id: 30,
    text: "Estoy dispuesto a defender mis principios incluso cuando hacerlo me cueste popularidad o comodidad.",
    dimensionFocus: "accion",
    weights: [
      { archetypeId: "heroe", weight: 3 },
      { archetypeId: "soberano", weight: 2 },
      { archetypeId: "rebelde", weight: 2 }
    ],
    scenarioCategory: "Honor y Principios"
  },

  // ==========================================
  // DIMENSIÓN 3: CORAZÓN & CONEXIÓN (15 Preguntas)
  // (Amante, Cuidador, Bufón, Sanador)
  // ==========================================
  {
    id: 31,
    text: "Me conmueve profundamente la belleza en el arte, la música, la naturaleza y los gestos humanos genuinos.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "mistico", weight: 1 }
    ],
    scenarioCategory: "Sensibilidad Estética"
  },
  {
    id: 32,
    text: "Tengo una habilidad natural para percibir el dolor ajeno y ofrecer una presencia cálida que brinda alivio y consuelo.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "sanador", weight: 3 },
      { archetypeId: "cuidador", weight: 2 },
      { archetypeId: "amante", weight: 1 }
    ],
    scenarioCategory: "Presencia Sanadora"
  },
  {
    id: 33,
    text: "Utilizo el humor y la risa para desarmar tensiones, relativizar los dramas y traer ligereza a quienes me rodean.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "sabio", weight: 1 },
      { archetypeId: "amante", weight: 1 }
    ],
    scenarioCategory: "Humor y Desdramatización"
  },
  {
    id: 34,
    text: "Siento una vocación genuina de servicio desinteresado y me aseguro de que las necesidades básicas de mi grupo estén cubiertas.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "sanador", weight: 1 }
    ],
    scenarioCategory: "Servicio y Apoyo"
  },
  {
    id: 35,
    text: "Valoro la intimidad emocional profunda; no temo mostrar mi vulnerabilidad ni expresar mi afecto con calidez.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "sanador", weight: 2 },
      { archetypeId: "sacerdote", weight: 1 }
    ],
    scenarioCategory: "Vulnerabilidad e Intimidad"
  },
  {
    id: 36,
    text: "Comprendo que las heridas emocionales pueden transformarse en fuentes de sabiduría, perdón y crecimiento humano.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "sanador", weight: 3 },
      { archetypeId: "integrador", weight: 2 },
      { archetypeId: "sabio", weight: 1 }
    ],
    scenarioCategory: "Transformación del Dolor"
  },
  {
    id: 37,
    text: "Me gusta jugar, improvisar y disfrutar del instante presente sin tomarme a mí mismo con demasiada solemnidad.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "explorador", weight: 1 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Juego y Espontaneidad"
  },
  {
    id: 38,
    text: "Sé escuchar con empatía profunda a alguien que sufre sin juzgarlo ni apresurarme a darle consejos no pedidos.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "sanador", weight: 3 },
      { archetypeId: "cuidador", weight: 2 },
      { archetypeId: "sacerdote", weight: 1 }
    ],
    scenarioCategory: "Escucha Compasiva"
  },
  {
    id: 39,
    text: "Busco crear momentos de deleite sensorial, buena comida, celebración y romance con las personas que amo.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "bufon", weight: 1 }
    ],
    scenarioCategory: "Celebración y Sensualidad"
  },
  {
    id: 40,
    text: "Estoy atento a los detalles que hacen la vida más amable y cómoda para los demás, cuidando su bienestar integral.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "sanador", weight: 1 }
    ],
    scenarioCategory: "Cuidado Cotidiano"
  },
  {
    id: 41,
    text: "Soy capaz de reírme de mis propios tropiezos y desdramatizar mis errores con simpatía.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "sabio", weight: 2 },
      { archetypeId: "integrador", weight: 1 }
    ],
    scenarioCategory: "Autoirrisión Sana"
  },
  {
    id: 42,
    text: "Fomento activamente la reconciliación y el perdón en grupos donde ha habido fricciones o rencores.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "sanador", weight: 3 },
      { archetypeId: "integrador", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Reconciliación y Paz"
  },
  {
    id: 43,
    text: "Disfruto enormemente de la pasión en mis proyectos y me entrego en cuerpo y alma a lo que despierta mi deseo.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "amante", weight: 3 },
      { archetypeId: "creador", weight: 2 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Pasión Vital"
  },
  {
    id: 44,
    text: "Me esfuerzo por mantener el equilibrio entre cuidar a los míos y preservar mi propio tiempo de recarga y salud.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "cuidador", weight: 2 },
      { archetypeId: "soberano", weight: 3 },
      { archetypeId: "sanador", weight: 2 }
    ],
    scenarioCategory: "Autocuidado Consciente"
  },
  {
    id: 45,
    text: "Aporto frescura, espontaneidad y un punto de saludable picardía a ambientes que se han vuelto demasiado rígidos.",
    dimensionFocus: "corazon",
    weights: [
      { archetypeId: "bufon", weight: 3 },
      { archetypeId: "rebelde", weight: 2 },
      { archetypeId: "amante", weight: 1 }
    ],
    scenarioCategory: "Frescura y Ruptura"
  },

  // ==========================================
  // DIMENSIÓN 4: CONSTRUCCIÓN & SOBERANÍA (15 Preguntas)
  // (Rey, Padre, Creador, Constructor, Soberano, Integrador)
  // ==========================================
  {
    id: 46,
    text: "Tiendo a asumir la responsabilidad de organizar mi entorno, definir prioridades claras y guiar a otros con calma.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "soberano", weight: 2 },
      { archetypeId: "padre", weight: 1 }
    ],
    scenarioCategory: "Liderazgo Soberano"
  },
  {
    id: 47,
    text: "Me apasiona dar vida a ideas originales y transformar materiales, código o palabras en creaciones palpables y útiles.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "creador", weight: 3 },
      { archetypeId: "constructor", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Creación y Materialización"
  },
  {
    id: 48,
    text: "Me preocupo profundamente por el legado ético y material que dejaré a las nuevas generaciones o a mi comunidad.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "constructor", weight: 1 }
    ],
    scenarioCategory: "Legado y Mentoría"
  },
  {
    id: 49,
    text: "Disfruto diseñar sistemas, procesos ordenados e infraestructuras estables que sigan funcionando a largo plazo.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "constructor", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "mago", weight: 1 }
    ],
    scenarioCategory: "Estructura y Sistemas"
  },
  {
    id: 50,
    text: "Camino erguido con base en mi propio código de honor y no permito que nadie pisotee mi dignidad inalienable.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "soberano", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Dignidad Interior"
  },
  {
    id: 51,
    text: "Busco integrar mis diferentes facetas (lógica y emoción, fuerza y ternura) viviendo desde una madurez psicológica plena.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "integrador", weight: 3 },
      { archetypeId: "sabio", weight: 2 },
      { archetypeId: "sanador", weight: 1 }
    ],
    scenarioCategory: "Totalidad e Integración"
  },
  {
    id: 52,
    text: "Celebro y bendigo genuinamente los éxitos y talentos de las personas que forman parte de mi equipo o familia.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "rey", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "cuidador", weight: 1 }
    ],
    scenarioCategory: "Bendición y Generosidad"
  },
  {
    id: 53,
    text: "Soy metódico con mis finanzas y recursos; construyo cimientos económicos y profesionales sólidos paso a paso.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "constructor", weight: 3 },
      { archetypeId: "padre", weight: 2 },
      { archetypeId: "guerrero", weight: 1 }
    ],
    scenarioCategory: "Solidez Financiera"
  },
  {
    id: 54,
    text: "Siento orgullo de acompañar pacientemente el desarrollo de proyectos o personas desde su semilla hasta su madurez.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "padre", weight: 3 },
      { archetypeId: "cuidador", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Nutrición de Procesos"
  },
  {
    id: 55,
    text: "Combino la visión estética con la destreza técnica para pulir mis obras hasta que alcancen un alto estándar de excelencia.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "creador", weight: 3 },
      { archetypeId: "constructor", weight: 2 },
      { archetypeId: "amante", weight: 1 }
    ],
    scenarioCategory: "Maestría y Diseño"
  },
  {
    id: 56,
    text: "Soy capaz de mantenerme en mi centro y no perder la compostura ni mi autoestima ante el juicio o la crítica externa.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "soberano", weight: 3 },
      { archetypeId: "sabio", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Autodeterminación Serena"
  },
  {
    id: 57,
    text: "En situaciones de polarización o conflicto de partes, actúo como mediador que encuentra síntesis armónicas.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "integrador", weight: 3 },
      { archetypeId: "rey", weight: 2 },
      { archetypeId: "sanador", weight: 1 }
    ],
    scenarioCategory: "Síntesis de Opuestos"
  },
  {
    id: 58,
    text: "Prefiero el pragmatismo que produce resultados duraderos frente a promesas vacías o especulaciones sin respaldo.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "constructor", weight: 3 },
      { archetypeId: "guerrero", weight: 2 },
      { archetypeId: "rey", weight: 1 }
    ],
    scenarioCategory: "Pragmatismo Operativo"
  },
  {
    id: 59,
    text: "Trato a todas las personas con respeto fundamental, sin arrodillarme ante los poderosos ni despreciar a los humildes.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "soberano", weight: 3 },
      { archetypeId: "integrador", weight: 2 },
      { archetypeId: "rebelde", weight: 1 }
    ],
    scenarioCategory: "Igualdad y Nobleza"
  },
  {
    id: 60,
    text: "Vivo mi vida como una obra de arte unificada, donde cada experiencia difícil encuentra su lugar en mi evolución.",
    dimensionFocus: "construccion",
    weights: [
      { archetypeId: "integrador", weight: 3 },
      { archetypeId: "mistico", weight: 2 },
      { archetypeId: "creador", weight: 1 }
    ],
    scenarioCategory: "Alquimia de Vida"
  }
];

// Quick test selection (24 representative questions across all 18 archetypes)
export const QUICK_QUESTION_IDS: number[] = [
  1, 2, 8, 9, 13, // Mente & Trascendencia (Mago, Sabio, Sacerdote, Místico)
  16, 17, 18, 19, 20, 21, // Acción & Coraje (Guerrero, Héroe, Rebelde, Explorador)
  31, 32, 33, 34, 35, 36, // Corazón & Conexión (Amante, Cuidador, Bufón, Sanador)
  46, 47, 48, 49, 50, 51, 57 // Construcción & Soberanía (Rey, Padre, Creador, Constructor, Soberano, Integrador)
];

export interface LikertOption {
  value: number;
  label: string;
  description: string;
  /**
   * La etiqueta que cabe dentro del punto de la escala en una pantalla estrecha.
   * En el movil la escala son cinco circulos, y ahi no entra "Totalmente de
   * acuerdo": entra un caracter.
   */
  short: string;
}

export const LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: 'En total desacuerdo', description: 'Casi nunca resuena conmigo', short: '1' },
  { value: 2, label: 'En desacuerdo', description: 'Rara vez me identifico', short: '2' },
  { value: 3, label: 'Neutral / A veces', description: 'A veces sí, a veces no', short: '3' },
  { value: 4, label: 'De acuerdo', description: 'Habitual en mi comportamiento', short: '4' },
  { value: 5, label: 'Totalmente de acuerdo', description: 'Describe mi forma esencial de ser', short: '5' },
];

