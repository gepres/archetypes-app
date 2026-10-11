/**
 * El registro de crisis: si hay una crisis abierta en el chat de una cuenta, para lo que no debe
 * entregar una interpretación mientras tanto (la lectura personal con IA).
 *
 * La conversación guardada no basta: si el almacenamiento está lleno, el mensaje de crisis no
 * llega a guardarse, y un cierre con el botón tampoco. Por eso hay un registro común a todas las
 * pestañas (IndexedDB, con mucho más espacio que el almacenamiento del chat), que cuenta en el
 * tiempo:
 * - Cada señal de crisis se apunta con su mensaje y el momento en que se escribió.
 * - «Ya estoy a salvo» apunta un cierre hasta ese momento: cierra toda señal anterior, se apunte
 *   antes o después, y ninguna posterior. Así un cierre que llega tarde no cierra una señal
 *   nueva, y una señal que se apunta tarde no reabre lo ya cerrado. El cierre solo avanza.
 * - El chat guardado también cuenta: sus señales desde su último cierre, y ese cierre. Lo que
 *   dice y falta en el registro se apunta (un cierre que solo llegó al chat no se pierde si luego
 *   se reinicia la conversación).
 * - Lo que una pestaña no pudo apuntar lo recuerda, lo reintenta en cada comprobación (y cuando
 *   otra pestaña pregunta) y se lo cuenta a las demás pestañas abiertas, que hacen lo mismo; una
 *   pestaña nueva lo pregunta al abrirse y espera un momento la respuesta antes de su primera
 *   comprobación. Si la respuesta llega después, la comprobación se repite.
 * - Reiniciar los datos borra del registro todo lo anterior al reinicio (de cualquier cuenta) y
 *   deja apuntado el reinicio, que lo cierra; lo posterior se conserva, aunque se apuntara
 *   mientras el reinicio esperaba. Se lo cuenta a las demás pestañas con su momento: olvidan lo
 *   anterior a él, no lo posterior.
 * - Si no se puede leer el registro o el chat guardado, cuenta como abierta. Un registro que no
 *   se entiende del todo (dañado, o de otra forma) no se borra ni se salta: un cierre o un
 *   reinicio ilegible no cierra nada, y cualquier otra cosa cuenta como una señal, con su momento
 *   si se lee y, si no, el 0 (como un mensaje del chat sin fecha: abierta hasta el primer cierre).
 * Hay una crisis abierta si alguna señal es posterior al último cierre que se conozca. (Se cuenta
 * con que el reloj del dispositivo no retrocede.)
 */
import { SenalCrisis, senalesDeCrisis, ultimoCierreDeCrisis } from './crisisSupport';

export type { SenalCrisis } from './crisisSupport';

/**
 * En el registro: una señal (su mensaje y cuándo se escribió), el cierre de la cuenta, o el
 * reinicio de todos los datos (que vale como cierre para todas las cuentas).
 */
export interface RegistroCrisis {
  clave: string;
  dueno: string;
  tipo: 'senal' | 'cierre' | 'reinicio';
  /** La señal: su mensaje. */
  mensajeId?: string;
  /** La señal: cuándo se escribió. El cierre y el reinicio: hasta cuándo cierran. En milisegundos. */
  momento: number;
}

/** Lo que se escribe en el registro de una vez: las claves que se quitan y, después, lo que se pone. */
export interface CambiosCrisis {
  poner: RegistroCrisis[];
  quitar: string[];
}

export interface AlmacenCrisis {
  /** Los de la cuenta, y el reinicio si lo hay. */
  deDueno(dueno: string): Promise<RegistroCrisis[]>;
  /**
   * Lee los de la cuenta y escribe los `cambios` que devuelva, todo en una sola transacción:
   * nadie escribe entre medias.
   */
  cambiar(dueno: string, cambios: (rs: RegistroCrisis[]) => CambiosCrisis): Promise<void>;
  /**
   * Al reiniciar los datos, de una vez: borra todo lo anterior a `reinicio` (o que no se entienda),
   * conserva lo posterior y lo apunta (salvo que ya conste uno más reciente).
   */
  reiniciar(reinicio: RegistroCrisis): Promise<void>;
}

/** El chat guardado no se pudo leer. */
export const ILEGIBLE = '__ilegible__';

