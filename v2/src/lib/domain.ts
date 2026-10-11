/**
 * El unico puente entre V2 y el dominio.
 *
 * V2 no importa de `../src` en ningun otro sitio: todo pasa por aqui. Si algun dia
 * el codigo se mueve a paquetes (la reestructuracion que vive en otra rama), o el
 * nucleo compartido se pone al dia con los 18 arquetipos, solo hay que reapuntar
 * este fichero y V2 no se entera.
 *
 * Hoy apunta al codigo que esta en produccion, que es el que tiene los 18.
 */
export {
  ARCHETYPES,
  ARCHETYPES_LIST,
  DIMENSIONS,
  getArchetype,
  getArchetypeList,
  getArchetypeName,
} from '@v1/data/archetypesData';

// La lectura personal con IA: la misma que en la V1 (interpreta el mapa, no lo calcula).
export { declararASalvo, estadoLectura, lecturas, suscribirCrisis } from '@v1/services/lecturaIA';
export type { RespuestaLectura } from '@v1/services/lecturaIA';
export { admiteLectura, parrafosLectura, textoParaVoz } from '@v1/services/lecturaPersonal';
export type { ParrafoLectura } from '@v1/services/lecturaPersonal';

// El test por dilemas: las mismas situaciones, barajadas y puntuadas igual que en la V1.
export { DILEMAS, DILEMAS_RAPIDO_IDS } from '@v1/data/dilemasData';
export type { Dilema, OpcionDilema } from '@v1/data/dilemasData';
export {
  barajar,
  calcularResultadoDilemas,
  candidatosDesempate,
  dilemaDeDesempate,
  dilemasDelTest,
} from '@v1/services/dilemas';

export { calculateAssessmentResult, getMapLead, listNames } from '@v1/services/scoringEngine';

export { ArchetypeIllustratedArtwork } from '@v1/components/archetypes/ArchetypeIllustratedArtwork';

// La imagen para compartir: la misma tarjeta que en la V1, con estilos en línea para que salga
// igual aunque cada app genere sus estilos por separado.
export { contenidoParaCompartir } from '@v1/services/tarjetaCompartir';
export { datosPostalDe } from '@v1/services/disenoPostal';
export { TEMAS_POSTAL, generarPostal } from '@v1/components/result/pintarPostal';

export type {
  Archetype,
  ArchetypeId,
  ArchetypeScore,
  AssessmentResult,
  RespuestaDilema,
  DimensionId,
  GenderMode,
  Question,
} from '@v1/types';
