import { Archetype, GenderMode } from '../../types';

export const TRANSFORMATIONAL_ARCHETYPES: Record<'rebelde' | 'sanador' | 'constructor' | 'soberano' | 'mistico' | 'integrador', Archetype> = {
  rebelde: {
    id: 'rebelde',
    name: 'Rebelde',
    universalName: 'Rebelde',
    masculineName: 'El Rebelde',
    feminineName: 'La Rebelde',
    emoji: '🔥',
    dimension: 'accion',
    concepts: ['romper estructuras', 'revolución', 'autenticidad radical', 'disrupción', 'desobediencia lúcida', 'cambio'],
    centralQuestion: '¿Qué estructura obsoleta o expectativa impuesta estoy llamado a romper para liberar la vida?',
    shortDescription: 'La fuerza disruptiva que desafía dogmas caducos, destruye la hipocresía y abre paso a la renovación.',
    fullDescription: 'El arquetipo del Rebelde es el agente de demolición consciente. No destruye por caos nihilista, sino porque reconoce que ciertas leyes y costumbres se han vuelto prisiones para el alma humana.',
    mantra: 'Cuestiono lo establecido y abro paso a la verdad con coraje revolucionario.',
    symbol: 'Antorcha Encendida & Cadenas Rotas',
    colorHex: '#EF4444',
    characterTitle: 'Disrupción & Autenticidad',
    strength: 'Inconformismo lúcido, valentía para decir la verdad prohibida, disrupción innovadora y libertad sin concesiones.',
    shadow: 'Rebelde sin causa / Destructor nihilista / Rebelión infantil por llamar la atención',
    shadowDescription: 'Oponerse a todo por principio sin construir nada mejor o caer en el resentimiento destructivo.',
    shadowAntidote: 'Someter la rebelión al servicio de la justicia y construir alternativas viables.',
    domains: {
      liderazgo: 'Desafía monopolios e inercias organizativas y propone modelos radicalmente nuevos.',
      relaciones: 'Tolerancia cero a la hipocresía, los pactos de silencio y la manipulación.',
      crisis: 'Rompe protocolos inútiles y actúa con audacia revolucionaria para salvar la situación.',
      creatividad: 'Vanguardismo puro: dinamita géneros y crea lenguajes artísticos rompedores.',
      paternidad: 'Enseña a los hijos a pensar por sí mismos y a no obedecer ciegamente la autoridad injusta.',
    },
    balancedBehavior: [
      'Cuestiona las normas injustas con argumentos sólidos.',
      'Sabe cuándo negociar y cuándo romper definitivamente.',
      'Canaliza su rabia en reformas constructivas.',
      'Defiende a los marginados frente al abuso del poder.'
    ],
    unbalancedBehavior: [
      'Llevar la contraria por capricho egoísta.',
      'Destruir relaciones valiosas en arranques de ira.',
      'Incapacidad de convivir en cualquier comunidad o respetar acuerdos.',
      'Cinismo que ridiculiza todo intento de orden o estabilidad.'
    ],
    reflectionQuestions: [
      '¿Qué regla o expectativa ajena estoy acatando que ya no tiene sentido para mí?',
      '¿Mi rebeldía está construyendo algo mejor o solo destruyendo lo existente?',
      '¿Dónde necesito alzar la voz con honestidad frente a una situación injusta?'
    ],
    developmentExercises: [
      {
        title: 'La Ruptura de una Inercia',
        description: 'Rompe deliberadamente una regla social o rutina absurda que te autoimpongas.',
        actionStep: 'Elige tu propia manera de hacer las cosas sin pedir disculpas.'
      }
    ],
    synergies: [
      {
        partnerId: 'constructor',
        title: 'Demolición + Reedificación',
        description: 'El Rebelde derriba lo caduco; el Constructor levanta la nueva estructura sólida sobre los cimientos limpios.',
        synergyKeyword: 'Renovación Estructural'
      }
    ],
    variants: {
      masculine: {
        name: 'El Rebelde',
        characterTitle: 'El Iconoclasta de la Transformación y Ruptura',
        centralQuestion: '¿Qué estructura caduca estás dispuesto a desafiar para abrir un nuevo horizonte?',
        shortDescription: 'Inconformismo constructivo, romper dogmas y coraje transformador.',
        fullDescription: 'El Rebelde masculino desafía el statu quo, la corrupción y las leyes injustas, arriesgando su propia comodidad por un ideal más libre.',
        mantra: 'Rompo las cadenas de la complacencia y abro caminos de libertad.',
        strength: 'Coraje iconoclasta, franqueza tajante y disrupción audaz.',
        shadow: 'Vándalo nihilista / Forajido resentido',
        shadowDescription: 'Destruye por rabia ciega sin ofrecer ninguna solución constructiva.',
        shadowAntidote: 'Alinear la rebeldía con el amor a la verdad y la justicia.',
        domains: {
          liderazgo: 'Innovación disruptiva y liderazgo contra la corriente.',
          relaciones: 'Honestidad frontal y rechazo a las apariencias.',
          crisis: 'Audacia para saltarse procedimientos estériles.',
          creatividad: 'Ruptura de moldes artísticos.',
          paternidad: 'Inculcación de pensamiento crítico e independencia.',
        },
        balancedBehavior: ['Desafía lo injusto', 'Construye alternativas mejores'],
        unbalancedBehavior: ['Rivalidad crónica con la autoridad', 'Autodestrucción'],
        reflectionQuestions: ['¿Qué dogma estoy dispuesto a cuestionar hoy?'],
        developmentExercises: [
          {
            title: 'Cuestionamiento Radical',
            description: 'Escribe un ensayo o reflexión desarmando una creencia limitante que te inculcaron.',
            actionStep: 'Define tu propia postura libre.'
          }
        ]
      },
      feminine: {
        name: 'La Rebelde',
        characterTitle: 'La Soberana de la Desobediencia Lúcida y la Liberación',
        centralQuestion: '¿Qué expectativa de género, rol o mandato familiar ya no estás dispuesta a aceptar?',
        shortDescription: 'Desobediencia lúcida, liberación de roles impuestos y autenticidad radical.',
        fullDescription: 'La Rebelde femenina se niega a ser sumisa, dócil o complaciente. Rompe con los mandatos de sacrificio y reclama su derecho a vivir bajo sus propios términos.',
        mantra: 'No nací para complacer; nací para ser libre y auténtica.',
        strength: 'Desobediencia lúcida, liberación de culpas ancestrales y fuego purificador.',
        shadow: 'Furia amarga / Rechazo a toda forma de vulnerabilidad',
        shadowDescription: 'Guerra constante contra todos los vínculos por miedo a ser dominada.',
        shadowAntidote: 'Saber que la verdadera libertad no teme a la ternura ni a la cooperación.',
        domains: {
          liderazgo: 'Transformación de culturas patriarcales o tóxicas.',
          relaciones: 'Pactos de igualdad y libertad genuina.',
          crisis: 'Decisiones radicales que salvan vidas.',
          creatividad: 'Arte visceral, provocador y emancipador.',
          paternidad: 'Crianza libre de estereotipos limitantes.',
        },
        balancedBehavior: ['Dice su verdad sin rodeos', 'Desmantela la culpa impuesta'],
        unbalancedBehavior: ['Reactividad agresiva', 'Miedo a bajar la guardia'],
        reflectionQuestions: ['¿Qué mandato de sumisión o complacencia sigo obedeciendo por costumbre?'],
        developmentExercises: [
          {
            title: 'Fuego de Liberación',
            description: 'Escribe en un papel una vieja culpa o mandato impuesto y quémalo o rómpelo.',
            actionStep: 'Siente el alivio de la liberación personal.'
          }
        ]
      },
      universal: {
        name: 'Rebelde',
        characterTitle: 'La Fuerza de Renovación y Disrupción',
        centralQuestion: '¿Cómo renuevo lo que se ha vuelto rígido?',
        shortDescription: 'Disrupción consciente, autenticidad y cambio necesario.',
        fullDescription: 'El principio evolutivo que rompe la inercia para que la vida continúe.',
        mantra: 'La evolución exige valentía para cambiar.',
        strength: 'Valentía y autenticidad.',
        shadow: 'Caos sin rumbo.',
        shadowDescription: 'Destrucción innecesaria.',
        shadowAntidote: 'Propósito constructivo.',
        domains: {
          liderazgo: 'Disrupción e innovación.',
          relaciones: 'Transparencia total.',
          crisis: 'Salida de esquemas rígidos.',
          creatividad: 'Vanguardismo.',
          paternidad: 'Fomento de la libertad.',
        },
        balancedBehavior: ['Cambio consciente'],
        unbalancedBehavior: ['Conflicto innecesario'],
        reflectionQuestions: ['¿Qué cambio urgente necesita mi vida?'],
        developmentExercises: [
          {
            title: 'Gesto de Cambio',
            description: 'Cambia un hábito negativo por una práctica saludable.',
            actionStep: 'Empieza hoy.'
          }
        ]
      }
    }
  },

  sanador: {
    id: 'sanador',
    name: 'Sanador / Sanadora',
    universalName: 'Sanador / Sanadora',
    masculineName: 'El Sanador',
    feminineName: 'La Sanadora',
    emoji: '🌿',
    dimension: 'corazon',
    concepts: ['integración', 'reparación', 'transformación del dolor', 'escucha profunda', 'presencia restauradora', 'alivio'],
    centralQuestion: '¿Cómo transformo el dolor y las heridas en fuentes vivas de sabiduría y salud integral?',
    shortDescription: 'La capacidad de restaurar el equilibrio, acompañar en el sufrimiento y transmutar la herida en medicina.',
    fullDescription: 'El Sanador / Sanadora comprende que las heridas no son fallos, sino portales de maduración. Acompaña los procesos de reparación física, emocional y relacional con paciencia y presencia.',
    mantra: 'Acepto mis heridas, permito su sanación y ofrezco presencia reparadora.',
    symbol: 'Caduceo de la Salud & Manantial de Agua Pura',
    colorHex: '#10B981',
    characterTitle: 'Reparación & Sanación',
    strength: 'Presencia restauradora, escucha compasiva, conocimiento del cuerpo y transmutación del sufrimiento.',
    shadow: 'Sanador herido no resuelto / Charlatán milagroso / Adicto a las heridas ajenas',
    shadowDescription: 'Pretender sanar a todos para no mirar la propia herida abierta o alimentar el sufrimiento para sentirse necesitado.',
    shadowAntidote: 'Trabajar primero en la propia integración personal y respetar los tiempos de maduración de cada ser.',
    domains: {
      liderazgo: 'Restaura la confianza tras crisis organizativas o despidos dolorosos.',
      relaciones: 'Sana malentendidos, repara vínculos dañados y promueve el perdón.',
      crisis: 'Ofrece calma inmediata, primeros auxilios emocionales y serenidad.',
      creatividad: 'Obras de arte profundamente terapéuticas y catárticas.',
      paternidad: 'Atención amorosa a los miedos, la salud y la integración emocional de los hijos.',
    },
    balancedBehavior: [
      'Acompaña sin intentar forzar soluciones prematuras.',
      'Cuida su propia energía y límites energéticos.',
      'Honra el dolor como parte del crecimiento.',
      'Inspira esperanza y confianza en la recuperación.'
    ],
    unbalancedBehavior: [
      'Dar consejos no solicitados continuamente.',
      'Creerse con poderes mágicos sobre la vida ajena.',
      'Negar la propia enfermedad o dolor por mantener el rol de sanador.',
      'Incapacidad de tolerar que otros pasen por su propio proceso doloroso.'
    ],
    reflectionQuestions: [
      '¿Qué herida personal sigue esperando mi atención y perdón?',
      '¿Estoy intentando arreglar la vida de los demás para evitar hacerme cargo de la mía?',
      '¿Cómo puedo traer mayor calma y descanso a mi cuerpo hoy?'
    ],
    developmentExercises: [
      {
        title: 'El Ritual del Perdón Interior',
        description: 'Escribe una carta de perdón a ti mismo por un error del pasado, reconociendo tu inocencia básica.',
        actionStep: 'Léela en voz alta y siéntete liberado de esa carga.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Sanación + Defensa',
        description: 'El Sanador repara las heridas del alma; el Guerrero defiende el espacio para que la sanación ocurra sin nuevas agresiones.',
        synergyKeyword: 'Fortaleza Restaurada'
      }
    ],
    variants: {
      masculine: {
        name: 'El Sanador',
        characterTitle: 'El Custodio de la Integración y la Reconstrucción',
        centralQuestion: '¿Cómo transformo mis cicatrices en fortaleza y acompaño a otros en su reconstrucción?',
        shortDescription: 'Acompañamiento, integración, comprensión del dolor y reconstrucción.',
        fullDescription: 'El Sanador masculino ha conocido la caída y el dolor, y desde esa experiencia forja una presencia serena que ayuda a reconstruir vidas y vínculos rotos.',
        mantra: 'Mis cicatrices son mi sabiduría; ofrezco mi presencia firme para reparar.',
        strength: 'Presencia serena, escucha profunda sin juicio y temple reparador.',
        shadow: 'Salvador desgastado / Hombre que oculta sus heridas',
        shadowDescription: 'Finge estar intacto para sostener a otros hasta colapsar en silencio.',
        shadowAntidote: 'Mostrar su vulnerabilidad y aceptar ser acompañado.',
        domains: {
          liderazgo: 'Cuidado del bienestar emocional del equipo.',
          relaciones: 'Espacio de confianza absoluta y lealtad.',
          crisis: 'Estabilidad y acompañamiento en el duelo.',
          creatividad: 'Obras de reconstrucción moral.',
          paternidad: 'Escucha atenta y apoyo en momentos de duda o caída.',
        },
        balancedBehavior: ['Acompaña con serenidad', 'Reconoce sus límites'],
        unbalancedBehavior: ['Aislamiento con el dolor propio', 'Complejo de salvador'],
        reflectionQuestions: ['¿Qué dolor estoy ocultando para que otros no se preocupen?'],
        developmentExercises: [
          {
            title: 'Espacio de Escucha Pura',
            description: 'Escucha a alguien durante 15 minutos sin interrumpir ni darle consejos.',
            actionStep: 'Solo brinda tu presencia y empatía sincera.'
          }
        ]
      },
      feminine: {
        name: 'La Sanadora',
        characterTitle: 'La Curandera del Alma y los Vínculos',
        centralQuestion: '¿Cómo tejo la reconciliación y restauro la vitalidad de mi cuerpo y mis relaciones?',
        shortDescription: 'Cuidado, integración, reparación, transformación emocional y presencia restauradora.',
        fullDescription: 'La Sanadora femenina comprende los ritmos del cuerpo, el poder de las palabras tiernas y la medicina de la reconciliación consigo misma y con los demás.',
        mantra: 'Abrazo el dolor con ternura y lo transformo en medicina viva.',
        strength: 'Intuición curativa, empatía profunda, suavidad reconfortante y perdón.',
        shadow: 'Esponja emocional tóxica / Mártir sanadora',
        shadowDescription: 'Absorbe el dolor ajeno hasta enfermarse o cree que su deber es soportar abusos para "sanar" al otro.',
        shadowAntidote: 'Proteger su campo energético y recordar que cada persona debe asumir su propia sanación.',
        domains: {
          liderazgo: 'Resolución de conflictos y facilitación de climas armónicos.',
          relaciones: 'Reconciliación, escucha profunda y calidez sanadora.',
          crisis: 'Alivio del sufrimiento y paz restauradora.',
          creatividad: 'Arte medicina y expresión catártica.',
          paternidad: 'Nutrición del alma infantil y sanación del dolor emocional.',
        },
        balancedBehavior: ['Pone límites a la toxicidad', 'Sana desde el amor propio'],
        unbalancedBehavior: ['Cargar con dolores ajenos', 'Desgaste por sobreempatía'],
        reflectionQuestions: ['¿Qué dolor ajeno estoy cargando en mi cuerpo?'],
        developmentExercises: [
          {
            title: 'Limpieza y Restauración',
            description: 'Toma un baño consciente o paseo por la naturaleza soltando las cargas de otros.',
            actionStep: 'Respira profundo y recupera tu centro.'
          }
        ]
      },
      universal: {
        name: 'Sanador / Sanadora',
        characterTitle: 'El Principio de Restauración y Salud',
        centralQuestion: '¿Cómo cultivo salud y armonía en mi vida?',
        shortDescription: 'Sanación, equilibrio y transformación del dolor.',
        fullDescription: 'La fuerza intrínseca de la vida para regenerarse y encontrar el equilibrio.',
        mantra: 'La vida en mí se restaura y renueva.',
        strength: 'Regeneración y compasión.',
        shadow: 'Negación del dolor o victimismo.',
        shadowDescription: 'Estancamiento en la queja.',
        shadowAntidote: 'Aceptación y cuidado activo.',
        domains: {
          liderazgo: 'Clima saludable.',
          relaciones: 'Perdón y comprensión.',
          crisis: 'Recuperación.',
          creatividad: 'Arte sanador.',
          paternidad: 'Cuidado amoroso.',
        },
        balancedBehavior: ['Regeneración y presencia'],
        unbalancedBehavior: ['Descuido de la salud'],
        reflectionQuestions: ['¿Cómo cuido mi energía hoy?'],
        developmentExercises: [
          {
            title: 'Descanso Reparador',
            description: 'Acuéstate 30 minutos antes para permitir que tu cuerpo descanse.',
            actionStep: 'Hazlo esta noche.'
          }
        ]
      }
    }
  },

  constructor: {
    id: 'constructor',
    name: 'Constructor / Constructora',
    universalName: 'Constructor / Constructora',
    masculineName: 'El Constructor',
    feminineName: 'La Constructora',
    emoji: '🏛️',
    dimension: 'construccion',
    concepts: ['materialización', 'estabilidad', 'sistemas sostenibles', 'infraestructura', 'organización', 'perseverancia'],
    centralQuestion: '¿Cómo creo estructuras, sistemas y cimientos sólidos que resistan el paso del tiempo?',
    shortDescription: 'El maestro de la materialización pragmática, la estabilidad, los procesos eficientes y las obras duraderas.',
    fullDescription: 'El Constructor / Constructora aterriza las visiones en la tierra. Calcula presupuestos, levanta muros firmes, diseña procesos sostenibles y se asegura de que todo funcione con precisión.',
    mantra: 'Construyo con paciencia, solidez y visión de futuro.',
    symbol: 'Escuadra & Piedra Angular',
    colorHex: '#D6A84F',
    characterTitle: 'Estructura & Sistemas',
    strength: 'Pragmatismo, capacidad organizativa, perseverancia metódica y construcción de patrimonio sostenible.',
    shadow: 'Burocrático rígido / Materialista obsesivo / Esclavo de la rutina',
    shadowDescription: 'Quedarse atrapado en procesos mecánicos sin alma o resistirse a cualquier cambio por miedo a desestabilizar la estructura.',
    shadowAntidote: 'Convocar al Mago para innovar y al Amante para recordar que las estructuras están al servicio de las personas.',
    domains: {
      liderazgo: 'Diseña operaciones impecables, administra recursos con prudencia y garantiza la continuidad.',
      relaciones: 'Aporta seguridad material, estabilidad doméstica y cumplimiento riguroso de acuerdos.',
      crisis: 'Evalúa los daños con objetividad y organiza la reconstrucción paso a paso.',
      creatividad: 'Especialista en arquitectura, ingeniería, desarrollo de software o gestión de proyectos.',
      paternidad: 'Enseña hábitos de ahorro, orden, perseverancia y responsabilidad práctica.',
    },
    balancedBehavior: [
      'Edifica paso a paso sin desesperarse por los resultados inmediatos.',
      'Optimiza los recursos para evitar el despilfarro.',
      'Crea sistemas que funcionan de forma autónoma.',
      'Combina solidez estructural con flexibilidad ante mejoras.'
    ],
    unbalancedBehavior: [
      'Inflexibilidad ante cualquier cambio imprevisto.',
      'Medir el valor de la vida exclusivamente en logros materiales o dinero.',
      'Microgestión obsesiva de cada detalle operativo.',
      'Miedo paralizante a salir de la zona de confort estructurada.'
    ],
    reflectionQuestions: [
      '¿Qué proyecto o sistema en mi vida necesita mejores cimientos y orden?',
      '¿Estoy construyendo para servir a un propósito vital o por miedo a la incertidumbre?',
      '¿Dónde necesito flexibilizar mis rutinas para permitir que entre aire fresco?'
    ],
    developmentExercises: [
      {
        title: 'La Auditoría de Cimientos',
        description: 'Revisa un área desorganizada de tu economía o trabajo y diseña un sistema simple de 3 pasos para mantenerla ordenada.',
        actionStep: 'Implementa el nuevo proceso hoy mismo.'
      }
    ],
    synergies: [
      {
        partnerId: 'creador',
        title: 'Diseño + Edificación',
        description: 'El Creador concibe la idea genial; el Constructor la convierte en un edificio o producto viable y rentable.',
        synergyKeyword: 'Materialización Exitosa'
      }
    ],
    variants: {
      masculine: {
        name: 'El Constructor',
        characterTitle: 'El Forjador de Infraestructuras y Estabilidad',
        centralQuestion: '¿Cómo hago que las cosas funcionen de forma impecable, sólida y duradera?',
        shortDescription: '"Haz que funcione." Estructura, estabilidad, patrimonio y organización.',
        fullDescription: 'El Constructor masculino asume la ingeniería práctica de la vida. Se asegura de que haya cimientos firmes, techos seguros y recursos suficientes para sostener a los suyos.',
        mantra: 'Trabajo con método y forjo realidades que perduran en el tiempo.',
        strength: 'Pragmatismo, fiabilidad, destreza técnica y perseverancia.',
        shadow: 'Hombre máquina / Esclavo del trabajo',
        shadowDescription: 'Se olvida de sentir y vivir, atrapado en el deber y la acumulación material.',
        shadowAntidote: 'Aprender a descansar y disfrutar de los frutos de su labor.',
        domains: {
          liderazgo: 'Gestión operativa, logística y administración eficaz.',
          relaciones: 'Compromiso firme y estabilidad práctica.',
          crisis: 'Reconstrucción metódica y control de daños.',
          creatividad: 'Ingeniería, construcción y sistemas.',
          paternidad: 'Enseñanza del valor del trabajo y el orden.',
        },
        balancedBehavior: ['Cumple lo prometido', 'Edifica con visión de futuro'],
        unbalancedBehavior: ['Rigidez mental', 'Trabajolismo compulsivo'],
        reflectionQuestions: ['¿Estoy dedicando tiempo a vivir o solo a construir?'],
        developmentExercises: [
          {
            title: 'Cierre del Día Laboral',
            description: 'Fija una hora exacta para desconectar del trabajo y respétala sin revisar correos.',
            actionStep: 'Dedica la noche al descanso o la familia.'
          }
        ]
      },
      feminine: {
        name: 'La Constructora',
        characterTitle: 'La Arquitecta de Proyectos Sostenibles y Hogares Fuertes',
        centralQuestion: '¿Cómo convierto mi visión en una realidad sostenible, rentable y llena de vida?',
        shortDescription: 'Convierte tu visión en una realidad sostenible. Solidez, proyectos duraderos y bases firmes.',
        fullDescription: 'La Constructora femenina organiza empresas, comunidades y proyectos con visión estratégica y cuidado del largo plazo, tejiendo solidez económica con calidez humana.',
        mantra: 'Doy forma concreta y sostenible a mis proyectos más nobles.',
        strength: 'Visión estratégica, administración impecable y edificación de proyectos duraderos.',
        shadow: 'Controladora exhausta / Miedo a perder la seguridad',
        shadowDescription: 'Se sobrecarga intentando controlar todas las variables materiales por desconfianza.',
        shadowAntidote: 'Confiar en el equipo y delegar con tranquilidad.',
        domains: {
          liderazgo: 'Dirección de proyectos sostenibles y organizaciones sólidas.',
          relaciones: 'Creación de un hogar seguro y relaciones estables.',
          crisis: 'Pragmatismo y reorganización eficaz.',
          creatividad: 'Materialización de ideas innovadoras.',
          paternidad: 'Educación en autonomía, orden y visión práctica.',
        },
        balancedBehavior: ['Crea proyectos prósperos', 'Combina firmeza y empatía'],
        unbalancedBehavior: ['Inseguridad material', 'Inflexibilidad ante los cambios'],
        reflectionQuestions: ['¿Qué estructura de mi vida necesita ser reforzada para resistir el crecimiento?'],
        developmentExercises: [
          {
            title: 'Plan de Sostenibilidad',
            description: 'Diseña el plan de acción a 6 meses de tu proyecto prioritario con fechas y recursos.',
            actionStep: 'Pon la primera piedra hoy.'
          }
        ]
      },
      universal: {
        name: 'Constructor / Constructora',
        characterTitle: 'El Principio de Estabilidad y Manifestación',
        centralQuestion: '¿Cómo edifico un futuro seguro y sostenible?',
        shortDescription: 'Organización, pragmatismo y materialización.',
        fullDescription: 'La capacidad humana para levantar civilización, tecnología e instituciones duraderas.',
        mantra: 'Pongo bases firmes a mis sueños.',
        strength: 'Pragmatismo y perseverancia.',
        shadow: 'Materialismo o rigidez.',
        shadowDescription: 'Pérdida de flexibilidad o sentido humano.',
        shadowAntidote: 'Propósito ético en la construcción.',
        domains: {
          liderazgo: 'Gestión eficiente.',
          relaciones: 'Estabilidad y lealtad.',
          crisis: 'Reconstrucción.',
          creatividad: 'Realización práctica.',
          paternidad: 'Educación en la constancia.',
        },
        balancedBehavior: ['Organización y solidez'],
        unbalancedBehavior: ['Inflexibilidad'],
        reflectionQuestions: ['¿Qué voy a construir con orden hoy?'],
        developmentExercises: [
          {
            title: 'Orden Operativo',
            description: 'Organiza tu espacio de trabajo.',
            actionStep: 'Déjalo impecable.'
          }
        ]
      }
    }
  },

  soberano: {
    id: 'soberano',
    name: 'Soberano / Soberana',
    universalName: 'Soberano / Soberana',
    masculineName: 'El Soberano',
    feminineName: 'La Soberana',
    emoji: '👑',
    dimension: 'construccion',
    concepts: ['autonomía interior', 'dignidad', 'autodeterminación', 'autoridad propia', 'centro inalienable', 'código de honor'],
    centralQuestion: '¿Cómo habito mi autoridad propia y gobierno mi vida desde mi propio centro?',
    shortDescription: 'La soberanía interior inalienable, la dignidad incorruptible y la lealtad al propio código ético.',
    fullDescription: 'El Soberano / Soberana no necesita gobernar sobre otros; su trono es su propia consciencia. Emana una dignidad natural que nadie puede arrebatarle.',
    mantra: 'Soy dueño de mi destino y habito mi dignidad con firmeza y serenidad.',
    symbol: 'Sello Real & Trono Interior',
    colorHex: '#D6A84F',
    characterTitle: 'Autonomía Interior & Dignidad',
    strength: 'Autodeterminación inquebrantable, dignidad moral, respeto por uno mismo y gobierno del propio destino.',
    shadow: 'Arrogancia aislada / Soberbia aristocrática / Desprecio hacia los demás',
    shadowDescription: 'Creerse por encima de las normas comunes o aislarse en una torre de marfil por desdén hacia el mundo terrenal.',
    shadowAntidote: 'Comprender que la verdadera nobleza se demuestra en la humildad y la cercanía con todos los seres.',
    domains: {
      liderazgo: 'Emana una autoridad natural y serena que inspira respeto sin necesidad de alzar la voz.',
      relaciones: 'Vínculos basados en el respeto mutuo incondicional; no tolera manipulaciones ni sumisiones.',
      crisis: 'Mantiene la compostura y la dignidad intactas incluso en la peor derrota material.',
      creatividad: 'Obras con sello de distinción, elegancia y profundidad ética.',
      paternidad: 'Enseña a los hijos a no arrodillarse ante tiranías y a cultivar su autoestima profunda.',
    },
    balancedBehavior: [
      'Actúa de acuerdo con su propio código ético sin ceder a presiones.',
      'Trata a reyes y mendigos con el mismo respeto fundamental.',
      'Sabe retirarse de lugares donde no se respeta su dignidad.',
      'No necesita humillar a nadie para reafirmar su valor.'
    ],
    unbalancedBehavior: [
      'Tratar a los demás como inferiores o súbditos.',
      'Incapacidad de pedir disculpas o reconocer errores por orgullo.',
      'Aislamiento aristocrático que teme mancharse con la realidad.',
      'Resentimiento desmedido ante cualquier falta de protocolo.'
    ],
    reflectionQuestions: [
      '¿En qué situación estoy permitiendo que otros decidan sobre mi dignidad o mis valores?',
      '¿Estoy actuando desde la nobleza y el honor o desde el orgullo herido?',
      '¿Cómo puedo honrar mi propio valor sin caer en la soberbia?'
    ],
    developmentExercises: [
      {
        title: 'El Código de Honor Personal',
        description: 'Escribe tus 5 principios morales no negociables que guiarán tus decisiones este año.',
        actionStep: 'Léelos y comprométete a no traicionarlos bajo ninguna circunstancia.'
      }
    ],
    synergies: [
      {
        partnerId: 'sanador',
        title: 'Dignidad + Humildad',
        description: 'El Soberano aporta la dignidad inalienable; el Sanador aporta la compasión y cercanía humana.',
        synergyKeyword: 'Nobleza Humana'
      }
    ],
    variants: {
      masculine: {
        name: 'El Soberano',
        characterTitle: 'El Señor del Gobierno Interior y el Honor',
        centralQuestion: '¿Cómo gobierno mi vida según mi propio código de honor y dignidad inquebrantable?',
        shortDescription: 'Gobierno interior, dignidad inquebrantable y alineación con el propio código de honor.',
        fullDescription: 'El Soberano masculino camina erguido por la vida, guiado por su brújula moral interna y asumiendo las consecuencias de cada uno de sus actos.',
        mantra: 'Camino con dignidad, honro mi palabra y soy dueño de mi destino.',
        strength: 'Carácter firme, dignidad incorruptible, rectitud y templanza.',
        shadow: 'Orgullo herido / Monarca despótico',
        shadowDescription: 'Prefiere perderlo todo antes que ceder por orgullo o trata a los demás con altanería.',
        shadowAntidote: 'Aprender la virtud de la nobleza generosa y la disculpa sincera.',
        domains: {
          liderazgo: 'Liderazgo moral incuestionable.',
          relaciones: 'Lealtad y respeto mutuo.',
          crisis: 'Entereza heroica y calma.',
          creatividad: 'Obras de peso y distinción.',
          paternidad: 'Transmisión de honor y rectitud.',
        },
        balancedBehavior: ['Mantiene su palabra', 'Actúa con templanza'],
        unbalancedBehavior: ['Soberbia', 'Rigidez de orgullo'],
        reflectionQuestions: ['¿Dónde estoy confundiendo dignidad con orgullo ciego?'],
        developmentExercises: [
          {
            title: 'Acto de Nobleza',
            description: 'Pide disculpas a alguien con quien hayas sido injusto o cortante.',
            actionStep: 'Hazlo con total sinceridad y sencillez.'
          }
        ]
      },
      feminine: {
        name: 'La Soberana',
        characterTitle: 'La Dueña de su Propio Destino y Dignidad',
        centralQuestion: '¿Cómo me adueño de mi vida y habito mi centro inalienable sin pedir permiso a nadie?',
        shortDescription: 'Autodeterminación, dueña de su propio destino, dignidad y centro interior inalienable.',
        fullDescription: 'La Soberana femenina no busca el poder para dominar, sino para ser dueña absoluta de su cuerpo, su mente, sus decisiones y su destino.',
        mantra: 'Soy la dueña indiscutible de mi propia vida y habito mi trono interior.',
        strength: 'Autonomía radical, elegancia interior, firmeza serena y dignidad.',
        shadow: 'Reina del hielo / Aislamiento defensivo',
        shadowDescription: 'Se vuelve inaccesible o fría por miedo a que invadan su espacio vital.',
        shadowAntidote: 'Saber que la verdadera soberana puede ser cálida y accesible sin perder un ápice de su dignidad.',
        domains: {
          liderazgo: 'Liderazgo visionario e independiente.',
          relaciones: 'Vínculos de reciprocidad digna.',
          crisis: 'Solidez inquebrantable ante la tormenta.',
          creatividad: 'Creaciones con personalidad magnética.',
          paternidad: 'Enseñanza del respeto propio y la autodeterminación.',
        },
        balancedBehavior: ['Se respeta a sí misma', 'No permite abusos ni humillaciones'],
        unbalancedBehavior: ['Frialdad extrema', 'Aislamiento en su trono'],
        reflectionQuestions: ['¿Qué área de mi vida aún no he reclamado como territorio propio?'],
        developmentExercises: [
          {
            title: 'Reclamar el Espacio Sagrado',
            description: 'Delimita un espacio físico o momento en tu agenda que sea 100% tu territorio inviolable.',
            actionStep: 'Hazlo respetar con serenidad.'
          }
        ]
      },
      universal: {
        name: 'Soberano / Soberana',
        characterTitle: 'La Autonomía y Dignidad del Ser',
        centralQuestion: '¿Cómo vivo con dignidad y honor?',
        shortDescription: 'Autodeterminación, dignidad y autoridad interior.',
        fullDescription: 'El principio de soberanía del ser humano sobre su propia consciencia.',
        mantra: 'Habito mi dignidad con respeto por todos los seres.',
        strength: 'Dignidad y autonomía.',
        shadow: 'Soberbia o servidumbre.',
        shadowDescription: 'Abuso de orgullo o pérdida de dignidad.',
        shadowAntidote: 'Humildad y nobleza.',
        domains: {
          liderazgo: 'Autoridad moral.',
          relaciones: 'Respeto recíproco.',
          crisis: 'Templanza.',
          creatividad: 'Nobleza formal.',
          paternidad: 'Autoestima sólida.',
        },
        balancedBehavior: ['Dignidad y respeto'],
        unbalancedBehavior: ['Altivez'],
        reflectionQuestions: ['¿Cómo honro mi dignidad hoy?'],
        developmentExercises: [
          {
            title: 'Postura de Soberanía',
            description: 'Camina erguido con consciencia durante tu trayecto.',
            actionStep: 'Siente tu dignidad corporal.'
          }
        ]
      }
    }
  },

  mistico: {
    id: 'mistico',
    name: 'Místico / Mística',
    universalName: 'Místico / Mística',
    masculineName: 'El Místico',
    feminineName: 'La Mística',
    emoji: '🌌',
    dimension: 'mente',
    concepts: ['significado profundo', 'trascendencia', 'contemplación', 'unidad cósmica', 'silencio sagrado', 'misterio de la vida'],
    centralQuestion: '¿Qué verdad y significado trascendente late detrás de la existencia y en el silencio?',
    shortDescription: 'La búsqueda de la unidad cósmica, el sentido existencial profundo y la comunión con el misterio de la vida.',
    fullDescription: 'El Místico / Mística experimenta la interconexión de todo lo vivo. Disuelve la ilusión de separación entre el yo y el cosmos, encontrando paz en la contemplación de lo infinito.',
    mantra: 'Me abro a la inmensidad del cosmos y reconozco la unidad en todo lo vivo.',
    symbol: 'Espiral Galáctica & Gota en el Océano',
    colorHex: '#3B82F6',
    characterTitle: 'Trascendencia & Misterio',
    strength: 'Consciencia de unidad, paz interior profunda, visión trascendente y serenidad existencial.',
    shadow: 'Evasión espiritual / Nihilismo cósmico / Desconexión del cuerpo y la tierra',
    shadowDescription: 'Usar la meditación o el misticismo para escapar de las responsabilidades materiales o despreciar la vida cotidiana como "mera ilusión".',
    shadowAntidote: 'Descubrir lo infinito en lo cotidiano: fregar los platos y cuidar el cuerpo con la misma reverencia mística.',
    domains: {
      liderazgo: 'Alinea la organización con el respeto ecológico y el bienestar planetario.',
      relaciones: 'Amor incondicional que ve la chispa divina en cada ser humano.',
      crisis: 'Ofrece una perspectiva cósmica que disuelve el pánico ante la pérdida o la muerte.',
      creatividad: 'Obras de arte contemplativo, poesía mística y música trascendental.',
      paternidad: 'Enseña la reverencia por la naturaleza, el cielo nocturno y el misterio de la vida.',
    },
    balancedBehavior: [
      'Vive con paz interior en medio del ajetreo del mundo.',
      'Respeta todas las formas de vida con reverencia.',
      'Integra la contemplación con actos prácticos de bondad.',
      'Acepta el fluir de la vida sin apego obsesivo.'
    ],
    unbalancedBehavior: [
      'Desconectar totalmente de las finanzas o la salud física.',
      'Superioridad espiritual que juzga a los demás como "no despiertos".',
      'Pasividad extrema ante injusticias terrenales.',
      'Fascinación morbosa por disolverse y huir del mundo.'
    ],
    reflectionQuestions: [
      '¿Qué significado trascendente tiene mi vida en este momento?',
      '¿Estoy usando la espiritualidad para amar más el mundo o para huir de mis problemas?',
      '¿Cómo puedo honrar el silencio y la inmensidad en mi rutina de hoy?'
    ],
    developmentExercises: [
      {
        title: 'La Contemplación del Cielo Nocturno',
        description: 'Pasa 20 minutos observando las estrellas o el cielo sin teléfono, sintiendo tu lugar en el cosmos.',
        actionStep: 'Respira la inmensidad y siente la paz de la pertenencia cósmica.'
      }
    ],
    synergies: [
      {
        partnerId: 'constructor',
        title: 'Cosmos + Tierra',
        description: 'El Místico contempla lo infinito; el Constructor enraíza esa visión en estructuras útiles y tangibles.',
        synergyKeyword: 'Mística Encarnada'
      }
    ],
    variants: {
      masculine: {
        name: 'El Místico',
        characterTitle: 'El Peregrino del Significado y la Trascendencia',
        centralQuestion: '¿Qué significado existencial profundo tiene para ti estar vivo y cómo te conectas con el todo?',
        shortDescription: 'Búsqueda existencial, contemplación del cosmos y profundidad filosófica.',
        fullDescription: 'El Místico masculino busca comprender el enigma del ser humano frente al universo, buscando la armonía entre su mente finita y el orden cósmico.',
        mantra: 'Busco la verdad más allá de las apariencias y vivo en sintonía con el cosmos.',
        strength: 'Profundidad existencial, visión panorámica y serenidad filosófica.',
        shadow: 'Ermitaño desconectado / Soñador inútil',
        shadowDescription: 'Se pierde en meditaciones abstractas descuidando a su familia y sus deberes terrenales.',
        shadowAntidote: 'Hacer de la vida cotidiana su monasterio.',
        domains: {
          liderazgo: 'Visión ética trascendente e impacto a largo plazo.',
          relaciones: 'Vínculos de comunión de alma a alma.',
          crisis: 'Serenidad absoluta frente a lo inevitable.',
          creatividad: 'Filosofía, poesía profunda y astronomía.',
          paternidad: 'Transmisión de reverencia y amor por el saber.',
        },
        balancedBehavior: ['Vive con serenidad', 'Actúa con ética universal'],
        unbalancedBehavior: ['Desconexión práctica', 'Evasión espiritual'],
        reflectionQuestions: ['¿Cómo traduzco mi búsqueda interior en actos de bondad concreta?'],
        developmentExercises: [
          {
            title: 'Meditación Caminando',
            description: 'Camina 20 minutos prestando atención a cada paso y al entorno con asombro.',
            actionStep: 'Siente la conexión con la tierra.'
          }
        ]
      },
      feminine: {
        name: 'La Mística',
        characterTitle: 'La Sabia del Silencio Sagrado y los Ciclos de la Vida',
        centralQuestion: '¿Qué verdad sagrada late en tu silencio y cómo te sintonizas con los ritmos de la naturaleza?',
        shortDescription: 'Conexión con los ciclos de la vida, sabiduría intuitiva, trascendencia y silencio.',
        fullDescription: 'La Mística femenina siente la vida como una danza sagrada de nacimientos, muertes y renacimientos. Escucha el palpitar de la tierra y comulga con el misterio del amor universal.',
        mantra: 'En mi silencio habita lo sagrado y danzo con los ciclos de la vida.',
        strength: 'Comunión con la naturaleza, sabiduría intuitiva profunda y presencia trascendental.',
        shadow: 'Flotando fuera de la realidad / Vulnerable a manipulaciones espirituales',
        shadowDescription: 'Pierde el arraigo corporal o se vuelve crédula ante falsos gurús.',
        shadowAntidote: 'Enraizarse firmemente en el cuerpo, la tierra y el sentido común.',
        domains: {
          liderazgo: 'Integración de valores ecológicos y armonía comunitaria.',
          relaciones: 'Amor incondicional y presencia compasiva.',
          crisis: 'Paz inmutable en la tormenta.',
          creatividad: 'Música sagrada, poesía y arte ritual.',
          paternidad: 'Educación en el asombro y la gratitud por la vida.',
        },
        balancedBehavior: ['Honra los ciclos naturales', 'Irradia paz profunda'],
        unbalancedBehavior: ['Falta de límites prácticos', 'Desarraigo material'],
        reflectionQuestions: ['¿En qué momento de mi día me permito entrar en el silencio fértil?'],
        developmentExercises: [
          {
            title: 'Comunión con la Naturaleza',
            description: 'Toca la tierra, un árbol o una planta con plena consciencia de su vida.',
            actionStep: 'Agradece la vida compartida en este planeta.'
          }
        ]
      },
      universal: {
        name: 'Místico / Mística',
        characterTitle: 'La Consciencia de Unidad',
        centralQuestion: '¿Cómo experimento la interconexión de la vida?',
        shortDescription: 'Trascendencia, silencio y sentido de unidad.',
        fullDescription: 'La experiencia humana de asombro y pertenencia ante el misterio del universo.',
        mantra: 'Soy uno con la vida y la vida es una conmigo.',
        strength: 'Paz interior y trascendencia.',
        shadow: 'Evasión terrenal.',
        shadowDescription: 'Descuido de la vida práctica.',
        shadowAntidote: 'Mística encarnada.',
        domains: {
          liderazgo: 'Visión ecológica.',
          relaciones: 'Compasión universal.',
          crisis: 'Serenidad profunda.',
          creatividad: 'Belleza trascendente.',
          paternidad: 'Reverencia por la vida.',
        },
        balancedBehavior: ['Serenidad y gratitud'],
        unbalancedBehavior: ['Desconexión'],
        reflectionQuestions: ['¿Dónde encuentro paz hoy?'],
        developmentExercises: [
          {
            title: 'Momento de Gratitud Cósmica',
            description: 'Agradece el simple hecho de respirar y existir.',
            actionStep: 'Hazlo hoy.'
          }
        ]
      }
    }
  },

  integrador: {
    id: 'integrador',
    name: 'Integrador / Integradora',
    universalName: 'Integrador / Integradora',
    masculineName: 'El Integrador',
    feminineName: 'La Integradora',
    emoji: '🌀',
    dimension: 'construccion',
    concepts: ['totalidad', 'integración de polaridades', 'madurez psicológica', 'alquimia interior', 'síntesis', 'armonía de opuestos'],
    centralQuestion: '¿Cómo tejo todas mis facetas, luces y sombras en una sola fuerza armónica y plena?',
    shortDescription: 'La maestría de sintetizar opuestos, madurar la psique y vivir desde la totalidad consciente.',
    fullDescription: 'El Integrador / Integradora representa la culminación del viaje arquetípico: la capacidad de no vivir fragmentado. Une la espada del Guerrero con la ternura del Amante, la razón del Sabio con la risa del Bufón.',
    mantra: 'Integro todas mis facetas en una sola presencia armónica y madura.',
    symbol: 'Ouroboros & Mandála de la Totalidad',
    colorHex: '#D6A84F',
    characterTitle: 'Totalidad & Madurez Psicológica',
    strength: 'Integración de opuestos, flexibilidad psicológica suprema, sabiduría holística y madurez emocional.',
    shadow: 'Indecisión por sobreanálisis / Parálisis del mediador / Falta de identidad clara',
    shadowDescription: 'Querer conciliar tanto que pierde su propia postura o volverse difuso por abarcarlo todo.',
    shadowAntidote: 'Saber que integrar no significa diluirse, sino actuar con la herramienta precisa en cada momento.',
    domains: {
      liderazgo: 'Media en conflictos complejos, crea culturas integradoras y lidera desde la madurez.',
      relaciones: 'Comprende todas las perspectivas y sostiene vínculos maduros y duraderos.',
      crisis: 'Aporta la respuesta exacta que el momento requiere (fuerza, calma, orden o compasión).',
      creatividad: 'Obras maestras que combinan múltiples disciplinas y profundidades.',
      paternidad: 'Cría seres humanos completos, equilibrados y libres de polarizaciones neuróticas.',
    },
    balancedBehavior: [
      'No reprime ninguna parte de su ser, sino que la canaliza maduramente.',
      'Sabe cuándo actuar con la espada y cuándo con la flor.',
      'Acepta su propia sombra sin identificarse con ella.',
      'Irradia una serenidad integradora que tranquiliza a su alrededor.'
    ],
    unbalancedBehavior: [
      'Tibieza que no toma partido cuando la justicia exige definición.',
      'Confusión de identidades por querer complacer a todas sus partes internas.',
      'Soberbia de creerse "totalmente evolucionado".',
      'Desgaste por intentar armonizar lo irreconciliable.'
    ],
    reflectionQuestions: [
      '¿Qué dos partes de mí parecen entrar en conflicto y cómo pueden colaborar?',
      '¿Dónde estoy rechazando una parte de mi personalidad que necesita ser integrada?',
      '¿Cómo puedo actuar hoy desde mi centro más pleno y maduro?'
    ],
    developmentExercises: [
      {
        title: 'El Diálogo de las Dos Fuerzas',
        description: 'Toma dos arquetipos que sientas en pugna en tu interior (ej. Guerrero y Amante) y escribe un diálogo donde acuerden cómo ayudarse.',
        actionStep: 'Encuentra el punto medio donde ambos arquetipos colaboren.'
      }
    ],
    synergies: [
      {
        partnerId: 'rey',
        title: 'Totalidad + Soberanía',
        description: 'El Integrador armoniza todas las fuerzas internas; el Rey/Reina las gobierna con justicia y propósito.',
        synergyKeyword: 'Plenitud del Ser'
      }
    ],
    variants: {
      masculine: {
        name: 'El Integrador',
        characterTitle: 'El Alquimista de la Madurez y Síntesis de Opuestos',
        centralQuestion: '¿Cómo dejo de vivir fragmentado y synthesized mi fuerza, ternura, mente y acción?',
        shortDescription: 'Síntesis de opuestos (Guerrero + Amante, Sabio + Bufón), integridad y madurez total.',
        fullDescription: 'El Integrador masculino no reprime su agresividad ni su sensibilidad; las funde en una presencia masculina madura, firme y compasiva.',
        mantra: 'Integro mi fuerza y mi ternura en una sola integridad masculina madura.',
        strength: 'Madurez psicológica, balance de opuestos, liderazgo completo y ecuanimidad.',
        shadow: 'Hombre ambiguo / Parálisis por conciliación',
        shadowDescription: 'Pierde contundencia por no querer ofender o se vuelve ambiguo.',
        shadowAntidote: 'Recordar que la integración incluye saber tomar decisiones tajantes cuando es debido.',
        domains: {
          liderazgo: 'Liderazgo multidimensional y adaptabilidad.',
          relaciones: 'Firmeza y ternura en el vínculo amoroso.',
          crisis: 'Respuesta exacta y equilibrada.',
          creatividad: 'Obras integrales y universales.',
          paternidad: 'Modelo de masculinidad madura, cariñosa y protectora.',
        },
        balancedBehavior: ['Actúa con sabiduría integral', 'Es firme y tierno a la vez'],
        unbalancedBehavior: ['Indecisión', 'Falta de definición clara'],
        reflectionQuestions: ['¿Qué polaridad mía necesita reconciliación urgente?'],
        developmentExercises: [
          {
            title: 'Matrimonio Interior',
            description: 'Dedica un momento a agradecer tanto tu capacidad de lucha como tu capacidad de amar.',
            actionStep: 'Siente ambas fuerzas vivas en tu pecho.'
          }
        ]
      },
      feminine: {
        name: 'La Integradora',
        characterTitle: 'La Tejedora de la Plenitud y Armonía Holística',
        centralQuestion: '¿Cómo tejo todas mis facetas, luces y sombras en una sola fuerza armónica y plena?',
        shortDescription: 'Integración de luces y sombras, plenitud holística y soberanía femenina completa.',
        fullDescription: 'La Integradora femenina abraza a la Guerrera, la Amante, la Madre, la Maga y la Reina dentro de sí, danzando entre ellas con soltura según lo demande cada instante.',
        mantra: 'Soy la tejedora de mis múltiples dimensiones; habito mi plenitud sin miedo.',
        strength: 'Totalidad femenina, fluidez entre roles, sabiduría holística y poder integrado.',
        shadow: 'Dispersión en múltiples máscaras / Agotamiento por querer serlo todo',
        shadowDescription: 'Intenta ser la guerrera perfecta, la madre perfecta y la amante perfecta a la vez y colapsa.',
        shadowAntidote: 'Saber que la totalidad no es perfección simultánea, sino fluidez y presencia.',
        domains: {
          liderazgo: 'Integración de equipos y visión panorámica.',
          relaciones: 'Riqueza emocional y libertad en el vínculo.',
          crisis: 'Sabiduría instintiva y serenidad.',
          creatividad: 'Arte holístico y conmovedor.',
          paternidad: 'Modelo de mujer completa, libre y sabia.',
        },
        balancedBehavior: ['Transita entre sus facetas con naturalidad', 'Se acepta completa'],
        unbalancedBehavior: ['Autoexigencia de perfección', 'Fragmentación'],
        reflectionQuestions: ['¿Qué faceta de mi feminidad he tenido reprimida últimamente?'],
        developmentExercises: [
          {
            title: 'La Rueda de las Diosas Interiores',
            description: 'Visualiza a tus diferentes facetas sentadas en círculo y pregúntales qué necesita cada una hoy.',
            actionStep: 'Satisface la necesidad de la faceta más desatendida.'
          }
        ]
      },
      universal: {
        name: 'Integrador / Integradora',
        characterTitle: 'El Arquetipo de la Totalidad',
        centralQuestion: '¿Cómo vivo desde la plenitud de mi ser?',
        shortDescription: 'Totalidad, síntesis de opuestos y madurez.',
        fullDescription: 'El fin del viaje de autorrealización: la integración armónica de todas las fuerzas de la psique.',
        mantra: 'Soy uno con mi totalidad y habito mi plenitud.',
        strength: 'Sabiduría integral y ecuanimidad.',
        shadow: 'Indecisión o ambigüedad.',
        shadowDescription: 'Pérdida de foco por exceso de abstracción.',
        shadowAntidote: 'Acción consciente y congruente.',
        domains: {
          liderazgo: 'Liderazgo sabio y holístico.',
          relaciones: 'Amor maduro y pleno.',
          crisis: 'Respuesta equilibrada.',
          creatividad: 'Obras maestras de síntesis.',
          paternidad: 'Educación para la plenitud humana.',
        },
        balancedBehavior: ['Plenitud y balance'],
        unbalancedBehavior: ['Tibieza'],
        reflectionQuestions: ['¿Cómo vivo desde mi centro unificado hoy?'],
        developmentExercises: [
          {
            title: 'El Abrazo a la Sombra',
            description: 'Reconoce un defecto propio con amor y decide canalizar su energía constructivamente.',
            actionStep: 'Haz las paces contigo mismo hoy.'
          }
        ]
      }
    }
  }
};
