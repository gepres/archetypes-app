/**
 * La voz de V2.
 *
 * Usa la sintesis del propio navegador: no cuesta nada, no necesita clave, no
 * anade latencia de red y funciona sin conexion. La calidad es la del sistema
 * de cada quien. Todo lo especifico de esa API vive aqui, detras de tres
 * funciones, para poder cambiarla por una voz de pago sin tocar las pantallas.
 */

export type VoiceState = 'no-soportada' | 'lista' | 'hablando';

// Voces femeninas en espanol, por plataforma. El orden es la preferencia.
const FEMENINAS = [
  // iOS y macOS
  'monica', 'mónica', 'paulina', 'marisol', 'soledad', 'isabela', 'esperanza',
  // Android y Chrome
  'google español', 'google espanol', 'es-es-standard-a', 'es-us-standard-a',
  // Windows y Edge
  'helena', 'laura', 'sabina', 'elvira', 'dalia', 'salome', 'salomé', 'ximena',
  'lupe', 'paloma', 'tania', 'camila', 'lia', 'lía', 'abril', 'triana',
];

// Voces masculinas conocidas: se descartan salvo que no quede ninguna otra.
const MASCULINAS = [
  'jorge', 'juan', 'diego', 'pablo', 'carlos', 'raul', 'raúl', 'alvaro', 'álvaro',
  'gonzalo', 'enrique', 'miguel', 'javier', 'andres', 'andrés', 'liberto', 'yannick',
  'male',
];

let vocesCache: SpeechSynthesisVoice[] = [];
let elegida: SpeechSynthesisVoice | null = null;

const CLAVE_VOZ = 'arquetipos_v2_voz';

function vozGuardada(): string | null {
  try {
    return localStorage.getItem(CLAVE_VOZ);
  } catch {
    return null;
  }
}

export function soportaVoz(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function puntuar(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || '').toLowerCase();
  const nombre = (v.name || '').toLowerCase();
  if (!lang.startsWith('es')) return -1;

  let p = 10;

  // Lo que manda es que sea de mujer.
  const iFem = FEMENINAS.findIndex(n => nombre.includes(n));
  if (iFem >= 0) p += 60 - iFem;
  if (MASCULINAS.some(n => nombre.includes(n))) p -= 50;
  // Algunos sistemas no ponen el nombre, pero si marcan el genero en el id.
  if (/female|femenin/.test(nombre)) p += 40;
  else if (/(^|[^a-z])male([^a-z]|$)|masculin/.test(nombre)) p -= 40;

  // Las senales de que una voz es neuronal, que es lo que separa una voz que
  // suena a persona de una que suena a maquina.
  if (/natural|neural|premium|enhanced|wavenet|studio/.test(nombre)) p += 30;
  if (nombre.includes('google')) p += 18;

  // OJO: aqui antes se premiaba la voz LOCAL, y era justo al reves. Las locales
  // del sistema son las viejas, las que suenan robotico; las buenas son de red.
  // La red se paga con latencia, pero `decir` ya tiene su tope de tiempo.
  if (!v.localService) p += 14;

  // Espanol de Estados Unidos por defecto: es el acento neutro de America, el
  // que menos suena "de fuera" para el publico de la app. Despues, el resto de
  // America; el de Espana solo si no hay otra cosa.
  if (lang.startsWith('es-us')) p += 26;
  else if (lang.startsWith('es-mx') || lang.startsWith('es-419')) p += 12;
  else if (lang.startsWith('es-419') || lang.startsWith('es-ar') || lang.startsWith('es-co')) p += 8;
  return p;
}

function refrescarVoces() {
  if (!soportaVoz()) return;
  vocesCache = window.speechSynthesis.getVoices();
  const candidatas = vocesCache
    .map(v => ({ v, p: puntuar(v) }))
    // Se descartan las que no son en espanol; una masculina con puntuacion
    // negativa sigue siendo mejor que quedarse sin voz.
    .filter(x => x.p > -50)
    .sort((a, b) => b.p - a.p);

  // Si hay una elegida a mano, manda sobre cualquier heuristica: quien la oye
  // sabe mejor que este codigo cual suena bien en su aparato.
  const guardada = vozGuardada();
  const aMano = guardada ? vocesCache.find(v => v.name === guardada) : undefined;
  elegida = aMano || (candidatas.length ? candidatas[0].v : null);
}

/**
 * Las voces llegan de forma asincrona en casi todos los navegadores: hay que
 * esperar al evento, y con un tope por si nunca llega.
 */
export function prepararVoz(): Promise<boolean> {
  if (!soportaVoz()) return Promise.resolve(false);
  refrescarVoces();
  if (vocesCache.length) return Promise.resolve(true);

  return new Promise(resolve => {
    let resuelto = false;
    const terminar = () => {
      if (resuelto) return;
      resuelto = true;
      refrescarVoces();
      resolve(vocesCache.length > 0);
    };
    window.speechSynthesis.addEventListener('voiceschanged', terminar, { once: true });
    window.setTimeout(terminar, 1200);
  });
}

export function nombreDeLaVoz(): string | null {
  return elegida ? elegida.name : null;
}

export function callar() {
  if (!soportaVoz()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
}

/**
 * Dice un texto y resuelve cuando termina (o si no se puede decir).
 * Nunca rechaza: quedarse sin voz no es un error del flujo, es un caso del flujo.
 */
export function decir(
  texto: string,
  opciones: { rate?: number; pitch?: number; silencio?: boolean } = {}
): Promise<void> {
  const { rate = 0.98, pitch = 1.08, silencio = false } = opciones;

  if (silencio || !soportaVoz() || !texto.trim()) {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      if (elegida) u.voice = elegida;
      u.lang = elegida?.lang || 'es-ES';
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;

      let resuelto = false;
      const terminar = () => {
        if (resuelto) return;
        resuelto = true;
        resolve();
      };
      u.onend = terminar;
      u.onerror = terminar;

      // Chrome deja de disparar onend si la pestana pierde el foco: un tope
      // proporcional al largo del texto evita que el recorrido se quede colgado.
      const topeMs = Math.min(15000, 1200 + texto.length * 90);
      window.setTimeout(terminar, topeMs);

      window.speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}

/** Vibracion corta de confirmacion, donde el dispositivo la tenga. */
export function vibrar(patron: number | number[] = 12) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(patron);
    }
  } catch {}
}

/** Las voces en espanol del aparato, de la que mejor suena a la que peor. */
export function vocesDisponibles(): { nombre: string; lang: string; deRed: boolean }[] {
  if (!soportaVoz()) return [];
  if (!vocesCache.length) refrescarVoces();
  return vocesCache
    .map(v => ({ v, p: puntuar(v) }))
    .filter(x => x.p > -50)
    .sort((a, b) => b.p - a.p)
    .map(x => ({ nombre: x.v.name, lang: x.v.lang, deRed: !x.v.localService }));
}

/** Fija la voz a mano, o vuelve a la automatica con `null`. */
export function elegirVoz(nombre: string | null) {
  try {
    if (nombre) localStorage.setItem(CLAVE_VOZ, nombre);
    else localStorage.removeItem(CLAVE_VOZ);
  } catch {}
  refrescarVoces();
}
