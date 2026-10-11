import { ArchetypeId } from '../types';

/**
 * El test por dilemas: cada pantalla es una situación concreta de la vida, con cuatro maneras de
 * responder, cada una de un arquetipo. Se elige la que más se parece a ti.
 *
 * Por qué así y no puntuando frases de 1 a 5: con frases que describen virtudes, casi todo el mundo
 * contesta «de acuerdo» a casi todo, los mapas salen planos y parecidos entre personas, y en bloques
 * por dimensión se adivina qué mide cada uno. Al tener que elegir, lo que sale es lo que de verdad
 * pesa más en ti.
 *
 * El reparto está equilibrado (lo comprueban las pruebas): en cada mitad del test, cada arquetipo
 * aparece exactamente cuatro veces, nunca dos veces en la misma pantalla, ninguna pareja se repite
 * dentro de una mitad, y en cada pantalla hay al menos tres dimensiones. La versión rápida es la
 * primera mitad; la completa, las dos intercaladas. Así ninguna figura tiene más ocasiones que otra.
 *
 * Las cuatro respuestas de una pantalla se quieren igual de razonables: ninguna es «la buena».
 * El orden en que se enseñan se baraja para cada persona.
 */

export interface OpcionDilema {
  texto: string;
  arquetipo: ArchetypeId;
}

export interface Dilema {
  /** Estable: los resultados guardados lo citan como «por qué te salió». */
  id: string;
  /** El ámbito de la vida, para situarse de un vistazo. */
  ambito: string;
  situacion: string;
  pregunta: string;
  opciones: [OpcionDilema, OpcionDilema, OpcionDilema, OpcionDilema];
}

