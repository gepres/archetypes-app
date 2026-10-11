/**
 * La lectura personal con IA, conectada a la app (V1 y V2): el asistente, los datos de la cuenta
 * y el almacenamiento del navegador. La lógica vive en lecturaCore.ts.
 */
import { AIProviderService } from './aiProviderService';
import { CRISIS_FOLLOWUP } from './crisisSupport';
import { crisisEnChatGuardado, crisisMarcada } from './crisisVigente';
import { StorageService } from './storageService';
import { crearLecturas } from './lecturaCore';

export type { RespuestaLectura } from './lecturaCore';
// Para que una lectura a la vista se retire si se abre una crisis (también en otra pestaña).
export { suscribirCrisis } from './crisisVigente';

export const lecturas = crearLecturas({
  // Sin el perfil de la persona: su nombre no hace falta para leer un mapa.
  enviar: (prompt, result, gender) => AIProviderService.sendMessage(prompt, [], result, undefined, null, gender),
  maxDaily: () => AIProviderService.getUsageStatus().maxDaily,
  dueno: () => StorageService.getUserProfile().id,
  resultadoExiste: id => StorageService.getCurrentResult()?.id === id || StorageService.getAssessmentHistory().some(r => r.id === id),
  // Lo que dicen los chats abiertos ahora (aunque no se haya podido guardar) o lo guardado. Se
  // lee el chat guardado tal cual (no con getChatMessages, que ante un error devuelve una
  // conversación vacía): si no se puede leer, se trata como abierta.
  crisisAbierta: () => {
    try {
      const dueno = StorageService.getUserProfile().id;
      return crisisMarcada(dueno) || crisisEnChatGuardado(localStorage.getItem('archetypes_chat_messages'));
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
