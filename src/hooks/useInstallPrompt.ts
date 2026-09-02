import { useCallback, useSyncExternalStore } from 'react';
import { PwaInstallService, PlataformaInstalacion } from '../services/pwaInstallService';

interface EstadoInstalacion {
  plataforma: PlataformaInstalacion;
  estaInstalada: boolean;
  bannerOculto: boolean;
  /** Hay prompt nativo disponible: se puede instalar con un clic */
  puedeInstalarDirecto: boolean;
  /** Solo quedan instrucciones manuales (iOS) */
  requiereInstruccionesManuales: boolean;
  instalar: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  ocultarBanner: () => void;
}

// El estado vive fuera de React (el evento del navegador llega antes de montar),
// así que se lee con useSyncExternalStore en vez de con useState + useEffect.
function leerSnapshot(): string {
  return [
    PwaInstallService.getPlatform(),
    PwaInstallService.isInstalled() ? '1' : '0',
    PwaInstallService.isBannerDismissed() ? '1' : '0',
  ].join('|');
}

export function useInstallPrompt(): EstadoInstalacion {
  // La cadena sirve de clave de igualdad: evita re-render en cada notificación
  useSyncExternalStore(PwaInstallService.subscribe, leerSnapshot, () => 'ninguna|0|0');

  const plataforma = PwaInstallService.getPlatform();
  const instalar = useCallback(() => PwaInstallService.promptInstall(), []);
  const ocultarBanner = useCallback(() => PwaInstallService.dismissBanner(), []);

  return {
    plataforma,
    estaInstalada: PwaInstallService.isInstalled(),
    bannerOculto: PwaInstallService.isBannerDismissed(),
    puedeInstalarDirecto: plataforma === 'android' || plataforma === 'escritorio',
    requiereInstruccionesManuales: plataforma === 'ios',
    instalar,
    ocultarBanner,
  };
}