/** La primera mitad: es también la versión rápida. */
const MITAD_RAPIDA: Dilema[] = [
  {
    id: 'proyecto-hundido',
    ambito: 'Trabajo',
    situacion: 'Te ponen al frente de un proyecto que va mal, con el equipo desanimado.',
    pregunta: '¿Qué haces primero?',
    opciones: [
      { arquetipo: 'rey', texto: 'Reparto responsabilidades y dejo claro quién decide qué.' },
      { arquetipo: 'guerrero', texto: 'Marco un ritmo exigente y dejo de aceptar excusas.' },
      { arquetipo: 'sacerdote', texto: 'Reúno al equipo para recordar por qué este proyecto importa.' },
      { arquetipo: 'mago', texto: 'Busco el fallo de fondo que nadie ha visto y le doy la vuelta.' },
    ],
  },
  {
    id: 'ascenso-dificil',
    ambito: 'Decisiones',
    situacion: 'Te ofrecen un puesto con más responsabilidad, pero bastante más difícil.',
    pregunta: '¿Qué pesa más en tu respuesta?',
    opciones: [
      { arquetipo: 'heroe', texto: 'Que es un reto de verdad y quiero comprobar si puedo con él.' },
      { arquetipo: 'rey', texto: 'Que podría ordenar lo que ahora funciona mal para mucha gente.' },
      { arquetipo: 'sabio', texto: 'Entender bien en qué me meto antes de contestar nada.' },
      { arquetipo: 'soberano', texto: 'Que sea una decisión mía, no lo que se espera de mí.' },
    ],
  },
  {
    id: 'amistades-peleadas',
    ambito: 'Amistad',
    situacion: 'Dos amistades tuyas se han peleado y cada una te cuenta su versión.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'sabio', texto: 'Antes de opinar, reúno los hechos y lo pienso con calma.' },
      { arquetipo: 'integrador', texto: 'Busco lo que cada una tiene de razón y las junto a hablar.' },
      { arquetipo: 'sanador', texto: 'Me fijo en lo que le duele a cada una debajo del enfado.' },
      { arquetipo: 'creador', texto: 'Les propongo hacer juntas algo nuevo que las vuelva a unir.' },
    ],
  },
  {
    id: 'relacion-fria',
    ambito: 'Pareja',
    situacion: 'Tu relación pasa por una etapa fría y rutinaria.',
    pregunta: '¿Qué te sale hacer?',
    opciones: [
      { arquetipo: 'amante', texto: 'Preparo algo que nos haga sentir y disfrutar como al principio.' },
      { arquetipo: 'heroe', texto: 'Lo tomo como una prueba: no pienso rendirme sin pelearlo.' },
      { arquetipo: 'sanador', texto: 'Pregunto qué herida hay debajo de esa distancia.' },
      { arquetipo: 'sacerdote', texto: 'Propongo algo nuestro que repetir cada semana, como un ritual.' },
    ],
  },
  {
    id: 'dos-semanas-libres',
    ambito: 'Tiempo libre',
    situacion: 'Por fin tienes dos semanas libres, sin compromisos.',
    pregunta: '¿Cómo las usas?',
    opciones: [
      { arquetipo: 'explorador', texto: 'Me voy a un sitio que no conozco, sin un plan cerrado.' },
      { arquetipo: 'sacerdote', texto: 'Hago un retiro, o algo que me devuelva el sentido de las cosas.' },
      { arquetipo: 'soberano', texto: 'Hago exactamente lo que me apetezca, sin dar explicaciones.' },
      { arquetipo: 'constructor', texto: 'Avanzo en ese proyecto que llevo tiempo queriendo terminar.' },
    ],
  },
  {
    id: 'hablar-en-publico',
    ambito: 'Miedo',
    situacion: 'Te toca hablar ante mucha gente, y es algo que te da miedo.',
    pregunta: '¿Cómo lo afrontas?',
    opciones: [
      { arquetipo: 'guerrero', texto: 'Ensayo cada día, con disciplina, hasta dominarlo.' },
      { arquetipo: 'integrador', texto: 'No elijo entre los nervios y las ganas: salgo con los dos.' },
      { arquetipo: 'heroe', texto: 'Justo porque me da miedo, quiero hacerlo.' },
      { arquetipo: 'mistico', texto: 'Antes de salir me quedo en silencio y confío en lo que surja.' },
    ],
  },
  {
    id: 'tareas-de-casa',
    ambito: 'Hogar',
    situacion: 'En casa hay tensión porque nadie se pone de acuerdo con las tareas.',
    pregunta: '¿Qué propones?',
    opciones: [
      { arquetipo: 'integrador', texto: 'Escucho a cada quien y armo un acuerdo con algo de todos.' },
      { arquetipo: 'constructor', texto: 'Un sistema claro de turnos, que funcione sin discutirlo cada día.' },
      { arquetipo: 'mago', texto: 'Busco qué está provocando de verdad la tensión y le doy la vuelta.' },
      { arquetipo: 'cuidador', texto: 'Me encargo yo de lo que falta para que nadie lo pase mal.' },
    ],
  },
  {
    id: 'norma-absurda',
    ambito: 'Normas',
    situacion: 'En tu trabajo imponen una norma nueva que te parece absurda.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'rebelde', texto: 'La cuestiono en voz alta: si no sirve, no pienso seguirla.' },
      { arquetipo: 'bufon', texto: 'Le saco el lado cómico y le quito tensión al equipo.' },
      { arquetipo: 'explorador', texto: 'Empiezo a mirar otros sitios donde trabajar a mi aire.' },
      { arquetipo: 'integrador', texto: 'Busco una versión que respete lo que pretende y lo que necesitamos.' },
    ],
  },
  {
    id: 'un-favor-mas',
    ambito: 'Cansancio',
    situacion: 'Llevas semanas con el cansancio acumulado y alguien te pide un favor más.',
    pregunta: '¿Qué respondes?',
    opciones: [
      { arquetipo: 'soberano', texto: 'Que no, sin culpa: mi tiempo también es mío.' },
      { arquetipo: 'cuidador', texto: 'Que sí: sé que esa persona me necesita.' },
      { arquetipo: 'bufon', texto: 'Le contesto con una broma y negocio algo más ligero.' },
      { arquetipo: 'mistico', texto: 'Me tomo un momento a solas para escuchar qué necesito de verdad.' },
    ],
  },
  {
    id: 'cumpleanos-familiar',
    ambito: 'Familia',
    situacion: 'Te toca organizar el cumpleaños de alguien de tu familia.',
    pregunta: '¿Qué te importa más?',
    opciones: [
      { arquetipo: 'creador', texto: 'Que sea original: algo que nunca hayamos hecho.' },
      { arquetipo: 'bufon', texto: 'Que nos riamos mucho; lo demás es lo de menos.' },
      { arquetipo: 'padre', texto: 'Que sienta que la familia está detrás y le respalda.' },
      { arquetipo: 'sacerdote', texto: 'Que haya un momento para honrar lo que ha vivido este año.' },
    ],
  },
  {
    id: 'dinero-inesperado',
    ambito: 'Dinero',
    situacion: 'Te llega un dinero que no esperabas.',
    pregunta: '¿En qué lo usas?',
    opciones: [
      { arquetipo: 'creador', texto: 'En lo necesario para crear eso que llevo tiempo imaginando.' },
      { arquetipo: 'mago', texto: 'En una idea que puede transformar mi situación por completo.' },
      { arquetipo: 'soberano', texto: 'En ganar libertad: depender menos de nadie.' },
      { arquetipo: 'amante', texto: 'En vivir algo precioso con alguien a quien quiero.' },
    ],
  },
  {
    id: 'duelo-cercano',
    ambito: 'Pérdida',
    situacion: 'Una persona cercana acaba de perder a alguien querido.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'sanador', texto: 'Me siento a su lado y dejo que hable de su dolor el tiempo que haga falta.' },
      { arquetipo: 'rey', texto: 'Organizo lo que haya que decidir para que no cargue con todo.' },
      { arquetipo: 'explorador', texto: 'Le propongo irnos unos días lejos, a respirar otro aire.' },
      { arquetipo: 'cuidador', texto: 'Le llevo comida y me encargo de lo práctico de su día a día.' },
    ],
  },
  {
    id: 'relacion-que-dana',
    ambito: 'Amistad',
    situacion: 'Una amistad te pide consejo sobre una relación que le hace daño.',
    pregunta: '¿Qué le dices o haces?',
    opciones: [
      { arquetipo: 'cuidador', texto: 'Le ofrezco mi casa y mi tiempo para lo que necesite.' },
      { arquetipo: 'amante', texto: 'Le recuerdo lo que merece sentir en una relación de verdad.' },
      { arquetipo: 'rebelde', texto: 'Le digo claro que corte con eso, aunque no quiera oírlo.' },
      { arquetipo: 'sabio', texto: 'Le ayudo a mirar los hechos con calma, sin decidir en su lugar.' },
    ],
  },
  {
    id: 'aprender-deprisa',
    ambito: 'Aprendizaje',
    situacion: 'Tienes que aprender algo difícil en poco tiempo.',
    pregunta: '¿Cómo lo haces?',
    opciones: [
      { arquetipo: 'guerrero', texto: 'Me pongo un horario estricto y lo cumplo cueste lo que cueste.' },
      { arquetipo: 'bufon', texto: 'Lo convierto en un juego para que no se me haga pesado.' },
      { arquetipo: 'sabio', texto: 'Voy a los fundamentos hasta entenderlo de verdad.' },
      { arquetipo: 'constructor', texto: 'Lo divido en pasos pequeños y avanzo uno cada día.' },
    ],
  },
  {
    id: 'viaje-torcido',
    ambito: 'Imprevistos',
    situacion: 'De viaje con gente a tu cargo, se cancela el vuelo de vuelta.',
    pregunta: '¿Qué te sale hacer?',
    opciones: [
      { arquetipo: 'mago', texto: 'Encuentro una salida ingeniosa que a nadie se le había ocurrido.' },
      { arquetipo: 'explorador', texto: 'Lo aprovecho: nos quedamos a descubrir el lugar.' },
      { arquetipo: 'heroe', texto: 'Me pongo al frente y no paro hasta resolverlo.' },
      { arquetipo: 'padre', texto: 'Lo primero, que todo el grupo esté a salvo y tranquilo.' },
    ],
  },
  {
    id: 'casa-futura',
    ambito: 'Futuro',
    situacion: 'Imaginas cómo quieres que sea tu casa dentro de diez años.',
    pregunta: '¿Qué es lo primero que ves?',
    opciones: [
      { arquetipo: 'padre', texto: 'Un lugar seguro donde quien quiero pueda crecer con amparo.' },
      { arquetipo: 'constructor', texto: 'Algo sólido, bien hecho y pagado, que dure.' },
      { arquetipo: 'mistico', texto: 'Un espacio de calma, con silencio y naturaleza cerca.' },
      { arquetipo: 'amante', texto: 'Belleza, buena mesa y gente que quiero alrededor.' },
    ],
  },
  {
    id: 'trato-injusto',
    ambito: 'Injusticia',
    situacion: 'Ves que en tu entorno tratan injustamente a alguien más vulnerable.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'guerrero', texto: 'Me planto y le defiendo con firmeza, ahí mismo.' },
      { arquetipo: 'padre', texto: 'Le tomo bajo mi protección y le enseño a hacerse respetar.' },
      { arquetipo: 'sanador', texto: 'Me acerco después a acompañarle en lo que le ha dolido.' },
      { arquetipo: 'rebelde', texto: 'Denuncio lo que permite que eso pase, aunque me cueste.' },
    ],
  },
  {
    id: 'cambio-de-vida',
    ambito: 'Sentido',
    situacion: 'Sientes que tu vida necesita un cambio grande, pero no sabes cuál.',
    pregunta: '¿Por dónde empiezas?',
    opciones: [
      { arquetipo: 'mistico', texto: 'Por el silencio: espero a que la respuesta se me revele.' },
      { arquetipo: 'creador', texto: 'Por imaginar y bocetar la vida que quiero.' },
      { arquetipo: 'rebelde', texto: 'Por romper con lo que me ata, aunque no tenga plan B.' },
      { arquetipo: 'rey', texto: 'Por hacer balance de mis responsabilidades y reordenar prioridades.' },
    ],
  },
];

