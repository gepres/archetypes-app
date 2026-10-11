/**
 * El test por dilemas: qué pantallas tiene cada versión, cómo se puntúa y cuándo hace falta
 * desempatar. Puro: la pantalla (V1 y V2) solo pinta y recoge elecciones.
 *
 * Cada elección es una comparación: elegir una respuesta es preferir esa figura a cada una de las
 * otras tres de la pantalla (de esas tres entre sí no se sabe nada). La puntuación de una figura
 * es la parte de sus comparaciones que ganó. No basta con contar cuántas veces se la eligió:
 * cada figura comparte pantalla con rivales distintos, y una que nunca coincidió con las favoritas
 * sale «elegida siempre» sin haber competido con ellas.
 *
 * Por eso el orden se decide con las comparaciones, por capas: primero las figuras que nunca
 * perdieron; después, las que solo perdieron contra las ya colocadas; y así. Ninguna figura va por
 * delante de otra que le ganó. Dentro de una capa (figuras que no compitieron entre sí), decide la
 * puntuación.
 *
 * Si en la primera capa o en la segunda (las que dan nombre a la pareja) hay varias, se ofrece
 * entre ellas una pantalla más, «¿qué te mueve más ahora?», con lo que mueve a cada una y sin su
 * nombre. Ese desempate es una comparación más para ordenar, pero no puntúa: los números que se
 * ven (y el balance de dimensiones) salen solo de las situaciones.
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
 * Más de estas en un grupo no se desempatan: las respuestas no las distinguen, y se dice. Seis
 * caben bien en una pantalla: las opciones del desempate son frases cortas.
 */
const MAX_EN_DESEMPATE = 6;
/** Cuántas situaciones se citan como «por qué te salió» cada figura. */
const EVIDENCIAS_POR_FIGURA = 2;

const IDS = ARCHETYPES_LIST.map(a => a.id as ArchetypeId);

function porFigura<T>(f: (id: ArchetypeId) => T): Record<ArchetypeId, T> {
  return Object.fromEntries(IDS.map(id => [id, f(id)])) as Record<ArchetypeId, T>;
}

export function dilemasDelTest(tipo: TipoTest): Dilema[] {
  return tipo === 'quick' ? DILEMAS.filter(d => DILEMAS_RAPIDO_IDS.includes(d.id)) : DILEMAS;
}

export const esDesempate = (r: Pick<RespuestaDilema, 'dilemaId'>) => r.dilemaId.startsWith(PREFIJO_DESEMPATE);

interface Comparaciones {
  victorias: Record<ArchetypeId, number>;
  derrotas: Record<ArchetypeId, number>;
  /** Contra quiénes perdió cada figura alguna vez. */
  leGanaron: Record<ArchetypeId, Set<ArchetypeId>>;
}

/**
 * Las comparaciones que dejan las respuestas. Solo cuentan los dilemas de esta versión del test
 * (un progreso guardado del otro tipo no se cuela) y, si se piden, los desempates.
 */
function comparar(respuestas: RespuestaDilema[], tipo: TipoTest, conDesempates: boolean): Comparaciones {
  const delTest = new Map(dilemasDelTest(tipo).map(d => [d.id, d]));
  const c: Comparaciones = { victorias: porFigura(() => 0), derrotas: porFigura(() => 0), leGanaron: porFigura(() => new Set()) };
  for (const r of respuestas) {
    if (esDesempate(r) && !conDesempates) continue;
    const ofrecidas = esDesempate(r) ? r.entre ?? [] : delTest.get(r.dilemaId)?.opciones.map(o => o.arquetipo) ?? [];
    if (!ofrecidas.includes(r.arquetipo)) continue;
    for (const otra of ofrecidas) {
      if (otra === r.arquetipo) continue;
      c.victorias[r.arquetipo]++;
      c.derrotas[otra]++;
      c.leGanaron[otra].add(r.arquetipo);
    }
  }
  return c;
}

/** La parte de sus comparaciones que ganó cada figura, de 0 a 100. */
function tasa(c: Comparaciones): Record<ArchetypeId, number> {
  return porFigura(id => {
    const total = c.victorias[id] + c.derrotas[id];
    return total ? (c.victorias[id] / total) * 100 : 0;
  });
}

/**
 * 0–100 sin redondear: la parte de sus comparaciones que ganó cada figura, solo con las
 * situaciones (los desempates ordenan, no puntúan).
 */
export function puntuacionesDilemas(respuestas: RespuestaDilema[], tipo: TipoTest): Record<ArchetypeId, number> {
  return tasa(comparar(respuestas, tipo, false));
}

const igual = (a: number, b: number) => Math.abs(a - b) < 1e-9;

