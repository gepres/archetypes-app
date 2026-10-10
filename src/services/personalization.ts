/**
 * Lo que viene después del test, a la medida del mapa de cada persona: qué prácticas se le
 * recomiendan, con qué figuras arrancan Sinergias y el Comparador, y qué preguntas se le
 * sugieren en el chat. Antes todo eso era igual para cualquiera (el Rey y el Guerrero), y la
 * app parecía no haber escuchado el test.
 *
 * Todo es puro: recibe el resultado y devuelve la elección, sin tocar el almacenamiento.
 */
import { ARCHETYPES_LIST, getArchetype, withA, withDe } from '../data/archetypesData';
import { ArchetypeId, AssessmentResult, Challenge, GenderMode } from '../types';
import { listNames } from './scoringEngine';

/**
 * Las figuras que encabezan el mapa, en orden. Las que comparten el primer puesto si hay
 * empate; si no, el dominante con su pareja o sus acompañantes. Vacío si el mapa no tiene un
 * polo claro: ahí no se puede decir que nadie encabece.
 */
export function leadingArchetypes(result: AssessmentResult): ArchetypeId[] {
  const p = result.compositeProfile;
  if (p.isFlat) return [];
  if (p.isTie) return p.tiedLeaders ?? [result.ranking[0].archetypeId, result.ranking[1].archetypeId];
  const dominante = result.dominantArchetype.archetypeId;
  const detras = p.companions ?? (p.pair ? p.pair.filter(id => id !== dominante) : []);
  return [dominante, ...detras];
}

/** Las que menos aparecieron, para desarrollar, sin repetir ninguna de cabeza. */
export function growthArchetypes(result: AssessmentResult): ArchetypeId[] {
  const cabeza = new Set(leadingArchetypes(result));
  return (result.developmentArchetypes ?? []).map(s => s.archetypeId).filter(id => !cabeza.has(id));
}

/** Un nombre dentro de una frase: «el Rey», «la Reina», «el arquetipo Rey / Reina». */
export function enFrase(name: string): string {
  if (name.startsWith('El ')) return `el ${name.slice(3)}`;
  if (name.startsWith('La ')) return `la ${name.slice(3)}`;
  return `el arquetipo ${name}`;
}

const conMayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Intercala dos listas: a1, b1, a2, b2… y sigue con la que quede. Sin repetir. */
function intercalar<T>(a: T[], b: T[]): T[] {
  const fuera: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    for (const x of [a[i], b[i]]) if (x !== undefined && !fuera.includes(x)) fuera.push(x);
  }
  return fuera;
}

/**
 * Las prácticas que se recomiendan en «Mi Mapa». Alternan las figuras que encabezan el mapa
 * (para sostener lo que ya es fuerte) con las que menos aparecieron (para hacerles sitio),
 * y detrás el resto del ranking; una práctica por figura antes de repetir ninguna, y las
 * pendientes antes que las hechas.
 */
export function recommendChallenges(challenges: Challenge[], result: AssessmentResult, n = 4): Challenge[] {
  const ranking = result.ranking.map(s => s.archetypeId);
  const orden = intercalar(leadingArchetypes(result), growthArchetypes(result));
  for (const id of ranking) if (!orden.includes(id)) orden.push(id);

  const elegidas: Challenge[] = [];
  const elegir = (aceptable: (c: Challenge) => boolean) => {
    // Por rondas: la primera práctica aceptable de cada figura, luego la segunda…
    const porFigura = orden.map(id => challenges.filter(c => c.archetypeId === id && aceptable(c) && !elegidas.includes(c)));
    for (let ronda = 0; elegidas.length < n && porFigura.some(l => l.length > ronda); ronda++) {
      for (const lista of porFigura) {
        if (elegidas.length >= n) break;
        if (lista[ronda]) elegidas.push(lista[ronda]);
      }
    }
  };
  elegir(c => !c.completed);
  elegir(() => true);
  return elegidas;
}

/**
 * El arquetipo de la Carta del Día. Sin mapa, el mismo para todo el mundo, rotando por los 18.
 * Con mapa, la carta alterna entre las figuras que lo encabezan y las que menos aparecieron;
 * uno de cada tres días trae el del ciclo general, para que también lleguen las demás.
 * `dia`: el número del día local (numeroDeDia).
 */
