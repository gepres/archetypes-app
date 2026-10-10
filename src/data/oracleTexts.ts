import { ArchetypeId } from '../types';

/**
 * La pregunta de la mañana (para orientar el día) y la de la noche (para repasarlo) de cada
 * arquetipo, en la Carta del Día. En segunda persona y sin marcas de género, para que valgan en
 * las tres perspectivas. La de la noche mira las dos caras: lo que salió y por dónde asomó la
 * sombra.
 */
export const ORACLE_TEXTS: Record<ArchetypeId, { manana: string; noche: string }> = {
  rey: {
    manana: '¿Qué decisión te toca asumir hoy, en vez de esperar a que otra persona la tome?',
    noche: '¿Dónde pusiste orden hoy, y dónde quisiste controlar más de lo que te tocaba?',
  },
  guerrero: {
    manana: '¿Qué tarea incómoda vas a hacer primero, antes de que el día te la esconda?',
    noche: '¿Qué límite sostuviste hoy, y en qué momento la dureza fue más de la cuenta, contigo o con alguien?',
  },
  mago: {
    manana: '¿Qué patrón se repite en tu vida y hoy podrías mirar con otros ojos?',
    noche: '¿Qué entendiste hoy que ayer no veías, y lo usaste para ayudar o para tener ventaja?',
  },
  sabio: {
    manana: '¿Sobre qué te conviene informarte hoy antes de dar tu opinión?',
    noche: '¿Qué aprendiste hoy, y en qué momento te refugiaste en pensar para no sentir?',
  },
  sacerdote: {
    manana: '¿Qué pequeño ritual puede darle sentido a tu día?',
    noche: '¿Qué momento de hoy merece ser recordado, y a qué le diste más importancia de la que tenía?',
  },
  amante: {
    manana: '¿Qué vas a disfrutar hoy con calma, sin prisa ni culpa?',
    noche: '¿Con quién conectaste de verdad hoy, y dónde te dejaste llevar más de la cuenta?',
  },
  padre: {
    manana: '¿A quién te toca acompañar hoy, y cómo lo harás sin decidir por esa persona?',
    noche: '¿A quién cuidaste hoy, y dónde le quitaste la ocasión de hacerlo por su cuenta?',
  },
  cuidador: {
    manana: '¿Qué necesita hoy alguien de tu entorno, y qué necesitas tú?',
    noche: '¿A quién atendiste hoy, y te atendiste también a ti?',
  },
  bufon: {
    manana: '¿Qué peso del día podrías aligerar con un poco de humor?',
    noche: '¿Qué te hizo reír hoy, y usaste la broma alguna vez para no decir algo importante?',
  },
  explorador: {
    manana: '¿Qué camino distinto podrías probar hoy, aunque sea pequeño?',
    noche: '¿Qué descubriste hoy, y de qué compromiso te escapaste con la excusa de la libertad?',
  },
  creador: {
    manana: '¿Qué vas a crear hoy, aunque no quede perfecto?',
    noche: '¿Qué tomó forma hoy gracias a ti, y qué dejaste a medias por perfeccionismo?',
  },
  heroe: {
    manana: '¿Qué reto de hoy te pide un poco más de valor del habitual?',
    noche: '¿Qué prueba superaste hoy, y cuándo luchaste una batalla que no era tuya?',
  },
  rebelde: {
    manana: '¿Qué regla de tu día ya no tiene sentido y podrías cuestionar?',
    noche: '¿Qué cambiaste hoy, y qué rompiste solo por llevar la contraria?',
  },
  sanador: {
    manana: '¿Qué herida, tuya o de otra persona, puedes acompañar hoy sin prisa por arreglarla?',
    noche: '¿A quién escuchaste hoy de verdad, y cargaste con un dolor que no era tuyo?',
  },
  constructor: {
    manana: '¿Qué ladrillo pequeño vas a poner hoy en algo que quieres que dure?',
    noche: '¿Qué avanzó hoy gracias a tu constancia, y dónde te costó soltar el plan?',
  },
  soberano: {
    manana: '¿Qué decisión sobre tu propia vida vas a tomar hoy sin pedir permiso?',
    noche: '¿Dónde decidiste por ti hoy, y dónde cediste para no incomodar a nadie?',
  },
  mistico: {
    manana: '¿Qué momento de silencio puedes regalarte hoy?',
    noche: '¿Qué sentiste hoy que va más allá de lo que se ve, y te alejaste de lo cotidiano para no enfrentarlo?',
  },
  integrador: {
    manana: '¿Qué dos partes de ti, o de tu entorno, parecen opuestas y hoy podrías acercar?',
    noche: '¿Qué uniste hoy, y qué tensión dejaste sin resolver por querer que todo encaje?',
  },
};
