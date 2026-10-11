/**
 * El núcleo de la lectura personal con IA: pedirla, guardarla y no hacer nada indebido mientras
 * tanto. Recibe sus dependencias (el asistente, los datos, el almacenamiento) para probarlo sin
 * red ni navegador; lecturaIA.ts le conecta las de verdad.
 *
 * Tres cuidados:
 * - Con una crisis abierta en el chat no se pide nada a la IA: se responde con el protocolo de
 *   cuidado, igual que haría el chat.
 * - Una respuesta solo se guarda si su cuenta y su resultado siguen existiendo: si mientras tanto
 *   se borraron los datos o se cambió de cuenta, no vuelve a escribir nada.
 * - Una petición en curso para el mismo resultado y perspectiva se comparte: volver a pedirla
 *   (A→B→A) no gasta otra consulta, y la respuesta se guarda bajo su clave aunque la pantalla
 *   ya muestre otra perspectiva.
 */
import { motivoSinLectura, promptLectura, pulirLectura } from './lecturaPersonal';
import { AssessmentResult, GenderMode } from '../types';

export type RespuestaLectura = { ok: true; texto: string } | { ok: false; motivo: string; cuidado?: boolean };

export interface DependenciasLectura {
  enviar(prompt: string, result: AssessmentResult, gender: GenderMode): Promise<{ text: string; modelUsed: string; provider: string }>;
  maxDaily(): number;
  /** La cuenta abierta ahora. */
  dueno(): string;
  /** Si ese resultado sigue en los datos de la cuenta abierta. */
  resultadoExiste(resultId: string): boolean;
  crisisAbierta(): boolean;
  /** El texto con el que se responde ante una crisis abierta. */
  textoDeCuidado: string;
  almacen: { getItem(k: string): string | null; setItem(k: string, v: string): void };
}

const CLAVE = 'archetypes_lecturas_ia';
const MAX_GUARDADAS = 12;

export function crearLecturas(deps: DependenciasLectura) {
  const pendientes = new Map<string, Promise<RespuestaLectura>>();

  const leerTodas = (): Record<string, { texto: string; fecha: string }> => {
    try {
      return JSON.parse(deps.almacen.getItem(CLAVE) || '{}');
    } catch {
      return {};
    }
  };

  const lecturas = {
    /** Por cuenta, resultado y perspectiva: otra cuenta del mismo dispositivo no la ve. */
    clave: (result: AssessmentResult, gender: GenderMode) => `${deps.dueno()}:${result.id}:${gender}`,

    leer(clave: string): string | null {
      const t = leerTodas()[clave]?.texto;
      return typeof t === 'string' ? t : null;
    },

    /** La petición en curso para esa clave, si la hay. */
    pendiente: (clave: string) => pendientes.get(clave),

    pedir(result: AssessmentResult, gender: GenderMode): Promise<RespuestaLectura> {
      const clave = lecturas.clave(result, gender);
      const enCurso = pendientes.get(clave);
      if (enCurso) return enCurso;
      const dueno = deps.dueno();
      const peticion = (async (): Promise<RespuestaLectura> => {
        if (deps.crisisAbierta()) return { ok: false, motivo: deps.textoDeCuidado, cuidado: true };
        const prompt = promptLectura(result, gender);
        if (!prompt) return { ok: false, motivo: 'La lectura personal está disponible para el test por situaciones.' };
        const maxDaily = deps.maxDaily();
        const respuesta = await deps.enviar(prompt, result, gender);
        // Si respondió el mapa simbólico en vez de una IA, no hay lectura: presentarla como
        // «de IA» sería engañoso.
        if (respuesta.provider === 'local') return { ok: false, motivo: motivoSinLectura(respuesta, maxDaily) };
        const texto = pulirLectura(respuesta.text);
        if (deps.dueno() === dueno && deps.resultadoExiste(result.id)) {
          try {
            const todas = leerTodas();
            todas[clave] = { texto, fecha: new Date().toISOString() };
            const recientes = Object.entries(todas)
              .sort((a, b) => String(b[1].fecha).localeCompare(String(a[1].fecha)))
              .slice(0, MAX_GUARDADAS);
            deps.almacen.setItem(CLAVE, JSON.stringify(Object.fromEntries(recientes)));
          } catch {
            // Sin almacenamiento, la lectura se ve igual; solo no se recuerda.
          }
        }
        return { ok: true, texto };
      })().finally(() => pendientes.delete(clave));
      pendientes.set(clave, peticion);
      return peticion;
    },
  };
  return lecturas;
}
