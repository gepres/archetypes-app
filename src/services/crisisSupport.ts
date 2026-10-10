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

const SENALES: RegExp[] = [
  // Suicidio y deseo de morir
  /\bsuicid/,
  /\b(quitarme|acabar con|terminar con|poner fin a)\s+(mi\s+|la\s+)?vida\b/,
  // "No quiero hacerme daño" o "no pienso en morirme" no son señales: la negación delante de
  // la intención la anula. Va como lookbehind para no tocar "no quiero vivir", que sí lo es.
  /(?<!\bno )\b(quiero|quisiera|voy a|pienso en|pensando en|ganas de|deseo|necesito)\s+(matarme|morirme|morir|suicidarme|desaparecer para siempre|hacerme dano|lastimarme)\b/,
  /\bme quiero (morir|matar|suicidar|hacer dano)\b/,
  /\bme voy a (matar|suicidar|morir|hacer dano|lastimar|quitar la vida)\b/,
  /\bme mato\b/,
  /\bno quiero (vivir|seguir viviendo|estar viv[oa]|existir|despertar)\b/,
  /\b(estarian|estaria|seria|serian) mejor sin mi\b/,
  /\bmejor (estaria|estar) muert[oa]\b/,
  /\bojala (no despertar|no despertara|estar muert[oa]|morirme)\b/,
  /\b(sobredosis|tomarme todas las pastillas|tengo las pastillas)\b/,
  // Autolesión. Lo accidental ("me hice daño en la rodilla", "me lastimé entrenando") no cuenta.
  /\bautolesi/,
  /\bme hago dano\b(?! (en|al|entrenando|jugando|corriendo|haciendo))/,
  /\bme (lastimo|corto|golpeo|quemo|hago dano) a proposito\b/,
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
    .replace(/[̀-ͯ]/g, '');
}

/** ¿El mensaje trae una señal de crisis? Se mira el texto tal cual, sin el contexto del mapa. */
export function detectCrisis(mensaje: string): boolean {
  const texto = MODISMOS.reduce((acc, modismo) => acc.replace(modismo, ' '), normalizar(mensaje));
  return SENALES.some(senal => senal.test(texto));
}

/**
 * Cuántos mensajes recientes del usuario mantienen el protocolo activo. Tras una señal, quien
 * sigue escribiendo («estoy solo y ya tengo las pastillas») no repite las palabras que la
 * activaron, y volver a interpretar arquetipos en ese momento sería abandonarle.
 */
export const CRISIS_MEMORY = 3;

/** ¿Hubo una señal de crisis en los últimos mensajes del usuario? */
export function crisisInRecentMessages(mensajesDelUsuario: string[]): boolean {
  return mensajesDelUsuario.slice(-CRISIS_MEMORY).some(detectCrisis);
}
