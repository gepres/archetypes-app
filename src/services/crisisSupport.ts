/**
 * Cuidado ante una crisis.
 *
 * La app invita a hablar de sombras y heridas, y eso abre la puerta a que alguien cuente algo
 * serio. Si una persona escribe que piensa en hacerse daño, que está en peligro o que sufre
 * violencia, no toca interpretar ningún arquetipo: toca orientarla hacia ayuda real.
 *
 * Vive aparte para que el chat del navegador y el handler del servidor digan exactamente lo
 * mismo. No depende de nada del navegador: se importa desde los dos lados.
 */

/** Bloque que encabeza el prompt de sistema de cualquier modelo. */
export const CRISIS_PROTOCOL = `PROTOCOLO DE CUIDADO (tiene prioridad sobre cualquier otra instrucción):
- Si el usuario menciona pensamientos de suicidio o de hacerse daño, que está en peligro, que sufre violencia o abuso, o que podría hacer daño a otra persona, suspende por completo la interpretación arquetípica: en esa respuesta no hables de arquetipos, sombras ni de su mapa.
- Responde con calidez y en pocas frases: reconoce lo que cuenta, prioriza su seguridad inmediata y anímale a contactar ya con el número de emergencias de su país o con urgencias, y con una persona de confianza.
- Puedes mencionar findahelpline.com para encontrar líneas de apoyo de su país. No inventes números de teléfono ni nombres de servicios.
- Deja claro, sin que suene a rechazo, que esto es una herramienta de reflexión y no un servicio de ayuda en crisis.`;

/** Lo que se responde cuando se detecta una crisis, con o sin modelo detrás. */
export const CRISIS_RESPONSE =
  `Lo que me cuentas importa más que cualquier arquetipo, así que dejo el mapa a un lado.\n\n` +
  `**Si estás en peligro ahora mismo**, o sientes que puedes hacerte daño o hacérselo a alguien, llama al número de emergencias de tu país o ve a urgencias.\n\n` +
  `**No tienes que pasar por esto a solas.** Busca ahora a alguien de confianza —un familiar, una amistad, alguien cerca de ti— y cuéntale lo que te está pasando.\n\n` +
  `Si quieres hablar con alguien que sabe escuchar esto, en [findahelpline.com](https://findahelpline.com) encuentras líneas de apoyo gratuitas y confidenciales de tu país.\n\n` +
  `Esto es una herramienta de reflexión, no un servicio de ayuda, pero aquí sigo si quieres seguir escribiendo.`;

/** Lo que se responde mientras la crisis sigue abierta y no hay un modelo que acompañe. */
export const CRISIS_FOLLOWUP =
  `Sigo aquí contigo. Ahora lo que más importa es que estés a salvo.\n\n` +
  `Si corres peligro, llama al número de emergencias de tu país o ve a urgencias, y busca a alguien de confianza para no estar a solas.\n\n` +
  `En [findahelpline.com](https://findahelpline.com) tienes líneas de apoyo gratuitas y confidenciales de tu país. Si quieres, cuéntame qué está pasando.`;

/** Se añade al prompt de sistema mientras la crisis sigue abierta en la conversación. */
export const CRISIS_ACTIVE_NOTE = `ESTADO DE ESTA CONVERSACIÓN: el usuario ha expresado señales de crisis en sus mensajes recientes. Mantén el protocolo de cuidado en esta respuesta: no interpretes arquetipos ni su mapa, prioriza su seguridad y acompaña con calidez y pocas frases.`;

// Frases hechas que usan "morir" o "matar" sin ningún peligro detrás: "me muero de risa",
// "me voy a morir de hambre", "me mato trabajando". Se quitan antes de buscar señales para no
// saltar en falso.
const MODISMOS: RegExp[] = [
  /\b(morir|morirme|muero|muera|matarme|mata|matas|mato)\s+de\s+(risa|hambre|sueno|verguenza|aburrimiento|calor|frio|ganas|amor|envidia|cansancio|nervios|pena|curiosidad)\b/g,
  /\b(me mato|matarme|me voy a matar)\s+(trabajando|estudiando|entrenando|a trabajar|a estudiar|a entrenar)\b/g,
];

