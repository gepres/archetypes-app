import { Archetype, ArchetypeId, DimensionId, DimensionInfo } from '../types';

export const DIMENSIONS: Record<DimensionId, DimensionInfo> = {
  mente: {
    id: 'mente',
    name: 'Mente',
    subtitle: 'Claridad, verdad y comprensión estratégica',
    description: 'La dimensión del discernimiento, la búsqueda de patrones y la sabiduría analítica.',
    color: '#3B82F6', // sapphire blue
    archetypes: ['mago', 'sabio'],
  },
  accion: {
    id: 'accion',
    name: 'Acción',
    subtitle: 'Coraje, movimiento y transformación activa',
    description: 'La dimensión del impacto en el mundo físico, los límites, la aventura y la superación.',
    color: '#EF4444', // crimson red
    archetypes: ['guerrero', 'heroe', 'rebelde', 'explorador'],
  },
  corazon: {
    id: 'corazon',
    name: 'Corazón',
    subtitle: 'Conexión, empatía y disfrute de la vida',
    description: 'La dimensión de la sensibilidad humana, el cuidado comunitario, el afecto y la ligereza.',
    color: '#10B981', // emerald green
    archetypes: ['amante', 'cuidador', 'bufon'],
  },
  construccion: {
    id: 'construccion',
    name: 'Construcción',
    subtitle: 'Orden, legado y manifestación tangible',
    description: 'La dimensión de la arquitectura social, la estructura, la nutrición del futuro y la obra.',
    color: '#D6A84F', // gold / ochre
    archetypes: ['rey', 'padre', 'creador'],
  },
};

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  rey: {
    id: 'rey',
    name: 'Rey',
    emoji: '👑',
    dimension: 'construccion',
    concepts: ['liderazgo', 'orden', 'responsabilidad', 'estabilidad', 'visión', 'integración', 'autoridad interior'],
    centralQuestion: '¿Cómo puedo poner orden en mi mundo?',
    shortDescription: 'El soberano interior que bendice, organiza el reino y asume la responsabilidad del conjunto.',
    fullDescription: 'El arquetipo del Rey representa el centro organizador de la psique. No es el déspota que domina por la fuerza, sino el soberano sereno que crea un espacio seguro donde otros pueden prosperar. Su función primordial es mantener el orden cósmico y ético, bendecir el talento ajeno, cultivar la visión a largo plazo y tomar decisiones difíciles sin perder la compostura.',
    mantra: 'Gobierno mi reino interior con justicia, serenidad y visión generosa.',
    symbol: 'Corona de Oro & Cetro de Integración',
    colorHex: '#D6A84F',
    strength: 'Capacidad innata para liderar, organizar el caos, mediar en conflictos y asumir la responsabilidad última de los proyectos y relaciones.',
    shadow: 'Tirano o Rey Débil',
    shadowDescription: 'En su polo activo, se vuelve un tirano autoritario, incapaz de escuchar y temeroso de perder el control. En su polo pasivo (rey débil), abdica de sus deberes, pospone decisiones cruciales y permite que el caos devore su entorno.',
    shadowAntidote: 'Cultivar la humildad y la escucha activa: convocar al Amante para recordar la empatía y al Mago para revisar los propios puntos ciegos.',
    domains: {
      liderazgo: 'Provee claridad de rumbo, define metas éticas y empodera a sus colaboradores bendiciendo sus talentos.',
      relaciones: 'Establece un entorno de confianza y lealtad donde los límites protegen la intimidad y la estabilidad.',
      crisis: 'Mantiene el pulso firme, evita el pánico colectivo y toma decisiones estratégicas con visión a largo plazo.',
      creatividad: 'Estructura los recursos y el tiempo necesarios para que las obras maestras maduren sin dispersión.',
      paternidad: 'Ofrece un marco de referencia seguro, estabilidad emocional y validación incondicional a las nuevas generaciones.'
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
        actionStep: 'Escribe en tu cuaderno tus tres prioridades estratégicas y una decisión difícil que has estado postergando.'
      },
      {
        title: 'El Acto de Bendición',
        description: 'Reconoce genuinamente el esfuerzo o valor de una persona en tu entorno sin buscar nada a cambio.',
        actionStep: 'Envía un mensaje o mantén una conversación honesta validando el talento o perseverancia de un colega o ser querido.'
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
        description: 'El Amante evita que el Rey se vuelva distante e inhumano, mientras el Rey da un contenedor seguro a la pasión.',
        synergyKeyword: 'Liderazgo Consciente'
      },
      {
        partnerId: 'mago',
        title: 'Gobierno + Sabiduría Oculta',
        description: 'El Mago ofrece análisis de patrones y comprensión técnica para que las decisiones del Rey sean lúcidas.',
        synergyKeyword: 'Estrategia de Estado'
      }
    ]
  },

  guerrero: {
    id: 'guerrero',
    name: 'Guerrero',
    emoji: '⚔️',
    dimension: 'accion',
    concepts: ['disciplina', 'acción', 'coraje', 'límites', 'perseverancia', 'determinación', 'foco'],
    centralQuestion: '¿Qué debo hacer aunque sea difícil?',
    shortDescription: 'La fuerza de voluntad focalizada, la disciplina inquebrantable y la capacidad de defender los límites sagrados.',
    fullDescription: 'El Guerrero encarna la energía de la acción decidida y la lealtad a una causa superior. No busca la violencia por la violencia, sino la maestría de su propio cuerpo y mente. Conoce sus límites, respeta a su oponente y está dispuesto a soportar la incomodidad presente en pos de una victoria noble.',
    mantra: 'Actúo con valentía y disciplina; mis límites son mi soberanía.',
    symbol: 'Espada de Acero Templado & Escudo de Límites',
    colorHex: '#EF4444',
    strength: 'Perseverancia frente a la adversidad, valentía para encarar lo incómodo y capacidad de decir "no" con firmeza.',
    shadow: 'Sadismo / Rigidez o Masoquismo / Impotencia',
    shadowDescription: 'En su sombra activa, confunde fuerza con crueldad, ve enemigos en todas partes y agota sus recursos en batallas estériles. En su sombra pasiva, no sabe defenderse, se somete y acumula resentimiento silenciado.',
    shadowAntidote: 'Alinear la espada con una causa amorosa (conectar con el Amante y el Cuidador) para evitar que la disciplina se convierta en castigo.',
    domains: {
      liderazgo: 'Ejecuta con rigor, no se rinde ante los obstáculos y protege al equipo frente a agresiones externas.',
      relaciones: 'Establece límites transparentes y defiende los acuerdos mutuos con honestidad frontal.',
      crisis: 'Entra en modo resolutivo inmediato, reduciendo el ruido mental y priorizando la acción eficaz.',
      creatividad: 'Aporta la rutina y la disciplina necesarias para convertir una idea dispersa en un producto terminado.',
      paternidad: 'Modela la perseverancia física y moral, enseñando a defenderse y a respetar el esfuerzo ajeno.'
    },
    balancedBehavior: [
      'Acepta el esfuerzo y la disciplina como herramientas de libertad.',
      'Sabe cuándo pelear una batalla y cuándo retirarse con dignidad.',
      'Defiende a los vulnerables sin buscar laureles de vanidad.',
      'Mantiene una rutina física y mental exigente pero sostenible.'
    ],
    unbalancedBehavior: [
      'Inflexibilidad y juicio severo ante los errores propios y ajenos.',
      'Tendencia a transformar cualquier conversación en una disputa de poder.',
      'Negación del dolor físico o emocional por miedo a parecer débil.',
      'Dificultad para relajarse y disfrutar del descanso sin culpa.'
    ],
    reflectionQuestions: [
      '¿Qué conversación difícil o decisión postergada estoy evitando por miedo al conflicto?',
      '¿Estoy usando mi disciplina como puente hacia mis metas o como castigo hacia mí mismo?',
      '¿Dónde necesito levantar un límite innegociable para proteger mi paz mental?'
    ],
    developmentExercises: [
      {
        title: 'El Límite Limpio',
        description: 'Practica decir "no" a una petición secundaria que compromete tu energía vital.',
        actionStep: 'Expresa una negativa cortés, breve y firme sin dar excesivas justificaciones defensivas.'
      },
      {
        title: 'Dosis de Incomodidad Voluntaria',
        description: 'Entrena la tolerancia al esfuerzo con una práctica física o mental rigurosa.',
        actionStep: 'Realiza 20 minutos de ejercicio intenso o 45 minutos de trabajo en profunda concentración sin distracciones.'
      }
    ],
    synergies: [
      {
        partnerId: 'rey',
        title: 'Espada + Corona',
        description: 'El Guerrero ejecuta fielmente la visión ética del Rey sin desbordarse en tiranía.',
        synergyKeyword: 'Impecabilidad'
      },
      {
        partnerId: 'amante',
        title: 'Fuerza + Ternura',
        description: 'El Amante ablanda la armadura del Guerrero y le recuerda por quién o por qué vale la pena luchar.',
        synergyKeyword: 'Coraje del Corazón'
      },
      {
        partnerId: 'sabio',
        title: 'Acción + Estrategia',
        description: 'El Sabio enseña al Guerrero a no gastar su energía en batallas inútiles.',
        synergyKeyword: 'Guerrero Estratega'
      }
    ]
  },

  mago: {
    id: 'mago',
    name: 'Mago',
    emoji: '🔮',
    dimension: 'mente',
    concepts: ['transformación', 'conocimiento profundo', 'estrategia', 'visión oculta', 'tecnología', 'intuición', 'iniciación'],
    centralQuestion: '¿Qué leyes ocultas rigen esta situación?',
    shortDescription: 'El maestro del conocimiento especializado, la alquimia interior y la comprensión de patrones invisibles.',
    fullDescription: 'El Mago es el arquetipo del pensador profundo, el investigador, el terapeuta y el estratega. Posee la capacidad de ver más allá de las apariencias superficiales, comprendiendo cómo los sistemas invisibles (psicológicos, tecnológicos, relacionales) influyen en los resultados tangibles.',
    mantra: 'Comprendo las causas profundas y transformo la realidad desde el entendimiento.',
    symbol: 'Báculo de Cristal & Ojo de la Sabiduría Oculta',
    colorHex: '#3B82F6',
    strength: 'Capacidad de diagnosticar problemas complejos, aprender habilidades avanzadas y catalizar transformaciones profundas.',
    shadow: 'Manipulador / Cínico o Inocente Desconectado',
    shadowDescription: 'En su sombra activa, usa su conocimiento para manipular a otros desde las sombras o aislarse en una soberbia intelectual cínica. En su sombra pasiva, se desconecta de la realidad práctica viviendo en teorías que nunca aterriza.',
    shadowAntidote: 'Poner el conocimiento al servicio de la comunidad (convocar al Cuidador) y actuar en el mundo físico (convocar al Guerrero).',
    domains: {
      liderazgo: 'Diseña estrategias innovadoras, anticipa riesgos sistémicos y guía transiciones complejas.',
      relaciones: 'Comprende las dinámicas subyacentes del vínculo y ayuda a disolver malentendidos inconscientes.',
      crisis: 'Analiza la raíz del problema con frialdad analítica para hallar soluciones de raíz no evidentes.',
      creatividad: 'Domina los principios técnicos y simbólicos para llevar la innovación a niveles revolucionarios.',
      paternidad: 'Estimula la curiosidad intelectual de los hijos y les enseña a pensar críticamente por sí mismos.'
    },
    balancedBehavior: [
      'Comparte su sabiduría con generosidad pedagógica.',
      'Sabe aplicar teorías abstractas a desafíos cotidianos concretos.',
      'Reconoce los límites de su propio conocimiento con honestidad intelectual.',
      'Maneja la tecnología y la información con ética irreprochable.'
    ],
    unbalancedBehavior: [
      'Uso de jerga compleja para intimidar o mantener distancia emocional.',
      'Desdén por la experiencia práctica o la sencillez de los demás.',
      'Manipulación indirecta de situaciones para beneficio propio.',
      'Aislamiento excesivo en su torre de marfil teórica.'
    ],
    reflectionQuestions: [
      '¿Estoy usando mi conocimiento para conectar y aportar valor o para sentirme superior?',
      '¿Qué patrón repetitivo en mi vida sigo sin querer mirar de frente?',
      '¿En qué ámbito necesito pasar de la teoría y la planificación a la ejecución?'
    ],
    developmentExercises: [
      {
        title: 'Mapeo de Patrones Inconscientes',
        description: 'Identifica una situación repetitiva que te causa malestar y analiza sus causas subyacentes.',
        actionStep: 'Escribe el detonante, tu reacción automática y la creencia oculta que sostiene ese ciclo.'
      },
      {
        title: 'Transmisión Generosa',
        description: 'Explica un concepto complejo a alguien de manera simple y accesible.',
        actionStep: 'Enseña un truco, método o aprendizaje útil a un compañero sin asumir un tono de superioridad.'
      }
    ],
    synergies: [
      {
        partnerId: 'creador',
        title: 'Visión + Materialización',
        description: 'El Mago comprende la estructura oculta y el Creador la convierte en una obra tangible.',
        synergyKeyword: 'Alquimia Productiva'
      },
      {
        partnerId: 'rey',
        title: 'Consejo + Soberanía',
        description: 'El Mago actúa como el sabio consejero que ilumina el camino del Rey sin usurpar el trono.',
        synergyKeyword: 'Lucidez de Gobierno'
      },
      {
        partnerId: 'cuidador',
        title: 'Conocimiento + Compasión',
        description: 'El Cuidador orienta el conocimiento del Mago hacia la sanación y el bienestar común.',
        synergyKeyword: 'Sanador Consciente'
      }
    ]
  },

  amante: {
    id: 'amante',
    name: 'Amante',
    emoji: '🔥',
    dimension: 'corazon',
    concepts: ['pasión', 'sensibilidad', 'conexión', 'belleza', 'empatía', 'vitalidad', 'vulnerabilidad'],
    centralQuestion: '¿Cómo puedo conectar con lo bello y lo vivo?',
    shortDescription: 'La fuente de vitalidad sensorial, la empatía profunda y la devoción por la belleza y la intimidad.',
    fullDescription: 'El Amante es el arquetipo de la vitalidad desbordante, el placer de los sentidos, la intimidad afectiva y la apreciación estética del mundo. Siente la vida con intensidad, rechaza la frialdad utilitaria y busca fundirse con lo que ama: una pareja, el arte, la naturaleza o un ideal sublime.',
    mantra: 'Abro mi corazón a la belleza, la intimidad auténtica y el gozo de estar vivo.',
    symbol: 'Llama Sagrada & Cáliz de Conexión',
    colorHex: '#E11D48',
    strength: 'Sensibilidad para percibir el clima emocional, capacidad de amar sin reservas y apreciación del gozo cotidiano.',
    shadow: 'Adicto / Obsesivo o Frígido / Desconectado',
    shadowDescription: 'En su sombra activa, cae en la adicción al placer efímero, la dependencia afectiva o el drama romántico constante. En su sombra pasiva, apaga su cuerpo y emociones, volviéndose frío, seco y resentido con la alegría.',
    shadowAntidote: 'Convocar al Rey y al Guerrero para crear una estructura de contención y discernimiento que no disperse su pasión.',
    domains: {
      liderazgo: 'Humaniza las organizaciones, inspira con pasión contagiosa y cuida el clima afectivo del equipo.',
      relaciones: 'Nutre la complicidad íntima, la ternura, el juego sensual y la escucha empática profunda.',
      crisis: 'Recuerda el valor de la vida y el apoyo mutuo, evitando que el equipo caiga en la deshumanización.',
      creatividad: 'Aporta el fuego visceral y la fascinación estética que hacen que una creación conmueva el alma.',
      paternidad: 'Brinda afecto físico, calidez, abrazos y valida los sentimientos de los hijos con profunda dulzura.'
    },
    balancedBehavior: [
      'Celebra la belleza en la música, la comida, el arte y la naturaleza.',
      'Expresa sus sentimientos con honestidad y vulnerabilidad madura.',
      'Disfruta de la intimidad sin perder su propia identidad.',
      'Sintoniza con las necesidades emocionales de las personas que ama.'
    ],
    unbalancedBehavior: [
      'Búsqueda compulsiva de estímulos placenteros para tapar el vacío interior.',
      'Idealización de personas que luego decepcionan catastróficamente.',
      'Manipulación emocional a través de la culpa o el desborde dramático.',
      'Dificultad para tolerar la sobriedad, la rutina o la disciplina.'
    ],
    reflectionQuestions: [
      '¿En qué áreas de mi vida me he vuelto frío, utilitario o desconectado del disfrute?',
      '¿Estoy buscando en la validación externa un amor que necesito darme a mí mismo?',
      '¿Qué experiencia de belleza (arte, naturaleza, música) necesito regalarme hoy?'
    ],
    developmentExercises: [
      {
        title: 'Presencia Sensorial Plena',
        description: 'Dedica 15 minutos a una experiencia estética o gastronómica con los cinco sentidos despiertos.',
        actionStep: 'Disfruta de una comida, un paseo al atardecer o una pieza musical sin mirar el teléfono móvil.'
      },
      {
        title: 'Expresión Afectiva Clara',
        description: 'Comunica un sentimiento de aprecio o gratitud sincera a alguien importante en tu vida.',
        actionStep: 'Dile a un amigo o ser querido qué cualidad suya admiras profundamente y por qué valoras su presencia.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Pasión + Determinación',
        description: 'El Amante aporta el propósito del corazón y el Guerrero aporta la disciplina para defenderlo.',
        synergyKeyword: 'Guerrero del Corazón'
      },
      {
        partnerId: 'sabio',
        title: 'Emoción + Claridad',
        description: 'El Sabio aporta templanza a los desbordes del Amante y el Amante llena de calidez la lucidez del Sabio.',
        synergyKeyword: 'Sabiduría Amorosa'
      },
      {
        partnerId: 'bufon',
        title: 'Gozo + Ligereza',
        description: 'El Bufón enseña al Amante a no tomarse el drama sentimental con excesiva gravedad.',
        synergyKeyword: 'Alegría de Vivir'
      }
    ]
  },

  padre: {
    id: 'padre',
    name: 'Padre',
    emoji: '🏛️',
    dimension: 'construccion',
    concepts: ['protección', 'guía', 'nutrición', 'legado', 'sostén', 'ejemplo', 'madurez generativa'],
    centralQuestion: '¿Qué condiciones puedo crear para que los demás crezcan?',
    shortDescription: 'El sostén generativo que brinda protección, guía moral y crea las condiciones para el florecimiento de otros.',
    fullDescription: 'El arquetipo del Padre representa la madurez generativa: el hombre que ha dejado de ser el centro del universo para convertirse en el custodio de las generaciones venideras. Su presencia brinda seguridad, paciencia ante el error ajeno y una guía firme pero compasiva.',
    mantra: 'Sostengo con firmeza y nutro con paciencia el crecimiento de quienes me rodean.',
    symbol: 'Columna de Piedra & Semilla de Legado',
    colorHex: '#CA8A04',
    strength: 'Capacidad de brindar seguridad emocional, orientar sin asfixiar y comprometerse con el bienestar a largo plazo.',
    shadow: 'Patriarca Castrador o Padre Ausente',
    shadowDescription: 'En su sombra activa, anula la autonomía de los demás imponiendo sus deseos como ley absoluta. En su sombra pasiva (padre ausente), se desentiende de sus responsabilidades y deja a los suyos en la orfandad emocional.',
    shadowAntidote: 'Aprender a soltar el control y celebrar la individualidad ajena (convocar al Explorador y al Rebelde).',
    domains: {
      liderazgo: 'Actúa como mentor paciente que desarrolla el potencial de sus colaboradores a largo plazo.',
      relaciones: 'Provee un ancla de serenidad y estabilidad en tiempos de tormenta o incertidumbre.',
      crisis: 'Absorbe la ansiedad colectiva y ofrece un refugio seguro desde donde recomenzar.',
      creatividad: 'Construye instituciones, proyectos y legados diseñados para perdurar en el tiempo.',
      paternidad: 'Acompaña el desarrollo de los hijos con presencia amorosa, límites claros y estímulo continuo.'
    },
    balancedBehavior: [
      'Escucha con paciencia antes de emitir un consejo o juicio.',
      'Sabe cuándo intervenir para proteger y cuándo dar espacio para que el otro aprenda de sus errores.',
      'Mantiene la palabra empeñada como base de la confianza.',
      'Enseña con el ejemplo más que con sermones vacíos.'
    ],
    unbalancedBehavior: [
      'Tratar a los adultos a su alrededor como si fueran niños indefensos.',
      'Resentimiento por no recibir el reconocimiento o la sumisión que cree merecer.',
      'Ausencia emocional oculta tras la provisión puramente material.',
      'Dificultad para pedir ayuda o admitir que se siente superado.'
    ],
    reflectionQuestions: [
      '¿Estoy guiando para que otros sean libres y fuertes o para que dependan de mí?',
      '¿Qué legado de valores y presencia estoy construyendo hoy para mi entorno?',
      '¿En qué aspecto de mi vida necesito mostrar mayor madurez y asumir la responsabilidad?'
    ],
    developmentExercises: [
      {
        title: 'Espacio de Escucha Sin Juicio',
        description: 'Ofrece 20 minutos de escucha atenta a alguien que esté atravesando un dilema sin apresurarte a solucionar su vida.',
        actionStep: 'Haz preguntas abiertas que ayuden a la otra persona a encontrar su propia respuesta.'
      },
      {
        title: 'Carta de Principios de Vida',
        description: 'Redacta los 5 valores éticos esenciales que deseas que guíen tus decisiones cotidianas.',
        actionStep: 'Coloca esta lista en un lugar visible de tu espacio de trabajo como recordatorio moral.'
      }
    ],
    synergies: [
      {
        partnerId: 'cuidador',
        title: 'Sostén + Ternura',
        description: 'El Padre provee la estructura y el Cuidador aporta la calidez que sana las heridas.',
        synergyKeyword: 'Nutrición Integral'
      },
      {
        partnerId: 'rey',
        title: 'Familia + Reino',
        description: 'El Padre asegura que las decisiones del Rey mantengan siempre un rostro humano y generativo.',
        synergyKeyword: 'Custodia Generosa'
      },
      {
        partnerId: 'explorador',
        title: 'Raíz + Alas',
        description: 'El Padre da la base segura para que el Explorador se atreva a aventurarse en lo desconocido.',
        synergyKeyword: 'Crecimiento Seguro'
      }
    ]
  },

  cuidador: {
    id: 'cuidador',
    name: 'Cuidador',
    emoji: '🛡️',
    dimension: 'corazon',
    concepts: ['servicio', 'compasión', 'generosidad', 'sanación', 'altruismo', 'atención', 'solidaridad'],
    centralQuestion: '¿Cómo puedo aliviar el sufrimiento de mi entorno?',
    shortDescription: 'La devoción altruista por el bienestar ajeno, la generosidad desinteresada y el refugio para los necesitados.',
    fullDescription: 'El Cuidador es la personificación de la compasión en acción. Siente una llamada natural a proteger a los vulnerables, sanar heridas y ofrecer hospitalidad. Su fuerza reside en su generosidad y en su capacidad de poner sus talentos al servicio del bien común.',
    mantra: 'Sirvo con amor y cuido también de mi propio templo interior.',
    symbol: 'Mano Protectora & Escudo de Compasión',
    colorHex: '#10B981',
    strength: 'Empatía para detectar necesidades ajenas, vocación de servicio genuina y calidez reconfortante.',
    shadow: 'Mártir / Resentido o Salvador Asfixiante',
    shadowDescription: 'En su sombra activa, asfixia a los demás haciéndolos dependientes para sentirse indispensable. En su sombra pasiva (el mártir), se desgasta hasta la extenuación y luego cobra la factura con quejas y amargura.',
    shadowAntidote: 'Aprender a ponerse en primer lugar (convocar al Guerrero para poner límites al autosacrificio).',
    domains: {
      liderazgo: 'Cuida el bienestar humano del equipo, previene el burnout y fomenta una cultura solidaria.',
      relaciones: 'Brinda apoyo incondicional en momentos de enfermedad o dolor, recordando la ternura.',
      crisis: 'Organiza la ayuda humanitaria y la contención psicológica con rapidez y entrega.',
      creatividad: 'Crea proyectos sociales, comunitarios o de salud orientados a generar un impacto humano real.',
      paternidad: 'Atiende con paciencia las necesidades físicas y emocionales de los hijos desde la dulzura.'
    },
    balancedBehavior: [
      'Cuida de sí mismo antes de salir a cuidar a los demás.',
      'Ayuda sin esperar aplausos ni generar deudas de gratitud.',
      'Respeta los límites y la dignidad de la persona a la que acompaña.',
      'Sabe cuándo delegar para no caer en el agotamiento crónico.'
    ],
    unbalancedBehavior: [
      'Dificultad patológica para decir "no" a cualquier pedido de ayuda.',
      'Sentimiento de culpa por tomarse tiempo para el descanso propio.',
      'Manipulación victimista: "Con todo lo que hago por ti y así me pagas".',
      'Descuido de la salud física y mental propia por atender a terceros.'
    ],
    reflectionQuestions: [
      '¿Estoy cuidando de los demás desde la plenitud o desde el miedo a ser rechazado?',
      '¿Qué necesidad propia estoy desatendiendo por ocuparme de las vidas ajenas?',
      '¿A quién necesito pedirle que asuma su propia responsabilidad en lugar de rescatarlo?'
    ],
    developmentExercises: [
      {
        title: 'El Cuidado hacia Uno Mismo',
        description: 'Dedica una hora exclusivamente a tu propia recuperación física o emocional sin sentir culpa.',
        actionStep: 'Toma un baño relajante, sal a caminar en silencio o prepara tu comida favorita solo para ti.'
      },
      {
        title: 'Ayuda Invisible',
        description: 'Realiza un acto de servicio o generosidad de manera totalmente anónima.',
        actionStep: 'Ayuda a un colega o haz un donativo sin que nadie sepa que fuiste tú el autor.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Amor + Protección',
        description: 'El Cuidador aporta la ternura y el Guerrero los límites necesarios para no ser explotado.',
        synergyKeyword: 'Guardián Compasivo'
      },
      {
        partnerId: 'padre',
        title: 'Refugio + Dirección',
        description: 'El Cuidador sana en el presente y el Padre prepara para el futuro.',
        synergyKeyword: 'Familia Integrada'
      },
      {
        partnerId: 'sabio',
        title: 'Servicio + Discernimiento',
        description: 'El Sabio ayuda al Cuidador a no desperdiciar su energía en causas perdidas o personas tóxicas.',
        synergyKeyword: 'Compasión Inteligente'
      }
    ]
  },

  bufon: {
    id: 'bufon',
    name: 'Bufón',
    emoji: '🃏',
    dimension: 'corazon',
    concepts: ['humor', 'ligereza', 'ironía sagrada', 'desmitificación', 'juego', 'verdad incómoda', 'gozo'],
    centralQuestion: '¿Por qué tomarse todo tan en serio?',
    shortDescription: 'El maestro del humor, la perspectiva liberadora, el juego creativo y la desmitificación de la solemnidad.',
    fullDescription: 'El Bufón es el único arquetipo que tiene permiso para reírse del Rey en su propia cara y decirle la verdad sin ser decapitado. Recuerda que la vida es también un juego cósmico, disuelve el ego rígido mediante la risa y rescata a la psique de la trampa de la solemnidad destructiva.',
    mantra: 'Río con ligereza, abrazo el presente y desmitifico el drama con alegría sabia.',
    symbol: 'Cascabel de Oro & Máscara de la Ironía Sagrada',
    colorHex: '#F59E0B',
    strength: 'Capacidad de distender ambientes tensos, señalar verdades difíciles con gracia y vivir en el aquí y el ahora.',
    shadow: 'Burlón Cínico o Bufón Triste y Evasivo',
    shadowDescription: 'En su sombra activa, usa el sarcasmo hiriente para humillar o destruir sin aportar nada. En su sombra pasiva, utiliza el humor como escudo para evadir el compromiso o huir de sus propios dolores profundos.',
    shadowAntidote: 'Integrar la seriedad ética del Rey y la empatía del Amante para que el humor una en vez de herir.',
    domains: {
      liderazgo: 'Desactiva tensiones absurdas, fomenta la creatividad desinhibida y mantiene al equipo con moral alta.',
      relaciones: 'Aporta frescura, complicidad divertida y evita que la rutina marchite la alegría compartida.',
      crisis: 'Aporta humor negro balsámico que permite sobrellevar la adversidad con resiliencia psicológica.',
      creatividad: 'Rompe convencionalismos aburridos combinando ideas dispares con chispa impredecible.',
      paternidad: 'Juega con los hijos de igual a igual, creando recuerdos de risa pura y complicidad inolvidable.'
    },
    balancedBehavior: [
      'Sabe reírse de sí mismo antes que de los demás.',
      'Usa el humor para incluir y relajar, no para humillar.',
      'Sabe cuándo es momento de callar y asumir la seriedad de una situación.',
      'Vive con espontaneidad sin perder el respeto por los demás.'
    ],
    unbalancedBehavior: [
      'Incapacidad para mantener una conversación profunda o seria.',
      'Sarcasmo cruel disfrazado de "era solo una broma".',
      'Payasadas constantes para llamar la atención a toda costa.',
      'Evasión de responsabilidades bajo el pretexto de que "nada importa tanto".'
    ],
    reflectionQuestions: [
      '¿En qué situación me estoy tomando a mí mismo con una solemnidad ridícula?',
      '¿Estoy usando el humor para conectar o para evitar que me conozcan de verdad?',
      '¿Cómo puedo llevar más juego y ligereza a mi rutina cotidiana hoy?'
    ],
    developmentExercises: [
      {
        title: 'Auto-Risa Terapéutica',
        description: 'Recuerda una metedura de pata reciente que te dio vergüenza y cuéntala como una anécdota divertida.',
        actionStep: 'Escribe la historia exagerando los elementos cómicos hasta que te cause una sonrisa genuina.'
      },
      {
        title: 'Momento de Juego Puro',
        description: 'Dedica 20 minutos a una actividad puramente lúdica sin meta de productividad.',
        actionStep: 'Dibuja un garabato absurdo, baila una canción alegre o juega un juego de mesa con alguien.'
      }
    ],
    synergies: [
      {
        partnerId: 'rey',
        title: 'Verdad + Poder',
        description: 'El Bufón mantiene humilde al Rey señalando sus errores con gracia.',
        synergyKeyword: 'Humildad Soberana'
      },
      {
        partnerId: 'guerrero',
        title: 'Ligereza + Disciplina',
        description: 'El Bufón evita que el Guerrero se vuelva un autómata amargado y rígido.',
        synergyKeyword: 'Guerrero Alegre'
      },
      {
        partnerId: 'sabio',
        title: 'Paradoja + Filosofía',
        description: 'El Bufón y el Sabio se entienden en la paradoja: ambos saben que lo absoluto es relativo.',
        synergyKeyword: 'Sabiduría Zen'
      }
    ]
  },

  explorador: {
    id: 'explorador',
    name: 'Explorador',
    emoji: '🧭',
    dimension: 'accion',
    concepts: ['libertad', 'autenticidad', 'aventura', 'búsqueda', 'independencia', 'fronteras', 'auto-descubrimiento'],
    centralQuestion: '¿Qué hay más allá de mis horizontes conocidos?',
    shortDescription: 'El peregrino que busca su propia verdad, expande las fronteras y desafía las zonas de confort.',
    fullDescription: 'El Explorador es el arquetipo de la búsqueda incesante de autenticidad y libertad. Rechaza la conformidad impuesta y siente la llamada a cruzar fronteras físicas, intelectuales y espirituales para descubrir quién es él realmente lejos de las expectativas sociales.',
    mantra: 'Camino hacia lo desconocido con curiosidad indomable y fidelidad a mi propia verdad.',
    symbol: 'Brújula de Latón & Botas del Peregrino',
    colorHex: '#0284C7',
    strength: 'Independencia de criterio, valentía para romper moldes y capacidad de reinventarse en territorios nuevos.',
    shadow: 'Eterno Inconforme o Marginado Solitario',
    shadowDescription: 'En su sombra activa, huye perpetuamente de cualquier compromiso o raíz por temor a perder su libertad ficticia. En su sombra pasiva, se aísla en una soledad amarga sintiéndose incomprendido por el mundo.',
    shadowAntidote: 'Echar raíces deliberadas sin perder el espíritu nómada (convocar al Rey y al Padre).',
    domains: {
      liderazgo: 'Abre nuevos mercados, explora tecnologías disruptivas y cuestiona dogmas organizacionales.',
      relaciones: 'Respeta la individualidad de la pareja, promoviendo espacios de crecimiento personal autónomo.',
      crisis: 'No teme reiniciar desde cero en un entorno desconocido cuando lo antiguo ha colapsado.',
      creatividad: 'Experimenta con estilos vanguardistas y fuentes de inspiración de culturas lejanas.',
      paternidad: 'Anima a los hijos a viajar, conocer mundo y forjar su propia identidad sin dogmas heredados.'
    },
    balancedBehavior: [
      'Disfruta de la soledad y la naturaleza como fuentes de recarga vital.',
      'Se mantiene fiel a sus valores esenciales aunque la masa piense distinto.',
      'Sabe cuándo es momento de explorar y cuándo es momento de regresar al hogar.',
      'Aprende de cada cultura y persona sin juzgar desde el prejuicio.'
    ],
    unbalancedBehavior: [
      'Incapacidad para echar raíces o construir relaciones duraderas.',
      'Aburrimiento crónico ante la rutina necesaria para consolidar un proyecto.',
      'Falsa sensación de superioridad moral por ser "diferente" o "antisistema".',
      'Huida constante ante los primeros signos de dificultad o conflicto.'
    ],
    reflectionQuestions: [
      '¿En qué ámbito de mi vida me he acomodado en una zona de confort que marchita mi vitalidad?',
      '¿Estoy explorando por verdadera curiosidad o huyendo de una responsabilidad que me asusta?',
      '¿Qué nuevo territorio (un libro, un lugar, una habilidad) me llama a expandir mis horizontes?'
    ],
    developmentExercises: [
      {
        title: 'Micro-Aventura en Solitario',
        description: 'Ve a un lugar de tu ciudad o entorno natural al que nunca hayas ido antes completamente solo.',
        actionStep: 'Pasea sin mapa predeterminado prestando atención a lo que despierta tu curiosidad.'
      },
      {
        title: 'Desafío a la Inercia de Opinión',
        description: 'Lee o investiga a fondo una postura opuesta a tus creencias habituales con mente de principiante.',
        actionStep: 'Anota dos argumentos válidos de esa perspectiva que no habías considerado previamente.'
      }
    ],
    synergies: [
      {
        partnerId: 'padre',
        title: 'Aventura + Hogar',
        description: 'El Padre provee el ancla y el Explorador trae historias y descubrimientos del mundo exterior.',
        synergyKeyword: 'Viaje con Retorno'
      },
      {
        partnerId: 'creador',
        title: 'Descubrimiento + Obra',
        description: 'El Explorador recolecta experiencias vírgenes y el Creador las transforma en arte.',
        synergyKeyword: 'Innovación Pionera'
      },
      {
        partnerId: 'rebelde',
        title: 'Ruptura + Horizonte',
        description: 'El Rebelde rompe la jaula y el Explorador encuentra el nuevo camino en el bosque.',
        synergyKeyword: 'Vanguardia Libre'
      }
    ]
  },

  creador: {
    id: 'creador',
    name: 'Creador',
    emoji: '🎨',
    dimension: 'construccion',
    concepts: ['imaginación', 'originalidad', 'manifestación', 'arte', 'innovación', 'belleza tangible', 'oficio'],
    centralQuestion: '¿Qué puedo dar a luz que antes no existía?',
    shortDescription: 'El artífice de la belleza, la originalidad y la manifestación tangible de ideas en el mundo real.',
    fullDescription: 'El Creador es el arquetipo del visionario artístico, el artesano y el innovador que transforma la materia prima en una obra con alma. Posee la necesidad visceral de expresarse a través de sus creaciones y de dejar una huella de belleza y sentido en el mundo.',
    mantra: 'Materializo mi visión interior con maestría, paciencia y autenticidad creadora.',
    symbol: 'Cincel de Escultor & Lienzo de la Creación',
    colorHex: '#8B5CF6',
    strength: 'Imaginación desbordante, gusto estético refinado y perseverancia artesanal para perfeccionar su obra.',
    shadow: 'Perfeccionista Paralizado o Creador Destructivo',
    shadowDescription: 'En su sombra activa, nunca publica su trabajo por un perfeccionismo neurótico destructivo. En su sombra pasiva, cae en el caos absoluto, acumulando proyectos inacabados y viviendo en un desorden que asfixia a los suyos.',
    shadowAntidote: 'Convocar al Guerrero para terminar lo empezado y al Rey para darle una utilidad noble a la obra.',
    domains: {
      liderazgo: 'Diseña la identidad de marca, propone productos revolucionarios e inspira con originalidad.',
      relaciones: 'Expresa su afecto a través de detalles únicos, cartas emotivas y ambientes estéticos.',
      crisis: 'Reinventa procesos obsoletos mediante soluciones ingeniosas y pensamiento lateral.',
      creatividad: 'Su hábitat natural: da vida a obras visuales, literarias, técnicas o arquitectónicas memorables.',
      paternidad: 'Fomenta la libre expresión y el talento artístico en los hijos sin imponer moldes rígidos.'
    },
    balancedBehavior: [
      'Termina lo que empieza y sabe cuándo una obra está lista para ser compartida.',
      'Acepta la crítica constructiva como abono para su evolución.',
      'Encuentra inspiración en lo cotidiano y en el trabajo constante más que en la musa mágica.',
      'Combina inspiración con maestría técnica disciplinada.'
    ],
    unbalancedBehavior: [
      'Parálisis por análisis: posponer indefinidamente la entrega de un proyecto.',
      'Soberbia de artista incomprendido que desprecia la realidad práctica.',
      'Adicción al proceso de ideación y abandono prematuro en la fase de pulido.',
      'Dependencia obsesiva del aplauso y la validación estética externa.'
    ],
    reflectionQuestions: [
      '¿Qué proyecto creativo tengo a medio hacer que merece ver la luz este mes?',
      '¿Estoy usando el "perfeccionismo" como una máscara elegante para ocultar mi miedo al juicio ajeno?',
      '¿Cómo puedo convertir mi experiencia vital presente en una pieza de valor para otros?'
    ],
    developmentExercises: [
      {
        title: 'El Manifiesto de lo "Suficientemente Bueno"',
        description: 'Toma un proyecto estancado y fija una fecha límite inamovible para publicarlo o compartirlo al 85% de perfección.',
        actionStep: 'Comparte un borrador o avance con 3 personas de confianza y pide retroalimentación específica.'
      },
      {
        title: 'Sesión de Creación Pura sin Crítica',
        description: 'Dedica 30 minutos a escribir, dibujar o prototipar sin permitir que tu editor interno juzgue nada.',
        actionStep: 'Prohíbete borrar o corregir durante la sesión; solo permite que el flujo creativo se exprese.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Arte + Disciplina',
        description: 'El Guerrero asegura que la inspiración del Creador se convierta en una obra finalizada.',
        synergyKeyword: 'Oficio Impecable'
      },
      {
        partnerId: 'mago',
        title: 'Idea + Alquimia',
        description: 'El Mago descifra las leyes invisibles y el Creador les da cuerpo en el lienzo de la realidad.',
        synergyKeyword: 'Diseño Sagrado'
      },
      {
        partnerId: 'amante',
        title: 'Pasión + Estética',
        description: 'El Amante llena de alma y calor la técnica del Creador.',
        synergyKeyword: 'Belleza Viva'
      }
    ]
  },

  sabio: {
    id: 'sabio',
    name: 'Sabio',
    emoji: '📜',
    dimension: 'mente',
    concepts: ['verdad', 'discernimiento', 'sobriedad', 'filosofía', 'perspectiva', 'ecuanimidad', 'templanza'],
    centralQuestion: '¿Cuál es la verdad esencial detrás de las apariencias?',
    shortDescription: 'La búsqueda desapasionada de la verdad, la perspectiva panorámica y la ecuanimidad ante los vaivenes de la vida.',
    fullDescription: 'El Sabio es el arquetipo del filósofo reflexivo, el juez ecuánime y el contemplador de la existencia. No se deja arrastrar por las modas efímeras ni por las pasiones ciegas del momento; busca los principios universales que resisten el paso del tiempo.',
    mantra: 'Busco la verdad con serenidad, discernimiento y una mente abierta a lo esencial.',
    symbol: 'Pergamino Antiguo & Lámpara de la Verdad',
    colorHex: '#6366F1',
    strength: 'Discernimiento objetivo, serenidad ante el caos y capacidad de sintetizar grandes volúmenes de experiencia en principios claros.',
    shadow: 'Dogmático Ciego o Espectador Inerte',
    shadowDescription: 'En su sombra activa, se convierte en un dogmático pedante que cree poseer la verdad absoluta. En su sombra pasiva, se queda como un mero espectador frío de la vida que jamás se moja las manos en el barro del mundo.',
    shadowAntidote: 'Conectar con la acción del Guerrero y la calidez del Amante para que la sabiduría sea viva y compasiva.',
    domains: {
      liderazgo: 'Aporta sobriedad ética, previene decisiones precipitadas y ofrece arbitraje imparcial en disputas.',
      relaciones: 'Escucha sin reactividad emocional, aportando perspectiva lúcida ante los dramas cotidianos.',
      crisis: 'Permanece como el ojo calmo en el centro del huracán, recordando que "esto también pasará".',
      creatividad: 'Sintetiza ideas complejas en tratados, máximas o estructuras conceptuales imperecederas.',
      paternidad: 'Transmite lecciones de vida con calma reflexiva, enseñando a los hijos a no ser esclavos de sus impulsos.'
    },
    balancedBehavior: [
      'Acepta el cambio y la incertidumbre como leyes naturales del cosmos.',
      'Mantiene una práctica regular de lectura, silencio y meditación.',
      'No confunde información o datos con verdadera sabiduría vivida.',
      'Sabe callar cuando las palabras solo añadirían confusión al momento.'
    ],
    unbalancedBehavior: [
      'Frialdad y desapego patológico que lastima a sus seres queridos.',
      'Rigidez conceptual que rechaza cualquier evidencia nueva que contradiga sus teorías.',
      'Incapacidad para tomar acción rápida en situaciones que requieren urgencia.',
      'Soberbia intelectual que mira a los demás con condescendencia no disimulada.'
    ],
    reflectionQuestions: [
      '¿En qué situación estoy reaccionando desde la herida emocional en lugar de observar con discernimiento?',
      '¿Qué verdad incómoda estoy evitando admitir sobre mi propia conducta?',
      '¿Cuánto tiempo de silencio reflexivo me he permitido en los últimos días?'
    ],
    developmentExercises: [
      {
        title: 'El Retiro de Silencio Diario',
        description: 'Pasa 20 minutos al día en completo silencio, sin pantallas, libros ni música.',
        actionStep: 'Observa tus pensamientos pasar como nubes sin apegarte ni juzgar ninguno de ellos.'
      },
      {
        title: 'Lectura de Sabiduría Clásica',
        description: 'Lee un capítulo de textos de filosofía estoica, budista o clásica (Séneca, Marco Aurelio, Epicteto).',
        actionStep: 'Extrae una sola máxima y aplícala activamente en una decisión durante tu jornada.'
      }
    ],
    synergies: [
      {
        partnerId: 'amante',
        title: 'Mente + Corazón',
        description: 'El Amante aporta calor humano a la frialdad del Sabio, y el Sabio aporta guía al Amante.',
        synergyKeyword: 'Sabiduría Compasiva'
      },
      {
        partnerId: 'guerrero',
        title: 'Pensamiento + Ejecución',
        description: 'El Sabio elige la batalla correcta y el Guerrero la gana con maestría impecable.',
        synergyKeyword: 'Estrategia Sagrada'
      },
      {
        partnerId: 'bufon',
        title: 'Profundidad + Paradoja',
        description: 'Ambos reconocen la relatividad de las cosas y desmantelan las ilusiones del ego.',
        synergyKeyword: 'Humor Filosófico'
      }
    ]
  },

  heroe: {
    id: 'heroe',
    name: 'Héroe',
    emoji: '⚡',
    dimension: 'accion',
    concepts: ['superación', 'misión', 'sacrificio noble', 'desafío', 'redención', 'coraje épico', 'victoria'],
    centralQuestion: '¿Cómo puedo superar este desafío por un bien mayor?',
    shortDescription: 'El protagonista del viaje que supera sus propios límites para salvar a la comunidad o redimir una causa.',
    fullDescription: 'El Héroe encarna la llamada a la aventura, el descenso al abismo personal y el triunfo sobre las fuerzas que amenazan con destruir lo valioso. Su energía surge en momentos de prueba máxima donde se requiere coraje moral y disposición al sacrificio.',
    mantra: 'Acepto el desafío, supero mis miedos y conquisto mi destino al servicio de un bien superior.',
    symbol: 'Rayo Dorado & Antorcha de la Victoria',
    colorHex: '#EA580C',
    strength: 'Capacidad de sobreponerse al miedo paralizante, liderazgo inspirador en tiempos de prueba y resiliencia indomable.',
    shadow: 'Narcisista con Complejo de Salvador o Matón Arrogante',
    shadowDescription: 'En su sombra activa, busca desesperadamente la gloria personal arriesgando a otros para sentirse admirado. En su sombra pasiva, se rinde antes de pelear creyéndose incapaz de afrontar el reto.',
    shadowAntidote: 'Subordinar el ego al servicio de la comunidad (convocar al Cuidador y al Rey).',
    domains: {
      liderazgo: 'Se pone al frente en los momentos más difíciles y asume los riesgos más pesados de la organización.',
      relaciones: 'Inspira admiración y lealtad incondicional cuando sus sacrificios son genuinamente desinteresados.',
      crisis: 'Su momento estelar: se agiganta en la adversidad y conduce al grupo a través de la tormenta.',
      creatividad: 'Emprende proyectos de alto riesgo que nadie más se atreve a intentar por miedo al fracaso.',
      paternidad: 'Demuestra con hechos que el coraje no es la ausencia de miedo, sino actuar a pesar de él.'
    },
    balancedBehavior: [
      'Lucha por una causa que trasciende su propia vanidad personal.',
      'Reconoce sus límites humanos y sabe pedir ayuda a sus aliados.',
      'Trata a sus compañeros de viaje con respeto y gratitud por su apoyo.',
      'Sabe retirarse de la batalla cuando la victoria ha sido alcanzada.'
    ],
    unbalancedBehavior: [
      'Complejo de salvador: creer que sin él todo se derrumbará inevitablemente.',
      'Búsqueda compulsiva de elogios y aplausos heroicos.',
      'Crear crisis artificiales solo para tener la oportunidad de "salvar el día".',
      'Desdén hacia quienes prefieren una vida pacífica y sin aspavientos.'
    ],
    reflectionQuestions: [
      '¿Qué reto presente me está exigiendo dar un salto de madurez y valentía personal?',
      '¿Estoy actuando por auténtica vocación de servicio o para alimentar mi ego de salvador?',
      '¿Quiénes son mis aliados en este viaje y cuándo fue la última vez que les agradecí su apoyo?'
    ],
    developmentExercises: [
      {
        title: 'El Salto del Dragón',
        description: 'Identifica tu mayor miedo actual y da un paso concreto hacia él hoy mismo.',
        actionStep: 'Realiza esa llamada, entrega esa propuesta o mantén esa conversación que te quita el sueño.'
      },
      {
        title: 'Reconocimiento a los Aliados',
        description: 'Agradece a quienes te sostienen detrás del escenario.',
        actionStep: 'Envía un mensaje de gratitud a 2 personas que hayan creído en ti cuando dudabas de tus fuerzas.'
      }
    ],
    synergies: [
      {
        partnerId: 'sabio',
        title: 'Espada + Oráculo',
        description: 'El Sabio entrega al Héroe el mapa del laberinto para que no muera en vano.',
        synergyKeyword: 'Héroe Consciente'
      },
      {
        partnerId: 'amante',
        title: 'Coraje + Devoción',
        description: 'El Amante le da al Héroe una razón sagrada por la cual regresar a salvo de la batalla.',
        synergyKeyword: 'Caballero Devoto'
      },
      {
        partnerId: 'rebelde',
        title: 'Ruptura + Victoria',
        description: 'El Rebelde derriba al tirano y el Héroe construye el nuevo puente hacia el futuro.',
        synergyKeyword: 'Transformación Épica'
      }
    ]
  },

  rebelde: {
    id: 'rebelde',
    name: 'Rebelde',
    emoji: '⚡',
    dimension: 'accion',
    concepts: ['disrupción', 'revolución', 'autonomía', 'inconformismo', 'cambio radical', 'fuerza renovadora'],
    centralQuestion: '¿Qué estructuras obsoletas deben ser derribadas?',
    shortDescription: 'El catalizador del cambio que destruye las reglas caducas para dar paso a una renovación necesaria.',
    fullDescription: 'El Rebelde es el arquetipo de la desobediencia sagrada, el espíritu revolucionario y la ruptura con la hipocresía social. No teme ser la voz disonante en la sala y está dispuesto a pagar el precio del rechazo para abrir espacio a lo nuevo.',
    mantra: 'Cuestiono lo establecido, rompo lo caduco y abro camino a la verdad sin temor al juicio.',
    symbol: 'Martillo de la Disrupción & Fuego Renovador',
    colorHex: '#DC2626',
    strength: 'Valentía para denunciar injusticias, pensamiento disruptivo y capacidad de romper estancamientos crónicos.',
    shadow: 'Destructor Nihilista o Rebelde Sin Causa',
    shadowDescription: 'En su sombra activa, destruye por el simple placer de la destrucción sin ofrecer ninguna alternativa constructiva. En su sombra pasiva, adopta una pose de víctima cínica y amargada que sabotea todo a su alrededor.',
    shadowAntidote: 'Asociarse con el Creador y el Rey para que la demolición dé paso a una nueva arquitectura con propósito.',
    domains: {
      liderazgo: 'Desafía modelos de negocio obsoletos e impulsa transformaciones radicales necesarias.',
      relaciones: 'Corta con dinámicas familiares tóxicas y pactos de silencio asfixiantes.',
      crisis: 'No duda en demoler lo que no funciona para liberar recursos hacia soluciones vivas.',
      creatividad: 'Vanguardista por excelencia: rompe las convenciones estéticas de su época.',
      paternidad: 'Enseña a los hijos a pensar con autonomía y a no obedecer ciegamente mandatos injustos.'
    },
    balancedBehavior: [
      'Destruye solo aquello que está muerto o corrompido para permitir que la vida fluya.',
      'Sabe cuándo negociar y cuándo mantenerse firme en sus principios no negociables.',
      'Canaliza su rabia sagrada hacia causas justas y reformas constructivas.',
      'Asume con madurez las consecuencias de sus actos rebeldes.'
    ],
    unbalancedBehavior: [
      'Llevar la contraria de manera automática solo por afán de notoriedad.',
      'Destruir relaciones valiosas en un arranque de resentimiento destructivo.',
      'Desprecio por cualquier tipo de orden, disciplina o autoridad legítima.',
      'Nihilismo amargo que contagia pesimismo y desconfianza a su alrededor.'
    ],
    reflectionQuestions: [
      '¿Qué regla o expectativa ajena estoy acatando por cobardía que me está matando por dentro?',
      '¿Estoy rebelándome para construir algo mejor o solo para desahogar mi rabia no procesada?',
      '¿En qué situación necesito tener el coraje de decir la verdad que todos callan?'
    ],
    developmentExercises: [
      {
        title: 'La Ruptura Consciente de un Mandato',
        description: 'Identifica una creencia limitante que heredaste de tu entorno familiar y renuncia a ella formalmente.',
        actionStep: 'Escribe esa creencia en un papel, táchala y anota al lado tu nueva declaración de soberanía personal.'
      },
      {
        title: 'Disrupción Constructiva',
        description: 'Propón una forma radicalmente distinta y más eficiente de hacer una tarea cotidiana en tu trabajo.',
        actionStep: 'Presenta la idea con argumentos sólidos y un plan piloto de implementación.'
      }
    ],
    synergies: [
      {
        partnerId: 'creador',
        title: 'Demolición + Construcción',
        description: 'El Rebelde limpia el terreno de lo caduco y el Creador levanta la nueva obra.',
        synergyKeyword: 'Innovación Radical'
      },
      {
        partnerId: 'rey',
        title: 'Reforma + Ley',
        description: 'El Rebelde evita que el Rey se convierta en tirano, y el Rey da un cauce ético a la rebeldía.',
        synergyKeyword: 'Renovación del Reino'
      },
      {
        partnerId: 'explorador',
        title: 'Frontera + Ruptura',
        description: 'Juntos cruzan todos los límites convencionales para fundar nuevas tierras.',
        synergyKeyword: 'Espíritu Libre'
      }
    ]
  }
};

export const ARCHETYPES_LIST: Archetype[] = Object.values(ARCHETYPES);