/** Lo que dice el chat guardado: sus señales desde su último cierre y ese cierre; o ILEGIBLE. */
export function crisisDelChatGuardado(
  guardado: string | null
): { senales: SenalCrisis[]; cierre: number | null } | typeof ILEGIBLE {
  if (guardado === null) return { senales: [], cierre: null };
  try {
    const mensajes = JSON.parse(guardado);
    if (!Array.isArray(mensajes)) return ILEGIBLE;
    return { senales: senalesDeCrisis(mensajes), cierre: ultimoCierreDeCrisis(mensajes) };
  } catch {
    return ILEGIBLE;
  }
}

/**
 * Cómo cuenta un registro tal como está guardado. Un cierre o un reinicio sin un momento legible
 * no cierra nada (null: no cuenta). Cualquier otra cosa (una señal, o algo que no se entiende)
 * cuenta como una señal: con su momento si se lee y, si no, el 0.
 */
export function comoCuenta(r: unknown): RegistroCrisis | null {
  if (!r || typeof r !== 'object') return null;
  const x = r as Partial<RegistroCrisis>;
  const momento = typeof x.momento === 'number' && Number.isFinite(x.momento) ? x.momento : null;
  const clave = String(x.clave);
  const dueno = String(x.dueno);
  if (x.tipo === 'cierre' || x.tipo === 'reinicio') return momento === null ? null : { clave, dueno, tipo: x.tipo, momento };
  return { clave, dueno, tipo: 'senal', mensajeId: typeof x.mensajeId === 'string' ? x.mensajeId : clave, momento: momento ?? 0 };
}
const cuentan = (rs: RegistroCrisis[]) => rs.map(comoCuenta).filter((r): r is RegistroCrisis => r !== null);

/** Lo que cambia un reinicio en el registro entero (todas las cuentas): se va lo anterior a él. */
export const cambiosDeReinicio = (todos: RegistroCrisis[], reinicio: RegistroCrisis): CambiosCrisis => {
  const actual = comoCuenta(todos.find(r => r?.clave === reinicio.clave));
  return {
    quitar: todos
      .filter(r => r?.clave !== reinicio.clave)
      .filter(r => {
        const c = comoCuenta(r);
        return c === null || c.momento <= reinicio.momento;
      })
      .map(r => r.clave),
    poner: actual?.tipo === 'reinicio' && actual.momento >= reinicio.momento ? [] : [reinicio],
  };
};

const deSenal = (dueno: string, s: SenalCrisis): RegistroCrisis => ({
  clave: `${dueno}:${s.id}`,
  dueno,
  tipo: 'senal',
  mensajeId: s.id,
  momento: s.momento,
});
const deCierre = (dueno: string, hasta: number, clave = `${dueno}:__cierre`): RegistroCrisis => ({ clave, dueno, tipo: 'cierre', momento: hasta });
const deReinicio = (momento: number): RegistroCrisis => ({ clave: '__reinicio', dueno: '*', tipo: 'reinicio', momento });

/**
 * Lo que falta en el registro: las señales que no consten, y el cierre si va más allá del que
 * hay. Nada se escribe encima de un registro que cuenta como señal (aunque esté dañado): el
 * cierre va entonces a otra clave.
 */
const loQueFalta =
  (dueno: string, senales: SenalCrisis[], cierre: number | null) =>
  (rs: RegistroCrisis[]): CambiosCrisis => {
    const cs = cuentan(rs);
    const ocupada = (clave: string) => cs.some(r => r.clave === clave && r.tipo === 'senal');
    const nuevas = senales
      .filter(s => !cs.some(r => r.tipo === 'senal' && r.mensajeId === s.id) && !ocupada(`${dueno}:${s.id}`))
      .map(s => deSenal(dueno, s));
    const actual = Math.max(-Infinity, ...cs.filter(r => r.tipo === 'cierre').map(r => r.momento));
    if (cierre === null || actual >= cierre) return { poner: nuevas, quitar: [] };
    const clave = ocupada(`${dueno}:__cierre`) ? `${dueno}:__cierre:${cierre}` : `${dueno}:__cierre`;
    return { poner: [...nuevas, deCierre(dueno, cierre, clave)], quitar: [] };
  };

/** Lo que una pestaña sabe de una cuenta y aún no consta en el registro. */
interface SinApuntar {
  senales: Map<string, number>;
  cierre: number | null;
}

/** Lo que se cuentan las pestañas. */
type MensajeEntrePestanas =
  | { tipo: 'cambio' }
  | { tipo: 'pregunta' }
  | { tipo: 'reinicio'; momento: number }
  | { tipo: 'saber'; cuentas: { dueno: string; senales: SenalCrisis[]; cierre: number | null }[]; reinicio: number | null };