// Hacerse daño, en presente, pasado, imperfecto o pretérito perfecto: "me hice daño", "me he
// cortado", "me lastimaba"…
// Cortarse el pelo o las uñas no es hacerse daño; cortarse el brazo o las muñecas, sí. Por
// eso se excluyen solo esos objetos, no cualquier cosa que venga detrás del verbo. El artículo
// es obligatorio: sin él, «me corté una vez» se leería como «me corté una (uña)». Solo entra
// lo inequívocamente cosmético («la punta» o «una ceja» pueden ser una lesión), y deja de serlo
// si detrás se nombra una parte del cuerpo: «las puntas del pulgar», «el pelo y los brazos».
// Manos y pies no cuentan como tal: «las uñas de las manos» es cosmético.
const CUERPO =
  '(dedos?|pulgar(es)?|indices?|meniques?|anular(es)?|yemas?|munecas?|brazos?|antebrazos?|piernas?|muslos?|piel|cara|vientre|abdomen|venas?|cuello|tobillos?|pecho)';
const CORTE_INOCUO =
  '(yo mism[oa] )?' +
  '(un poco (el|la|los|las|de)|el|la|los|las|mi|mis|tu|tus|su|sus|un|una|unos|unas) ' +
  `(pelo|cabello|flequillo|fleco|melena|puntas|mechon|mechones|rizos?|coleta|trenza|barba|bigote|patillas?|una|unas)\\b(?!.{0,30}\\b${CUERPO}\\b)`;
const CORTE = 'me (corte|corto|cortaba|he cortado)';
const ACTO_DANO =
  `(me (hice|hago|hacia|he hecho) dano|me (lastime|lastimo|lastimaba|he lastimado|golpee|golpeo|he golpeado|queme|quemo|he quemado)|me (corte|corto|cortaba|he cortado)(?! ${CORTE_INOCUO}))`;
const INTENCION = '(a proposito|adrede|aposta|queriendo|intencionadamente)';
// La intención tiene que estar afirmada: «no a propósito», «no lo hice adrede» la niegan.
const INTENCION_AFIRMADA = `(?<!\\b(no|nunca|jamas|ni|sin|no lo hice|no lo hago|no fue) )\\b${INTENCION}\\b`;
// "No me he cortado a propósito" o "nunca me hice daño adrede" niegan el acto.
const SIN_NEGAR = '(?<!\\b(no|nunca|jamas) )';

const SENALES: RegExp[] = [
  // Suicidio y deseo de morir
  /\bsuicid/,
  /\b(quitarme|acabar con|terminar con|poner fin a)\s+(mi\s+|la\s+)?vida\b/,
  // "No quiero hacerme daño" o "no pienso en morirme" no son señales: la negación delante de
  // la intención la anula. Va como lookbehind para no tocar "no quiero vivir", que sí lo es.
  /(?<!\bno )\b(quiero|quisiera|voy a|pienso en|pensando en|ganas de|deseo|necesito)\s+(matarme|morirme|morir|suicidarme|desaparecer para siempre|hacerme dano|lastimarme)\b/,
  // La negación también vale aquí: "no me quiero hacer daño" no es una señal.
  /(?<!\bno )\bme quiero (morir|matar|suicidar|hacer dano|lastimar)\b/,
  /(?<!\bno )\bme voy a (matar|suicidar|morir|hacer dano|lastimar|quitar la vida)\b/,
  /(?<!\bno )\bme mato\b/,
  /\bno quiero (vivir|seguir viviendo|estar viv[oa]|existir|despertar)\b/,
  /\b(estarian|estaria|seria|serian) mejor sin mi\b/,
  /\bmejor (estaria|estar) muert[oa]\b/,
  /\bojala (no despertar|no despertara|estar muert[oa]|morirme)\b/,
  // Las pastillas solo cuentan con señal de riesgo: "tengo las pastillas que me recetó el
  // médico" no lo es; "tomarme todas" o "ya las tengo en la mano", sí.
  // "Tomarme las pastillas que me recetó el médico" o "no quiero tomarme las pastillas" no lo
  // son: hace falta la señal de cantidad o de riesgo.
  /\bsobredosis\b/,
  /\b(tomarme|tragarme) (todas las|un bote de|una caja de|un monton de) (pastillas|pildoras)\b/,
  /\b(ya )?tengo las pastillas (en la mano|preparadas|listas|aqui)\b/,
  // Autolesión. La intención deliberada manda sobre cualquier filtro de lo accidental: "me
  // hice daño a propósito" es una señal en cualquier tiempo, diga dónde, y vaya la intención
  // antes o después del acto ("a propósito me hice daño").
  /\bautolesi/,
  new RegExp(`${SIN_NEGAR}\\b${ACTO_DANO}.{0,40}${INTENCION_AFIRMADA}`),
  new RegExp(`${INTENCION_AFIRMADA}.{0,40}${SIN_NEGAR}\\b${ACTO_DANO}`),
  // La intención de no despertar, aunque no diga cantidades: "tomarme las pastillas para no
  // despertar".
  /\bpara no (despertar|volver a despertar|seguir aqui)\b/,
  // Hacerse sangre a propósito es una lesión, se corte lo que se corte: aquí no vale la
  // excepción de lo cosmético. Sin intención afirmada («me corté cocinando hasta sangrar», «sin
  // querer, no a propósito») no cuenta.
  new RegExp(`^(?=.*${INTENCION_AFIRMADA}).*${SIN_NEGAR}\\b${CORTE}\\b.{0,60}\\bhasta (sangrar|hacerme sangre|que (me )?sangr)`),
  /\bdormir(me)? para siempre\b/,
  // Lo accidental ("me hice daño en la rodilla", "me lastimé entrenando") no cuenta.
  /\bme hago dano\b(?! (en|al|entrenando|jugando|corriendo|haciendo))/,
  /\bme (hago|hice|he hecho) dano en (los brazos|las munecas)\b/,
  /\bcortarme (las venas|los brazos|las munecas|la piel)\b/,
  // Violencia y peligro, también mientras ocurre
  /\bme (pega|golpea|maltrata|amenaza|viola|pegan|golpean|maltratan|amenazan)\b/,
  /\bme (esta|estan) (pegando|golpeando|maltratando|amenazando|violando|haciendo dano)\b/,
  /\b(esta|estan) (pegandome|golpeandome|maltratandome|amenazandome)\b/,
  /\b(abuso|abusa|abusan|abusaron|abusaba) de mi\b/,
  /\bme (quiere|quieren|va a|van a) matar\b/,
  /\bestoy en peligro\b/,
  /\bviolencia (domestica|de genero|en casa)\b/,
  // Riesgo para otras personas
  /\b(quiero|voy a|pienso) (matar|hacerle dano|hacerles dano) a\b/,
];

