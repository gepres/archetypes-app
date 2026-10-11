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
 * Por eso la cabeza del mapa se decide con las comparaciones, no con la puntuación:
 * - el primer puesto, entre las figuras que nunca perdieron;
 * - el segundo (el que da nombre a la pareja), entre las que solo perdieron contra la primera.
 * Si en alguno de los dos hay varias, se ofrece entre ellas una pantalla más, «¿qué te mueve más
 * ahora?», con lo que mueve a cada una y sin su nombre. Esa pantalla solo ordena dentro de su
 * grupo: no le resta a nadie ni deja que otra figura adelante a las del grupo.
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

/**
 * La cabeza del mapa según las comparaciones (desempates incluidos): el primero y el segundo si
 * ya están claros, o el grupo entre el que hay que decidir.
 */
function resolverCabeza(
  c: Comparaciones,
  p: Record<ArchetypeId, number>
): { primero?: ArchetypeId; segundo?: ArchetypeId; pendiente?: ArchetypeId[] } {
  const conDatos = IDS.filter(id => c.victorias[id] + c.derrotas[id] > 0);
  if (!conDatos.length) return {};
  const invictas = conDatos.filter(id => c.leGanaron[id].size === 0);
  // Si nadie está invicta (respuestas que se contradicen), decide la tasa.
  const candidatasPrimero = invictas.length ? invictas : mejores(conDatos, p);
  if (candidatasPrimero.length > 1) return { pendiente: candidatasPrimero };
  const primero = candidatasPrimero[0];

  const resto = conDatos.filter(id => id !== primero);
  if (!resto.length) return { primero };
  const soloAnteElPrimero = resto.filter(id => [...c.leGanaron[id]].every(g => g === primero));
  const candidatasSegundo = soloAnteElPrimero.length ? soloAnteElPrimero : mejores(resto, p);
  if (candidatasSegundo.length > 1) return { primero, pendiente: candidatasSegundo };
  return { primero, segundo: candidatasSegundo[0] };
}

/** Si hay que desempatar, entre quiénes. Si no (o ya no quedan desempates), null. */
export function candidatosDesempate(respuestas: RespuestaDilema[], tipo: TipoTest): ArchetypeId[] | null {
  const respondidas = new Set(respuestas.map(r => r.dilemaId));
  if (!dilemasDelTest(tipo).every(d => respondidas.has(d.id))) return null;
  if (respuestas.filter(esDesempate).length >= MAX_DESEMPATES) return null;
  const c = comparar(respuestas, tipo, true);
  const { pendiente } = resolverCabeza(c, tasa(c));
  return pendiente && pendiente.length <= MAX_EN_DESEMPATE ? pendiente : null;
}

/**
 * El orden final y las puntuaciones que se muestran: primero la cabeza resuelta por las
 * comparaciones; después el resto, por su tasa. Ninguna figura de detrás se muestra con más
 * puntuación que las de la cabeza: las respuestas la sitúan por debajo.
 */
export function ordenDilemas(
  respuestas: RespuestaDilema[],
  tipo: TipoTest
): { ids: ArchetypeId[]; resueltos: 0 | 1 | 2; puntuaciones: Record<ArchetypeId, number> } {
  const todas = comparar(respuestas, tipo, true);
  const cabeza = resolverCabeza(todas, tasa(todas));
  const resueltas = [cabeza.primero, cabeza.segundo].filter((id): id is ArchetypeId => !!id);
  const p = puntuacionesDilemas(respuestas, tipo);
  const resto = IDS.filter(id => !resueltas.includes(id)).sort((a, b) => p[b] - p[a]);
  const puntuaciones = { ...p };
  let tope = Infinity;
  for (const id of resueltas) {
    puntuaciones[id] = Math.min(puntuaciones[id], tope);
    tope = puntuaciones[id];
  }
  for (const id of resto) puntuaciones[id] = Math.min(puntuaciones[id], tope);
  return { ids: [...resueltas, ...resto], resueltos: resueltas.length as 0 | 1 | 2, puntuaciones };
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
