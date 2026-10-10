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

// Frases hechas que usan "morir" o "matar" sin ningún peligro detrás: "me muero de risa",
// "me voy a morir de hambre". Se quitan antes de buscar señales para no saltar en falso.
const MODISMOS = /\b(morir|morirme|muero|muera|matarme|mata|matas)\s+de\s+(risa|hambre|sueno|verguenza|aburrimiento|calor|frio|ganas|amor|envidia|cansancio|nervios|pena|curiosidad)\b/g;

const SENALES: RegExp[] = [
  // Suicidio y deseo de morir
  /\bsuicid/,
  /\b(quitarme|acabar con|terminar con|poner fin a)\s+(mi\s+|la\s+)?vida\b/,
  /\b(quiero|quisiera|voy a|pienso en|pensando en|ganas de|deseo|necesito)\s+(matarme|morirme|morir|suicidarme|desaparecer para siempre)\b/,
  /\bme quiero (morir|matar)\b/,
  /\bno quiero (vivir|seguir viviendo|estar viv[oa]|existir|despertar)\b/,
  /\b(estarian|estaria|seria|serian) mejor sin mi\b/,
  /\bmejor (estaria|estar) muert[oa]\b/,
  /\bojala (no despertar|no despertara|estar muert[oa]|morirme)\b/,
  /\b(sobredosis|tomarme todas las pastillas)\b/,
  // Autolesión
  /\bautolesi/,
  /\b(hacerme|me hago|me hice) dano\b/,
  /\b(lastimarme|me lastimo|me lastime)\b/,
  /\bcortarme (las venas|los brazos|las munecas|la piel)\b/,
  // Violencia y peligro
  /\bme (pega|golpea|maltrata|amenaza|viola|pegan|golpean|maltratan|amenazan)\b/,
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
  const texto = normalizar(mensaje).replace(MODISMOS, ' ');
  return SENALES.some(senal => senal.test(texto));
}