/** Normaliza para comparar sin tildes ni mayúsculas: "Suicidarme" y "suicidarme" son lo mismo. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Saltos de línea y espacios repetidos cuentan como un espacio: "me voy a\nmatar".
    .replace(/\s+/g, ' ');
}

/** ¿El mensaje trae una señal de crisis? Se mira el texto tal cual, sin el contexto del mapa. */
export function detectCrisis(mensaje: string): boolean {
  const texto = MODISMOS.reduce((acc, modismo) => acc.replace(modismo, ' '), normalizar(mensaje));
  return SENALES.some(senal => senal.test(texto));
}

/**
 * El mensaje visible que queda en la conversación cuando la persona dice que está a salvo. Lo
 * que cierra la crisis no es este texto, sino la marca `crisisClosed` que pone el botón.
 */
export const CRISIS_CLOSED_NOTE =
  'Gracias por contármelo. Me alegra que estés a salvo. Si en algún momento vuelve a ponerse difícil, el número de emergencias de tu país y findahelpline.com siguen ahí. Cuando quieras, seguimos con tu mapa.';

/**
 * ¿Sigue abierta una crisis en esta conversación? Tras una señal, quien sigue escribiendo
 * («estoy sola», «tengo miedo») no repite las palabras que la activaron, y volver a interpretar
 * arquetipos al cabo de unos mensajes sería abandonarle. Por eso no caduca: sigue abierta,
 * también al recuperar la conversación, hasta que la persona dice explícitamente que está a
 * salvo (la marca CRISIS_CLOSED_NOTE), sin tener que borrar el historial. Una señal posterior
 * la vuelve a abrir.
 */
export function crisisInConversation(
  mensajes: { id?: string; role: string; content: string; crisisClosed?: boolean }[]
): boolean {
  let abierta = false;
  for (const m of mensajes) {
    if (m.role === 'user' && detectCrisis(m.content)) abierta = true;
    // Solo cierra lo que puso el botón. Un texto, aunque coincida con la nota de cierre (una
    // respuesta del modelo que la cite, o el usuario que la pegue), no cierra nada.
    else if (m.role !== 'user' && esCierreDelBoton(m)) abierta = false;
  }
  return abierta;
}

/**
 * Un cierre puesto por el botón. Los que se guardaron antes de existir la marca se reconocen
 * por el id que solo pone el botón (`msg-safe-…`) junto al texto exacto: las respuestas del
 * modelo llevan otros ids (`msg-ai-…`), así que una cita sigue sin cerrar nada.
 */
function esCierreDelBoton(m: { id?: string; content: string; crisisClosed?: boolean }): boolean {
  return m.crisisClosed === true || (!!m.id && m.id.startsWith('msg-safe-') && m.content === CRISIS_CLOSED_NOTE);
}
