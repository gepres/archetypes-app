import type { Archetype, ArchetypeId, ArchetypeNarrativeVariant } from '../model';
import { ARCHETYPES } from './archetypes.data';

/**
 * La perspectiva desde la que se recorre el mapa.
 *
 * No es un dato demografico de la persona ni un ajuste de idioma: es la voz con
 * la que el sistema le habla. La misma figura es El Rey, La Reina o Rey / Reina
 * segun quien la mire, y de esa eleccion cuelgan el nombre, el tono de las
 * preguntas del test y la voz del oraculo.
 *
 * Vive en el dominio, y no en cada pantalla, porque es una regla del producto:
 * si el movil decidiera por su cuenta como se llama un arquetipo, acabaria
 * llamandolo distinto que la web para la misma persona.
 */
export type Perspective = 'male' | 'female' | 'universal';

/** En el orden en que se ofrecen: las dos encarnadas y luego la que las integra. */
export const PERSPECTIVES = ['male', 'female', 'universal'] as const;

/** Como se nombra cada perspectiva en la interfaz. */
export const PERSPECTIVE_LABELS: Record<Perspective, string> = {
  male: 'Masculina',
  female: 'Femenina',
  universal: 'Universal',
};

/**
 * El nombre de cada arquetipo en las tres perspectivas.
 *
 * Se deriva de los datos del arquetipo en vez de escribirse aparte. Antes era un
 * mapa a mano, y al pasar de doce a dieciocho se quedo corto sin que nada
 * fallara: la traduccion existia para doce y los seis nuevos no tenian nombre.
 * Derivandolo, un arquetipo nuevo trae su nombre en las tres perspectivas o no
 * compila.
 */
export const ARCHETYPE_NAMES: Record<ArchetypeId, Record<Perspective, string>> = Object.fromEntries(
  (Object.keys(ARCHETYPES) as ArchetypeId[]).map(id => {
    const a = ARCHETYPES[id];
    return [
      id,
      {
        male: a.masculineName,
        female: a.feminineName,
        universal: a.universalName,
      },
    ];
  })
) as Record<ArchetypeId, Record<Perspective, string>>;

/**
 * La perspectiva con la que arranca quien todavia no ha elegido.
 *
 * Universal y no masculina: es la unica de las tres que no le dice a nadie que
 * se ha equivocado de aplicacion antes de haber podido elegir.
 */
export const DEFAULT_PERSPECTIVE: Perspective = 'universal';

/** Como se llama este arquetipo para quien mira desde esta perspectiva. */
export function archetypeName(id: ArchetypeId, perspective: Perspective): string {
  return ARCHETYPE_NAMES[id][perspective];
}

/**
 * Valida lo que viene de fuera.
 *
 * Lo guardado en el dispositivo puede ser de una version anterior o estar
 * corrupto, y una perspectiva desconocida no debe dejar la interfaz sin ninguna
 * opcion marcada.
 */
export function isPerspective(value: unknown): value is Perspective {
  return value === 'male' || value === 'female' || value === 'universal';
}

/**
 * La ficha del arquetipo resuelta en una perspectiva.
 *
 * Una pantalla no deberia tener que saber que existen variantes: pide el
 * arquetipo con la perspectiva activa y recibe algo que ya se puede pintar. Si
 * falta la variante concreta se cae a la universal, y si tampoco esta, a la base:
 * un arquetipo sin traducir se ve incompleto, pero nunca vacio.
 */
export function archetypeIn(id: ArchetypeId, perspective: Perspective): Archetype {
  const base = ARCHETYPES[id];
  const clave = perspective === 'female' ? 'feminine' : perspective === 'male' ? 'masculine' : 'universal';
  const variante: ArchetypeNarrativeVariant | undefined =
    base.variants?.[clave] ?? base.variants?.universal;

  return {
    ...base,
    name: variante?.name ?? archetypeName(id, perspective),
    characterTitle: variante?.characterTitle ?? base.characterTitle,
    centralQuestion: variante?.centralQuestion ?? base.centralQuestion,
    shortDescription: variante?.shortDescription ?? base.shortDescription,
    fullDescription: variante?.fullDescription ?? base.fullDescription,
    mantra: variante?.mantra ?? base.mantra,
    strength: variante?.strength ?? base.strength,
    shadow: variante?.shadow ?? base.shadow,
    shadowDescription: variante?.shadowDescription ?? base.shadowDescription,
    shadowAntidote: variante?.shadowAntidote ?? base.shadowAntidote,
    domains: variante?.domains ?? base.domains,
    balancedBehavior: variante?.balancedBehavior ?? base.balancedBehavior,
    unbalancedBehavior: variante?.unbalancedBehavior ?? base.unbalancedBehavior,
    reflectionQuestions: variante?.reflectionQuestions ?? base.reflectionQuestions,
    developmentExercises: variante?.developmentExercises ?? base.developmentExercises,
  };
}

/** Los dieciocho, resueltos en una perspectiva. */
export function archetypeListIn(perspective: Perspective): Archetype[] {
  return (Object.keys(ARCHETYPES) as ArchetypeId[]).map(id => archetypeIn(id, perspective));
}
