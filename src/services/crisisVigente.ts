/**
 * El registro de crisis: si hay una crisis abierta en el chat de una cuenta, para lo que no debe
 * entregar una interpretación mientras tanto (la lectura personal con IA).
 *
 * La conversación guardada no basta: si el almacenamiento está lleno, el mensaje de crisis no
 * llega a guardarse; y una crisis cerrada con el botón puede no llegar a guardar su cierre. Por
 * eso cada señal de crisis se apunta, por su mensaje, en un registro común a todas las pestañas
 * (IndexedDB, con mucho más espacio que el almacenamiento del chat):
 * - El chat apunta cada señal al enviarla. Un chat que no tiene ese mensaje no la cierra: no hace
 *   nada. Una señal nueva cuenta aunque otra pestaña hubiera cerrado las anteriores.
 * - El botón «Ya estoy a salvo» cierra todas las de la cuenta (la persona dice que está a salvo).
 * - Una crisis cerrada no se vuelve a abrir aunque reaparezca una copia antigua del chat.
 * - Si el registro no se puede usar, se mira lo que se sepa (lo de esta pestaña y el chat
 *   guardado), y si tampoco se puede leer, cuenta como abierta.
 * Abrir y cerrar se hacen cada uno en una sola transacción (leer y escribir de una vez): así una
 * apertura que llega a la vez que un cierre no lo pisa.
 * Los avisos entre pestañas solo sirven para que una lectura a la vista se vuelva a comprobar:
 * no deciden nada.
 */
import { senalesDeCrisis } from './crisisSupport';

export interface RegistroCrisis {
  clave: string;
  dueno: string;
  /** El mensaje con la señal de crisis. */
  mensajeId: string;
  abierta: boolean;
  fecha: string;
}

export interface AlmacenCrisis {
  deDueno(dueno: string): Promise<RegistroCrisis[]>;
  /**
   * Lee los de la cuenta y guarda los que devuelva `cambios`, todo en una sola transacción: nadie
   * escribe entre medias.
   */
  cambiar(dueno: string, cambios: (rs: RegistroCrisis[]) => RegistroCrisis[]): Promise<void>;
  /** Lo vacía (al reiniciar los datos). */
  vaciar(): Promise<void>;
}

/** El chat guardado no se pudo leer. */
export const ILEGIBLE = '__ilegible__';

/** Las señales de crisis abiertas en el chat guardado (sus mensajes), o ILEGIBLE. */
export function senalesDelChatGuardado(guardado: string | null): string[] | typeof ILEGIBLE {
  if (guardado === null) return [];
  try {
    const mensajes = JSON.parse(guardado);
    if (!Array.isArray(mensajes)) return ILEGIBLE;
    return senalesDeCrisis(mensajes);
  } catch {
    return ILEGIBLE;
  }
}

const registro = (dueno: string, mensajeId: string, abierta: boolean): RegistroCrisis => ({
  clave: `${dueno}:${mensajeId}`,
  dueno,
  mensajeId,
  abierta,
  fecha: new Date().toISOString(),
});

/** Abiertas las de esos mensajes que aún no consten; las que constan (sobre todo, cerradas) no se tocan. */
const abrirNuevas = (dueno: string, ids: string[]) => (rs: RegistroCrisis[]) =>
  ids.filter(id => !rs.some(r => r.mensajeId === id)).map(id => registro(dueno, id, true));

