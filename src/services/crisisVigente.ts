/**
 * Si hay una crisis abierta en el chat de una cuenta, tal como la ven los chats abiertos ahora.
 *
 * Lo guardado no basta: si el almacenamiento está lleno, el mensaje de crisis no llega a
 * guardarse, pero el chat la mantiene abierta en memoria. Lo que dependa de saberlo (la lectura
 * personal con IA, que no debe entregar una interpretación durante una crisis) pregunta aquí,
 * además de mirar la conversación guardada.
 *
 * Cada crisis se identifica por el mensaje que la abrió (crisisAbiertaDesde). Entre pestañas:
 * - Cada pestaña informa de la crisis que tiene abierta su chat; la crisis está abierta si
 *   alguna pestaña la tiene. Un chat sin ese mensaje (incompleto) no la cierra: solo informa de
 *   lo suyo.
 * - Un cierre explícito (el botón «estoy a salvo») se anuncia con el mensaje de esa crisis y
 *   vale para todas, también para lo que contó una pestaña que ya se cerró.
 * - Una pestaña nueva pregunta al abrirse; las demás le cuentan lo que saben (también lo que
 *   oyeron de otras) y los cierres. Hasta recibirlo (un momento), el estado está «pendiente»: quien
 *   lo consulte debe esperar, no darlo por cerrado.
 */
import { crisisInConversation } from './crisisSupport';

interface Mensaje {
  tipo?: unknown;
  de?: unknown;
  quien?: unknown;
  dueno?: unknown;
  abierta?: unknown;
  ids?: unknown;
}

export type EstadoCrisis = 'abierta' | 'cerrada' | 'pendiente';

export function crearCrisisVigente(
  abrirCanal: () => BroadcastChannel | null = () => (typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('archetypes-crisis')),
  /** Cuánto se espera a que respondan las demás pestañas al abrirse. */
  espera = 300
) {
  const pestana = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  /** Por cuenta, lo que cada pestaña dice tener abierto (el mensaje que abrió su crisis). */
  const informes = new Map<string, Map<string, string>>();
  /** Por cuenta, las crisis que alguien cerró explícitamente. */
  const cerradas = new Map<string, Set<string>>();
  const oyentes = new Set<() => void>();
  let canal: BroadcastChannel | null = null;
  let iniciado = false;
  let listo = false;
  let alEstarListo: () => void = () => {};
  const sincronia = new Promise<void>(r => {
    alEstarListo = r;
  });

  const abiertaEn = (dueno: string) => {
    const cerr = cerradas.get(dueno);
    for (const id of informes.get(dueno)?.values() ?? []) if (!cerr?.has(id)) return true;
    return false;
  };
  const conAviso = (dueno: string, cambio: () => void) => {
    const antes = abiertaEn(dueno);
    cambio();
    if (antes !== abiertaEn(dueno)) for (const f of oyentes) f();
  };
  const informe = (dueno: string, quien: string, id: string | null) =>
    conAviso(dueno, () => {
      const m = informes.get(dueno) ?? new Map<string, string>();
      if (id) m.set(quien, id);
      else m.delete(quien);
      informes.set(dueno, m);
    });
  const cierre = (dueno: string, ids: string[]) =>
    conAviso(dueno, () => {
      const s = cerradas.get(dueno) ?? new Set<string>();
      for (const id of ids) s.add(id);
      cerradas.set(dueno, s);
    });

  const enviar = (m: object) => {
    try {
      canal?.postMessage({ ...m, de: pestana });
    } catch {
      // Sin canal, al menos esta pestaña lo sabe.
    }
  };

  const recibir = (m: Mensaje) => {
    if (!m || m.de === pestana) return;
    if (m.tipo === 'hola') {
      // Se cuenta todo lo que se sabe: lo propio, lo oído de otras y los cierres.
      for (const [dueno, porPestana] of informes)
        for (const [quien, id] of porPestana) enviar({ tipo: 'informe', quien, dueno, abierta: id });
      for (const [dueno, ids] of cerradas) enviar({ tipo: 'cierre', dueno, ids: [...ids] });
    } else if (m.tipo === 'informe' && typeof m.dueno === 'string' && typeof m.quien === 'string' && m.quien !== pestana) {
      informe(m.dueno, m.quien, typeof m.abierta === 'string' ? m.abierta : null);
    } else if (m.tipo === 'cierre' && typeof m.dueno === 'string' && Array.isArray(m.ids)) {
      cierre(m.dueno, m.ids.filter((x): x is string => typeof x === 'string'));
    }
  };

  const terminarSincronia = () => {
    if (listo) return;
    listo = true;
    alEstarListo();
    for (const f of oyentes) f();
  };

  const iniciar = () => {
    if (iniciado) return;
    iniciado = true;
    try {
      canal = abrirCanal();
    } catch {
      canal = null;
    }
    if (!canal) {
      terminarSincronia();
      return;
    }
    canal.onmessage = e => recibir(e.data as Mensaje);
    // Que el canal no mantenga vivo un proceso (las pruebas, en Node).
    (canal as unknown as { unref?: () => void }).unref?.();
    enviar({ tipo: 'hola' });
    const t = setTimeout(terminarSincronia, espera);
    (t as unknown as { unref?: () => void }).unref?.();
  };

  return {
    /**
     * Lo que tiene ahora el chat de esta pestaña en esa cuenta: el mensaje que abrió su crisis
     * (o null), y si acaba de cerrar una explícitamente, cuál.
     */
    marcar(dueno: string, abierta: string | null, cerradaAhora?: string): void {
      iniciar();
      if (cerradaAhora) {
        cierre(dueno, [cerradaAhora]);
        enviar({ tipo: 'cierre', dueno, ids: [cerradaAhora] });
      }
      informe(dueno, pestana, abierta);
      enviar({ tipo: 'informe', quien: pestana, dueno, abierta });
    },
    /** Abierta, cerrada, o pendiente mientras esta pestaña aún no sabe lo de las demás. */
    estado(dueno: string): EstadoCrisis {
      iniciar();
      if (abiertaEn(dueno)) return 'abierta';
      return listo ? 'cerrada' : 'pendiente';
    },
    /** Se resuelve cuando esta pestaña ya sabe lo de las demás. */
    sincronizada(): Promise<void> {
      iniciar();
      return sincronia;
    },
    /** Avisa cuando cambia si hay o no una crisis abierta, y cuando termina la sincronía. */
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

const deEstaPestana = crearCrisisVigente();
export const marcarCrisis = deEstaPestana.marcar;
export const estadoCrisis = deEstaPestana.estado;
export const crisisSincronizada = deEstaPestana.sincronizada;
export const suscribirCrisis = deEstaPestana.suscribir;

/**
 * Si la conversación guardada tiene una crisis abierta. Si existe pero no se puede leer (dañada),
 * cuenta como abierta: no se sabe, y es mejor no entregar una interpretación.
 */
export function crisisEnChatGuardado(guardado: string | null): boolean {
  if (guardado === null) return false;
  try {
    const mensajes = JSON.parse(guardado);
    if (!Array.isArray(mensajes)) return true;
    return crisisInConversation(mensajes);
  } catch {
    return true;
  }
}

