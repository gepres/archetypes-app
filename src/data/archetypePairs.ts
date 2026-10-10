import { ArchetypeId, DimensionId } from '../types';

/**
 * Lo que cada arquetipo te empuja a hacer, en infinitivo y sin género: completa la frase
 * «una parte de ti quiere…». Sirve para escribir la tensión entre las dos figuras que
 * encabezan un mapa sin tener que redactar a mano cada una de las 153 parejas posibles.
 */
export const ARCHETYPE_DRIVES: Record<ArchetypeId, string> = {
  rey: 'poner orden y asumir la responsabilidad',
  guerrero: 'actuar con disciplina y sostener el límite',
  mago: 'entender el patrón oculto y transformarlo',
  sabio: 'comprender a fondo antes de actuar',
  sacerdote: 'dar sentido y ritual a lo que vives',
  amante: 'conectar, disfrutar y sentir de verdad',
  padre: 'proteger y guiar a quien depende de ti',
  cuidador: 'atender lo que otras personas necesitan',
  bufon: 'aligerar el peso con juego y humor',
  explorador: 'salir a lo desconocido',
  creador: 'imaginar y dar forma a algo nuevo',
  heroe: 'superar la prueba que tienes delante',
  rebelde: 'romper con lo que ya no funciona',
  sanador: 'acompañar lo que duele',
  constructor: 'levantar algo que dure',
  soberano: 'decidir sobre tu propia vida sin pedir permiso',
  mistico: 'buscar lo que va más allá de lo visible',
  integrador: 'unir lo que parece opuesto',
};

/**
 * La pregunta que abre la tensión entre dos dimensiones. Diez combinaciones (cuatro consigo
 * mismas y seis cruzadas) cubren cualquier pareja de arquetipos.
 */
const DIMENSION_TENSIONS: Record<string, string> = {
  'mente|mente': '¿Cuándo pasas de entender a vivir lo que entendiste?',
  'accion|accion': '¿Cuándo te detienes a elegir hacia dónde va tanto impulso?',
  'corazon|corazon': 'Cuando te vuelcas en los demás, ¿quién se ocupa de ti?',
  'construccion|construccion': '¿Qué parte de tu vida no cabe en un plan, y qué haces con ella?',
  'accion|mente': 'Una quiere entender primero y la otra moverse ya: ¿cuál decide cuando hay prisa?',
  'corazon|mente': '¿Qué haces cuando lo que piensas y lo que sientes no dicen lo mismo?',
  'construccion|mente': '¿Cuándo merece una idea convertirse en un plan, y cuándo basta con pensarla?',
  'accion|corazon': '¿Cómo sostienes el empuje sin pasar por encima de nadie, tampoco de ti?',
  'accion|construccion': '¿Cuándo toca lanzarse y cuándo toca echar cimientos?',
  'construccion|corazon': '¿Cómo cuidas a las personas sin que el orden las apriete, ni el afecto lo desordene todo?',
};

/** La pregunta de tensión para dos dimensiones, en cualquier orden. */
export function getDimensionTension(a: DimensionId, b: DimensionId): string {
  const key = [a, b].sort().join('|');
  return DIMENSION_TENSIONS[key] ?? DIMENSION_TENSIONS[`${b}|${a}`] ?? '';
}
