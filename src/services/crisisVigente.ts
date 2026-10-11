/**
 * El registro de crisis: si hay una crisis abierta en el chat de una cuenta, para lo que no debe
 * entregar una interpretación mientras tanto (la lectura personal con IA).
 *
 * La conversación guardada no basta: si el almacenamiento está lleno, el mensaje de crisis no
 * llega a guardarse; y una crisis cerrada con el botón puede no llegar a guardar su cierre. Por
 * eso cada crisis se apunta, por el mensaje que la abrió, en un registro común a todas las
 * pestañas (IndexedDB, con mucho más espacio que el almacenamiento del chat):
 * - El chat la apunta al abrirse. Un chat que no tiene ese mensaje no la cierra: no hace nada.
 * - El botón «Ya estoy a salvo» cierra todas las de la cuenta (la persona dice que está a salvo).
 * - Una crisis cerrada no se vuelve a abrir aunque reaparezca una copia antigua del chat.
 * - Si el registro no se puede usar, se mira lo que se sepa (lo de esta pestaña y el chat
 *   guardado), y si tampoco se puede leer, cuenta como abierta.
 * Los avisos entre pestañas solo sirven para que una lectura a la vista se vuelva a comprobar:
 * no deciden nada.
 */
import { crisisAbiertaDesde } from './crisisSupport';

export interface RegistroCrisis {
  clave: string;
  dueno: string;
  /** El mensaje que abrió la crisis. */
  mensajeId: string;
  abierta: boolean;
  fecha: string;
}

export interface AlmacenCrisis {
  deDueno(dueno: string): Promise<RegistroCrisis[]>;
  poner(r: RegistroCrisis): Promise<void>;
}

/** El chat guardado no se pudo leer. */
export const ILEGIBLE = '__ilegible__';

/** La crisis abierta en el chat guardado: el mensaje que la abrió, null, o ILEGIBLE. */
export function crisisDelChatGuardado(guardado: string | null): string | null {
  if (guardado === null) return null;
  try {
    const mensajes = JSON.parse(guardado);
    if (!Array.isArray(mensajes)) return ILEGIBLE;
    return crisisAbiertaDesde(mensajes);
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

export function crearRegistroCrisis(almacen: AlmacenCrisis | null, abrirCanal: () => BroadcastChannel | null = () => null) {
  /** Lo que esta pestaña no pudo apuntar en el registro (si falló), para no perderlo. */
  const sinApuntar = new Map<string, Set<string>>();
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
      try {
        if (!almacen) throw new Error('sin registro');
        const rs = await almacen.deDueno(dueno);
        if (!rs.some(r => r.mensajeId === mensajeId)) await almacen.poner(registro(dueno, mensajeId, true));
      } catch {
        const s = sinApuntar.get(dueno) ?? new Set<string>();
        s.add(mensajeId);
        sinApuntar.set(dueno, s);
      }
      avisar();
    },

    /** «Ya estoy a salvo»: se cierran todas las de la cuenta (y las conocidas, aunque no constaran). */
    async cerrarTodas(dueno: string, conocidas: string[] = []): Promise<void> {
      iniciar();
      sinApuntar.delete(dueno);
      try {
        if (almacen) {
          const rs = await almacen.deDueno(dueno);
          for (const r of rs) if (r.abierta) await almacen.poner({ ...r, abierta: false, fecha: new Date().toISOString() });
          for (const id of conocidas) if (!rs.some(r => r.mensajeId === id)) await almacen.poner(registro(dueno, id, false));
        }
      } catch {
        // Lo que no se pudo apuntar se comprueba igual con el chat guardado.
      }
      avisar();
    },

    /** Si hay una crisis abierta en esa cuenta. `guardado`: el chat guardado, tal cual. */
    async abierta(dueno: string, guardado: string | null): Promise<boolean> {
      iniciar();
      if (sinApuntar.get(dueno)?.size) return true;
      const enChat = crisisDelChatGuardado(guardado);
      if (enChat === ILEGIBLE) return true;
      if (!almacen) return enChat !== null;
      let rs: RegistroCrisis[];
      try {
        rs = await almacen.deDueno(dueno);
      } catch {
        return true;
      }
      if (rs.some(r => r.abierta)) return true;
      // La del chat guardado, salvo que conste cerrada (su cierre pudo no llegar a guardarse).
      return enChat !== null && !rs.some(r => r.mensajeId === enChat && !r.abierta);
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
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.onblocked = () => reject(new Error('registro de crisis bloqueado'));
    }).catch(e => {
      db = null; // otro intento la próxima vez
      throw e;
    });
    return db;
  };
  const enTransaccion = async <T>(modo: IDBTransactionMode, hacer: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    const d = await abrirDb();
    return new Promise<T>((resolve, reject) => {
      const t = d.transaction('crisis', modo);
      const peticion = hacer(t.objectStore('crisis'));
      t.oncomplete = () => resolve(peticion.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  };
  return {
    deDueno: async dueno => ((await enTransaccion('readonly', s => s.getAll())) as RegistroCrisis[]).filter(r => r.dueno === dueno),
    poner: async r => {
      await enTransaccion('readwrite', s => s.put(r));
    },
  };
}

/** Borra el registro entero (al reiniciar todos los datos). */
export function borrarRegistroCrisis(): void {
  try {
    indexedDB?.deleteDatabase('archetypes-crisis');
  } catch {
    // Sin IndexedDB no hay nada que borrar.
  }
}

const deLaApp = crearRegistroCrisis(almacenEnNavegador(), () =>
  typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('archetypes-crisis')
);
export const apuntarCrisis = deLaApp.abrir;
export const cerrarCrisisRegistradas = deLaApp.cerrarTodas;
export const crisisAbiertaEnRegistro = deLaApp.abierta;
export const suscribirCrisis = deLaApp.suscribir;
