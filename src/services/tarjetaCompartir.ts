/**
 * Qué cuenta la imagen que se comparte: la pareja que encabeza el mapa, con una frase propia
 * («Una parte de mí quiere…; otra, …»), y no un dominante con un recuadro de texto. Sin
 * inventar un dominante cuando no lo hay: a la par, lo dice; sin polo claro, también.
 *
 * Puro: lo usan la V1 (el modal de compartir) y la V2 (la revelación), cada una en su
 * perspectiva.
 */
import { getArchetype } from '../data/archetypesData';
import { ARCHETYPE_DRIVES_YO } from '../data/archetypePairs';
import { ArchetypeId, AssessmentResult, GenderMode } from '../types';
import { getMapLead, listNames } from './scoringEngine';

export interface ContenidoTarjeta {
  /** Encima del título: qué se está mirando. */
  etiqueta: string;
  /** Los nombres de quienes encabezan, o «Sin un polo claro». */
  titulo: string;
  /** Los retratos que se enseñan (ninguno si el mapa no tiene un polo claro). */
  figuras: ArchetypeId[];
  /** La frase propia, en primera persona. */
  frase: string;
  /** La pregunta que abre la tensión de la pareja, si hay pareja. */
  pregunta?: string;
  /** El mantra, cuando una sola figura encabeza. */
  mantra?: string;
  /** El texto que acompaña a la imagen al compartirla (sin el enlace, que pone cada app). */
  texto: string;
}

/** «El Creador y el Rebelde»; en la perspectiva universal, sin artículos: «Creador / Creadora y Rebelde». */
function nombresJuntos(ids: ArchetypeId[], gender: GenderMode): string {
  const nombres = ids.map(id => getArchetype(id, gender).name);
  if (gender === 'universal') return listNames(nombres);
  return listNames(nombres.map((n, i) => (i === 0 ? n : n.replace(/^El /, 'el ').replace(/^La /, 'la '))));
}

// En primera persona: la frase es de quien comparte («una parte de mí quiere…»).
const quiere = (id: ArchetypeId) => ARCHETYPE_DRIVES_YO[id];

/**
 * «Una parte de mí quiere A; otra, B; y otra, C.» Lo que quiere cada arquetipo ya lleva «y» y
 * comas por dentro («conectar, disfrutar y sentir de verdad»): unirlas con comas daría una
 * ristra ambigua. Por eso cada parte va en su tramo.
 */
function partes(ids: ArchetypeId[]): string {
  const [a, ...resto] = ids.map(quiere);
  const tramos = resto.map((d, i) => (i === resto.length - 1 && resto.length > 1 ? `y otra, ${d}` : `otra, ${d}`));
  return [`Una parte de mí quiere ${a}`, ...tramos].join('; ') + '.';
}

export function contenidoParaCompartir(result: AssessmentResult, gender: GenderMode): ContenidoTarjeta {
  const lead = getMapLead(result, gender);
  const p = result.compositeProfile;

  if (lead.kind === 'flat') {
    const frase = 'Ninguna parte de mí manda sobre las demás: todas tienen voz.';
    return {
      etiqueta: 'Mi mapa',
      titulo: 'Sin un polo claro',
      figuras: [],
      frase,
      texto: `Hice el test de arquetipos y mi mapa no tiene un polo claro. ${frase}`,
    };
  }

  if (lead.kind === 'tie') {
    const muchas = lead.ids.length > 3;
    const frase = muchas
      ? 'Varias partes de mí tiran a la vez, sin que ninguna mande.'
      : `A la vez, ${partes(lead.ids).replace(/^Una/, 'una')}`;
    return {
      etiqueta: 'A la par en mi mapa',
      titulo: muchas ? lead.label : nombresJuntos(lead.ids, gender),
      figuras: lead.ids.slice(0, 3),
      frase,
      texto: `${muchas ? lead.label : `${nombresJuntos(lead.ids, gender)} van a la par en mi mapa`}. ${frase}`,
    };
  }

  const lider = result.dominantArchetype.archetypeId;
  const detras = p.companions ?? (p.pair ? p.pair.filter(id => id !== lider) : []);

  if (detras.length === 0) {
    const frase = `Lo que más me mueve: ${quiere(lider)}.`;
    return {
      etiqueta: 'Lo que encabeza mi mapa',
      titulo: getArchetype(lider, gender).name,
      figuras: [lider],
      frase,
      mantra: getArchetype(lider, gender).mantra,
      texto: `${getArchetype(lider, gender).name} encabeza mi mapa. ${frase}`,
    };
  }

  const frase = partes([lider, ...detras]);
  return {
    etiqueta: detras.length === 1 ? 'La pareja que encabeza mi mapa' : 'Lo que encabeza mi mapa',
    titulo: nombresJuntos([lider, ...detras], gender),
    figuras: [lider, ...detras],
    frase,
    pregunta: detras.length === 1 ? p.tension : undefined,
    texto: frase,
  };
}