/** La segunda mitad: completa el test con otras situaciones y otras parejas de figuras. */
const MITAD_COMPLETA: Dilema[] = [
  {
    id: 'crisis-sin-respuestas',
    ambito: 'Crisis',
    situacion: 'Pasas por una crisis que te ha dejado sin respuestas.',
    pregunta: '¿A qué te agarras?',
    opciones: [
      { arquetipo: 'mistico', texto: 'A algo más grande que yo: meditar, rezar o contemplar.' },
      { arquetipo: 'mago', texto: 'A entender el patrón que se repite en mi vida, para transformarlo.' },
      { arquetipo: 'rebelde', texto: 'A cuestionar todo lo que me enseñaron y quedarme con lo mío.' },
      { arquetipo: 'sanador', texto: 'A sanar la herida de fondo, con ayuda y sin prisa.' },
    ],
  },
  {
    id: 'ciudad-desconocida',
    ambito: 'Viajes',
    situacion: 'Llegas a una ciudad que no conoces y tienes un día libre.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'sacerdote', texto: 'Visito sus lugares con historia y significado.' },
      { arquetipo: 'explorador', texto: 'Me pierdo por barrios a los que no van los turistas.' },
      { arquetipo: 'heroe', texto: 'Me propongo algo difícil: subir a lo más alto o hacer la ruta larga.' },
      { arquetipo: 'amante', texto: 'Busco dónde comer bien y disfrutar del ambiente.' },
    ],
  },
  {
    id: 'proyecto-propio',
    ambito: 'Proyectos',
    situacion: 'Quieres poner en marcha algo propio: un negocio, una obra, una idea.',
    pregunta: '¿Cómo empiezas?',
    opciones: [
      { arquetipo: 'constructor', texto: 'Con un plan detallado y unas bases sólidas antes de lanzarme.' },
      { arquetipo: 'mago', texto: 'Buscando el enfoque que lo cambia todo y nadie está usando.' },
      { arquetipo: 'creador', texto: 'Creando ya, aunque no sepa a dónde me llevará.' },
      { arquetipo: 'guerrero', texto: 'Con un compromiso diario, sin fallar un solo día.' },
    ],
  },
  {
    id: 'algo-sale-mal',
    ambito: 'Fracaso',
    situacion: 'Algo que te importaba mucho te ha salido mal.',
    pregunta: '¿Qué haces después?',
    opciones: [
      { arquetipo: 'heroe', texto: 'Me levanto y lo vuelvo a intentar con más fuerza.' },
      { arquetipo: 'bufon', texto: 'Me río de mí y le quito hierro al asunto.' },
      { arquetipo: 'creador', texto: 'Aprovecho lo que salió para hacer algo distinto.' },
      { arquetipo: 'rebelde', texto: 'Me pregunto si las reglas del juego tenían sentido.' },
    ],
  },
  {
    id: 'tradicion-familiar',
    ambito: 'Tradición',
    situacion: 'Tu familia espera que sigas una tradición que no compartes del todo.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'constructor', texto: 'La mantengo: lo que se sostiene en el tiempo da estabilidad.' },
      { arquetipo: 'rebelde', texto: 'Me niego: no repito algo solo porque siempre se ha hecho.' },
      { arquetipo: 'sacerdote', texto: 'Busco su sentido original y la honro a mi manera.' },
      { arquetipo: 'soberano', texto: 'Decido yo qué parte sigo y cuál no, sin pedir permiso.' },
    ],
  },
  {
    id: 'futuros-distintos',
    ambito: 'Pareja',
    situacion: 'Tú y la persona más cercana a ti queréis cosas distintas para el futuro.',
    pregunta: '¿Cómo lo resuelves?',
    opciones: [
      { arquetipo: 'integrador', texto: 'Busco un camino que tenga algo de lo que queremos los dos.' },
      { arquetipo: 'padre', texto: 'Pienso primero en quienes dependen de nosotros.' },
      { arquetipo: 'amante', texto: 'Escucho lo que siento por esa persona y dejo que eso decida.' },
      { arquetipo: 'mistico', texto: 'Lo dejo reposar: la respuesta llegará cuando toque.' },
    ],
  },
  {
    id: 'decision-de-un-joven',
    ambito: 'Guiar',
    situacion: 'Una persona joven a la que quieres toma una decisión que te parece un error.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'padre', texto: 'Le doy mi opinión con cariño y sigo a su lado para guiarle.' },
      { arquetipo: 'guerrero', texto: 'Le hablo claro y firme: hay límites que no se cruzan.' },
      { arquetipo: 'sabio', texto: 'Le hago preguntas para que piense en las consecuencias.' },
      { arquetipo: 'rebelde', texto: 'Le apoyo: a veces hay que equivocarse a la propia manera.' },
    ],
  },
  {
    id: 'domingo-libre',
    ambito: 'Tiempo libre',
    situacion: 'Tienes un domingo entero para ti.',
    pregunta: '¿Qué haces con él?',
    opciones: [
      { arquetipo: 'creador', texto: 'Creo algo: escribir, cocinar algo nuevo, pintar.' },
      { arquetipo: 'mistico', texto: 'Paseo sin rumbo por la naturaleza, en silencio.' },
      { arquetipo: 'cuidador', texto: 'Visito a alguien que pasa mucho tiempo sin compañía.' },
      { arquetipo: 'explorador', texto: 'Me escapo a un pueblo o una ruta que no conozco.' },
    ],
  },
  {
    id: 'grupo-dividido',
    ambito: 'Grupo',
    situacion: 'Tu grupo está dividido en dos bandos ante una decisión importante.',
    pregunta: '¿Qué papel tomas?',
    opciones: [
      { arquetipo: 'integrador', texto: 'Busco la propuesta que recoge lo mejor de los dos bandos.' },
      { arquetipo: 'soberano', texto: 'Digo lo que pienso con claridad y no me dejo arrastrar.' },
      { arquetipo: 'sanador', texto: 'Atiendo a quien está saliendo herido de la discusión.' },
      { arquetipo: 'heroe', texto: 'Asumo yo el riesgo de la decisión difícil.' },
    ],
  },
  {
    id: 'reunion-atascada',
    ambito: 'Trabajo',
    situacion: 'Una reunión importante se ha atascado y la tensión sube.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'mago', texto: 'Planteo la pregunta que lo pone todo en otra perspectiva.' },
      { arquetipo: 'integrador', texto: 'Resumo lo que tienen en común las posturas enfrentadas.' },
      { arquetipo: 'rey', texto: 'Tomo la palabra, ordeno el debate y propongo una decisión.' },
      { arquetipo: 'bufon', texto: 'Suelto un comentario que nos hace reír y rompe el hielo.' },
    ],
  },
  {
    id: 'cuidar-el-cuerpo',
    ambito: 'Salud',
    situacion: 'Decides cuidar más tu cuerpo.',
    pregunta: '¿Cómo lo haces?',
    opciones: [
      { arquetipo: 'guerrero', texto: 'Con un entrenamiento exigente y constante.' },
      { arquetipo: 'cuidador', texto: 'Cocinando sano para mí y para quienes viven conmigo.' },
      { arquetipo: 'amante', texto: 'Con lo que me da placer: bailar, nadar, comer rico y sano.' },
      { arquetipo: 'soberano', texto: 'A mi manera, sin seguir modas ni consejos de nadie.' },
    ],
  },
  {
    id: 'familiar-en-el-hospital',
    ambito: 'Enfermedad',
    situacion: 'Alguien de tu familia está ingresado en el hospital.',
    pregunta: '¿Cómo estás a su lado?',
    opciones: [
      { arquetipo: 'sanador', texto: 'Le escucho, también en lo que le da miedo.' },
      { arquetipo: 'padre', texto: 'Hablo con el equipo médico y velo por que le traten bien.' },
      { arquetipo: 'bufon', texto: 'Le hago reír para que olvide un rato dónde está.' },
      { arquetipo: 'sacerdote', texto: 'Con una oración, un ritual o un gesto que tenga sentido.' },
    ],
  },
  {
    id: 'ciudad-nueva',
    ambito: 'Cambios',
    situacion: 'Te mudas a una ciudad nueva donde no conoces a nadie.',
    pregunta: '¿Qué haces los primeros meses?',
    opciones: [
      { arquetipo: 'explorador', texto: 'Salgo cada día a descubrir rincones y gente nueva.' },
      { arquetipo: 'constructor', texto: 'Monto mi casa y mis rutinas para tener una base firme.' },
      { arquetipo: 'rey', texto: 'Me uno a algún grupo y acabo organizándolo.' },
      { arquetipo: 'sanador', texto: 'Me doy tiempo para despedir lo que dejé atrás.' },
    ],
  },
  {
    id: 'critica-dura',
    ambito: 'Críticas',
    situacion: 'Alguien critica con dureza cómo vives tu vida.',
    pregunta: '¿Cómo te lo tomas?',
    opciones: [
      { arquetipo: 'soberano', texto: 'Con calma: mi vida la decido yo.' },
      { arquetipo: 'bufon', texto: 'Con humor: le devuelvo una broma.' },
      { arquetipo: 'explorador', texto: 'Me recuerda que hay mil maneras de vivir, y quiero conocer más.' },
      { arquetipo: 'sabio', texto: 'Analizo si tiene algo de razón antes de responder.' },
    ],
  },
  {
    id: 'amistad-en-apuros',
    ambito: 'Amistad',
    situacion: 'Una amistad tiene un problema económico serio.',
    pregunta: '¿Cómo le ayudas?',
    opciones: [
      { arquetipo: 'cuidador', texto: 'Con lo que necesite en el día a día, sin que tenga que pedirlo.' },
      { arquetipo: 'padre', texto: 'Le aconsejo y le guío para que no vuelva a pasarle.' },
      { arquetipo: 'mago', texto: 'Le ayudo a ver una salida que no está viendo.' },
      { arquetipo: 'heroe', texto: 'Me pongo manos a la obra hasta sacarle del apuro.' },
    ],
  },
  {
    id: 'plan-sin-concretar',
    ambito: 'Amistad',
    situacion: 'Tu grupo de amistades quiere hacer algo juntos, pero nadie concreta.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'creador', texto: 'Me invento un plan distinto que nadie haya propuesto.' },
      { arquetipo: 'sabio', texto: 'Comparo las opciones y propongo la que tiene más sentido.' },
      { arquetipo: 'amante', texto: 'Propongo lo que más disfrutamos: una cena larga, sin prisa.' },
      { arquetipo: 'rey', texto: 'Tomo la iniciativa: pongo fecha y reparto tareas.' },
    ],
  },
  {
    id: 'manana-propia',
    ambito: 'Rutina',
    situacion: 'Tienes la mañana para ti, sin prisas.',
    pregunta: '¿Cómo empiezas el día?',
    opciones: [
      { arquetipo: 'rey', texto: 'Repaso lo que depende de mí y organizo la jornada.' },
      { arquetipo: 'sacerdote', texto: 'Con un pequeño ritual que le da sentido al día.' },
      { arquetipo: 'mistico', texto: 'En silencio, sin pantallas, sintiendo el momento.' },
      { arquetipo: 'guerrero', texto: 'Con ejercicio: me pongo en marcha con disciplina.' },
    ],
  },
  {
    id: 'problema-del-barrio',
    ambito: 'Comunidad',
    situacion: 'En tu edificio o tu barrio hay un problema común que nadie resuelve.',
    pregunta: '¿Qué haces?',
    opciones: [
      { arquetipo: 'integrador', texto: 'Junto a vecinos de posturas distintas para que se entiendan.' },
      { arquetipo: 'cuidador', texto: 'Ayudo directamente a quienes más lo sufren.' },
      { arquetipo: 'sabio', texto: 'Me informo bien de las causas y propongo una solución con fundamento.' },
      { arquetipo: 'constructor', texto: 'Organizo una solución práctica y duradera, paso a paso.' },
    ],
  },
];

/** El test completo, con las dos mitades intercaladas para que los ámbitos se alternen. */
export const DILEMAS: Dilema[] = MITAD_RAPIDA.flatMap((d, i) => [d, MITAD_COMPLETA[i]]);

/** El rápido: la primera mitad, que por sí sola también está equilibrada. */
export const DILEMAS_RAPIDO_IDS: string[] = MITAD_RAPIDA.map(d => d.id);

/** Para desempatar: lo que mueve a cada figura, sin su nombre (el nombre inclina la elección). */
export const PREGUNTA_DESEMPATE = 'Ahora mismo, en tu vida, ¿qué te mueve más?';
