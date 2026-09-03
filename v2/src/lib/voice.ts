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
  // Una voz que no es en espanol queda fuera del todo. Antes devolvia -1 y el
  // filtro dejaba pasar cualquier cosa por encima de -50: en un aparato sin
  // voz espanola acababa leyendo el texto una voz inglesa, que es peor que no
  // tener voz. Sin candidata, el navegador elige por su cuenta segun `lang`.
  if (!lang.startsWith('es')) return -Infinity;

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
  else if (lang.startsWith('es-ar') || lang.startsWith('es-co') || lang.startsWith('es-cl')) p += 8;
  return p;
}

function refrescarVoces() {
  if (!soportaVoz()) return;
  vocesCache = window.speechSynthesis.getVoices();
  const candidatas = vocesCache
    .map(v => ({ v, p: puntuar(v) }))
    // Fuera las que no son en espanol. Una masculina puntua negativo pero sigue
    // siendo mejor que quedarse sin voz, asi que esa si entra.
    .filter(x => Number.isFinite(x.p))
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

/** Como termino una narracion. Solo `fin` significa que la voz llego al final. */
export type FinDeVoz = 'fin' | 'cortada' | 'tope' | 'omitida';

// Quien esta hablando ahora mismo, para poder cerrar su promesa si lo callan.
let cerrarActual: ((razon: FinDeVoz) => void) | null = null;

export function callar() {
  if (!soportaVoz()) return;
  // Primero se cierra la promesa en vuelo y despues se cancela: asi quien
  // esperaba el final sabe que lo cortaron, y no lo confunde con haber acabado.
  cerrarActual?.('cortada');
  try {
    window.speechSynthesis.cancel();
  } catch {}
}

/**
 * Dice un texto y resuelve cuando termina, diciendo COMO termino.
 * Nunca rechaza: quedarse sin voz no es un error del flujo, es un caso del flujo.
 *
 * Esa distincion no es un adorno. Quien encadena capitulos solos necesita saber
 * si la voz llego al final o si solo se agoto un tope, porque avanzar en el
 * segundo caso corta a la voz a media frase.
 */
export function decir(
  texto: string,
  opciones: { rate?: number; pitch?: number; silencio?: boolean } = {}
): Promise<FinDeVoz> {
  const { rate = 0.98, pitch = 1.08, silencio = false } = opciones;

  if (silencio || !soportaVoz() || !texto.trim()) {
    return Promise.resolve('omitida');
  }

  return new Promise<FinDeVoz>(resolve => {
    try {
      cerrarActual?.('cortada');
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(texto);
      if (elegida) u.voice = elegida;
      u.lang = elegida?.lang || 'es-ES';
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;

      let vigilante = 0;
      let resuelto = false;
      let empezo = false;
      const arranque = Date.now();
      let ultimoEmpujon = arranque;

      const cerrar = (razon: FinDeVoz) => {
        if (resuelto) return;
        resuelto = true;
        window.clearInterval(vigilante);
        if (cerrarActual === cerrar) cerrarActual = null;
        resolve(razon);
      };
      cerrarActual = cerrar;

      u.onstart = () => {
        empezo = true;
      };
      u.onend = () => cerrar('fin');
      u.onerror = () => cerrar('tope');

      // El vigilante, y por que no es un simple temporizador:
      //
      // Aqui habia un tope de quince segundos, y ningun capitulo se narra en
      // menos de quince. Saltaba SIEMPRE antes de que la voz acabara, el
      // recorrido avanzaba solo, y el propio avance manda callar: la voz se
      // cortaba a media frase, cada vez. El largo del texto no sirve para
      // adivinar cuanto dura una narracion —depende de la voz, del ritmo y del
      // aparato—; lo unico que lo sabe es el motor. Asi que en vez de adivinar,
      // se le pregunta: mientras `speaking` sea cierto, la voz sigue viva.
      vigilante = window.setInterval(() => {
        const s = window.speechSynthesis;

        if (s.speaking || s.pending) {
          empezo = true;
          // Chrome corta por su cuenta las frases largas si nadie toca la cola;
          // este empujon periodico es el remedio conocido.
          if (Date.now() - ultimoEmpujon > 5000) {
            ultimoEmpujon = Date.now();
            try {
              s.resume();
            } catch {}
          }
          return;
        }

        // Ya no habla y si llego a hablar: termino de verdad, aunque `onend` no
        // llegara (Chrome se lo traga si la pestana pierde el foco).
        if (empezo) return cerrar('fin');

        // Nunca arranco: no hay voz instalada, o el sistema la denego. Se deja
        // un margen y se sigue, pero diciendo que no fue un final de verdad.
        if (Date.now() - arranque > 2500) cerrar('tope');
      }, 400);

      // Techo absoluto, por si todo lo demas fallara.
      window.setTimeout(() => cerrar('tope'), 5 * 60 * 1000);

      window.speechSynthesis.speak(u);
    } catch {
      resolve('omitida');
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
    .filter(x => Number.isFinite(x.p))
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
