// Datos del dominio. Se mantienen en el nucleo, no en la web, porque son el
// producto: el movil y la web tienen que hablar de los mismos dieciocho.
import type { Archetype } from '../model';

export const RELATIONAL_ARCHETYPES: Record<'padre' | 'cuidador' | 'bufon' | 'explorador' | 'creador' | 'heroe', Archetype> = {
  padre: {
    id: 'padre',
    name: 'Padre / Madre',
    universalName: 'Padre / Madre',
    masculineName: 'El Padre',
    feminineName: 'La Madre',
    emoji: '🛡️',
    dimension: 'construccion',
    concepts: ['generación', 'nutrición', 'protección', 'legado', 'mentoría', 'estructura', 'crecimiento'],
    centralQuestion: '¿Qué estoy nutriendo, cuidando y qué legado dejo a las futuras generaciones?',
    shortDescription: 'La energía generativa que nutre, protege y guía proyectos, vidas y comunidades hacia su madurez.',
    fullDescription: 'El arquetipo de Padre / Madre encarna el impulso de engendrar vida, ideas o instituciones y acompañar su desarrollo con paciencia, cuidado y contención.',
    mantra: 'Protejo, nutro y bendigo lo que está creciendo a mi alrededor.',
    symbol: 'Árbol de la Vida & Nido Protector',
    colorHex: '#D6A84F',
    characterTitle: 'Nutrición & Legado',
    strength: 'Generatividad, cuidado incondicional, mentoría paciente y construcción de bases seguras.',
    shadow: 'Sobreprotección asfixiante o Abandono / Control posesivo',
    shadowDescription: 'En su sombra sobreprotectora impide que los hijos o proyectos maduren por miedo a perderlos. En su sombra ausente, rehúye la responsabilidad y deja en desamparo.',
    shadowAntidote: 'Nutrir y soltar: confiar en que lo creado tiene su propio destino e independencia.',
    domains: {
      liderazgo: 'Forma a los líderes del mañana y crea una cultura de pertenencia y seguridad.',
      relaciones: 'Ofrece refugio incondicional y paciencia para sostener los procesos de maduración.',
      crisis: 'Protege a los más vulnerables y asume la carga organizativa sin quejas.',
      creatividad: 'Nutre las ideas incipientes hasta que adquieren la fuerza necesaria para ser públicas.',
      paternidad: 'Equilibrio entre límites protectores y libertad para equivocarse y crecer.',
    },
    balancedBehavior: [
      'Celebra la autonomía de quienes ha formado.',
      'Sabe cuándo intervenir y cuándo dar un paso al costado.',
      'Aporta seguridad emocional y estabilidad material.',
      'Transmite valores y sabiduría práctica.'
    ],
    unbalancedBehavior: [
      'Incapacidad de soltar a los hijos o colaboradores.',
      'Manipulación a través de la culpa ("con todo lo que hice por ti").',
      'Descuido de la propia vida por vivir a través de otros.',
      'Abandono emocional o distanciamiento frío.'
    ],
    reflectionQuestions: [
      '¿A qué proyecto o persona estoy sobreprotegiendo sin permitirle madurar?',
      '¿Qué legado intangible quiero dejar a quienes vienen detrás de mí?',
      '¿Estoy nutriendo mi propia vida con el mismo esmero con que cuido a los demás?'
    ],
    developmentExercises: [
      {
        title: 'El Acto de Confianza y Suelta',
        description: 'Delega una tarea o responsabilidad importante en alguien que esté aprendiendo, confiando en su capacidad.',
        actionStep: 'Permite que lo resuelva a su manera sin corregir detalles menores.'
      }
    ],
    synergies: [
      {
        partnerId: 'explorador',
        title: 'Raíces + Alas',
        description: 'El Padre/Madre da el suelo seguro; el Explorador vuela hacia nuevas fronteras.',
        synergyKeyword: 'Seguridad para Volar'
      }
    ],
    variants: {
      masculine: {
        name: 'El Padre',
        characterTitle: 'El Pilar Protector y Mentor de Raíces',
        centralQuestion: '¿Qué estoy construyendo y qué legado de valores y protección quiero dejar?',
        shortDescription: 'Protección, enseñanza, estructura, responsabilidad y legado.',
        fullDescription: 'El Padre masculino provee contención, enseña destrezas para la vida y ofrece un referente de solidez y dignidad moral a su familia o equipo.',
        mantra: 'Ofrezco un cimiento sólido para que otros puedan erigir su propio destino.',
        strength: 'Firmeza protectora, guía práctica, provisión responsable y orgullo generoso.',
        shadow: 'Patriarca autoritario / Padre ausente',
        shadowDescription: 'Impositor de su propia voluntad o figura distante que no se involucra emocionalmente.',
        shadowAntidote: 'Combinar la firmeza con la ternura y la escucha atenta.',
        domains: {
          liderazgo: 'Mentoría de jóvenes talentos y visión de largo plazo.',
          relaciones: 'Compromiso inquebrantable y lealtad protectora.',
          crisis: 'Estabilidad y resguardo de la familia o empresa.',
          creatividad: 'Edificación de instituciones duraderas.',
          paternidad: 'Transmisión de disciplina, coraje y valores éticos.',
        },
        balancedBehavior: ['Acompaña sin imponer', 'Da ejemplo de integridad'],
        unbalancedBehavior: ['Exigencia desmedida', 'Frialdad afectiva'],
        reflectionQuestions: ['¿Qué ejemplo estoy dando con mis hábitos diarios?'],
        developmentExercises: [
          {
            title: 'Tiempo de Mentoría Dedicado',
            description: 'Comparte una lección de vida honesta (incluyendo tus errores) con alguien más joven.',
            actionStep: 'Ten una conversación de mentoría sin emitir juicios.'
          }
        ]
      },
      feminine: {
        name: 'La Madre',
        characterTitle: 'La Matriz de Vida, Nutrición y Cuidado',
        centralQuestion: '¿Qué estoy nutriendo y ayudando a crecer en mi entorno y en mis proyectos?',
        shortDescription: 'Cuidado, nutrición, protección, creación, vínculo y crecimiento.',
        fullDescription: 'La Madre femenina es la fuerza generadora que acoge, nutre y sostiene la vida en todas sus expresiones (hijos, comunidades, creaciones artísticas o empresas).',
        mantra: 'Nutro con amor y sabiduría todo lo que florece bajo mi cuidado.',
        strength: 'Nutrición incondicional, intuición protectora, calidez de hogar y fecundidad creativa.',
        shadow: 'Madre devoradora / Culpa asfixiante',
        shadowDescription: 'Se vuelve posesiva o hace sentir culpable a quien busca su independencia.',
        shadowAntidote: 'Reconocer que el mayor éxito de la crianza es ver a lo creado volar con alas propias.',
        domains: {
          liderazgo: 'Cuidado del clima laboral y cohesión de equipo.',
          relaciones: 'Calidez, hospitalidad y refugio afectivo.',
          crisis: 'Contención emocional y protección activa.',
          creatividad: 'Gestación paciente de obras con alma.',
          paternidad: 'Nutrición emocional, ternura y estímulo del crecimiento.',
        },
        balancedBehavior: ['Nutre sin asfixiar', 'Sabe bendecir la partida de los hijos'],
        unbalancedBehavior: ['Martirio y queja', 'Control por culpa'],
        reflectionQuestions: ['¿Dónde estoy dando de más a costa de mi propia salud?'],
        developmentExercises: [
          {
            title: 'Autonutrición Consciente',
            description: 'Haz algo que sea puramente nutritivo para ti (descanso, comida saludable, mimo personal).',
            actionStep: 'Dedica 1 hora a cuidarte como cuidarías a tu hijo más amado.'
          }
        ]
      },
      universal: {
        name: 'Padre / Madre',
        characterTitle: 'La Fuerza Generativa y Protectora',
        centralQuestion: '¿Cómo cuido y transmito lo valioso a las nuevas generaciones?',
        shortDescription: 'Generatividad, cuidado, nutrición y legado constructivo.',
        fullDescription: 'El principio arquetípico de sostener y nutrir el crecimiento de la vida y los proyectos.',
        mantra: 'Cuido el presente para florecer en el futuro.',
        strength: 'Cuidado responsable y visión generacional.',
        shadow: 'Sobreprotección o abandono.',
        shadowDescription: 'Control asfixiante o falta de presencia.',
        shadowAntidote: 'Amor libre y presencia atenta.',
        domains: {
          liderazgo: 'Desarrollo de personas.',
          relaciones: 'Confianza y cuidado mutuo.',
          crisis: 'Protección y serenidad.',
          creatividad: 'Gestación de ideas.',
          paternidad: 'Educación con amor y límites.',
        },
        balancedBehavior: ['Presencia y nutrición equilibrada'],
        unbalancedBehavior: ['Invasión o desinterés'],
        reflectionQuestions: ['¿Qué legado estoy construyendo hoy?'],
        developmentExercises: [
          {
            title: 'Gesto de Apoyo',
            description: 'Ayuda al crecimiento de alguien sin pedir nada a cambio.',
            actionStep: 'Hazlo hoy.'
          }
        ]
      }
    }
  },

  cuidador: {
    id: 'cuidador',
    name: 'Cuidador / Cuidadora',
    universalName: 'Cuidador / Cuidadora',
    masculineName: 'El Cuidador',
    feminineName: 'La Cuidadora',
    emoji: '🌱',
    dimension: 'corazon',
    concepts: ['servicio', 'compasión', 'entrega', 'altruismo', 'límites sanos', 'hospitalidad', 'sanación comunitaria'],
    centralQuestion: '¿Cómo puedo servir a los demás sin olvidarme de cuidar mi propio ser?',
    shortDescription: 'El impulso generoso de aliviar el sufrimiento ajeno, ofrecer ayuda desinteresada y crear bienestar compartido.',
    fullDescription: 'El Cuidador / Cuidadora sostiene el tejido social mediante la compasión activa, la escucha atenta y la disposición al servicio generoso.',
    mantra: 'Sirvo con generosidad y respeto mi propio equilibrio interior.',
    symbol: 'Manos Abiertas & Brote Verde',
    colorHex: '#10B981',
    characterTitle: 'Servicio & Compasión',
    strength: 'Compasión profunda, generosidad, capacidad de escucha y vocación de servicio.',
    shadow: 'Mártir sacrificado / Rescatador dependiente',
    shadowDescription: 'El mártir que se destruye a sí mismo para sentirse necesario o que rescata a otros para crear dependencia emocional.',
    shadowAntidote: 'Aprender que el autocuidado es la base de todo servicio sostenible y aprender a recibir.',
    domains: {
      liderazgo: 'Crea un ambiente de bienestar donde nadie queda rezagado o desatendido.',
      relaciones: 'Atención a los detalles y apoyo incondicional en los momentos difíciles.',
      crisis: 'Primeros auxilios emocionales y contención práctica inmediata.',
      creatividad: 'Obras orientadas al beneficio social y la sanación comunitaria.',
      paternidad: 'Paciencia infinita, atención a la salud y escucha amorosa.',
    },
    balancedBehavior: [
      'Ayuda sin esperar aplausos pero sin dejarse explotar.',
      'Sabe poner límites a las demandas excesivas de los demás.',
      'Practica el autocuidado antes de quedar exhausto.',
      'Fomenta la autonomía de las personas a quienes cuida.'
    ],
    unbalancedBehavior: [
      'Incapacidad de decir "no" a cualquier pedido de auxilio.',
      'Resentimiento oculto cuando los demás no agradecen su sacrificio.',
      'Descuido total de la propia salud física o económica.',
      'Tratar a los demás como incapaces para poder "salvarlos".'
    ],
    reflectionQuestions: [
      '¿Estoy cuidando a otros para sentirme valioso o por verdadero amor?',
      '¿En qué aspecto de mi vida necesito pedir ayuda y permitir que me cuiden?',
      '¿Dónde se está convirtiendo mi ayuda en sobrecarga o codependencia?'
    ],
    developmentExercises: [
      {
        title: 'El Día del Autocuidado Sagrado',
        description: 'Reserva una tarde exclusivamente para ti, donde no resolverás problemas ajenos.',
        actionStep: 'Notifica a tu entorno que estarás desconectado y descansa.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Compasión + Límites',
        description: 'El Cuidador aporta el amor; el Guerrero protege los límites para que no haya abuso.',
        synergyKeyword: 'Compasión Firme'
      }
    ],
    variants: {
      masculine: {
        name: 'El Cuidador',
        characterTitle: 'El Servidor Silencioso y Protector de la Comunidad',
        centralQuestion: '¿Puedo cuidar y servir sin sentir que tengo que cargarlo todo a mis espaldas?',
        shortDescription: 'Servicio sereno, presencia sin sobrecarga y resolución práctica.',
        fullDescription: 'El Cuidador masculino ofrece su fuerza práctica al servicio de su comunidad, aliviando cargas sin quejas ni dramatismo.',
        mantra: 'Pongo mis manos y mi fuerza al servicio del bien común con serenidad.',
        strength: 'Ayuda práctica, fiabilidad absoluta y apoyo desinteresado.',
        shadow: 'Mártir silencioso / Resentimiento acumulado',
        shadowDescription: 'Carga con todo en silencio hasta explotar o enfermar por agotamiento.',
        shadowAntidote: 'Aprender a delegar y expresar las propias necesidades con franqueza.',
        domains: {
          liderazgo: 'Servicio y apoyo incondicional a los miembros del equipo.',
          relaciones: 'Presencia confiable en emergencias y tareas cotidianas.',
          crisis: 'Logística, ayuda práctica y auxilio sin aspavientos.',
          creatividad: 'Proyectos de utilidad directa para la comunidad.',
          paternidad: 'Cuidado atento y resolución de necesidades materiales y afectivas.',
        },
        balancedBehavior: ['Ayuda de forma eficaz', 'Descansa cuando es necesario'],
        unbalancedBehavior: ['Agotamiento crónico', 'Queja pasiva'],
        reflectionQuestions: ['¿Qué carga ajena estoy llevando que no me corresponde?'],
        developmentExercises: [
          {
            title: 'Aprender a Recibir',
            description: 'Acepta un favor o regalo de alguien sin sentir la obligación de devolverlo de inmediato.',
            actionStep: 'Da las gracias sinceramente y disfruta la ayuda.'
          }
        ]
      },
      feminine: {
        name: 'La Cuidadora',
        characterTitle: 'La Sanadora de Vínculos y Sostén Emocional',
        centralQuestion: '¿Puedo cuidar a otros con amor sin olvidarme de mis propias necesidades?',
        shortDescription: 'Límites sanos, autocuidado, nutrición mutua y compasión activa.',
        fullDescription: 'La Cuidadora femenina brinda contención emocional y calidez humana, aprendiendo a llenar su propia copa primero para que su entrega no se vuelva martirio.',
        mantra: 'Me cuido para cuidar; mi bienestar es el origen de mi servicio.',
        strength: 'Empatía tierna, hospitalidad, escucha reparadora y generosidad.',
        shadow: 'Codependencia / Autoanulación en el rol de salvadora',
        shadowDescription: 'Se olvida de sí misma, se vuelve codependiente y manipula desde el papel de víctima.',
        shadowAntidote: 'Ponerse a una misma en primer lugar en la lista de prioridades de cuidado.',
        domains: {
          liderazgo: 'Creación de ambientes armónicos y acogedores.',
          relaciones: 'Escucha atenta y apoyo en momentos de vulnerabilidad.',
          crisis: 'Contención afectiva y alivio del dolor ajeno.',
          creatividad: 'Arte terapéutico y transformador.',
          paternidad: 'Amor incondicional y atención a la salud integral.',
        },
        balancedBehavior: ['Se cuida a sí misma primero', 'Da con alegría sin esperar rescates'],
        unbalancedBehavior: ['Sensación de abandono', 'Reclamo encubierto'],
        reflectionQuestions: ['¿Cuándo fue la última vez que me pregunté qué necesito yo?'],
        developmentExercises: [
          {
            title: 'El Límite del Amor Propio',
            description: 'Declina amablemente una petición para poder descansar o dedicarte a tu bienestar.',
            actionStep: 'Hazlo con tranquilidad y sin justificarte en exceso.'
          }
        ]
      },
      universal: {
        name: 'Cuidador / Cuidadora',
        characterTitle: 'El Espíritu de Servicio y Solidaridad',
        centralQuestion: '¿Cómo aporto bienestar y alivio a mi entorno?',
        shortDescription: 'Compasión, generosidad y servicio equilibrado.',
        fullDescription: 'La capacidad humana de empatía activa y ayuda solidaria hacia los semejantes.',
        mantra: 'Sirvo con alegría y mantengo mi propia paz.',
        strength: 'Solidaridad y compasión.',
        shadow: 'Autodestrucción por sobreentrega.',
        shadowDescription: 'Pérdida de salud o identidad por exceso de sacrificio.',
        shadowAntidote: 'Equilibrio entre dar y recibir.',
        domains: {
          liderazgo: 'Cuidado mutuo.',
          relaciones: 'Apoyo incondicional.',
          crisis: 'Asistencia inmediata.',
          creatividad: 'Impacto social positivo.',
          paternidad: 'Presencia atenta y cariñosa.',
        },
        balancedBehavior: ['Compasión activa y balance'],
        unbalancedBehavior: ['Sobreexigencia y queja'],
        reflectionQuestions: ['¿Cómo cuido de mí hoy?'],
        developmentExercises: [
          {
            title: 'Momento de Autocuidado',
            description: 'Dedica 20 minutos a tu descanso.',
            actionStep: 'Hazlo hoy.'
          }
        ]
      }
    }
  },

  bufon: {
    id: 'bufon',
    name: 'Bufón / Bufona',
    universalName: 'Bufón / Bufona',
    masculineName: 'El Bufón',
    feminineName: 'La Bufona',
    emoji: '🎭',
    dimension: 'corazon',
    concepts: ['juego', 'humor', 'espontaneidad', 'libertad', 'desmitificación', 'gozo', 'autenticidad'],
    centralQuestion: '¿Cómo disfruto del presente y desarmo la excesiva solemnidad con humor?',
    shortDescription: 'La chispa del juego, el humor desarmante, la libertad del juicio ajeno y la ligereza de espíritu.',
    fullDescription: 'El Bufón / Bufona recuerda que la vida es también un juego cósmico. Desmitifica egos inflados, dice verdades incómodas a través de la risa y libera de la rigidez.',
    mantra: 'Vivo con ligereza, juego con el presente y celebro la risa sanadora.',
    symbol: 'Cascabeles & Espejo de la Risa',
    colorHex: '#F59E0B',
    characterTitle: 'Juego & Espontaneidad',
    strength: 'Humor inteligente, capacidad de reírse de uno mismo, espontaneidad y desarticulación de tensiones.',
    shadow: 'Burlón cínico / Evasor inmaduro de la realidad',
    shadowDescription: 'Usa el sarcasmo para herir o el chiste constante para evitar conectar con el dolor o la responsabilidad madura.',
    shadowAntidote: 'Saber cuándo reír y cuándo respetar la seriedad del momento con empatía genuina.',
    domains: {
      liderazgo: 'Desactiva momentos de alta tensión con un comentario oportuno y humano.',
      relaciones: 'Aporta complicidad, diversión cotidiana y alegría compartida.',
      crisis: 'Ayuda a mantener la cordura y la esperanza a través del humor resiliente.',
      creatividad: 'Libera la mente de bloqueos racionales mediante el pensamiento lateral y el juego.',
      paternidad: 'Juega en el suelo con los hijos y les enseña a no tomarse los errores como tragedias.',
    },
    balancedBehavior: [
      'Sabe reírse de sus propios tropiezos sin crueldad.',
      'Aporta aire fresco y risa a ambientes sofocantes.',
      'Dice verdades lúcidas envueltas en amabilidad y humor.',
      'Disfruta el momento presente con total entrega.'
    ],
    unbalancedBehavior: [
      'Burlarse de los defectos o dolores de los demás.',
      'Incapacidad de tener una conversación seria o profunda.',
      'Consumos compulsivos o fiesta continua para escapar de la tristeza.',
      'Cinismo amargo disfrazado de ironía.'
    ],
    reflectionQuestions: [
      '¿En qué asunto de mi vida me estoy tomando con demasiada solemnidad?',
      '¿Estoy usando el humor para conectar o como una barrera para no mostrar mi dolor?',
      '¿Cuándo fue la última vez que jugué o me reí hasta las lágrimas?'
    ],
    developmentExercises: [
      {
        title: 'La Risa de la Propia Sombra',
        description: 'Identifica una metedura de pata reciente y cuéntasela a un amigo como una anécdota divertida.',
        actionStep: 'Aprecia cómo el humor le quita peso al ego perfeccionista.'
      }
    ],
    synergies: [
      {
        partnerId: 'sabio',
        title: 'Verdad + Risa',
        description: 'El Sabio busca la verdad profunda; el Bufón la hace accesible y ligera.',
        synergyKeyword: 'Paradoja Lúcida'
      }
    ],
    variants: {
      masculine: {
        name: 'El Bufón',
        characterTitle: 'El Maestro de la Risa, el Desparpajo y la Autenticidad',
        centralQuestion: '¿Cómo desarmo la solemnidad de mi ego y disfruto de la vida sin máscaras rígidas?',
        shortDescription: 'Desarmar la solemnidad, romper el ego rígido y celebrar la autenticidad.',
        fullDescription: 'El Bufón masculino se ríe de las pretensiones de poder, baja los humos del orgullo y disfruta del instante con alegría contagiosa.',
        mantra: 'Me río de mi propia importancia y disfruto de la aventura humana.',
        strength: 'Ingenio rápido, ligereza contagiosa y desmitificación del drama.',
        shadow: 'Payaso triste / Burlón hiriente',
        shadowDescription: 'Oculta su dolor tras una máscara cómica o humilla a otros con sarcasmo.',
        shadowAntidote: 'Aceptar la tristeza y conectar con la ternura.',
        domains: {
          liderazgo: 'Alivia tensiones en el equipo y rompe jerarquías artificiales.',
          relaciones: 'Juego, vitalidad y disfrute compartido.',
          crisis: 'Humor que salva de la desesperanza.',
          creatividad: 'Pensamiento irreverente y original.',
          paternidad: 'Juego espontáneo y risas compartidas.',
        },
        balancedBehavior: ['Aporta ligereza sin herir', 'Se ríe de sus errores'],
        unbalancedBehavior: ['Frivolidad destructiva', 'Sarcasmo cruel'],
        reflectionQuestions: ['¿Dónde estoy siendo demasiado rígido o pretencioso?'],
        developmentExercises: [
          {
            title: 'El Día del Juego',
            description: 'Participa en un juego de mesa o actividad lúdica sin afán competitivo.',
            actionStep: 'Juega por el puro placer de divertirte.'
          }
        ]
      },
      feminine: {
        name: 'La Bufona',
        characterTitle: 'La Soberana de la Espontaneidad y la Libertad del Juicio',
        centralQuestion: '¿Cómo suelto la presión de ser perfecta o complacer y me permito ser espontánea?',
        shortDescription: 'Soltar la presión de agradar, libertad de expresión y gozo sin culpa.',
        fullDescription: 'La Bufona femenina desafía el mandato de ser "la niña buena" o la "mujer perfecta". Baila con desparpajo, dice lo que piensa con picardía y disfruta sin pedir permiso.',
        mantra: 'Suelto la perfección; elijo la autenticidad, la risa y el gozo.',
        strength: 'Desparpajo liberador, autenticidad radical y alegría contagiosa.',
        shadow: 'Autosabotaje por ridículo / Incontinencia verbal hiriente',
        shadowDescription: 'Se ridiculiza a sí misma para agradar o usa la ironía para herir.',
        shadowAntidote: 'Reconocer que su valor no depende de entretener a los demás.',
        domains: {
          liderazgo: 'Desmitificación de protocolos innecesarios y fomento de la creatividad.',
          relaciones: 'Frescura, autenticidad y alegría sin filtros.',
          crisis: 'Resiliencia optimista.',
          creatividad: 'Innovación sin miedo al ridículo.',
          paternidad: 'Libertad de expresión y juego sin moldes rígidos.',
        },
        balancedBehavior: ['Disfruta sin culpa', 'Rompe tabúes con humor elegante'],
        unbalancedBehavior: ['Hacerse la tonta por miedo a destacar', 'Burlas hirientes'],
        reflectionQuestions: ['¿Qué parte de mí teme hacer el ridículo si es 100% auténtica?'],
        developmentExercises: [
          {
            title: 'Baño de Desparpajo',
            description: 'Ponte una canción alegre y baila por toda la habitación sin preocuparte por cómo te ves.',
            actionStep: 'Ríete y conecta con la pura alegría del movimiento.'
          }
        ]
      },
      universal: {
        name: 'Bufón / Bufona',
        characterTitle: 'La Sabiduría del Juego y la Alegría',
        centralQuestion: '¿Cómo pongo humor y ligereza en mi día a día?',
        shortDescription: 'Juego, humor sanador y espontaneidad libre.',
        fullDescription: 'El principio de ligereza que disuelve la rigidez mental y celebra el gozo de estar vivos.',
        mantra: 'La risa es mi medicina y el juego mi libertad.',
        strength: 'Optimismo y frescura.',
        shadow: 'Frivolidad o cinismo.',
        shadowDescription: 'Evasión de la realidad o burla destructiva.',
        shadowAntidote: 'Humor consciente y compasivo.',
        domains: {
          liderazgo: 'Flexibilidad y clima positivo.',
          relaciones: 'Alegría y distensión.',
          crisis: 'Perspectiva optimista.',
          creatividad: 'Pensamiento lateral.',
          paternidad: 'Juego libre.',
        },
        balancedBehavior: ['Risa sana y autenticidad'],
        unbalancedBehavior: ['Superficialidad excesiva'],
        reflectionQuestions: ['¿Dónde puedo sumar una sonrisa hoy?'],
        developmentExercises: [
          {
            title: 'Momento de Risa',
            description: 'Mira un video cómico o comparte un chiste con un amigo.',
            actionStep: 'Disfruta de la risa.'
          }
        ]
      }
    }
  },

  explorador: {
    id: 'explorador',
    name: 'Explorador / Exploradora',
    universalName: 'Explorador / Exploradora',
    masculineName: 'El Explorador',
    feminineName: 'La Exploradora',
    emoji: '🧭',
    dimension: 'accion',
    concepts: ['autonomía', 'búsqueda', 'libertad', 'nuevos horizontes', 'independencia', 'viaje', 'autenticidad'],
    centralQuestion: '¿Quién soy cuando nadie me dice qué camino seguir y hacia qué nuevo horizonte me dirijo?',
    shortDescription: 'La búsqueda de la propia verdad, el coraje de adentrarse en territorio desconocido y la fidelidad al propio camino.',
    fullDescription: 'El Explorador / Exploradora rehúye el conformismo y la inercia social. Necesita abrir caminos nuevos, experimentar por cuenta propia y descubrir quién es en soledad fecunda.',
    mantra: 'Exploro nuevos horizontes con valentía y soy fiel a mi brújula interior.',
    symbol: 'Brújula de Bronce & Bastón de Peregrino',
    colorHex: '#3B82F6',
    characterTitle: 'Autonomía & Búsqueda',
    strength: 'Independencia de criterio, curiosidad insaciable, adaptabilidad y coraje para empezar de cero.',
    shadow: 'Eterno vagabundo desarraigado / Fóbico al compromiso',
    shadowDescription: 'Huye en cuanto las cosas exigen permanencia, compromiso o rutina, disfrazando su miedo al arraigo de "amor a la libertad".',
    shadowAntidote: 'Descubrir que el compromiso con lo profundo no limita la libertad, sino que le da un hogar fértil.',
    domains: {
      liderazgo: 'Abre nuevos mercados, desafía el "siempre se hizo así" e impulsa la innovación.',
      relaciones: 'Valora el espacio propio y respeta la libertad e independencia de su pareja.',
      crisis: 'Se adapta con rapidez a cambios radicales y no teme reinventarse en la incertidumbre.',
      creatividad: 'Se nutre de diversas culturas y experiencias para forjar estilos inéditos.',
      paternidad: 'Fomenta la curiosidad, el amor por los viajes y la capacidad de resolver imprevistos.',
    },
    balancedBehavior: [
      'Sigue su vocación aunque sea poco convencional.',
      'Tolera la soledad y la convierte en espacio de autoconocimiento.',
      'Sabe arraigarse cuando encuentra algo que vale la pena cultivar.',
      'Respeta las diferencias culturales y humanas sin juzgarlas.'
    ],
    unbalancedBehavior: [
      'Abandonar proyectos en cuanto surge la primera dificultad o aburrimiento.',
      'Dificultad crónica para comprometerse en relaciones profundas.',
      'Inconformismo destructivo que nunca encuentra satisfacción.',
      'Aislamiento excesivo por miedo a sentirse controlado.'
    ],
    reflectionQuestions: [
      '¿Qué nuevo territorio (físico, intelectual o emocional) pide ser explorado en mi vida?',
      '¿Estoy huyendo de un compromiso necesario o estoy siguiendo una llamada genuina de libertad?',
      '¿Cómo mantengo mi independencia sin aislarme de las personas que amo?'
    ],
    developmentExercises: [
      {
        title: 'La Microaventura en Solitario',
        description: 'Haz una excursión a un lugar desconocido por tu cuenta, sin mapa prediseñado.',
        actionStep: 'Toma decisiones sobre la marcha y disfruta de tu propia compañía durante unas horas.'
      }
    ],
    synergies: [
      {
        partnerId: 'constructor',
        title: 'Exploración + Asentamiento',
        description: 'El Explorador descubre nuevas tierras fértiles; el Constructor erige el asentamiento durable.',
        synergyKeyword: 'Conquista y Construcción'
      }
    ],
    variants: {
      masculine: {
        name: 'El Explorador',
        characterTitle: 'El Navegante de Fronteras y Buscador de Horizontes',
        centralQuestion: '¿Quién eres cuando nadie te dice qué camino seguir y te atreves a cruzar el umbral?',
        shortDescription: 'Independencia, aventura, forjar camino propio y valentía ante lo desconocido.',
        fullDescription: 'El Explorador masculino desafía la comodidad burguesa y los caminos trillados, buscando forjar su propio carácter a través de la prueba y la aventura.',
        mantra: 'Forjo mi propio camino donde no hay senderos trazados.',
        strength: 'Audacia, autosuficiencia, resiliencia y afán de descubrimiento.',
        shadow: 'Fugitivo errante / Desarraigado solitario',
        shadowDescription: 'Huye de las responsabilidades adultas saltando de proyecto en proyecto.',
        shadowAntidote: 'Aprender a echar raíces en propósitos significativos.',
        domains: {
          liderazgo: 'Pionero en proyectos arriesgados e innovadores.',
          relaciones: 'Vínculos basados en el respeto a la libertad mutua.',
          crisis: 'Ingenio y supervivencia en entornos hostiles.',
          creatividad: 'Originalidad y ruptura de moldes convencionales.',
          paternidad: 'Iniciación a la aventura y la autonomía.',
        },
        balancedBehavior: ['Abre caminos nuevos', 'Asume riesgos calculados'],
        unbalancedBehavior: ['Fobia al compromiso', 'Evasión continua'],
        reflectionQuestions: ['¿Hacia qué frontera interior necesito avanzar?'],
        developmentExercises: [
          {
            title: 'Ruta Desconocida',
            description: 'Toma una ruta diferente a casa o visita un barrio nuevo.',
            actionStep: 'Observa detalles con ojos de explorador.'
          }
        ]
      },
      feminine: {
        name: 'La Exploradora',
        characterTitle: 'La Soberana de la Libertad Interior y los Nuevos Caminos',
        centralQuestion: '¿Quién eres cuando dejas de vivir según las expectativas de los demás y sigues tu brújula?',
        shortDescription: 'Soberanía, libertad interior, romper moldes y fidelidad a la propia llamada.',
        fullDescription: 'La Exploradora femenina se atreve a salir de los roles tradicionales asignados, viajando al exterior y a su propio interior para descubrir su auténtica vocación.',
        mantra: 'Sigo mi propia brújula y conquisto mi libertad interior.',
        strength: 'Autodeterminación indomable, valentía para romper moldes y autenticidad.',
        shadow: 'Eterna insatisfecha / Huida de los vínculos profundos',
        shadowDescription: 'Cree que la libertad es estar sola y sabotea la intimidad por miedo a ser atrapada.',
        shadowAntidote: 'Saber que una mujer libre puede amar profundamente sin perderse a sí misma.',
        domains: {
          liderazgo: 'Apertura de nuevos caminos profesionales y liderazgo pionero.',
          relaciones: 'Amor libre, maduro y sin ataduras asfixiantes.',
          crisis: 'Reinvención total y fortaleza ante los cambios.',
          creatividad: 'Expresión transgresora y fresca.',
          paternidad: 'Educación en la libertad de elección y la valentía.',
        },
        balancedBehavior: ['Defiende su espacio propio', 'Se atreve a emprender su viaje'],
        unbalancedBehavior: ['Rechazo al compromiso', 'Sensación de vacío constante'],
        reflectionQuestions: ['¿Qué expectativa familiar o social estoy lista para dejar atrás?'],
        developmentExercises: [
          {
            title: 'Viaje a lo Desconocido',
            description: 'Inscríbete en un curso o actividad sobre un tema que nunca hayas explorado.',
            actionStep: 'Abre tu mente a una nueva perspectiva.'
          }
        ]
      },
      universal: {
        name: 'Explorador / Exploradora',
        characterTitle: 'El Espíritu de Búsqueda y Autonomía',
        centralQuestion: '¿Cómo expando mis horizontes vitales?',
        shortDescription: 'Libertad, curiosidad y búsqueda de nuevos caminos.',
        fullDescription: 'La pulsión humana de conocer el mundo y descubrir nuevas posibilidades.',
        mantra: 'El mundo es amplio y mi curiosidad infinita.',
        strength: 'Adaptabilidad y curiosidad.',
        shadow: 'Desarraigo o inconstancia.',
        shadowDescription: 'Falta de perseverancia o miedo a echar raíces.',
        shadowAntidote: 'Compromiso consciente con lo valioso.',
        domains: {
          liderazgo: 'Innovación pionera.',
          relaciones: 'Respeto a la individualidad.',
          crisis: 'Reinvención ágil.',
          creatividad: 'Diversidad de fuentes.',
          paternidad: 'Estímulo a la curiosidad.',
        },
        balancedBehavior: ['Curiosidad viva y solidez'],
        unbalancedBehavior: ['Inestabilidad crónica'],
        reflectionQuestions: ['¿Qué nuevo aprendizaje me apasiona hoy?'],
        developmentExercises: [
          {
            title: 'Lectura Exploratoria',
            description: 'Lee sobre un tema completamente ajeno a tu trabajo.',
            actionStep: 'Anota 2 ideas interesantes.'
          }
        ]
      }
    }
  },

  creador: {
    id: 'creador',
    name: 'Creador / Creadora',
    universalName: 'Creador / Creadora',
    masculineName: 'El Creador',
    feminineName: 'La Creadora',
    emoji: '🎨',
    dimension: 'construccion',
    concepts: ['arte', 'innovación', 'proyectos', 'expresión', 'originalidad', 'manifestación', 'visión estética'],
    centralQuestion: '¿Qué parte de mi mundo interno necesita tomar forma visible y tangible?',
    shortDescription: 'La capacidad de manifestar ideas, forjar obras originales y dejar una huella estética e innovadora.',
    fullDescription: 'El Creador / Creadora vive para dar vida a lo que antes no existía. Une imaginación y técnica para transformar la materia prima en belleza, tecnología o soluciones.',
    mantra: 'Canalizo mi visión única en obras tangibles y significativas.',
    symbol: 'Paleta del Artista & Martillo del Escultor',
    colorHex: '#D6A84F',
    characterTitle: 'Arte & Innovación',
    strength: 'Originalidad desbordante, talento estético, capacidad de materialización y visión de diseño.',
    shadow: 'Perfeccionista paralizado / Creador destructivo o vanidoso',
    shadowDescription: 'El perfeccionismo neurótico que nunca concluye nada o la obsesión artística que arrasa con las relaciones y la salud.',
    shadowAntidote: 'Comprender que lo perfecto es enemigo de lo realizado y soltar las obras al mundo con humildad.',
    domains: {
      liderazgo: 'Diseña la visión de producto, la identidad de marca y la cultura visual innovadora.',
      relaciones: 'Sorprende con detalles originales y renueva la chispa del vínculo con creatividad.',
      crisis: 'Encuentra formas inéditas de sortear obstáculos materiales.',
      creatividad: 'Su hábitat natural: pintura, escritura, arquitectura, software o diseño.',
      paternidad: 'Fomenta el talento expresivo, la imaginación y la experimentación sin juicios.',
    },
    balancedBehavior: [
      'Termina lo que empieza y lo comparte con el mundo.',
      'Acepta las críticas constructivas sin destruir su autoestima.',
      'Combina inspiración con rutina y oficio diario.',
      'Encuentra belleza y material de creación en la cotidianidad.'
    ],
    unbalancedBehavior: [
      'Acumular decenas de proyectos a medio terminar.',
      'Parálisis por miedo a no estar a la altura de su propia expectativa.',
      'Soberbia y desprecio hacia las ideas de los demás.',
      'Uso del arte para escapar del mundo real.'
    ],
    reflectionQuestions: [
      '¿Qué proyecto creativo tengo postergado por miedo a que no quede perfecto?',
      '¿Estoy creando para expresar mi verdad o para buscar aprobación y estatus?',
      '¿Cómo puedo incorporar más juego y libertad en mi proceso de creación?'
    ],
    developmentExercises: [
      {
        title: 'El Manifiesto de la Obra Imperfecta',
        description: 'Crea algo completo en 45 minutos (un texto, un dibujo, un prototipo) y dalo por terminado sin corregirlo.',
        actionStep: 'Siente la liberación de cerrar un ciclo creativo sin la trampa del perfeccionismo.'
      }
    ],
    synergies: [
      {
        partnerId: 'guerrero',
        title: 'Inspiración + Disciplina',
        description: 'El Creador aporta la visión y el arte; el Guerrero se sienta cada día a trabajar con rigor.',
        synergyKeyword: 'Obra Culminada'
      }
    ],
    variants: {
      masculine: {
        name: 'El Creador',
        characterTitle: 'El Arquitecto de Realidades y Obras Eternas',
        centralQuestion: '¿Qué puedes construir y materializar que antes no existía en el mundo?',
        shortDescription: 'Visión innovadora, diseño, técnica y manifestación original.',
        fullDescription: 'El Creador masculino combina la maestría de las herramientas con una visión audaz para forjar obras, inventos o estructuras que perduren.',
        mantra: 'Pongo mi talento y disciplina al servicio de la invención.',
        strength: 'Innovación técnica, persistencia creadora y estética formal.',
        shadow: 'Genio megalómano / Perfeccionista estéril',
        shadowDescription: 'Se cree superior por sus creaciones o destruye lo que hace porque nunca es suficiente.',
        shadowAntidote: 'Humildad creadora y servicio a la comunidad.',
        domains: {
          liderazgo: 'Innovación estratégica y diseño de nuevos productos.',
          relaciones: 'Expresión de afecto a través de detalles y creaciones.',
          crisis: 'Soluciones inventivas.',
          creatividad: 'Maestría en el oficio.',
          paternidad: 'Transmisión de habilidades prácticas y pasión creadora.',
        },
        balancedBehavior: ['Materializa proyectos con constancia', 'Comparte su visión'],
        unbalancedBehavior: ['Obsesión y aislamiento', 'Intolerancia al error'],
        reflectionQuestions: ['¿Qué obra mía necesita salir a la luz ya?'],
        developmentExercises: [
          {
            title: 'Prototipo Rápido',
            description: 'Construye un borrador de tu idea en 1 hora.',
            actionStep: 'Muéstraselo a alguien de confianza para recibir feedback.'
          }
        ]
      },
      feminine: {
        name: 'La Creadora',
        characterTitle: 'La Alquimista de Formas y Alumbramiento Artístico',
        centralQuestion: '¿Qué parte de tu alma necesita convertirse en algo visible y qué necesitas dar a luz?',
        shortDescription: 'Alumbramiento creativo, expresión auténtica, arte con alma y belleza viva.',
        fullDescription: 'La Creadora femenina gesta ideas en su mundo interno y las da a luz con paciencia y amor, fusionando sensibilidad, estética e intuición.',
        mantra: 'Doy a luz mis visiones con confianza, paciencia y libertad.',
        strength: 'Sensibilidad estética, fecundidad imaginativa y autenticidad expresiva.',
        shadow: 'Inseguridad paralizante / Miedo a exponerse',
        shadowDescription: 'Esconde sus creaciones en cajones por temor al juicio ajeno.',
        shadowAntidote: 'Reconocer que el arte no necesita ser perfecto para conmover y transformar.',
        domains: {
          liderazgo: 'Diseño de experiencias memorables y ambientes inspiradores.',
          relaciones: 'Nutrición del vínculo a través de la belleza y la creatividad.',
          crisis: 'Transformación del dolor en obras significativas.',
          creatividad: 'Creación artística profunda y conmovedora.',
          paternidad: 'Estímulo a la libre expresión de los hijos.',
        },
        balancedBehavior: ['Publica y comparte su arte', 'Confía en su voz creadora'],
        unbalancedBehavior: ['Ocultar su talento por timidez', 'Autocrítica destructiva'],
        reflectionQuestions: ['¿Qué temo que piensen si muestro mi trabajo más auténtico?'],
        developmentExercises: [
          {
            title: 'Exposición Valiente',
            description: 'Comparte un poema, foto, texto o idea creada por ti con tu entorno.',
            actionStep: 'Acepta los elogios y comentarios con agradecimiento.'
          }
        ]
      },
      universal: {
        name: 'Creador / Creadora',
        characterTitle: 'El Impulso de Creación y Expresión',
        centralQuestion: '¿Cómo materializo mi imaginación en la realidad?',
        shortDescription: 'Innovación, arte y manifestación de ideas.',
        fullDescription: 'La capacidad fundamental del ser humano para transformar la materia a través de la creatividad.',
        mantra: 'Creo con propósito y entrego mi obra al mundo.',
        strength: 'Imaginación e innovación.',
        shadow: 'Perfeccionismo o dispersión.',
        shadowDescription: 'Incapacidad de cerrar ciclos creativos.',
        shadowAntidote: 'Disciplina y entrega honesta.',
        domains: {
          liderazgo: 'Visión creativa.',
          relaciones: 'Originalidad.',
          crisis: 'Pensamiento divergente.',
          creatividad: 'Expresión artística.',
          paternidad: 'Fomento del juego creador.',
        },
        balancedBehavior: ['Creación constante y entrega'],
        unbalancedBehavior: ['Procrastinación perfeccionista'],
        reflectionQuestions: ['¿Qué voy a crear hoy?'],
        developmentExercises: [
          {
            title: 'Momento Creativo',
            description: '15 minutos de dibujo, escritura o diseño libre.',
            actionStep: 'Hazlo sin juzgar el resultado.'
          }
        ]
      }
    }
  },

  heroe: {
    id: 'heroe',
    name: 'Héroe / Heroína',
    universalName: 'Héroe / Heroína',
    masculineName: 'El Héroe',
    feminineName: 'La Heroína',
    emoji: '⚡',
    dimension: 'accion',
    concepts: ['desafío', 'valentía', 'superación', 'resiliencia', 'viaje interior', 'empoderamiento', 'conquista'],
    centralQuestion: '¿Qué prueba existencial estoy llamado a superar para rescatar mi verdadero poder?',
    shortDescription: 'El viaje de superación personal, el coraje para enfrentar pruebas difíciles y la transformación a través de la adversidad.',
    fullDescription: 'El Héroe / Heroína responde al llamado de la aventura. No teme a los gigantes ni a las sombras, sabiendo que las mayores pruebas forjan el carácter más noble.',
    mantra: 'Encaro la prueba con coraje y transformo la adversidad en fuerza.',
    symbol: 'Rayo de Fuerza & Laurel de Victoria',
    colorHex: '#EF4444',
    characterTitle: 'Desafío & Superación',
    strength: 'Resiliencia extraordinaria, coraje ante lo desconocido, superación de límites y lealtad a los ideales.',
    shadow: 'Arrogancia temeraria / Complejo de salvador / Victimización heroica',
    shadowDescription: 'Lanzarse a peligros absurdos por vanagloria o creer que solo mediante el sufrimiento y la épica constante la vida tiene valor.',
    shadowAntidote: 'Humildad y reconocimiento de que las mayores victorias son las internas, en silencio.',
    domains: {
      liderazgo: 'Lidera la remontada en momentos de colapso y devuelve la fe a su equipo.',
      relaciones: 'Lucha por defender a quienes ama y no abandona en la adversidad.',
      crisis: 'Su momento de brillo: saca fuerzas de donde no las hay y encuentra el camino de salida.',
      creatividad: 'Obras de carácter épico, trascendente y conmovedor.',
      paternidad: 'Inspira valentía, honor y el rechazo a la rendición cobarde.',
    },
    balancedBehavior: [
      'Asume la responsabilidad de su propio destino.',
      'Supera el miedo con acción decidida.',
      'Sabe cuándo pedir ayuda sin que su ego se derrumbe.',
      'Pone su victoria al servicio del bienestar colectivo.'
    ],
    unbalancedBehavior: [
      'Necesidad continua de drama y épica para sentirse vivo.',
      'Desprecio hacia quienes eligen una vida tranquila o cautelosa.',
      'Agotamiento por creerse inmortal o infalible.',
      'Incapacidad de disfrutar de la paz cotidiana.'
    ],
    reflectionQuestions: [
      '¿Qué miedo profundo me está bloqueando y cómo puedo dar el primer paso para enfrentarlo?',
      '¿Estoy luchando una batalla real o buscando drama para alimentar mi ego?',
      '¿Qué talento o verdad personal necesito rescatar del fondo de mis dudas?'
    ],
    developmentExercises: [
      {
        title: 'El Desafío Incómodo',
        description: 'Elige una situación que te dé un miedo respetable y enfréntala deliberadamente hoy.',
        actionStep: 'Registra cómo te sientes antes y después de haber cruzado el umbral.'
      }
    ],
    synergies: [
      {
        partnerId: 'sanador',
        title: 'Batalla + Recuperación',
        description: 'El Héroe libra la batalla; el Sanador cura las heridas para permitir una nueva victoria.',
        synergyKeyword: 'Resiliencia Victoriosa'
      }
    ],
    variants: {
      masculine: {
        name: 'El Héroe',
        characterTitle: 'El Campeón del Coraje y la Superación Trascendente',
        centralQuestion: '¿Qué desafío estás dispuesto a enfrentar para demostrar tu valía y proteger a los tuyos?',
        shortDescription: 'Superación de pruebas, coraje ante lo desconocido y defensa noble.',
        fullDescription: 'El Héroe masculino cruza el umbral del miedo para conquistar la prueba, rescatar a los suyos y regresar con el elixir de la sabiduría.',
        mantra: 'No huyo del desafío; avanzo con honor y determinación.',
        strength: 'Valor indomable, perseverancia, lealtad y liderazgo épico.',
        shadow: 'Temerario suicida / Arrogante invencible',
        shadowDescription: 'Se expone a riesgos absurdos por orgullo o trata a los demás con condescendencia.',
        shadowAntidote: 'Someter el coraje al discernimiento ético.',
        domains: {
          liderazgo: 'Liderazgo en situaciones límite y rescate de proyectos en crisis.',
          relaciones: 'Protección y lealtad a toda prueba.',
          crisis: 'Resiliencia y coraje de choque.',
          creatividad: 'Historias épicas y desafíos monumentales.',
          paternidad: 'Inculcación de coraje y perseverancia.',
        },
        balancedBehavior: ['Afronta la prueba con nobleza', 'Reconoce sus límites'],
        unbalancedBehavior: ['Búsqueda de protagonismo vano', 'Negación del dolor'],
        reflectionQuestions: ['¿Qué prueba me está pidiendo la vida superar en este momento?'],
        developmentExercises: [
          {
            title: 'Entrenamiento de Resistencia',
            description: 'Ponte una meta física o intelectual exigente y cúmplela sin excusas.',
            actionStep: 'Concluye el reto con presencia.'
          }
        ]
      },
      feminine: {
        name: 'La Heroína',
        characterTitle: 'La Conquistadora del Viaje Interior y la Propia Voz',
        centralQuestion: '¿Qué parte de tu poder necesitas reclamar para avanzar y rescatar tu propia voz?',
        shortDescription: 'Viaje interior de empoderamiento, valentía y rescate de la propia fuerza.',
        fullDescription: 'La Heroína emprende el descenso al inframundo de sus propios miedos para rescatar su autenticidad, romper cadenas del pasado y renacer fortalecida.',
        mantra: 'Reclamo mi poder, desciendo a mi verdad y renazco invencible.',
        strength: 'Empoderamiento radical, resiliencia emocional, coraje para sanar y voz propia.',
        shadow: 'Víctima resentida / Heroína solitaria desconectada',
        shadowDescription: 'Cree que tiene que sufrir para ser valiosa o se niega a recibir apoyo.',
        shadowAntidote: 'Celebrar la victoria y saber que la fuerza no está reñida con la ternura.',
        domains: {
          liderazgo: 'Defensa de causas justas y empoderamiento de otras mujeres.',
          relaciones: 'Relaciones de igual a igual, sin sumisión ni tiranía.',
          crisis: 'Resurgimiento poderoso tras el colapso emocional.',
          creatividad: 'Obras de sanación y empoderamiento transformador.',
          paternidad: 'Enseñanza del valor de la propia voz y la autoestima.',
        },
        balancedBehavior: ['Se levanta tras la caída con más fuerza', 'Honra su proceso'],
        unbalancedBehavior: ['Cargar con el sufrimiento como medalla', 'Aislamiento defensivo'],
        reflectionQuestions: ['¿Qué dolor del pasado estoy lista para transformar en mi mayor fortaleza?'],
        developmentExercises: [
          {
            title: 'Reclamo de la Voz',
            description: 'Expresa una opinión impopular pero sincera en una reunión o conversación.',
            actionStep: 'Sostén tu postura con serenidad y firmeza.'
          }
        ]
      },
      universal: {
        name: 'Héroe / Heroína',
        characterTitle: 'El Espíritu de Superación y Victoria',
        centralQuestion: '¿Cómo transformo la dificultad en fortaleza?',
        shortDescription: 'Valentía, resiliencia y superación personal.',
        fullDescription: 'La capacidad de afrontar los desafíos existenciales con entereza y nobleza.',
        mantra: 'Supero las pruebas y crezco con cada desafío.',
        strength: 'Coraje y resiliencia.',
        shadow: 'Temeridad o complejo de mártir.',
        shadowDescription: 'Búsqueda innecesaria del sufrimiento.',
        shadowAntidote: 'Sabiduría y cuidado.',
        domains: {
          liderazgo: 'Inspiración ante la dificultad.',
          relaciones: 'Lealtad.',
          crisis: 'Superación.',
          creatividad: 'Fuerza expresiva.',
          paternidad: 'Educación en el coraje.',
        },
        balancedBehavior: ['Nobleza y valor'],
        unbalancedBehavior: ['Arrogancia o victimismo'],
        reflectionQuestions: ['¿Qué reto voy a encarar con valentía?'],
        developmentExercises: [
          {
            title: 'Superación Diaria',
            description: 'Haz algo que requiera coraje.',
            actionStep: 'Hazlo hoy.'
          }
        ]
      }
    }
  }
};
