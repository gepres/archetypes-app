// Datos del dominio. Se mantienen en el nucleo, no en la web, porque son el
// producto: el movil y la web tienen que hablar de los mismos dieciocho.
import type { Archetype } from '../model';

export const CORE_ARCHETYPES: Record<'rey' | 'guerrero' | 'mago' | 'sabio' | 'sacerdote' | 'amante', Archetype> = {
  rey: {
    id: 'rey',
    name: 'Rey / Reina',
    universalName: 'Rey / Reina',
    masculineName: 'El Rey',
    feminineName: 'La Reina',
    emoji: '👑',
    dimension: 'construccion',
    concepts: ['soberanía', 'liderazgo', 'orden', 'responsabilidad', 'autoridad interior', 'legado'],
    centralQuestion: '¿Cómo gobierno mi reino interior y qué espacio genero para los demás?',
    shortDescription: 'La soberanía interior que organiza el reino, establece orden benevolente y asume la responsabilidad ética.',
    fullDescription: 'El arquetipo del Rey / Reina representa el centro organizador y la autoridad serena de la psique. Genera un espacio donde los talentos pueden florecer sin tiranía ni debilidad.',
    mantra: 'Gobierno mi espacio vital con justicia, serenidad y responsabilidad.',
    symbol: 'Corona Solar & Cetro de Orden',
    colorHex: '#D6A84F',
    characterTitle: 'Soberanía & Liderazgo',
    strength: 'Liderazgo generoso, orden ético, serenidad en crisis y claridad de propósito.',
    shadow: 'Tirano o Débil / Control o Dependencia de validación',
    shadowDescription: 'En sombra masculina oscila entre la tiranía controladora y el rey débil que abdica. En sombra femenina oscila entre el microcontrol hipervigilante y la búsqueda de validación externa para legitimar su poder.',
    shadowAntidote: 'Gobernar desde la autonomía y la bendición del entorno, soltando la necesidad de complacer o imponer.',
    domains: {
      liderazgo: 'Provee claridad de rumbo, define metas éticas y empodera a sus colaboradores bendiciendo sus talentos.',
      relaciones: 'Establece un entorno de confianza y lealtad donde los límites protegen la intimidad y la estabilidad.',
      crisis: 'Mantiene el pulso firme, evita el pánico colectivo y toma decisiones estratégicas con visión a largo plazo.',
      creatividad: 'Estructura los recursos y el tiempo necesarios para que las obras maestras maduren sin dispersión.',
      paternidad: 'Ofrece un marco de referencia seguro, estabilidad emocional y validación incondicional a las nuevas generaciones.',
    },
    balancedBehavior: [
      'Establece límites claros con serenidad y sin agresividad.',
      'Sabe delegar y celebrar el éxito de quienes le rodean.',
      'Mantiene una perspectiva panorámica ante las crisis.',
      'Actúa con congruencia ética y sentido de propósito colectivo.'
    ],
    unbalancedBehavior: [
      'Sentimiento de que todo debe pasar por su aprobación.',
      'Rigidez defensiva cuando se cuestiona su criterio.',
      'Parálisis decisional por miedo a equivocarse o perder estatus.',
      'Frialdad emocional disfrazada de pragmatismo.'
    ],
    reflectionQuestions: [
      '¿En qué áreas de mi vida estoy dejando que el desorden o la pasividad tomen el control?',
      '¿Estoy liderando desde la generosidad y la visión o desde la necesidad de control?',
      '¿A quién o qué proyectos necesito bendecir y respaldar hoy con mi presencia?'
    ],
    developmentExercises: [
      {
        title: 'Delimitar el Reino Semanal',
        description: 'Define con absoluta claridad las 3 prioridades no negociables de esta semana.',
        actionStep: 'Escribe tus tres prioridades estratégicas y una decisión difícil que has postergado.'
      },
      {
        title: 'El Acto de Bendición',
        description: 'Reconoce genuinamente el esfuerzo o valor de una persona en tu entorno sin buscar nada a cambio.',
        actionStep: 'Envía un mensaje validando el talento o perseverancia de un colega o ser querido.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Dirección + Disciplina',
        description: 'El Rey provee la visión y el propósito ético; el Guerrero ejecuta la estrategia con impecabilidad y rigor.',
        synergyKeyword: 'Soberanía en Acción'
      },
      {
        partnerId: 'amante',
        title: 'Estructura + Sensibilidad',
        description: 'El Rey aporta el orden y la contención; el Amante nutre el corazón del reino con empatía, arte y calidez.',
        synergyKeyword: 'Reino Humanizado'
      }
    ],
    variants: {
      masculine: {
        name: 'El Rey',
        characterTitle: 'El Soberano del Orden y la Protección',
        centralQuestion: '¿Cómo guío con firmeza, justicia y responsabilidad ética?',
        shortDescription: 'Liderazgo masculino, autoridad interior, protección y legado.',
        fullDescription: 'El Rey encarna el liderazgo masculino maduro: la capacidad de asumir la responsabilidad de su mundo, proteger su territorio y ofrecer dirección clara sin recurrir a la imposición.',
        mantra: 'Asumo la responsabilidad de mi reino y proveo orden con serenidad.',
        strength: 'Autoridad interior, dirección clara, protección firme y templanza.',
        shadow: 'Tirano autoritario / Rey débil e indeciso',
        shadowDescription: 'El tirano aplasta para sentirse seguro; el rey débil huye de las decisiones difíciles.',
        shadowAntidote: 'Cultivar la humildad y gobernar desde el servicio y la escucha.',
        domains: {
          liderazgo: 'Dirección firme, protección del equipo y visión a largo plazo.',
          relaciones: 'Presencia segura y compromisos inquebrantables.',
          crisis: 'Calma protectora y toma de decisiones sin titubear.',
          creatividad: 'Estructura sólida para materializar grandes proyectos.',
          paternidad: 'Firmeza amorosa, respaldo y mentoría generosa.',
        },
        balancedBehavior: ['Toma decisiones justas', 'Genera estabilidad', 'Protege a los suyos con calma'],
        unbalancedBehavior: ['Autoritarismo', 'Frialdad emocional', 'Miedo a ser cuestionado'],
        reflectionQuestions: [
          '¿Dónde estoy actuando como tirano por miedo a perder control?',
          '¿Qué decisión de liderazgo he venido postergando?',
          '¿Cómo puedo brindar protección sin ahogar el crecimiento ajeno?'
        ],
        developmentExercises: [
          {
            title: 'Consejo del Reino',
            description: 'Escucha sin interrumpir a las personas clave antes de tomar una decisión importante.',
            actionStep: 'Pide la opinión honesta de alguien cercano sobre un proyecto o dilema.'
          }
        ]
      },
      feminine: {
        name: 'La Reina',
        characterTitle: 'La Soberana de la Dignidad y la Autonomía',
        centralQuestion: '¿Cómo habito mi soberanía personal y ejerzo mi influencia con dignidad?',
        shortDescription: 'Soberanía personal, liderazgo, autonomía, dignidad e influencia.',
        fullDescription: 'La Reina encarna la soberanía personal indiscutible: el poder de la dignidad, la autodeterminación y la influencia lúcida sin depender de la aprobación ajena.',
        mantra: 'Habito mi soberanía con gracia, límites firmes y dignidad inalienable.',
        strength: 'Dignidad personal, influencia magnética, límites claros y autonomía.',
        shadow: 'Hipercontrol rígido / Dependencia de reconocimiento',
        shadowDescription: 'Puede volverse controladora por desconfianza o perder su centro buscando validación externa.',
        shadowAntidote: 'Reconocer que el verdadero trono está dentro de una misma y no en el juicio ajeno.',
        domains: {
          liderazgo: 'Liderazgo inspirador, coordinación armónica e influencia transformadora.',
          relaciones: 'Dignidad, reciprocidad y límites respetuosos.',
          crisis: 'Resiliencia majestuosa y claridad estratégica.',
          creatividad: 'Proyectos con propósito noble y estética impecable.',
          paternidad: 'Fomento de la autoestima y el respeto mutuo.',
        },
        balancedBehavior: ['Establece límites con elegancia', 'Guía desde la propia solidez', 'Valora su propia voz'],
        unbalancedBehavior: ['Necesidad excesiva de validación', 'Resentimiento por falta de reconocimiento', 'Control asfixiante'],
        reflectionQuestions: [
          '¿En qué situaciones cedo mi poder por agradar o evitar incomodidad?',
          '¿Cómo puedo expresar mi autoridad sin pedir disculpas por brillar?',
          '¿Dónde necesito poner un límite digno hoy?'
        ],
        developmentExercises: [
          {
            title: 'Decreto de Soberanía',
            description: 'Define un área donde dejarás de pedir permiso y actuarás desde tu propio criterio.',
            actionStep: 'Escribe tu declaración de soberanía personal para este mes.'
          }
        ]
      },
      universal: {
        name: 'Rey / Reina',
        characterTitle: 'El Soberano Consciente',
        centralQuestion: '¿Cómo pongo orden y propósito en mi entorno?',
        shortDescription: 'Soberanía, liderazgo consciente, orden y responsabilidad compartida.',
        fullDescription: 'La soberanía arquetípica como centro unificador de la conciencia que crea orden y sostiene el bienestar.',
        mantra: 'Gobierno mi vida con equilibrio, dignidad y justicia.',
        strength: 'Soberanía integral, liderazgo consciente y responsabilidad.',
        shadow: 'Tiranía o abdicación del poder personal',
        shadowDescription: 'Uso destructivo del poder o renuncia al liderazgo personal.',
        shadowAntidote: 'Alinear las decisiones con valores éticos universales.',
        domains: {
          liderazgo: 'Propósito ético y visión integradora.',
          relaciones: 'Confianza y límites constructivos.',
          crisis: 'Serenidad y visión global.',
          creatividad: 'Estructuración y orden.',
          paternidad: 'Guía y nutrición generacional.',
        },
        balancedBehavior: ['Equilibrio ético', 'Liderazgo sereno', 'Responsabilidad clara'],
        unbalancedBehavior: ['Abuso de poder', 'Pasividad', 'Falta de rumbo'],
        reflectionQuestions: ['¿Qué orden necesita mi vida hoy?', '¿Cómo sirvo a mi comunidad desde mi centro?'],
        developmentExercises: [
          {
            title: 'Alineación de Metas',
            description: 'Alinea tus prioridades semanales con tu visión de vida.',
            actionStep: 'Revisa tu calendario y elimina lo superfluo.'
          }
        ]
      }
    }
  },

  guerrero: {
    id: 'guerrero',
    name: 'Guerrero / Guerrera',
    universalName: 'Guerrero / Guerrera',
    masculineName: 'El Guerrero',
    feminineName: 'La Guerrera',
    emoji: '⚔️',
    dimension: 'accion',
    concepts: ['acción', 'disciplina', 'límites', 'valentía', 'enfoque', 'resistencia', 'competencia'],
    centralQuestion: '¿Qué causa merece mi coraje y dónde debo trazar límites inviolables?',
    shortDescription: 'La fuerza de acción, disciplina física y mental, coraje para confrontar y defensa de los límites sagrados.',
    fullDescription: 'El arquetipo del Guerrero / Guerrera es el ejecutor impecable de la psique. Aporta foco sin distracción, valentía ante la adversidad y la capacidad de defender lo valioso.',
    mantra: 'Actúo con disciplina, defiendo lo sagrado y mantengo mi foco inquebrantable.',
    symbol: 'Espada de Discernimiento & Escudo de Límites',
    colorHex: '#EF4444',
    characterTitle: 'Acción & Disciplina',
    strength: 'Enfoque absoluto, capacidad de esfuerzo sostenido, valentía ante la incomodidad y límites firmes.',
    shadow: 'Sadismo / Masoquismo / Violencia o Parálisis por complacencia',
    shadowDescription: 'En polo activo puede caer en agresividad innecesaria, adicción a la lucha o dureza insensible. En polo pasivo, incapacidad de decir no o resignación.',
    shadowAntidote: 'Conectar la espada con el corazón: luchar solo por causas éticas y recordar el autocuidado.',
    domains: {
      liderazgo: 'Ejecuta estrategias complejas, vence la procrastinación y marca el ritmo con el ejemplo.',
      relaciones: 'Defiende la honestidad radical y no tolera la falta de respeto ni la manipulación.',
      crisis: 'Entra en acción inmediata, organiza la defensa y tolera la presión extrema sin derrumbarse.',
      creatividad: 'Aporta la disciplina diaria necesaria para pulir la técnica hasta la maestría.',
      paternidad: 'Enseña la perseverancia, el valor del esfuerzo y la autodefensa responsable.',
    },
    balancedBehavior: [
      'Encara las conversaciones difíciles sin rodeos pero sin crueldad.',
      'Mantiene una disciplina cotidiana sin volverse rígido.',
      'Sabe cuándo retirarse de una batalla inútil.',
      'Protege a los vulnerables con su propia fuerza.'
    ],
    unbalancedBehavior: [
      'Ver enemigos y amenazas en todas partes.',
      'Desprecio hacia la vulnerabilidad o lentitud ajena.',
      'Agotamiento físico por negarse al descanso.',
      'Miedo a la ternura y la intimidad emocional.'
    ],
    reflectionQuestions: [
      '¿Qué batalla estoy librando que ya no tiene sentido?',
      '¿Dónde necesito poner un límite tajante pero respetuoso hoy?',
      '¿Estoy cuidando mi cuerpo con la misma disciplina con que le exijo resultados?'
    ],
    developmentExercises: [
      {
        title: 'El Límite Limpio',
        description: 'Di un "no" firme a una demanda que compromete tu integridad o energía sin pedir disculpas excesivas.',
        actionStep: 'Comunica una negativa educada y concisa a una petición que no desees aceptar.'
      },
      {
        title: 'Sesión de Disciplina Enfocada',
        description: 'Dedica 50 minutos ininterrumpidos a la tarea más desafiante de tu jornada.',
        actionStep: 'Apaga notificaciones y completa la tarea prioritaria antes de abrir redes sociales.'
      }
    ],
    synergies: [
      {
        partnerId: 'mago',
        title: 'Fuerza + Estrategia',
        description: 'El Mago analiza las tácticas y puntos débiles; el Guerrero actúa con precisión quirúrgica.',
        synergyKeyword: 'Estrategia Bélica Impecable'
      },
      {
        partnerId: 'sanador',
        title: 'Defensa + Reparación',
        description: 'El Guerrero pone los límites necesarios para que el Sanador pueda restaurar el tejido emocional.',
        synergyKeyword: 'Restauración Protegida'
      }
    ],
    variants: {
      masculine: {
        name: 'El Guerrero',
        characterTitle: 'El Campeón de la Acción y la Disciplina',
        centralQuestion: '¿Qué estás dispuesto a defender y qué causa merece tu esfuerzo total?',
        shortDescription: 'Disciplina, responsabilidad, competencia, resistencia y protección.',
        fullDescription: 'El Guerrero masculino orienta su fuerza hacia la conquista de metas y la protección de su tribu a través de la disciplina inquebrantable.',
        mantra: 'Pongo mi fuerza y disciplina al servicio de una causa noble.',
        strength: 'Determinación implacable, lealtad, resistencia y valentía.',
        shadow: 'Belicismo destructivo / Cobardía pasiva',
        shadowDescription: 'El mercenario agresivo o el soldado rendido que no defiende sus valores.',
        shadowAntidote: 'Someter la espada al servicio del propósito ético.',
        domains: {
          liderazgo: 'Ejecución firme y liderazgo con el ejemplo.',
          relaciones: 'Lealtad y franqueza directa.',
          crisis: 'Coraje bajo fuego y resolución rápida.',
          creatividad: 'Rigor técnico y perseverancia.',
          paternidad: 'Fuerza protectora y transmisión de resiliencia.',
        },
        balancedBehavior: ['Actúa con prontitud', 'Mantiene la palabra dada', 'Canaliza la fuerza constructivamente'],
        unbalancedBehavior: ['Conflicto constante', 'Incapacidad de mostrar debilidad', 'Competitividad destructiva'],
        reflectionQuestions: [
          '¿Qué estoy postergando por miedo a la incomodidad?',
          '¿Estoy luchando por ego o por convicción real?'
        ],
        developmentExercises: [
          {
            title: 'Superación de Fricción',
            description: 'Enfrenta la tarea más incómoda en la primera hora del día.',
            actionStep: 'Haz la llamada o entrega postergada antes de cualquier otra cosa.'
          }
        ]
      },
      feminine: {
        name: 'La Guerrera',
        characterTitle: 'La Guardiana de los Límites y la Autonomía',
        centralQuestion: '¿Qué ya no estás dispuesta a permitir y cómo defiendes tu espacio?',
        shortDescription: 'Autonomía, límites claros, defensa personal, independencia y capacidad de decir no.',
        fullDescription: 'La Guerrera femenina reclama su autonomía e integridad, sabiendo cuándo decir "basta" y defendiendo su tiempo, su cuerpo y sus proyectos con determinación.',
        mantra: 'Mi "no" es sagrado y defiendo mi espacio con fuerza y claridad.',
        strength: 'Autonomía indomable, corte de lazos tóxicos y valentía para defenderse.',
        shadow: 'Acorazamiento defensivo / Complacencia sumisa',
        shadowDescription: 'Muro emocional que impide la cercanía o parálisis por temor al rechazo.',
        shadowAntidote: 'Recordar que poner límites no es atacar, sino honrar la propia verdad.',
        domains: {
          liderazgo: 'Firmeza en las negociaciones y defensa de la justicia.',
          relaciones: 'Tolerancia cero a la manipulación o la falta de respeto.',
          crisis: 'Determinación inquebrantable para superar la adversidad.',
          creatividad: 'Defensa del tiempo creativo frente a interrupciones.',
          paternidad: 'Enseñanza de la autodefensa y la independencia emocional.',
        },
        balancedBehavior: ['Dice no sin culpa', 'Se defiende con serenidad', 'Preserva su energía vital'],
        unbalancedBehavior: ['Desconfianza crónica', 'Ataque preventivo', 'Miedo a pedir ayuda'],
        reflectionQuestions: [
          '¿A qué situación o relación necesito decirle un "no" definitivo?',
          '¿Dónde estoy cargando con lo que no me corresponde por evitar conflicto?'
        ],
        developmentExercises: [
          {
            title: 'El No Tajante',
            description: 'Practica declinar un compromiso innecesario de forma directa y serena.',
            actionStep: 'Rechaza una invitación o demanda que drene tu energía.'
          }
        ]
      },
      universal: {
        name: 'Guerrero / Guerrera',
        characterTitle: 'La Fuerza de Acción y Valentía',
        centralQuestion: '¿Cómo aplico mi disciplina con sentido?',
        shortDescription: 'Acción consciente, valentía, perseverancia y defensa de valores.',
        fullDescription: 'El principio de superación y enfoque activo para manifestar cambios en el mundo.',
        mantra: 'Avanzo con determinación y respeto por mis principios.',
        strength: 'Coraje, foco y constancia.',
        shadow: 'Violencia o parálisis.',
        shadowDescription: 'Uso destructivo de la energía o falta de iniciativa.',
        shadowAntidote: 'Actuar con consciencia y propósito claro.',
        domains: {
          liderazgo: 'Capacidad ejecutiva.',
          relaciones: 'Respeto mutuo y franqueza.',
          crisis: 'Resistencia y resiliencia.',
          creatividad: 'Constancia diaria.',
          paternidad: 'Disciplina positiva.',
        },
        balancedBehavior: ['Foco activo', 'Respeto a los límites'],
        unbalancedBehavior: ['Agresividad', 'Pasividad'],
        reflectionQuestions: ['¿En qué invierto mi fuerza hoy?'],
        developmentExercises: [
          {
            title: 'Bloque de Foco',
            description: 'Trabaja 45 min sin distracciones.',
            actionStep: 'Concluye una tarea pendiente hoy.'
          }
        ]
      }
    }
  },

  mago: {
    id: 'mago',
    name: 'Mago / Maga',
    universalName: 'Mago / Maga',
    masculineName: 'El Mago',
    feminineName: 'La Maga',
    emoji: '🔮',
    dimension: 'mente',
    concepts: ['conocimiento', 'transformación', 'patrones', 'tecnología', 'alquimia', 'visión sutil'],
    centralQuestion: '¿Qué leyes y patrones profundos operan detrás de esta realidad?',
    shortDescription: 'El maestro de la transformación sutil, la comprensión de sistemas complejos y el puente entre lo invisible y lo visible.',
    fullDescription: 'El Mago / Maga es el alquimista y estratega de la psique. No usa la fuerza bruta, sino el conocimiento de los principios universales para catalizar transformaciones profundas.',
    mantra: 'Comprendo los patrones ocultos y transformo mi realidad desde la raíz.',
    symbol: 'Esfera Alquímica & Pentáculo de Sistemas',
    colorHex: '#3B82F6',
    characterTitle: 'Conocimiento & Transformación',
    strength: 'Pensamiento sistémico, resolución de problemas complejos, visión anticipatoria y maestría técnica/simbólica.',
    shadow: 'Manipulador cínico / Charlatán confuso',
    shadowDescription: 'Uso del conocimiento superior para manipular a otros desde las sombras o desconexión en teorías abstractas desconectadas de la vida real.',
    shadowAntidote: 'Poner el conocimiento al servicio de la verdad y el bienestar colectivo, con transparencia absoluta.',
    domains: {
      liderazgo: 'Diseña arquitecturas y estrategias innovadoras que resuelven cuellos de botella.',
      relaciones: 'Aporta perspectiva desapegada para desactivar conflictos destructivos.',
      crisis: 'Encuentra soluciones no evidentes donde otros solo ven callejones sin salida.',
      creatividad: 'Combina herramientas técnicas con intuición para crear obras revolucionarias.',
      paternidad: 'Estimula la curiosidad científica, el pensamiento crítico y la resolución ingeniosa.',
    },
    balancedBehavior: [
      'Descubre la causa raíz detrás de síntomas superficiales.',
      'Comparte el conocimiento con claridad y generosidad.',
      'Usa la tecnología y las herramientas con maestría y ética.',
      'Anticipa cambios y prepara soluciones antes de la crisis.'
    ],
    unbalancedBehavior: [
      'Guardar secretos para mantener una posición de poder.',
      'Manipulación sutil de las emociones ajenas.',
      'Complejo de superioridad intelectual.',
      'Parálisis por exceso de abstracción teórica.'
    ],
    reflectionQuestions: [
      '¿Qué patrón repetitivo en mi vida estoy ignorando?',
      '¿Estoy usando mi inteligencia para conectar y sanar o para protegerme y manipular?',
      '¿Qué cambio sutil en mis hábitos diarios generaría un impacto exponencial?'
    ],
    developmentExercises: [
      {
        title: 'Mapeo de Patrones Ocultos',
        description: 'Toma un conflicto recurrente y dibuja el ciclo causa-efecto que lo sostiene.',
        actionStep: 'Identifica el punto exacto del circuito donde puedes introducir una respuesta diferente.'
      }
    ],
    synergies: [
      {
        partnerId: 'creador',
        title: 'Conocimiento + Materialización',
        description: 'El Mago descifra las leyes invisibles; el Creador las convierte en obras de arte o sistemas prácticos.',
        synergyKeyword: 'Alquimia Creadora'
      }
    ],
    variants: {
      masculine: {
        name: 'El Mago',
        characterTitle: 'El Iniciado de Sistemas y Alquimia',
        centralQuestion: '¿Cómo comprendo el funcionamiento del mundo para transformarlo con precisión?',
        shortDescription: 'Comprender el mundo exterior y los sistemas para transformarlos.',
        fullDescription: 'El Mago masculino investiga las leyes de la naturaleza, la tecnología y las estructuras estratégicas para innovar y desbloquear el progreso.',
        mantra: 'Descifro los sistemas y aplico la palanca exacta para el cambio.',
        strength: 'Dominio técnico, visión estratégica y destreza analítica.',
        shadow: 'Manipulador frío / Teórico desconectado',
        shadowDescription: 'Calcula con frialdad sin empatía o se encierra en su laboratorio mental.',
        shadowAntidote: 'Vincular el intelecto con el corazón.',
        domains: {
          liderazgo: 'Diseño de sistemas eficientes y resolución estratégica.',
          relaciones: 'Análisis constructivo y desarticulación de tensiones.',
          crisis: 'Soluciones ingeniosas bajo presión.',
          creatividad: 'Innovación técnica.',
          paternidad: 'Fomento del aprendizaje y la experimentación.',
        },
        balancedBehavior: ['Aporta soluciones brillantes', 'Enseña con paciencia'],
        unbalancedBehavior: ['Soberbia intelectual', 'Manipulación'],
        reflectionQuestions: ['¿Qué sistema en mi vida necesita reestructuración?'],
        developmentExercises: [
          {
            title: 'La Palanca Estratégica',
            description: 'Encuentra la pequeña acción que desbloquea un gran proyecto.',
            actionStep: 'Aplica esa acción hoy mismo.'
          }
        ]
      },
      feminine: {
        name: 'La Maga',
        characterTitle: 'La Tejedora de Transformaciones y Patrones',
        centralQuestion: '¿Cómo reconozco las dinámicas invisibles y transformo mi realidad interior y exterior?',
        shortDescription: 'Comprender patrones internos y externos para transformar su realidad.',
        fullDescription: 'La Maga femenina combina la agudeza intuitiva con el conocimiento práctico para sanar dinámicas familiares, profesionales y personales desde su origen.',
        mantra: 'Transformo la energía estancada en sabiduría viva y creación.',
        strength: 'Intuición lúcida, transmutación de crisis en crecimiento y visión integradora.',
        shadow: 'Controladora entre bastidores / Duda de su propio don',
        shadowDescription: 'Manipula sutilmente desde la sombra o niega su intuición por miedo a ser juzgada.',
        shadowAntidote: 'Actuar a la luz del día con honestidad total y plena confianza en su discernimiento.',
        domains: {
          liderazgo: 'Lectura precisa de dinámicas de equipo y facilitación del cambio.',
          relaciones: 'Transformación profunda de vínculos y sanación de viejas heridas.',
          crisis: 'Capacidad de renacer de las cenizas con mayor poder.',
          creatividad: 'Canalización de visiones inspiradas.',
          paternidad: 'Acompañamiento en el despertar de la consciencia infantil.',
        },
        balancedBehavior: ['Transforma ambientes densos', 'Confía en su percepción profunda'],
        unbalancedBehavior: ['Intriga oculta', 'Desconfianza en su propia visión'],
        reflectionQuestions: ['¿Qué verdad intuitiva estoy resistiéndome a aceptar?'],
        developmentExercises: [
          {
            title: 'Transmutación Emocional',
            description: 'Toma una emoción densa (rabia, tristeza) y canalízala en una acción creativa.',
            actionStep: 'Escribe o crea algo significativo a partir de esa energía.'
          }
        ]
      },
      universal: {
        name: 'Mago / Maga',
        characterTitle: 'El Alquimista del Conocimiento',
        centralQuestion: '¿Cómo transformo el conocimiento en evolución?',
        shortDescription: 'Conocimiento, discernimiento de patrones y transformación consciente.',
        fullDescription: 'El principio de comprensión y alquimia que permite evolucionar las estructuras de la conciencia.',
        mantra: 'Integro sabiduría y acción para transformar la realidad.',
        strength: 'Sabiduría aplicada y visión multidimensional.',
        shadow: 'Manipulación o abstracción vacía.',
        shadowDescription: 'Desconexión de la ética o la realidad.',
        shadowAntidote: 'Servicio ético y transparencia.',
        domains: {
          liderazgo: 'Innovación estratégica.',
          relaciones: 'Empatía lúcida.',
          crisis: 'Resolución de problemas.',
          creatividad: 'Maestría técnica.',
          paternidad: 'Educación viva.',
        },
        balancedBehavior: ['Claridad y visión sistémica'],
        unbalancedBehavior: ['Soberbia y secretismo'],
        reflectionQuestions: ['¿Qué verdad esencial debo comprender hoy?'],
        developmentExercises: [
          {
            title: 'Observación Sistémica',
            description: 'Analiza las causas de un problema sin culpar a nadie.',
            actionStep: 'Propón una mejora estructural.'
          }
        ]
      }
    }
  },

  sabio: {
    id: 'sabio',
    name: 'Sabio / Sabia',
    universalName: 'Sabio / Sabia',
    masculineName: 'El Sabio',
    feminineName: 'La Sabia',
    emoji: '📖',
    dimension: 'mente',
    concepts: ['verdad', 'conocimiento', 'discernimiento', 'perspectiva', 'claridad', 'objetividad'],
    centralQuestion: '¿Cuál es la verdad objetiva detrás de las apariencias?',
    shortDescription: 'La búsqueda de la verdad pura, el discernimiento filosófico y la serenidad ante el ruido del mundo.',
    fullDescription: 'El Sabio / Sabia cultiva la objetividad y la lucidez mental. Desarma ilusiones y busca comprender la naturaleza humana con desapego sereno.',
    mantra: 'Busco la verdad con mente abierta y discernimiento lúcido.',
    symbol: 'Libro Abierto & Linterna de Diógenes',
    colorHex: '#3B82F6',
    characterTitle: 'Verdad & Discernimiento',
    strength: 'Objetividad, profundidad filosófica, pensamiento crítico y consejo sereno.',
    shadow: 'Pedantería / Cinismo frío / Dogmatismo',
    shadowDescription: 'Quedarse atrapado en el juicio escéptico o creer poseer la verdad absoluta sin empatía humana.',
    shadowAntidote: 'Humildad socrática: recordar que la sabiduría genuina convive con la compasión.',
    domains: {
      liderazgo: 'Brinda consejo estratégico imparcial y clarifica dilemas éticos.',
      relaciones: 'Escucha sin juzgar y ayuda a ver la perspectiva del otro.',
      crisis: 'Mantiene la calma y analiza la situación sin caer en el pánico.',
      creatividad: 'Aporta rigor conceptual y profundidad filosófica a las obras.',
      paternidad: 'Enseña a pensar con criterio propio y cuestionar dogmas.',
    },
    balancedBehavior: ['Busca la verdad sin arrogancia', 'Mantiene la serenidad', 'Cuestiona sus propios sesgos'],
    unbalancedBehavior: ['Cinismo', 'Desconexión emocional', 'Aislamiento intelectual'],
    reflectionQuestions: [
      '¿En qué asunto estoy opinando sin conocer los hechos reales?',
      '¿Cómo distingo mi verdad profunda del ruido y expectativas de los demás?'
    ],
    developmentExercises: [
      {
        title: 'La Pausa de Discernimiento',
        description: 'Ante una noticia o discusión acalorada, pospón tu juicio 24 horas para analizarla con serenidad.',
        actionStep: 'Registra qué sesgos o emociones nublaban tu primera impresión.'
      }
    ],
    synergies: [
      {
        partnerId: 'bufon',
        title: 'Verdad + Ligereza',
        description: 'El Sabio descubre la verdad; el Bufón evita que se vuelva solemne o pedante.',
        synergyKeyword: 'Sabiduría Sonriente'
      }
    ],
    variants: {
      masculine: {
        name: 'El Sabio',
        characterTitle: 'El Filósofo de la Verdad y la Perspectiva',
        centralQuestion: '¿Cómo comprendo a fondo los hechos antes de emitir un juicio o actuar?',
        shortDescription: 'Busca comprender con rigor antes de actuar.',
        fullDescription: 'El Sabio masculino cultiva el estudio riguroso, la ecuanimidad y la solidez de criterio frente a las modas pasajeras.',
        mantra: 'Observo con calma y busco los principios que no cambian con el tiempo.',
        strength: 'Discernimiento imparcial, estudio metódico y serenidad.',
        shadow: 'Ermitaño frío / Crítico implacable',
        shadowDescription: 'Se aísla del mundo o juzga a los demás con desprecio intelectual.',
        shadowAntidote: 'Participar activamente en la vida comunitaria con humildad.',
        domains: {
          liderazgo: 'Mentoría y consultoría estratégica.',
          relaciones: 'Consejo objetivo y leal.',
          crisis: 'Perspectiva histórica y calma.',
          creatividad: 'Fundamentación filosófica.',
          paternidad: 'Fomento del amor por la lectura y el saber.',
        },
        balancedBehavior: ['Escucha antes de hablar', 'Admite lo que no sabe'],
        unbalancedBehavior: ['Pedantería', 'Miedo al compromiso emocional'],
        reflectionQuestions: ['¿Dónde necesito más estudio y menos juicio impulsivo?'],
        developmentExercises: [
          {
            title: 'Lectura Contemplativa',
            description: 'Lee un texto filosófico clásico y extrae un principio aplicable hoy.',
            actionStep: 'Dedica 20 minutos a reflexionar sobre su significado.'
          }
        ]
      },
      feminine: {
        name: 'La Sabia',
        characterTitle: 'La Anciana del Conocimiento y la Verdad Propia',
        centralQuestion: '¿Cómo distingo mi propia verdad de las expectativas que otros proyectan sobre mí?',
        shortDescription: 'Busca distinguir tu propia verdad de las expectativas ajenas.',
        fullDescription: 'La Sabia femenina representa la madurez interior que sabe escuchar el silencio, desarmar mandatos sociales y honrar la voz auténtica.',
        mantra: 'Honro mi verdad interior por encima de las expectativas del entorno.',
        strength: 'Claridad lúcida, desapego de mandatos sociales y sabiduría vital.',
        shadow: 'Amargura escéptica / Juicio implacable sobre otras mujeres',
        shadowDescription: 'Cinismo ante la ingenuidad ajena o aislamiento amargo.',
        shadowAntidote: 'Compartir la experiencia como faro amoroso y no como tribunal.',
        domains: {
          liderazgo: 'Guía ética y desmitificación de falsas urgencias.',
          relaciones: 'Espacio de escucha profunda y aceptación incondicional.',
          crisis: 'Paz interior indestructible.',
          creatividad: 'Obras con alma y peso existencial.',
          paternidad: 'Transmisión de autonomía y confianza en el propio camino.',
        },
        balancedBehavior: ['Vive según su propio código', 'Acoge con calidez y lucidez'],
        unbalancedBehavior: ['Aislamiento defensivo', 'Inflexibilidad'],
        reflectionQuestions: ['¿Qué mandato ajeno sigo cumpliendo por inercia?'],
        developmentExercises: [
          {
            title: 'Inventario de Mandatos',
            description: 'Anota 3 cosas que haces por cumplir con otros y decide soltar una de ellas.',
            actionStep: 'Toma una decisión coherente con tu verdad.'
          }
        ]
      },
      universal: {
        name: 'Sabio / Sabia',
        characterTitle: 'El Custodio de la Verdad',
        centralQuestion: '¿Cómo cultivo discernimiento y claridad mental?',
        shortDescription: 'Verdad, conocimiento y objetividad serena.',
        fullDescription: 'La búsqueda incansable de la verdad como fundamento de la libertad humana.',
        mantra: 'La verdad me hace libre y sereno.',
        strength: 'Lucidez y perspectiva.',
        shadow: 'Cinismo o arrogancia.',
        shadowDescription: 'Pérdida de empatía por exceso de abstracción.',
        shadowAntidote: 'Amor por la verdad viva.',
        domains: {
          liderazgo: 'Orientación ética.',
          relaciones: 'Respeto mutuo.',
          crisis: 'Claridad mental.',
          creatividad: 'Profundidad de contenido.',
          paternidad: 'Enseñanza del pensamiento libre.',
        },
        balancedBehavior: ['Objetividad y serenidad'],
        unbalancedBehavior: ['Juicio despectivo'],
        reflectionQuestions: ['¿Qué verdad necesito abrazar hoy?'],
        developmentExercises: [
          {
            title: 'Silencio y Reflexión',
            description: '15 minutos de contemplación sin pantallas.',
            actionStep: 'Escribe tu conclusión en el diario.'
          }
        ]
      }
    }
  },

  sacerdote: {
    id: 'sacerdote',
    name: 'Sacerdote / Sacerdotisa',
    universalName: 'Sacerdote / Sacerdotisa',
    masculineName: 'El Sacerdote',
    feminineName: 'La Sacerdotisa',
    emoji: '🕯️',
    dimension: 'mente',
    concepts: ['mundo interior', 'intuición', 'contemplación', 'misterio', 'lo sagrado', 'conexión simbólica'],
    centralQuestion: '¿Qué verdades habitan en el silencio y cómo conecto con lo sagrado en mi vida cotidiana?',
    shortDescription: 'El custodio del mundo interior, la contemplación silenciosa, la intuición profunda y el sentido de lo sagrado.',
    fullDescription: 'El Sacerdote / Sacerdotisa cuida el umbral entre la mente consciente y las profundidades del inconsciente. Su territorio es el misterio, el símbolo y la devoción.',
    mantra: 'Escucho la voz del silencio y honro lo sagrado en mi cotidianidad.',
    symbol: 'Cáliz Sagrado & Velo del Misterio',
    colorHex: '#3B82F6',
    characterTitle: 'Mundo Interior & Intuición',
    strength: 'Introspección profunda, sensibilidad intuitiva, devoción y conexión con el significado de la vida.',
    shadow: 'Fanatismo dogmático / Evasión mística de la realidad terrenal',
    shadowDescription: 'Desconectar del mundo material o volverse guardián de dogmas inflexibles que excluyen a otros.',
    shadowAntidote: 'Enraizar la espiritualidad en actos concretos de servicio y presencia cotidiana.',
    domains: {
      liderazgo: 'Alinea la misión de la organización con valores trascendentes y respeto humano.',
      relaciones: 'Sostiene un espacio de intimidad sagrada donde las almas pueden mostrarse.',
      crisis: 'Aporta paz profunda y significado transformador frente al sufrimiento.',
      creatividad: 'Canaliza símbolos universales y belleza que conmueve el espíritu.',
      paternidad: 'Cultiva la sensibilidad interior, el respeto por la naturaleza y la reverencia por la vida.',
    },
    balancedBehavior: [
      'Reserva momentos diarios de silencio y meditación.',
      'Confía en sus intuiciones sin perder el sentido común.',
      'Trata los vínculos con cuidado y reverencia.',
      'Encuentra significado profundo en las pequeñas cosas.'
    ],
    unbalancedBehavior: [
      'Sentirse superior moral o espiritualmente a los demás.',
      'Despreciar las necesidades prácticas o materiales de la vida.',
      'Aislamiento excesivo en el propio mundo interno.',
      'Superstición o búsqueda compulsiva de señales mágicas.'
    ],
    reflectionQuestions: [
      '¿Cuánto tiempo dedico al silencio y a escuchar mi mundo interior?',
      '¿Qué aspecto de mi vida cotidiana necesita ser tratado con mayor reverencia?',
      '¿Estoy usando mi espiritualidad para transformar mi realidad o para escapar de ella?'
    ],
    developmentExercises: [
      {
        title: 'El Ritual del Silencio',
        description: 'Dedica 15 minutos al despertar a estar en silencio sin tecnología ni tareas.',
        actionStep: 'Observa tus pensamientos y sensaciones sin juzgarlos.'
      }
    ],
    synergies: [
      {
        partnerId: 'constructor',
        title: 'Espíritu + Materia',
        description: 'El Sacerdote aporta el sentido sagrado; el Constructor le da forma material y estructura durable.',
        synergyKeyword: 'Templo en la Tierra'
      }
    ],
    variants: {
      masculine: {
        name: 'El Sacerdote',
        characterTitle: 'El Custodio de la Filosofía Interior y el Significado',
        centralQuestion: '¿Cómo guío mi vida desde principios trascendentes y devoción ética?',
        shortDescription: 'Conocimiento interior, filosofía, contemplación, guía y significado.',
        fullDescription: 'El Sacerdote masculino cultiva la disciplina contemplativa, el estudio de los misterios y la guía ética para su comunidad.',
        mantra: 'Busco el significado profundo y consagro mis actos a lo sagrado.',
        strength: 'Serenidad interior, guía moral, devoción y profundidad.',
        shadow: 'Dogmatismo moralista / Falso iluminado',
        shadowDescription: 'Juzga la vida ajena desde un pedestal de supuesta pureza.',
        shadowAntidote: 'Reconocer la propia humanidad y vulnerabilidad.',
        domains: {
          liderazgo: 'Liderazgo ético y alineación con valores elevados.',
          relaciones: 'Vínculos de respeto profundo y lealtad.',
          crisis: 'Consuelo y perspectiva trascendente.',
          creatividad: 'Obras de arte con contenido espiritual.',
          paternidad: 'Educación en valores y reverencia.',
        },
        balancedBehavior: ['Vive con coherencia ética', 'Practica la escucha compasiva'],
        unbalancedBehavior: ['Rigidez moral', 'Desconexión de lo terrenal'],
        reflectionQuestions: ['¿Estoy juzgando a otros desde mi propio dogma?'],
        developmentExercises: [
          {
            title: 'Examen de Coherencia',
            description: 'Evalúa si tus acciones diarias reflejan tus valores más altos.',
            actionStep: 'Ajusta una conducta que no sea coherente con tu ética.'
          }
        ]
      },
      feminine: {
        name: 'La Sacerdotisa',
        characterTitle: 'La Guardiana de la Intuición y los Misterios',
        centralQuestion: '¿Qué me revela mi intuición cuando aquieto la mente?',
        shortDescription: 'Intuición, mundo interior, sensibilidad, percepción y conexión simbólica.',
        fullDescription: 'La Sacerdotisa femenina habita los ciclos naturales, escucha la sabiduría del cuerpo y percibe lo no dicho en los vínculos.',
        mantra: 'Confío en mi intuición y honro los ciclos de mi mundo interior.',
        strength: 'Percepción intuitiva, conexión con el inconsciente y sabiduría sutil.',
        shadow: 'Hermetismo impenetrable / Evasión en mundos de fantasía',
        shadowDescription: 'Se vuelve inaccesible o utiliza el misterio como escudo contra el compromiso real.',
        shadowAntidote: 'Expresar la intuición de forma clara, terrenal y comunicable.',
        domains: {
          liderazgo: 'Percepción de lo que el grupo necesita antes de que se exprese.',
          relaciones: 'Espacio de intimidad profunda y empatía intuitiva.',
          crisis: 'Serenidad en la oscuridad y confianza en el renacimiento.',
          creatividad: 'Inspiración simbólica y poesía.',
          paternidad: 'Conexión emocional y validación del mundo interno infantil.',
        },
        balancedBehavior: ['Confía en sus corazonadas', 'Crea espacios de calma'],
        unbalancedBehavior: ['Incomunicación', 'Hipersensibilidad no canalizada'],
        reflectionQuestions: ['¿Qué mensaje me está dando mi intuición que he venido ignorando?'],
        developmentExercises: [
          {
            title: 'Diario de Intuición',
            description: 'Anota las corazonadas o impresiones del día y observa cómo se manifiestan.',
            actionStep: 'Dedica 10 minutos a escuchar tus sensaciones corporales.'
          }
        ]
      },
      universal: {
        name: 'Sacerdote / Sacerdotisa',
        characterTitle: 'El Umbral de lo Sagrado',
        centralQuestion: '¿Cómo conecto con la dimensión interior de la existencia?',
        shortDescription: 'Contemplación, intuición y profundidad espiritual.',
        fullDescription: 'El principio de reverencia y conexión con lo trascendente que habita en todo ser humano.',
        mantra: 'Honro lo sagrado en mí y en todos los seres.',
        strength: 'Introspección y devoción.',
        shadow: 'Fanatismo o desconexión.',
        shadowDescription: 'Pérdida del sentido práctico de la vida.',
        shadowAntidote: 'Espiritualidad encarnada en la acción.',
        domains: {
          liderazgo: 'Valores trascendentes.',
          relaciones: 'Respeto mutuo.',
          crisis: 'Significado profundo.',
          creatividad: 'Expresión del alma.',
          paternidad: 'Educación con amor y reverencia.',
        },
        balancedBehavior: ['Serenidad y presencia'],
        unbalancedBehavior: ['Aislamiento dogmático'],
        reflectionQuestions: ['¿Cómo vivo mi espiritualidad en lo cotidiano?'],
        developmentExercises: [
          {
            title: 'Pausa Sagrada',
            description: 'Una pausa de gratitud antes de las comidas o al comenzar el día.',
            actionStep: 'Agradece tres aspectos de tu vida hoy.'
          }
        ]
      }
    }
  },

  amante: {
    id: 'amante',
    name: 'Amante',
    universalName: 'Amante',
    masculineName: 'El Amante',
    feminineName: 'La Amante',
    emoji: '❤️',
    dimension: 'corazon',
    concepts: ['intimidad', 'vulnerabilidad', 'sensualidad', 'conexión', 'deseo', 'pasión', 'aprecio estético'],
    centralQuestion: '¿Cómo me abro a la intimidad, la belleza y la plenitud del deseo sin perderme a mí mismo?',
    shortDescription: 'La pasión por la vida, la apertura a la vulnerabilidad, el deleite estético y la conexión emocional profunda.',
    fullDescription: 'El arquetipo del Amante despierta la sensorialidad, el afecto y la capacidad de conmoverse ante la belleza. Es el antídoto a la frialdad y el cálculo.',
    mantra: 'Celebro la belleza de la vida y me abro a la intimidad con valentía y respeto.',
    symbol: 'Corazón Radiante & Flor de Loto',
    colorHex: '#10B981',
    characterTitle: 'Intimidad & Conexión',
    strength: 'Empatía exquisita, calidez humana, aprecio de la belleza, pasión vital y vulnerabilidad consciente.',
    shadow: 'Adicto / Hedonista desbordado o Impotente / Desconectado emocional',
    shadowDescription: 'En su polo adictivo busca gratificación inmediata y se pierde en dependencias. En su polo reprimido, cae en la apatía, frialdad y rechazo del placer.',
    shadowAntidote: 'Integrar la disciplina del Guerrero y la dignidad del Rey/Reina para amar con límites sanos.',
    domains: {
      liderazgo: 'Inyecta pasión y propósito humano en los proyectos, enamorando a la comunidad.',
      relaciones: 'Crea vínculos íntimos, nutritivos, tiernos y apasionados.',
      crisis: 'Recuerda que la vida vale la pena y ofrece contención emocional cálida.',
      creatividad: 'Provee el combustible de la pasión estética y la sensibilidad para conmover.',
      paternidad: 'Ofrece afecto físico, ternura incondicional y celebración del gozo de vivir.',
    },
    balancedBehavior: [
      'Expresa sus sentimientos con honestidad y sin vergüenza.',
      'Disfruta de los placeres sencillos con presencia.',
      'Sabe entregarse sin perder su propia identidad.',
      'Aprecia el arte, la música y la naturaleza.'
    ],
    unbalancedBehavior: [
      'Dependencia emocional y miedo atroz al abandono.',
      'Búsqueda compulsiva de estímulos y validación afectiva.',
      'Dramatismo excesivo ante los desengaños.',
      'Frialdad defensiva tras haber sido lastimado.'
    ],
    reflectionQuestions: [
      '¿Qué placeres sencillos estoy postergando por exigencias externas?',
      '¿Estoy amando desde la plenitud o desde la carencia y el miedo a la soledad?',
      '¿Cómo es mi relación con mi propio cuerpo y con el descanso?'
    ],
    developmentExercises: [
      {
        title: 'Cita con la Belleza',
        description: 'Dedica 1 hora a una actividad puramente estética o sensorial (música, cocina, naturaleza).',
        actionStep: 'Apaga el móvil y disfruta de la experiencia con todos tus sentidos.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Pasión + Foco',
        description: 'El Amante aporta el motivo por el cual luchar; el Guerrero defiende ese amor con disciplina.',
        synergyKeyword: 'Corazón Valiente'
      }
    ],
    variants: {
      masculine: {
        name: 'El Amante',
        characterTitle: 'El Custodio de la Sensibilidad y la Pasión',
        centralQuestion: '¿Cómo expreso mi deseo y mi vulnerabilidad con madurez y ternura?',
        shortDescription: 'Intimidad, vulnerabilidad, conexión, deseo y expresión emocional.',
        fullDescription: 'El Amante masculino derriba la armadura de la frialdad, atreviéndose a sentir, conmoverse y conectar desde el corazón sin temor a la vulnerabilidad.',
        mantra: 'Abro mi corazón a la experiencia del amor sin perder mi eje.',
        strength: 'Calidez emocional, pasión creadora y presencia amorosa.',
        shadow: 'Donjuán compulsivo / Hombre frío e inaccesible',
        shadowDescription: 'Usa a otros para validar su ego o se encierra en una armadura insensible.',
        shadowAntidote: 'Cultivar la lealtad y el compromiso afectivo consciente.',
        domains: {
          liderazgo: 'Conexión humana y empatía con el equipo.',
          relaciones: 'Entrega sincera y romanticismo maduro.',
          crisis: 'Contención afectiva.',
          creatividad: 'Expresión artística intensa.',
          paternidad: 'Ternura, abrazos y presencia cariñosa.',
        },
        balancedBehavior: ['Expresa afecto con naturalidad', 'Cuida sus relaciones con dedicación'],
        unbalancedBehavior: ['Infidelidad compulsiva', 'Aislamiento afectivo'],
        reflectionQuestions: ['¿Qué emoción estoy reprimiendo por parecer fuerte?'],
        developmentExercises: [
          {
            title: 'Expresión Emocional Honesta',
            description: 'Expresa aprecio sincero a una persona importante en tu vida.',
            actionStep: 'Dile lo que valoras de ella de forma directa.'
          }
        ]
      },
      feminine: {
        name: 'La Amante',
        characterTitle: 'La Soberana del Deseo, la Belleza y la Sensualidad',
        centralQuestion: '¿Cómo habito mi sensualidad, mi deseo y mi autonomía emocional con plenitud?',
        shortDescription: 'Sensualidad, conexión, deseo, autonomía emocional y relación con el propio cuerpo.',
        fullDescription: 'La Amante femenina celebra el gozo de estar viva, se apropia de su deseo y cultiva su magnetismo personal sin supeditarlo a la mirada ajena.',
        mantra: 'Habito mi cuerpo con placer y celebro la vida con plenitud.',
        strength: 'Magnetismo, vitalidad, sensualidad sana y deleite estético.',
        shadow: 'Seductora manipuladora / Desconexión del propio cuerpo',
        shadowDescription: 'Usa la seducción para controlar o suprime su sensualidad por culpa.',
        shadowAntidote: 'Honrar el deseo como una fuerza sagrada de conexión y autoexpresión.',
        domains: {
          liderazgo: 'Inspiración magnética y pasión contagiosa.',
          relaciones: 'Intimidad profunda y celebración de la sensualidad.',
          crisis: 'Capacidad de encontrar belleza incluso en el dolor.',
          creatividad: 'Creación artística sensorial y deslumbrante.',
          paternidad: 'Transmisión del amor por el cuerpo y la alegría.',
        },
        balancedBehavior: ['Disfruta de su sensualidad sin culpa', 'Ama con libertad y respeto'],
        unbalancedBehavior: ['Búsqueda compulsiva de atención', 'Vergüenza corporal'],
        reflectionQuestions: ['¿Cómo me relaciono con el placer y el autocuidado en mi rutina?'],
        developmentExercises: [
          {
            title: 'Celebración Sensorial',
            description: 'Haz algo que reconecte tu cuerpo con el deleite (baño aromático, baile, masaje).',
            actionStep: 'Dedica 30 minutos a habitar tu cuerpo con gratitud.'
          }
        ]
      },
      universal: {
        name: 'Amante',
        characterTitle: 'La Fuerza del Amor y la Conexión',
        centralQuestion: '¿Cómo abro mi vida al amor y la belleza?',
        shortDescription: 'Afecto, vulnerabilidad, arte y celebración de la vida.',
        fullDescription: 'El principio de vinculación humana, compasión y aprecio estético.',
        mantra: 'Amo con libertad y celebro la belleza.',
        strength: 'Empatía y pasión vital.',
        shadow: 'Adicción afectiva o frialdad.',
        shadowDescription: 'Pérdida de límites o cerrazón emocional.',
        shadowAntidote: 'Amor consciente con respeto propio.',
        domains: {
          liderazgo: 'Cultura de cuidado humano.',
          relaciones: 'Intimidad y escucha.',
          crisis: 'Apoyo emocional.',
          creatividad: 'Sensibilidad artística.',
          paternidad: 'Afecto incondicional.',
        },
        balancedBehavior: ['Calidez y empatía'],
        unbalancedBehavior: ['Dependencia emocional'],
        reflectionQuestions: ['¿Dónde puedo poner más amor hoy?'],
        developmentExercises: [
          {
            title: 'Acto de Ternura',
            description: 'Realiza un gesto de bondad sin esperar retribución.',
            actionStep: 'Hazlo hoy.'
          }
        ]
      }
    }
  }
};