/** Cuánto espera una pestaña recién abierta, antes de su primera comprobación, a que le cuenten. */
export const ESPERA_AL_ABRIR = 300;

export function crearRegistroCrisis(
  almacen: AlmacenCrisis | null,
  abrirCanal: () => BroadcastChannel | null = () => null,
  esperaAlAbrir = ESPERA_AL_ABRIR
) {
  const sinApuntar = new Map<string, SinApuntar>();
  /** El último reinicio que se sabe (cierra todo lo anterior, de todas las cuentas). */
  let reinicio = -Infinity;
  const oyentes = new Set<() => void>();
  let canal: BroadcastChannel | null = null;
  let iniciado = false;
  /** La primera comprobación espera a que las demás pestañas cuenten lo que sepan. */
  let alAbrir: Promise<void> = Promise.resolve();

  const deCuenta = (dueno: string) => {
    let s = sinApuntar.get(dueno);
    if (!s) {
      s = { senales: new Map(), cierre: null };
      sinApuntar.set(dueno, s);
    }
    return s;
  };
  const recordar = (dueno: string, senales: SenalCrisis[], cierre: number | null) => {
    const s = deCuenta(dueno);
    for (const x of senales) if (x.momento > reinicio && !s.senales.has(x.id)) s.senales.set(x.id, x.momento);
    if (cierre !== null && cierre > reinicio) s.cierre = Math.max(s.cierre ?? cierre, cierre);
  };
  /** Un reinicio: se olvida lo anterior a él (no lo posterior, aunque el aviso llegue tarde). */
  const olvidarHasta = (momento: number) => {
    reinicio = Math.max(reinicio, momento);
    for (const s of sinApuntar.values()) {
      for (const [id, m] of s.senales) if (m <= reinicio) s.senales.delete(id);
      if (s.cierre !== null && s.cierre <= reinicio) s.cierre = null;
    }
  };
  const lista = (s: SinApuntar): SenalCrisis[] => [...s.senales].map(([id, momento]) => ({ id, momento }));
  const vacia = (s: SinApuntar | undefined) => !s || (s.senales.size === 0 && s.cierre === null);

  const enviar = (m: MensajeEntrePestanas) => {
    try {
      canal?.postMessage(m);
    } catch {
      // Sin canal, cada pestaña sabe lo suyo y lo que haya en el registro y en el chat guardado.
    }
  };
  /** Contar a las demás lo que esta pestaña sabe sin apuntar (de una cuenta, o de todas). */
  const contar = (dueno?: string) => {
    const cuentas = [...sinApuntar]
      .filter(([d, s]) => (dueno === undefined || d === dueno) && !vacia(s))
      .map(([d, s]) => ({ dueno: d, senales: lista(s), cierre: s.cierre }));
    const conReinicio = Number.isFinite(reinicio) ? reinicio : null;
    if (cuentas.length || conReinicio !== null) enviar({ tipo: 'saber', cuentas, reinicio: conReinicio });
  };
  const avisarAqui = () => {
    for (const f of oyentes) f();
  };
  const avisar = () => {
    avisarAqui();
    enviar({ tipo: 'cambio' });
  };

  /**
   * Apunta en el registro lo que esta pestaña sabe sin apuntar, si ahora se puede. Solo avisa
   * si de verdad cambió algo (así las comprobaciones no se encadenan).
   */
  const apuntarLoSabido = async (dueno: string) => {
    const s = sinApuntar.get(dueno);
    if (!almacen || !s || vacia(s)) return;
    const senales = lista(s);
    const cierre = s.cierre;
    let cambio = false;
    try {
      await almacen.cambiar(dueno, rs => {
        const c = loQueFalta(dueno, senales, cierre)(rs);
        cambio = c.poner.length > 0 || c.quitar.length > 0;
        return c;
      });
    } catch {
      return;
    }
    // Ya consta: se olvida lo apuntado (no lo que haya llegado entretanto).
    for (const x of senales) if (s.senales.get(x.id) === x.momento) s.senales.delete(x.id);
    if (s.cierre === cierre) s.cierre = null;
    // Las demás tienen que saberlo: alguna pudo enseñar una lectura mientras tanto.
    if (cambio) avisar();
  };
  const reintentarTodo = async () => {
    for (const d of [...sinApuntar.keys()]) await apuntarLoSabido(d);
  };

  const iniciar = () => {
    if (iniciado) return;
    iniciado = true;
    try {
      canal = abrirCanal();
    } catch {
      canal = null;
    }
    if (!canal) return;
    canal.onmessage = (e: MessageEvent<MensajeEntrePestanas>) => {
      const m = e.data;
      if (m?.tipo === 'pregunta') {
        // Se le cuenta lo que se sabe, y se intenta apuntar (quizá el registro ya funciona).
        contar();
        void reintentarTodo();
        return;
      }
      if (m?.tipo === 'saber') {
        for (const c of m.cuentas) recordar(c.dueno, c.senales, c.cierre);
        if (m.reinicio !== null) olvidarHasta(m.reinicio);
      }
      if (m?.tipo === 'reinicio') olvidarHasta(m.momento);
      avisarAqui();
    };
    enviar({ tipo: 'pregunta' });
    alAbrir = new Promise(r => setTimeout(r, esperaAlAbrir));
  };

  /** Apunta una señal o un cierre; si no se puede, se recuerda y se cuenta a las demás. */
  const apuntar = async (dueno: string, senales: SenalCrisis[], cierre: number | null) => {
    iniciar();
    try {
      if (!almacen) throw new Error('sin registro');
      await almacen.cambiar(dueno, loQueFalta(dueno, senales, cierre));
    } catch {
      recordar(dueno, senales, cierre);
      contar(dueno);
    }
    avisar();
  };

  return {
    /** Una señal de crisis en el chat (su mensaje y cuándo se escribió). */
    abrir(dueno: string, senal: SenalCrisis): Promise<void> {
      return apuntar(dueno, [senal], null);
    },

    /**
     * «Ya estoy a salvo» (de ahora, o uno ya pulsado que dice el chat): cierra toda señal de la
     * cuenta anterior a `hasta`, y ninguna posterior.
     */
    cerrarTodas(dueno: string, hasta: number = Date.now()): Promise<void> {
      return apuntar(dueno, [], hasta);
    },

    /** Si hay una crisis abierta en esa cuenta. `guardado`: el chat guardado, tal cual. */
    async abierta(dueno: string, guardado: string | null): Promise<boolean> {
      iniciar();
      await alAbrir;
      const chat = crisisDelChatGuardado(guardado);
      if (chat === ILEGIBLE) return true;
      // Lo que dice el chat guardado y falte en el registro, se apunta (con lo que no se pudo antes).
      recordar(dueno, chat.senales, chat.cierre);
      await apuntarLoSabido(dueno);
      let rs: RegistroCrisis[] = [];
      if (almacen) {
        try {
          rs = cuentan(await almacen.deDueno(dueno));
        } catch {
          return true;
        }
      }
      const sabido = sinApuntar.get(dueno);
      const cierres = [chat.cierre, sabido?.cierre ?? null, reinicio, ...rs.filter(r => r.tipo !== 'senal').map(r => r.momento)];
      const hasta = Math.max(-Infinity, ...cierres.filter((x): x is number => x !== null));
      const momentos = [
        ...chat.senales.map(s => s.momento),
        ...(sabido ? [...sabido.senales.values()] : []),
        ...rs.filter(r => r.tipo === 'senal').map(r => r.momento),
      ];
      return momentos.some(m => m > hasta);
    },

    /** Reiniciar todos los datos: se olvida todo lo anterior, aquí y en las demás pestañas. */
    async olvidarTodo(): Promise<void> {
      iniciar();
      const momento = Date.now();
      olvidarHasta(momento);
      try {
        await almacen?.reiniciar(deReinicio(momento));
      } catch {
        // Si no se pudo vaciar, lo que quede se sigue respetando (y «Ya estoy a salvo» lo cierra).
      }
      enviar({ tipo: 'reinicio', momento });
      avisar();
    },

    /** Avisa cuando algo cambia (aquí o en otra pestaña), para volver a comprobar. */
    suscribir(f: () => void): () => void {
      iniciar();
      oyentes.add(f);
      return () => {
        oyentes.delete(f);
      };
    },

    cerrar(): void {
      canal?.close();
    },
  };
}

