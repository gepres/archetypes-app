// Estado de instalación de la app como PWA.
//
// El navegador dispara `beforeinstallprompt` muy pronto, a menudo antes de que React
// haya montado nada: por eso el listener se registra al importar este módulo y no
// dentro de un componente. Si se pierde ese evento, ya no hay forma de recuperarlo
// y el botón de instalar nunca funcionaría.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_BANNER_OCULTO = 'archetypes_pwa_banner_dismissed_v1';

let promptDiferido: BeforeInstallPromptEvent | null = null;
const suscriptores = new Set<() => void>();

function avisar() {
  suscriptores.forEach(fn => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {
    // Sin esto Chrome muestra su propia barra y perdemos el control del momento
    event.preventDefault();
    promptDiferido = event as BeforeInstallPromptEvent;
    avisar();
  });

  window.addEventListener('appinstalled', () => {
    promptDiferido = null;
    try {
      localStorage.removeItem(STORAGE_KEY_BANNER_OCULTO);
    } catch {
      /* modo privado: no pasa nada */
    }
    avisar();
  });
}

export type PlataformaInstalacion = 'android' | 'ios' | 'escritorio' | 'ninguna';

export const PwaInstallService = {
  subscribe(fn: () => void): () => void {
    suscriptores.add(fn);
    return () => {
      suscriptores.delete(fn);
    };
  },

  // Ya se está ejecutando como app instalada
  isInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches;
    const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
    return Boolean(standalone || iosStandalone);
  },

  // Safari en iOS no implementa beforeinstallprompt: solo cabe explicar los pasos
  isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    const esIPhone = /iPhone|iPod/i.test(ua);
    // El iPad moderno se anuncia como Mac; los puntos táctiles lo delatan
    const esIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    return esIPhone || esIPad;
  },

  canPrompt(): boolean {
    return promptDiferido !== null;
  },

  // Qué se le puede ofrecer al usuario ahora mismo
  getPlatform(): PlataformaInstalacion {
    if (this.isInstalled()) return 'ninguna';
    if (promptDiferido) {
      return /Android/i.test(navigator.userAgent) ? 'android' : 'escritorio';
    }
    if (this.isIOS()) return 'ios';
    return 'ninguna';
  },

  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!promptDiferido) return 'unavailable';
    const evento = promptDiferido;
    // Un prompt solo puede consumirse una vez
    promptDiferido = null;
    avisar();
    try {
      await evento.prompt();
      const { outcome } = await evento.userChoice;
      return outcome;
    } catch {
      return 'unavailable';
    }
  },

  isBannerDismissed(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY_BANNER_OCULTO) === '1';
    } catch {
      return false;
    }
  },

  dismissBanner(): void {
    try {
      localStorage.setItem(STORAGE_KEY_BANNER_OCULTO, '1');
    } catch {
      /* modo privado: el banner reaparecerá, es aceptable */
    }
    avisar();
  },
};
