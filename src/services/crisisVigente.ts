/**
 * Si hay una crisis abierta en el chat de una cuenta, tal como la ven los chats abiertos ahora.
 *
 * Lo guardado no basta: si el almacenamiento está lleno, el mensaje de crisis no llega a
 * guardarse, pero el chat la mantiene abierta en memoria. Lo que dependa de saberlo (la lectura
 * personal con IA, que no debe entregar una interpretación durante una crisis) pregunta aquí,
 * además de mirar la conversación guardada.
 *
 * Entre pestañas:
 * - Cada pestaña declara solo lo suyo: una conversación incompleta en otra pestaña no puede
 *   cerrar la crisis que esta tiene abierta. La crisis está abierta si lo está en alguna.
 * - Una pestaña nueva pregunta al abrirse y las demás le cuentan las crisis que tienen abiertas.
 * - Quien necesite reaccionar (una lectura a la vista) se suscribe a los cambios.
 */
import { crisisInConversation } from './crisisSupport';

interface Mensaje {
  tipo?: unknown;
  pestana?: unknown;
  dueno?: unknown;
  abierta?: unknown;
}

export function crearCrisisVigente(
  abrirCanal: () => BroadcastChannel | null = () => (typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('archetypes-crisis'))
) {
  const pestana = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  /** Por cuenta, las pestañas que la tienen abierta. */
  const abiertas = new Map<string, Set<string>>();
  /** Lo que esta pestaña tiene abierto. */
  const propias = new Map<string, boolean>();
  const oyentes = new Set<() => void>();
  let canal: BroadcastChannel | null = null;
  let iniciado = false;

  const enviar = (m: object) => {
    try {
      canal?.postMessage(m);
    } catch {
      // Sin canal, al menos esta pestaña lo sabe.
    }
  };

  const aplicar = (dueno: string, quien: string, abierta: boolean) => {
    const s = abiertas.get(dueno) ?? new Set<string>();
    const antes = s.size > 0;
    if (abierta) s.add(quien);
    else s.delete(quien);
    abiertas.set(dueno, s);
    if (antes !== s.size > 0) for (const f of oyentes) f();
  };

  const recibir = (m: Mensaje) => {
    if (!m || typeof m.pestana !== 'string' || m.pestana === pestana) return;
    if (m.tipo === 'hola') {
      for (const [dueno, abierta] of propias) if (abierta) enviar({ tipo: 'estado', pestana, dueno, abierta: true });
    } else if (m.tipo === 'estado' && typeof m.dueno === 'string') {
      aplicar(m.dueno, m.pestana, m.abierta === true);
    }
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
    canal.onmessage = e => recibir(e.data as Mensaje);
    // Que el canal no mantenga vivo un proceso (las pruebas, en Node).
    (canal as unknown as { unref?: () => void }).unref?.();
    enviar({ tipo: 'hola', pestana });
  };

  return {
    /** El chat de esta pestaña tiene (o ya no tiene) una crisis abierta en esa cuenta. */
    marcar(dueno: string, abierta: boolean): void {
      iniciar();
      propias.set(dueno, abierta);
      aplicar(dueno, pestana, abierta);
      enviar({ tipo: 'estado', pestana, dueno, abierta });
    },
    /** Si alguna pestaña tiene abierta una crisis en esa cuenta. */
    abierta(dueno: string): boolean {
      iniciar();
      return (abiertas.get(dueno)?.size ?? 0) > 0;
    },
    /** Avisa cuando cambia si hay o no una crisis abierta (en cualquier cuenta). */
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
export const crisisMarcada = deEstaPestana.abierta;
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