/** El grupo de las que mejor tasa tienen entre `ids`. */
function mejores(ids: ArchetypeId[], p: Record<ArchetypeId, number>): ArchetypeId[] {
  const max = Math.max(...ids.map(id => p[id]));
  return ids.filter(id => igual(p[id], max));
}

interface Capa {
  ids: ArchetypeId[];
  /** Si la decidieron las comparaciones (y no la tasa, cuando las respuestas se contradicen). */
  porComparacion: boolean;
}

/**
 * El orden por capas (desempates incluidos): cada capa son las figuras cuyas derrotas fueron
 * todas contra figuras ya colocadas. Dentro de una capa, por la puntuación de las situaciones.
 * Si las respuestas se contradicen (A gana a B, B a C y C a A), ninguna queda libre: entonces se
 * coloca la de mejor tasa, contando los desempates.
 */
function capas(c: Comparaciones, puntuacion: Record<ArchetypeId, number>): Capa[] {
  const conTodo = tasa(c);
  const colocadas = new Set<ArchetypeId>();
  let restantes = IDS.filter(id => c.victorias[id] + c.derrotas[id] > 0);
  const lista: Capa[] = [];
  while (restantes.length) {
    const libres = restantes.filter(id => [...c.leGanaron[id]].every(g => colocadas.has(g)));
    const porComparacion = libres.length > 0;
    const capa = (porComparacion ? libres : mejores(restantes, conTodo)).sort((a, b) => puntuacion[b] - puntuacion[a]);
    lista.push({ ids: capa, porComparacion });
    for (const id of capa) colocadas.add(id);
    restantes = restantes.filter(id => !colocadas.has(id));
  }
  const sinDatos = IDS.filter(id => !colocadas.has(id));
  if (sinDatos.length) lista.push({ ids: sinDatos, porComparacion: false });
  return lista;
}

/** Si hay que desempatar, entre quiénes. Si no (o ya no quedan desempates), null. */
export function candidatosDesempate(respuestas: RespuestaDilema[], tipo: TipoTest): ArchetypeId[] | null {
  const respondidas = new Set(respuestas.map(r => r.dilemaId));
  if (!dilemasDelTest(tipo).every(d => respondidas.has(d.id))) return null;
  if (respuestas.filter(esDesempate).length >= MAX_DESEMPATES) return null;
  const [primera, segunda] = capas(comparar(respuestas, tipo, true), puntuacionesDilemas(respuestas, tipo));
  // La pareja sale de las dos primeras capas: si la primera tiene varias, se decide el primer
  // puesto; si no, el segundo.
  const pendiente = primera && primera.ids.length > 1 ? primera.ids : segunda && segunda.ids.length > 1 ? segunda.ids : null;
  return pendiente && pendiente.length <= MAX_EN_DESEMPATE ? pendiente : null;
}

/**
 * El orden final, con las puntuaciones de las situaciones tal cual. `resueltos`: cuántos puestos
 * de arriba (hasta dos, los de la pareja) quedaron decididos uno a uno por comparaciones.
 */
export function ordenDilemas(
  respuestas: RespuestaDilema[],
  tipo: TipoTest
): { ids: ArchetypeId[]; resueltos: 0 | 1 | 2; puntuaciones: Record<ArchetypeId, number> } {
  const puntuaciones = puntuacionesDilemas(respuestas, tipo);
  const lista = capas(comparar(respuestas, tipo, true), puntuaciones);
  let resueltos = 0;
  for (const capa of lista) {
    if (resueltos >= 2 || capa.ids.length !== 1 || !capa.porComparacion) break;
    resueltos++;
  }
  return { ids: lista.flatMap(capa => capa.ids), resueltos: resueltos as 0 | 1 | 2, puntuaciones };
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
  for (const ch of semilla) {
    h ^= ch.charCodeAt(0);
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
  const { victorias } = comparar(respuestas, tipo, false);
  const orden = ordenDilemas(respuestas, tipo);
  const delTest = dilemasDelTest(tipo);
  const eleccionPorDilema = new Map(respuestas.filter(r => !esDesempate(r)).map(r => [r.dilemaId, r.arquetipo]));

  // Las situaciones en que se eligió a esa figura, en el orden del test (los desempates no: no
  // cuentan una situación).
  const evidenciaDe = (id: ArchetypeId): AnswerEvidence[] =>
    delTest
      .filter(d => eleccionPorDilema.get(d.id) === id)
      .slice(0, EVIDENCIAS_POR_FIGURA)
      .map(d => ({ dilemaId: d.id }));

  return resultadoDesdePuntuaciones(orden.puntuaciones, victorias, tipo, gender, evidenciaDe, 'dilemas', {
    ids: orden.ids,
    resueltos: orden.resueltos,
  });
}
