/**
 * La lectura personal con IA, conectada a la app (V1 y V2): el asistente, los datos de la cuenta
 * y el almacenamiento del navegador. La lógica vive en lecturaCore.ts.
 */
import { AIProviderService } from './aiProviderService';
import { CRISIS_FOLLOWUP, crisisInConversation } from './crisisSupport';
import { StorageService } from './storageService';
import { crearLecturas } from './lecturaCore';

export type { RespuestaLectura } from './lecturaCore';

export const lecturas = crearLecturas({
  // Sin el perfil de la persona: su nombre no hace falta para leer un mapa.
  enviar: (prompt, result, gender) => AIProviderService.sendMessage(prompt, [], result, undefined, null, gender),
  maxDaily: () => AIProviderService.getUsageStatus().maxDaily,
  dueno: () => StorageService.getUserProfile().id,
  resultadoExiste: id => StorageService.getCurrentResult()?.id === id || StorageService.getAssessmentHistory().some(r => r.id === id),
  crisisAbierta: () => {
    try {
      return crisisInConversation(StorageService.getChatMessages());
    } catch {
      return false;
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
