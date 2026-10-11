/**
 * La lectura personal con IA, conectada a la app (V1 y V2): el asistente, los datos de la cuenta
 * y el almacenamiento del navegador. La lógica vive en lecturaCore.ts.
 */
import { AIProviderService } from './aiProviderService';
import { CRISIS_FOLLOWUP, crisisInConversation } from './crisisSupport';
import { cerrarCrisisRegistradas, crisisAbiertaEnRegistro, suscribirCrisis } from './crisisVigente';
import { StorageService } from './storageService';
import { crearLecturas } from './lecturaCore';

export type { RespuestaLectura } from './lecturaCore';

const CHAT = 'archetypes_chat_messages';
/** Lo que, si cambia en otra pestaña, obliga a volver a comprobar una lectura a la vista. */
const CLAVES_VIGILADAS = new Set([CHAT, 'archetypes_user_profile', 'archetypes_current_result', 'archetypes_history']);

/**
 * Avisa cuando hay que volver a comprobar una lectura a la vista: se abre o cierra una crisis
 * (aquí o en otra pestaña), o en otra pestaña cambian la cuenta, el resultado o el chat, o se
 * borran los datos.
 */
export function suscribirCambios(f: () => void): () => void {
  const dejarCrisis = suscribirCrisis(f);
  const alCambiar = (e: StorageEvent) => {
    if (e.key === null || CLAVES_VIGILADAS.has(e.key)) f();
  };
  window.addEventListener('storage', alCambiar);
  return () => {
    dejarCrisis();
    window.removeEventListener('storage', alCambiar);
  };
}

export const lecturas = crearLecturas({
  // Sin el perfil de la persona: su nombre no hace falta para leer un mapa.
  enviar: (prompt, result, gender) => AIProviderService.sendMessage(prompt, [], result, undefined, null, gender),
  maxDaily: () => AIProviderService.getUsageStatus().maxDaily,
  dueno: () => StorageService.getUserProfile().id,
  resultadoExiste: id => StorageService.getCurrentResult()?.id === id || StorageService.getAssessmentHistory().some(r => r.id === id),
  // El registro común de crisis y el chat guardado tal cual (no con getChatMessages, que ante un
  // error devuelve una conversación vacía). Si no se puede saber, cuenta como abierta.
  crisisAbierta: async () => {
    try {
      return await crisisAbiertaEnRegistro(StorageService.getUserProfile().id, localStorage.getItem(CHAT));
    } catch {
      return true;
    }
  },
  textoDeCuidado: CRISIS_FOLLOWUP,
  almacen: {
    getItem: k => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    setItem: (k, v) => localStorage.setItem(k, v),
  },
});

/**
 * «Ya estoy a salvo» desde la lectura: lo mismo que el botón del chat (cierra hasta ahora la
 * crisis en el chat y en el registro común, con el mismo momento). Así nadie se queda bloqueado
 * por una crisis que ya no se ve en ningún chat (una pestaña que la tenía y se cerró sin poder
 * guardarla).
 */
export async function declararASalvo(): Promise<void> {
  const dueno = StorageService.getUserProfile().id;
  const momento = new Date();
  try {
    const chat = StorageService.getChatMessages();
    if (crisisInConversation(chat)) StorageService.closeCrisis(chat, momento);
  } catch {
    // El registro se cierra igual.
  }
  await cerrarCrisisRegistradas(dueno, momento.getTime());
}

/** Si se puede pedir ahora, y la línea que lo acompaña (qué se envía y lo que cuesta). */
export function estadoLectura(): { disponible: boolean; aviso: string } {
  const uso = AIProviderService.getUsageStatus();
  if (uso.activeKeySource === 'none' || uso.activeKeySource === 'local') {
    return { disponible: false, aviso: 'Ahora no hay un asistente de IA conectado: puedes conectarlo en Ajustes de IA.' };
  }
  if (uso.activeKeySource === 'app' && uso.remainingCourtesy <= 0) {
    return { disponible: false, aviso: `Hoy ya usaste tus ${uso.maxDaily} consultas con el asistente: mañana se renuevan.` };
  }
  return {
    disponible: true,
    aviso: `Al pedirla, lo que elegiste en el test se envía al asistente de IA (sin tu nombre).${
      uso.activeKeySource === 'app' ? ` Usa una de tus consultas de hoy: te quedan ${uso.remainingCourtesy}.` : ''
    }`,
  };
}
