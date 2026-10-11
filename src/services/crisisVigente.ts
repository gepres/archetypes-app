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
 * - El chat guardado también cuenta: sus señales desde su último cierre, y ese cierre.
 * - Lo que una pestaña no pudo apuntar lo recuerda, lo reintenta en cada comprobación y se lo
 *   cuenta a las demás pestañas abiertas, que hacen lo mismo; una pestaña nueva lo pregunta al
 *   abrirse y espera un momento la respuesta antes de su primera comprobación.
 * - Reiniciar los datos vacía el registro y deja apuntado el reinicio, que cierra todo lo anterior
 *   (de cualquier cuenta): lo que otra pestaña aún no sabía apuntar no revive al apuntarse tarde.
 * - Si no se puede leer el registro o el chat guardado, cuenta como abierta.
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

export interface AlmacenCrisis {
  /** Los de la cuenta, y el reinicio si lo hay. */
  deDueno(dueno: string): Promise<RegistroCrisis[]>;
  /**
   * Lee los de la cuenta y guarda los que devuelva `cambios`, todo en una sola transacción: nadie
   * escribe entre medias.
   */
  cambiar(dueno: string, cambios: (rs: RegistroCrisis[]) => RegistroCrisis[]): Promise<void>;
  /** Lo vacía y deja apuntado `reinicio`, de una vez (al reiniciar los datos). */
  vaciar(reinicio: RegistroCrisis): Promise<void>;
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

const deSenal = (dueno: string, s: SenalCrisis): RegistroCrisis => ({
  clave: `${dueno}:${s.id}`,
  dueno,
  tipo: 'senal',
  mensajeId: s.id,
  momento: s.momento,
});
const deCierre = (dueno: string, hasta: number): RegistroCrisis => ({ clave: `${dueno}:__cierre`, dueno, tipo: 'cierre', momento: hasta });
const deReinicio = (momento: number): RegistroCrisis => ({ clave: '__reinicio', dueno: '*', tipo: 'reinicio', momento });

/** Lo que falta en el registro: las señales que no consten, y el cierre si va más allá del que hay. */
const loQueFalta = (dueno: string, senales: SenalCrisis[], cierre: number | null) => (rs: RegistroCrisis[]) => {
  const nuevas = senales.filter(s => !rs.some(r => r.tipo === 'senal' && r.mensajeId === s.id)).map(s => deSenal(dueno, s));
  const actual = rs.find(r => r.tipo === 'cierre');
  const avanza = cierre !== null && (!actual || actual.momento < cierre);
  return avanza ? [...nuevas, deCierre(dueno, cierre)] : nuevas;
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
  | { tipo: 'reinicio' }
  | { tipo: 'saber'; cuentas: { dueno: string; senales: SenalCrisis[]; cierre: number | null }[] };

/** Cuánto espera una pestaña recién abierta, antes de su primera comprobación, a que le cuenten. */
export const ESPERA_AL_ABRIR = 300;

export function crearRegistroCrisis(
  almacen: AlmacenCrisis | null,
  abrirCanal: () => BroadcastChannel | null = () => null,
  esperaAlAbrir = ESPERA_AL_ABRIR
) {
  const sinApuntar = new Map<string, SinApuntar>();
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
    for (const x of senales) if (!s.senales.has(x.id)) s.senales.set(x.id, x.momento);
    if (cierre !== null) s.cierre = Math.max(s.cierre ?? cierre, cierre);
  };
  const lista = (s: SinApuntar): SenalCrisis[] => [...s.senales].map(([id, momento]) => ({ id, momento }));

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
      .filter(([d, s]) => (dueno === undefined || d === dueno) && (s.senales.size > 0 || s.cierre !== null))
      .map(([d, s]) => ({ dueno: d, senales: lista(s), cierre: s.cierre }));
    if (cuentas.length) enviar({ tipo: 'saber', cuentas });
  };
  const avisarAqui = () => {
    for (const f of oyentes) f();
  };
  const avisar = () => {
    avisarAqui();
    enviar({ tipo: 'cambio' });
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
        contar();
        return;
      }
      if (m?.tipo === 'saber') for (const c of m.cuentas) recordar(c.dueno, c.senales, c.cierre);
      if (m?.tipo === 'reinicio') sinApuntar.clear();
      avisarAqui();
    };
    enviar({ tipo: 'pregunta' });
    alAbrir = new Promise(r => setTimeout(r, esperaAlAbrir));
  };

  /** Apunta en el registro lo que esta pestaña sabe sin apuntar, si ahora se puede. */
  const apuntarLoSabido = async (dueno: string) => {
    const s = sinApuntar.get(dueno);
    if (!almacen || !s || (s.senales.size === 0 && s.cierre === null)) return;
    const senales = lista(s);
    const cierre = s.cierre;
    try {
      await almacen.cambiar(dueno, loQueFalta(dueno, senales, cierre));
    } catch {
      return;
    }
    // Ya consta: se olvida lo apuntado (no lo que haya llegado entretanto).
    for (const x of senales) if (s.senales.get(x.id) === x.momento) s.senales.delete(x.id);
    if (s.cierre === cierre) s.cierre = null;
    // Las demás tienen que saberlo: alguna pudo enseñar una lectura mientras tanto.
    avisar();
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

    /** «Ya estoy a salvo»: cierra toda señal de la cuenta anterior a `hasta`, y ninguna posterior. */
    cerrarTodas(dueno: string, hasta: number = Date.now()): Promise<void> {
      return apuntar(dueno, [], hasta);
    },

    /** Si hay una crisis abierta en esa cuenta. `guardado`: el chat guardado, tal cual. */
    async abierta(dueno: string, guardado: string | null): Promise<boolean> {
      iniciar();
      await alAbrir;
      const chat = crisisDelChatGuardado(guardado);
      if (chat === ILEGIBLE) return true;
      await apuntarLoSabido(dueno);
      let rs: RegistroCrisis[] = [];
      if (almacen) {
        try {
          rs = await almacen.deDueno(dueno);
        } catch {
          return true;
        }
      }
      const sabido = sinApuntar.get(dueno);
      const cierres = [chat.cierre, sabido?.cierre ?? null, ...rs.filter(r => r.tipo !== 'senal').map(r => r.momento)];
      const hasta = Math.max(-Infinity, ...cierres.filter((x): x is number => x !== null));
      const momentos = [
        ...chat.senales.map(s => s.momento),
        ...(sabido ? [...sabido.senales.values()] : []),
        ...rs.filter(r => r.tipo === 'senal').map(r => r.momento),
      ];
      return momentos.some(m => m > hasta);
    },

    /** Reiniciar todos los datos: se olvida todo, también lo que sabían las pestañas. */
    async olvidarTodo(): Promise<void> {
      iniciar();
      sinApuntar.clear();
      try {
        await almacen?.vaciar(deReinicio(Date.now()));
      } catch {
        // Si no se pudo vaciar, lo que quede se sigue respetando (y «Ya estoy a salvo» lo cierra).
      }
      enviar({ tipo: 'reinicio' });
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
      const r = indexedDB.open('archetypes-crisis', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('crisis', { keyPath: 'clave' });
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
      ((await enTransaccion('readonly', s => s.getAll())) as RegistroCrisis[]).filter(r => r.dueno === dueno || r.tipo === 'reinicio'),
    cambiar: async (dueno, cambios) => {
      await enTransaccion('readwrite', s => {
        const todos = s.getAll();
        // Se escribe en la misma transacción en que se leyó.
        todos.onsuccess = () => {
          for (const r of cambios((todos.result as RegistroCrisis[]).filter(x => x.dueno === dueno))) s.put(r);
        };
        return todos;
      });
    },
    // Se vacía en vez de borrar la base: borrarla esperaría a que la cerraran las demás pestañas.
    vaciar: async reinicio => {
      await enTransaccion('readwrite', s => {
        s.clear();
        return s.put(reinicio);
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
