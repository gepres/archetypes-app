/**
 * La voz de V2.
 *
 * Usa la sintesis del propio navegador: no cuesta nada, no necesita clave, no
 * anade latencia de red y funciona sin conexion. La calidad es la del sistema
 * de cada quien. Todo lo especifico de esa API vive aqui, detras de tres
 * funciones, para poder cambiarla por una voz de pago sin tocar las pantallas.
 */

export type VoiceState = 'no-soportada' | 'lista' | 'hablando';

const PREFERIDAS = [
  // iOS y macOS
  'monica', 'paulina', 'jorge', 'juan',
  // Android / Google
  'google espanol', 'google español', 'es-es', 'es-us', 'es-mx',
  // Windows
  'helena', 'laura', 'sabina', 'pablo',
];

let vocesCache: SpeechSynthesisVoice[] = [];
let elegida: SpeechSynthesisVoice | null = null;

export function soportaVoz(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function puntuar(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || '').toLowerCase();
  const nombre = (v.name || '').toLowerCase();
  if (!lang.startsWith('es')) return -1;

  let p = 10;
  // Una voz local no depende de la red ni se corta a mitad de frase.
  if (v.localService) p += 6;
  const idx = PREFERIDAS.findIndex(n => nombre.includes(n) || lang.includes(n));
  if (idx >= 0) p += 12 - idx;
  // El castellano de America suena mas cercano al publico de la app.
  if (lang.startsWith('es-mx') || lang.startsWith('es-us') || lang.startsWith('es-419')) p += 3;
  return p;
}

function refrescarVoces() {
  if (!soportaVoz()) return;
  vocesCache = window.speechSynthesis.getVoices();
  const candidatas = vocesCache
    .map(v => ({ v, p: puntuar(v) }))
    .filter(x => x.p >= 0)
    .sort((a, b) => b.p - a.p);
  elegida = candidatas.length ? candidatas[0].v : null;
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
  const { rate = 0.98, pitch = 1, silencio = false } = opciones;

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
