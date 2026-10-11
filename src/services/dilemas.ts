/**
 * El test por dilemas: qué pantallas tiene cada versión, cómo se puntúa y cuándo hace falta
 * desempatar. Puro: la pantalla (V1 y V2) solo pinta y recoge elecciones.
 *
 * La puntuación de cada arquetipo es la proporción de veces que se le eligió cuando aparecía:
 * elegido 6 de 8 veces, 75. Como cada uno aparece las mismas veces, ninguno parte con ventaja.
 *
 * Desempate: si al terminar varias figuras comparten el primer puesto (o, con un líder claro, el
 * segundo, que es el que da nombre a la pareja), se ofrece entre ellas una pantalla más, «¿qué te
 * mueve más ahora?», con lo que mueve a cada una y sin su nombre. Cuenta como un dilema más: una
 * aparición para cada una y una elección para la elegida. Así el empate se resuelve con una
 * diferencia real y la puntuación sigue significando lo mismo. Como mucho, tres, y entre seis
 * figuras como máximo.
 */
import { ARCHETYPE_DRIVES_YO } from '../data/archetypePairs';
import { ARCHETYPES_LIST } from '../data/archetypesData';
import { DILEMAS, DILEMAS_RAPIDO_IDS, Dilema, OpcionDilema, PREGUNTA_DESEMPATE } from '../data/dilemasData';
import { AnswerEvidence, ArchetypeId, AssessmentResult, GenderMode, RespuestaDilema } from '../types';
import { resultadoDesdePuntuaciones } from './scoringEngine';

export type TipoTest = 'full' | 'quick';

export const MAX_DESEMPATES = 3;
const PREFIJO_DESEMPATE = 'desempate-';
/**
 * Más de estas a la par no se desempatan: las respuestas no las distinguen, y se dice. Seis caben
 * bien en una pantalla: las opciones del desempate son frases cortas.
 */
const MAX_EN_DESEMPATE = 6;
/** Cuántas situaciones se citan como «por qué te salió» cada figura. */
const EVIDENCIAS_POR_FIGURA = 2;

const IDS = ARCHETYPES_LIST.map(a => a.id as ArchetypeId);

export function dilemasDelTest(tipo: TipoTest): Dilema[] {
  return tipo === 'quick' ? DILEMAS.filter(d => DILEMAS_RAPIDO_IDS.includes(d.id)) : DILEMAS;
}

export const esDesempate = (r: Pick<RespuestaDilema, 'dilemaId'>) => r.dilemaId.startsWith(PREFIJO_DESEMPATE);

/**
 * Cuántas veces apareció y cuántas se eligió cada figura. Solo cuentan las respuestas a dilemas
 * de esta versión del test (un progreso guardado del otro tipo no se cuela) y los desempates.
 */
function recuento(respuestas: RespuestaDilema[], tipo: TipoTest) {
  const delTest = new Map(dilemasDelTest(tipo).map(d => [d.id, d]));
  const apariciones = Object.fromEntries(IDS.map(id => [id, 0])) as Record<ArchetypeId, number>;
  const elecciones = Object.fromEntries(IDS.map(id => [id, 0])) as Record<ArchetypeId, number>;
  for (const r of respuestas) {
    const ofrecidas = esDesempate(r) ? r.entre ?? [] : delTest.get(r.dilemaId)?.opciones.map(o => o.arquetipo) ?? [];
    if (!ofrecidas.includes(r.arquetipo)) continue;
    for (const id of ofrecidas) apariciones[id]++;
    elecciones[r.arquetipo]++;
  }
  return { apariciones, elecciones };
}

/** 0–100 sin redondear: la proporción de veces que se eligió a cada una cuando aparecía. */
export function puntuacionesDilemas(respuestas: RespuestaDilema[], tipo: TipoTest): Record<ArchetypeId, number> {
  const { apariciones, elecciones } = recuento(respuestas, tipo);
  return Object.fromEntries(IDS.map(id => [id, apariciones[id] ? (elecciones[id] / apariciones[id]) * 100 : 0])) as Record<
    ArchetypeId,
    number
  >;
}

const igual = (a: number, b: number) => Math.abs(a - b) < 1e-9;

/** Si hay que desempatar, entre quiénes. Si no (o ya no quedan desempates), null. */
export function candidatosDesempate(respuestas: RespuestaDilema[], tipo: TipoTest): ArchetypeId[] | null {
  const respondidas = new Set(respuestas.map(r => r.dilemaId));
  if (!dilemasDelTest(tipo).every(d => respondidas.has(d.id))) return null;
  if (respuestas.filter(esDesempate).length >= MAX_DESEMPATES) return null;

  const p = puntuacionesDilemas(respuestas, tipo);
  // En el orden de los datos dentro de cada grupo; la pantalla las baraja.
  const max = Math.max(...IDS.map(id => p[id]));
  const lideres = IDS.filter(id => igual(p[id], max));
  if (lideres.length >= 2) return lideres.length <= MAX_EN_DESEMPATE ? lideres : null;

  const resto = IDS.filter(id => !lideres.includes(id));
  const segundo = Math.max(...resto.map(id => p[id]));
  const segundos = resto.filter(id => igual(p[id], segundo));
  // Si detrás del líder no hay nadie elegido nunca, no hay pareja que decidir.
  if (segundo <= 0) return null;
  return segundos.length >= 2 && segundos.length <= MAX_EN_DESEMPATE ? segundos : null;
}

/** La pantalla de un desempate: lo que mueve a cada figura, sin su nombre. */
export function dilemaDeDesempate(candidatos: ArchetypeId[], numero: number): { id: string; pregunta: string; opciones: OpcionDilema[] } {
  return {
    id: `${PREFIJO_DESEMPATE}${numero}`,
    pregunta: PREGUNTA_DESEMPATE,
    opciones: candidatos.map(id => ({ arquetipo: id, texto: `Quiero ${ARCHETYPE_DRIVES_YO[id]}.` })),
  };
}

/**
 * Baraja con semilla: el orden de las opciones es propio de cada persona (que la posición no
 * decida) pero estable si retoma el test donde lo dejó.
 */
export function barajar<T>(lista: T[], semilla: string): T[] {
  let h = 2166136261;
  for (const c of semilla) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const azar = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** El resultado del test por dilemas, con la misma forma que el de frases. */
export function calcularResultadoDilemas(respuestas: RespuestaDilema[], tipo: TipoTest, gender: GenderMode): AssessmentResult {
  const { elecciones } = recuento(respuestas, tipo);
  const puntuaciones = puntuacionesDilemas(respuestas, tipo);
  const delTest = dilemasDelTest(tipo);
  const eleccionPorDilema = new Map(respuestas.filter(r => !esDesempate(r)).map(r => [r.dilemaId, r.arquetipo]));

  // Las situaciones en que se eligió a esa figura, en el orden del test (los desempates no: no
  // cuentan una situación).
  const evidenciaDe = (id: ArchetypeId): AnswerEvidence[] =>
    delTest
      .filter(d => eleccionPorDilema.get(d.id) === id)
      .slice(0, EVIDENCIAS_POR_FIGURA)
      .map(d => ({ dilemaId: d.id }));

  return resultadoDesdePuntuaciones(puntuaciones, elecciones, tipo, gender, evidenciaDe, 'dilemas');
}
