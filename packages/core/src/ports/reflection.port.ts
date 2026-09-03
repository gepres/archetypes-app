import type { ArchetypeId, AssessmentResult } from '../domain/model';

/** Lo que se le pide a un proveedor de IA para acompanar una reflexion. */
export interface ReflectionRequest {
  prompt: string;
  result?: AssessmentResult | null;
  focusArchetype?: ArchetypeId;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export type ReflectionOutcome =
  | { ok: true; text: string; model?: string }
  | { ok: false; reason: 'no-provider' | 'quota' | 'network' | 'refused'; detail?: string };

/**
 * Proveedor de reflexiones.
 *
 * El nucleo no sabe si detras hay un modelo en la nube, uno local o nada. Solo
 * sabe que puede pedir un texto y que la peticion puede no salir bien, asi que
 * el fallo forma parte del tipo de retorno en vez de ser una excepcion: quedarse
 * sin cuota es un caso previsto del flujo, no una situacion excepcional.
 */
export interface ReflectionProvider {
  isAvailable(): Promise<boolean>;
  reflect(request: ReflectionRequest): Promise<ReflectionOutcome>;
}
