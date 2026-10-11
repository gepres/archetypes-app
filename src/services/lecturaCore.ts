/**
 * El núcleo de la lectura personal con IA: pedirla, guardarla y no hacer nada indebido mientras
 * tanto. Recibe sus dependencias (el asistente, los datos, el almacenamiento) para probarlo sin
 * red ni navegador; lecturaIA.ts le conecta las de verdad.
 *
 * Tres cuidados:
 * - Con una crisis abierta en el chat no se entrega ninguna interpretación: ni se pide a la IA,
 *   ni se entrega (ni se guarda) si la crisis se abrió mientras llegaba. Se responde con el
 *   protocolo de cuidado, igual que haría el chat.
 * - Solo se pide para un resultado de la cuenta abierta, y solo se entrega y se guarda si la
 *   cuenta y el resultado siguen ahí al llegar: si mientras tanto se borraron los datos o se
 *   cambió de cuenta (en otra pestaña), no se muestra ni se escribe nada.
 * - Una petición en curso para el mismo resultado y perspectiva se comparte: volver a pedirla
 *   (A→B→A) no gasta otra consulta, y la respuesta se guarda bajo su clave aunque la pantalla
 *   ya muestre otra perspectiva.
 */
import { motivoSinLectura, promptLectura, pulirLectura } from './lecturaPersonal';
import { AssessmentResult, GenderMode } from '../types';

export type RespuestaLectura =
  | { ok: true; texto: string }
  | {
      ok: false;
      motivo: string;
      /** Hay una crisis abierta: se muestra el protocolo de cuidado, nunca una interpretación. */
      cuidado?: boolean;
      /** La cuenta o sus datos cambiaron (o el resultado no es suyo): la lectura anterior tampoco vale. */
      invalidada?: boolean;
    };

export interface DependenciasLectura {
  enviar(prompt: string, result: AssessmentResult, gender: GenderMode): Promise<{ text: string; modelUsed: string; provider: string }>;
  maxDaily(): number;
  /** La cuenta abierta ahora. */
  dueno(): string;
  /** Si ese resultado sigue en los datos de la cuenta abierta. */
  resultadoExiste(resultId: string): boolean;
  crisisAbierta(): boolean;
  /** Si ya se sabe el estado de crisis de las demás pestañas (y si no, esperar a saberlo). */
  listo(): boolean;
  esperarListo(): Promise<void>;
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

  const cuidado: RespuestaLectura = { ok: false, motivo: deps.textoDeCuidado, cuidado: true };
  const ajeno: RespuestaLectura = {
    ok: false,
    motivo: 'Este resultado no está guardado en la cuenta abierta, así que no se puede pedir su lectura.',
    invalidada: true,
  };

  const cambiada: RespuestaLectura = {
    ok: false,
    motivo: 'La cuenta o sus datos cambiaron mientras llegaba la lectura, así que no se muestra.',
    invalidada: true,
  };

  /** Lo que se entrega al llegar la respuesta, si todo sigue en pie: crisis, cuenta y resultado. */
  const alEntregar = (r: { ok: true; texto: string }, dueno: string, resultId: string): RespuestaLectura => {
    if (deps.crisisAbierta()) return cuidado;
    if (deps.dueno() !== dueno || !deps.resultadoExiste(resultId)) return cambiada;
    return r;
  };

  const lecturas = {
    /** Si hay una crisis abierta ahora: entonces no se muestra ni se lee ninguna lectura. */
    crisisAbierta: () => deps.crisisAbierta(),
    /** Si ya se sabe lo de las demás pestañas; mientras no, no se muestra ninguna lectura. */
    listo: () => deps.listo(),
    /** Lo que se muestra en su lugar. */
    cuidado,

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
      // Una petición compartida también pasa por los cuidados al entregarse: la crisis pudo
      // abrirse, o la cuenta cambiar, después de que la pidiera otra pantalla.
      const enCurso = pendientes.get(clave);
      if (enCurso) return enCurso.then(r => (r.ok ? alEntregar(r, deps.dueno(), result.id) : r));
      const dueno = deps.dueno();
      const peticion = (async (): Promise<RespuestaLectura> => {
        // Una pestaña recién abierta aún no sabe si otra tiene una crisis: se espera a saberlo.
        await deps.esperarListo();
        if (deps.crisisAbierta()) return cuidado;
        // Solo se envían las elecciones de un resultado de la cuenta abierta.
        if (!deps.resultadoExiste(result.id)) return ajeno;
        const prompt = promptLectura(result, gender);
        if (!prompt) return { ok: false, motivo: 'La lectura personal está disponible para el test por situaciones.' };
        const maxDaily = deps.maxDaily();
        const respuesta = await deps.enviar(prompt, result, gender);
        // Al llegar, antes de nada (también si falló la conexión): crisis, cuenta y resultado.
        if (deps.crisisAbierta()) return cuidado;
        if (deps.dueno() !== dueno || !deps.resultadoExiste(result.id)) return cambiada;
        // Si respondió el mapa simbólico en vez de una IA, no hay lectura: presentarla como
        // «de IA» sería engañoso.
        if (respuesta.provider === 'local') return { ok: false, motivo: motivoSinLectura(respuesta, maxDaily) };
        const entregable = alEntregar({ ok: true, texto: pulirLectura(respuesta.text) }, dueno, result.id);
        if (entregable.ok) {
          const texto = entregable.texto;
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
        return entregable;
      })().finally(() => pendientes.delete(clave));
      pendientes.set(clave, peticion);
      return peticion;
    },
  };
  return lecturas;
}
