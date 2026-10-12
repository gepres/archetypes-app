import { RefObject, useEffect } from 'react';

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Cuántos modales hay abiertos: la app queda inerte mientras haya alguno. */
let abiertos = 0;

/**
 * El foco de un modal pintado en un portal (fuera de #root). Al abrirse, el foco entra en él (en
 * el contenedor, no en un campo: en el celular abriría el teclado); mientras está abierto, Tab
 * y Shift+Tab no salen de él y el resto de la app queda inerte (ni el teclado ni un lector de
 * pantalla llegan a lo de detrás); al cerrarse, el foco vuelve a donde estaba.
 */
export function useFocoModal(abierto: boolean, ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!abierto) return;
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const raiz = document.getElementById('root');
    abiertos++;
    raiz?.setAttribute('inert', '');
    const caja = ref.current;
    caja?.focus({ preventScroll: true });

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !caja) return;
      const lista = [...caja.querySelectorAll<HTMLElement>(ENFOCABLES)].filter(el => el.getClientRects().length > 0);
      if (!lista.length) {
        e.preventDefault();
        caja.focus();
        return;
      }
      const i = lista.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        lista[lista.length - 1].focus();
      } else if (!e.shiftKey && (i === -1 || i === lista.length - 1)) {
        e.preventDefault();
        lista[0].focus();
      }
    };
    document.addEventListener('keydown', alPulsar);

    return () => {
      document.removeEventListener('keydown', alPulsar);
      abiertos = Math.max(0, abiertos - 1);
      if (abiertos === 0) raiz?.removeAttribute('inert');
      antes?.focus({ preventScroll: true });
    };
  }, [abierto, ref]);
}
