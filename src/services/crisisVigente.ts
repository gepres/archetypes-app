/**
 * Si hay una crisis abierta en el chat de una cuenta, tal como la ve el chat ahora mismo.
 *
 * Lo guardado no basta: si el almacenamiento está lleno, el mensaje de crisis no llega a
 * guardarse, pero el chat la mantiene abierta en memoria. Lo que dependa de saberlo (la lectura
 * personal con IA, que no debe entregar una interpretación durante una crisis) pregunta aquí,
 * además de mirar la conversación guardada. Se avisa también a las demás pestañas de la app.
 */
const abiertas = new Map<string, boolean>();
let canal: BroadcastChannel | null = null;

function abrirCanal() {
  if (canal || typeof BroadcastChannel === 'undefined') return;
  try {
    canal = new BroadcastChannel('archetypes-crisis');
    canal.onmessage = e => {
      const { dueno, abierta } = (e.data || {}) as { dueno?: unknown; abierta?: unknown };
      if (typeof dueno === 'string') abiertas.set(dueno, abierta === true);
    };
    // Que el canal no mantenga vivo un proceso (las pruebas, en Node).
    (canal as unknown as { unref?: () => void }).unref?.();
  } catch {
    canal = null;
  }
}

/** El chat de esa cuenta tiene (o ya no tiene) una crisis abierta. */
export function marcarCrisis(dueno: string, abierta: boolean): void {
  abrirCanal();
  abiertas.set(dueno, abierta);
  try {
    canal?.postMessage({ dueno, abierta });
  } catch {
    // Sin canal, al menos esta pestaña lo sabe.
  }
}

/** Si el chat de esa cuenta avisó de una crisis abierta (en esta pestaña o en otra). */
export function crisisMarcada(dueno: string): boolean {
  abrirCanal();
  return abiertas.get(dueno) === true;
}