/**
 * «Ya estoy a salvo» en una conversación: el cierre del registro y la marca que se guarda en el
 * chat llevan el mismo momento (`guardarCierre` lo recibe para ponérselo a la marca).
 */
export function cerrarCrisisDeConversacion<T>(
  registro: Pick<ReturnType<typeof crearRegistroCrisis>, 'cerrarTodas'>,
  dueno: string,
  guardarCierre: (momento: Date) => T
): { resultado: T; registrado: Promise<void> } {
  const momento = new Date();
  const registrado = registro.cerrarTodas(dueno, momento.getTime());
  return { resultado: guardarCierre(momento), registrado };
}

/** El registro en IndexedDB del navegador (null si no lo hay). */
function almacenEnNavegador(): AlmacenCrisis | null {
  if (typeof indexedDB === 'undefined') return null;
  let db: Promise<IDBDatabase> | null = null;
  const abrirDb = () => {
    db ??= new Promise<IDBDatabase>((resolve, reject) => {
      // Versión 2: los registros cuentan en el tiempo. La 1 (con otra forma, nunca publicada) se
      // descarta al subir; una pestaña con el código de la 1 ya no puede abrirla ni escribir.
      const r = indexedDB.open('archetypes-crisis', 2);
      r.onupgradeneeded = () => {
        if (r.result.objectStoreNames.contains('crisis')) r.result.deleteObjectStore('crisis');
        r.result.createObjectStore('crisis', { keyPath: 'clave' });
      };
      r.onsuccess = () => {
        // Si alguna vez otra pestaña necesita cambiar o borrar la base, esta no se lo impide:
        // cierra y la próxima vez abre de nuevo.
        r.result.onversionchange = () => {
          r.result.close();
          db = null;
        };
        // Si el navegador la cierra por su cuenta, también.
        r.result.onclose = () => {
          db = null;
        };
        resolve(r.result);
      };
      r.onerror = () => reject(r.error);
      r.onblocked = () => reject(new Error('registro de crisis bloqueado'));
    }).catch(e => {
      db = null; // otro intento la próxima vez
      throw e;
    });
    return db;
  };
  /** Una transacción entera: se da por hecha solo cuando se completa. */
  const enTransaccion = async <T>(modo: IDBTransactionMode, hacer: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    const d = await abrirDb();
    return new Promise<T>((resolve, reject) => {
      let t: IDBTransaction;
      try {
        t = d.transaction('crisis', modo);
      } catch (e) {
        db = null; // una conexión que ya no sirve: la próxima vez se abre otra
        throw e;
      }
      const peticion = hacer(t.objectStore('crisis'));
      t.oncomplete = () => resolve(peticion.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  };
  return {
    deDueno: async dueno =>
      ((await enTransaccion('readonly', s => s.getAll())) as RegistroCrisis[]).filter(r => r?.dueno === dueno || r?.tipo === 'reinicio'),
    cambiar: async (dueno, cambios) => {
      await enTransaccion('readwrite', s => {
        const todos = s.getAll();
        // Se escribe en la misma transacción en que se leyó.
        todos.onsuccess = () => {
          const c = cambios((todos.result as RegistroCrisis[]).filter(x => x?.dueno === dueno));
          for (const clave of c.quitar) s.delete(clave);
          for (const r of c.poner) s.put(r);
        };
        return todos;
      });
    },
    // Se borra lo anterior en vez de la base: borrarla esperaría a que la cerraran las demás
    // pestañas, y se llevaría lo que se apuntara mientras tanto.
    reiniciar: async reinicio => {
      await enTransaccion('readwrite', s => {
        const todos = s.getAll();
        todos.onsuccess = () => {
          const c = cambiosDeReinicio(todos.result as RegistroCrisis[], reinicio);
          for (const clave of c.quitar) s.delete(clave);
          for (const r of c.poner) s.put(r);
        };
        return todos;
      });
    },
  };
}

const deLaApp = crearRegistroCrisis(almacenEnNavegador(), () =>
  typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('archetypes-crisis')
);
export const apuntarCrisis = deLaApp.abrir;
export const cerrarCrisisRegistradas = deLaApp.cerrarTodas;
export const crisisAbiertaEnRegistro = deLaApp.abierta;
export const suscribirCrisis = deLaApp.suscribir;
/** «Ya estoy a salvo» en el chat: el cierre del registro y la marca del chat, con el mismo momento. */
export const cerrarCrisisDelChat = <T>(dueno: string, guardarCierre: (momento: Date) => T): T =>
  cerrarCrisisDeConversacion(deLaApp, dueno, guardarCierre).resultado;
/** Borra el registro entero y lo que esta pestaña recordaba (al reiniciar todos los datos). */
export const borrarRegistroCrisis = deLaApp.olvidarTodo;