export function crearRegistroCrisis(almacen: AlmacenCrisis | null, abrirCanal: () => BroadcastChannel | null = () => null) {
  /** Lo que esta pestaña no pudo apuntar en el registro (si falló), para no perderlo. */
  const sinApuntar = new Map<string, Set<string>>();
  /**
   * Cuántas veces se ha cerrado (o reiniciado) cada cuenta en esta pestaña. Una apertura pedida
   * antes de un cierre no se apunta después de él: el cierre manda.
   */
  const cierres = new Map<string, number>();
  let reinicios = 0;
  const vez = (dueno: string) => `${reinicios}:${cierres.get(dueno) ?? 0}`;
  const oyentes = new Set<() => void>();
  let canal: BroadcastChannel | null = null;
  let iniciado = false;

  const avisarAqui = () => {
    for (const f of oyentes) f();
  };
  const iniciar = () => {
    if (iniciado) return;
    iniciado = true;
    try {
      canal = abrirCanal();
      if (canal) canal.onmessage = () => avisarAqui();
    } catch {
      canal = null;
    }
  };
  const avisar = () => {
    avisarAqui();
    try {
      canal?.postMessage('cambio');
    } catch {
      // Sin canal, las demás pestañas lo comprueban igual antes de pedir o entregar.
    }
  };

  return {
    /** El chat tiene abierta la crisis que abrió ese mensaje. Si ya se cerró, no se reabre. */
    async abrir(dueno: string, mensajeId: string): Promise<void> {
      iniciar();
      const pedida = vez(dueno);
      try {
        if (!almacen) throw new Error('sin registro');
        // Se decide dentro de la transacción: si consta (abierta o cerrada) no se toca, y si esta
        // pestaña la cerró entretanto, tampoco.
        await almacen.cambiar(dueno, rs => (vez(dueno) === pedida ? abrirNuevas(dueno, [mensajeId])(rs) : []));
      } catch {
        if (vez(dueno) === pedida) {
          const s = sinApuntar.get(dueno) ?? new Set<string>();
          s.add(mensajeId);
          sinApuntar.set(dueno, s);
        }
      }
      avisar();
    },

    /** «Ya estoy a salvo»: se cierran todas las de la cuenta (y las conocidas, aunque no constaran). */
    async cerrarTodas(dueno: string, conocidas: string[] = []): Promise<void> {
      iniciar();
      cierres.set(dueno, (cierres.get(dueno) ?? 0) + 1);
      sinApuntar.delete(dueno);
      try {
        if (almacen) {
          const fecha = new Date().toISOString();
          await almacen.cambiar(dueno, rs => [
            ...rs.filter(r => r.abierta).map(r => ({ ...r, abierta: false, fecha })),
            ...conocidas.filter(id => !rs.some(r => r.mensajeId === id)).map(id => registro(dueno, id, false)),
          ]);
        }
      } catch {
        // Lo que no se pudo apuntar se comprueba igual con el chat guardado.
      }
      avisar();
    },

    /** Si hay una crisis abierta en esa cuenta. `guardado`: el chat guardado, tal cual. */
    async abierta(dueno: string, guardado: string | null): Promise<boolean> {
      iniciar();
      const enChat = senalesDelChatGuardado(guardado);
      if (enChat === ILEGIBLE) return true;
      const pendientes = [...(sinApuntar.get(dueno) ?? [])];
      if (!almacen) return pendientes.length > 0 || enChat.length > 0;
      if (pendientes.length) {
        // Lo que esta pestaña no pudo apuntar se apunta ahora, sin pisar un cierre que ya conste
        // (de otra pestaña, por ejemplo): desde ahí manda el registro. Si sigue sin poder, cuenta
        // como abierta.
        const pedida = vez(dueno);
        try {
          await almacen.cambiar(dueno, rs => (vez(dueno) === pedida ? abrirNuevas(dueno, pendientes)(rs) : []));
        } catch {
          return true;
        }
        const s = sinApuntar.get(dueno);
        for (const id of pendientes) s?.delete(id);
        // Las demás pestañas tienen que saberlo: alguna pudo enseñar una lectura mientras tanto.
        avisar();
      }
      let rs: RegistroCrisis[];
      try {
        rs = await almacen.deDueno(dueno);
      } catch {
        return true;
      }
      if (rs.some(r => r.abierta)) return true;
      // Las del chat guardado, salvo las que consten cerradas (su cierre pudo no llegar a guardarse).
      return enChat.some(id => !rs.some(r => r.mensajeId === id && !r.abierta));
    },

    /** Reiniciar todos los datos: se olvida todo, también lo que esta pestaña recordaba. */
    async olvidarTodo(): Promise<void> {
      iniciar();
      reinicios++;
      sinApuntar.clear();
      try {
        await almacen?.vaciar();
      } catch {
        // Si no se pudo borrar, lo que quede se sigue respetando (y «Ya estoy a salvo» lo cierra).
      }
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
    deDueno: async dueno => ((await enTransaccion('readonly', s => s.getAll())) as RegistroCrisis[]).filter(r => r.dueno === dueno),
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
    vaciar: async () => {
      await enTransaccion('readwrite', s => s.clear());
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
/** Borra el registro entero y lo que esta pestaña recordaba (al reiniciar todos los datos). */
export const borrarRegistroCrisis = deLaApp.olvidarTodo;