export function arquetipoDelDia(dia: number, result: AssessmentResult | null): ArchetypeId {
  const n = ARCHETYPES_LIST.length;
  const ciclo = (i: number, largo: number) => ((i % largo) + largo) % largo;
  // Lo que encabeza y lo que menos apareció, alternados.
  const propias = result ? intercalar(leadingArchetypes(result), growthArchetypes(result)) : [];
  if (!propias.length) return ARCHETYPES_LIST[ciclo(dia, n)].id;
  // Cada ciclo cuenta sus propias ocasiones. Si los dos usaran el número de día, con tres
  // figuras propias una caería siempre en los días del ciclo general y no saldría nunca, y el
  // general solo recorrería seis de los 18.
  const tercio = Math.floor(dia / 3);
  if (ciclo(dia, 3) === 0) return ARCHETYPES_LIST[ciclo(tercio, n)].id;
  return propias[ciclo(dia - tercio - 1, propias.length)];
}

/** De dónde sale la carta de hoy respecto a tu mapa, si sale de él. */
export function relacionConTuMapa(id: ArchetypeId, result: AssessmentResult | null): 'cabeza' | 'crecer' | null {
  if (!result) return null;
  if (leadingArchetypes(result).includes(id)) return 'cabeza';
  if (growthArchetypes(result).includes(id)) return 'crecer';
  return null;
}

/**
 * Con qué figuras arrancan Sinergias y el Comparador: las de cabeza y, detrás, las siguientes
 * del ranking. Sin resultado, las de siempre.
 */
export function initialArchetypes(result: AssessmentResult | null, count: number): ArchetypeId[] {
  const deSiempre: ArchetypeId[] = ['rey', 'guerrero', 'mago'];
  if (!result) return deSiempre.slice(0, count);
  const orden = [...leadingArchetypes(result)];
  for (const s of result.ranking) if (!orden.includes(s.archetypeId)) orden.push(s.archetypeId);
  return orden.slice(0, count);
}

/**
 * Las preguntas que se sugieren en el chat general, escritas a partir del mapa: la figura que
 * lo encabeza, la que menos apareció, o que no tenga un polo claro. Sin resultado, null (se
 * usan las genéricas).
 */
export function suggestedPrompts(result: AssessmentResult | null, gender: GenderMode): string[] | null {
  if (!result) return null;
  const nombre = (id: ArchetypeId) => getArchetype(id, gender).name;
  const cabeza = leadingArchetypes(result);
  const crecer = growthArchetypes(result)[0];
  const hacerSitio = crecer
    ? `¿Cómo puedo darle más espacio ${withA(nombre(crecer))} en mi día a día?`
    : '¿Qué parte de mí he dejado más de lado últimamente?';

  if (cabeza.length === 0) {
    return [
      'Mi mapa no tiene un polo claro: ¿qué puede significar eso?',
      '¿Cómo puedo descubrir qué me mueve más en este momento de mi vida?',
      hacerSitio,
      '¿Qué sombra podría estar jugándome en contra ahora mismo?',
    ];
  }

  if (result.compositeProfile.isTie) {
    const juntas = cabeza.length > 3 ? 'Varias figuras' : conMayuscula(listNames(cabeza.map(id => enFrase(nombre(id)))));
    return [
      `${juntas} salieron a la par en mi mapa: ¿cómo conviven en mí?`,
      '¿Qué sombra puede asomar cuando todas tiran a la vez?',
      hacerSitio,
      '¿Qué práctica me ayudaría a elegir cuál toma la palabra en cada momento?',
    ];
  }

  const lider = nombre(cabeza[0]);
  const segunda = cabeza[1];
  return [
    segunda
      ? `¿Cómo se llevan en mí ${enFrase(lider)} y ${enFrase(nombre(segunda))}, y cuál suele decidir?`
      : `¿Dónde se nota más ${enFrase(lider)} en mi vida ahora mismo?`,
    `¿Qué sombra ${withDe(lider)} podría estar jugándome en contra?`,
    hacerSitio,
    `¿Qué práctica sencilla me ayudaría a sostener lo mejor ${withDe(lider)} esta semana?`,
  ];
}
