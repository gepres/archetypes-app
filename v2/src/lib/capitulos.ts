import type { ArchetypeId } from './domain';

/**
 * El recorrido narrado: qué es un arquetipo, de dónde viene y cómo se lee el mapa.
 *
 * El texto está escrito para ser DICHO, no leído: frases cortas, sin incisos y
 * sin paréntesis, porque la voz del sistema no sabe entonarlos. Lo que aparece
 * en pantalla es el mismo texto, para quien no puede oír o está en un sitio
 * ruidoso.
 *
 * `rostros` son los arquetipos cuya ilustración acompaña al capítulo. Se eligen
 * por lo que el capítulo cuenta, no al azar.
 */
export interface Capitulo {
  id: string;
  titulo: string;
  texto: string;
  rostros: ArchetypeId[];
  /** Color de acento del capítulo, del arquetipo o dimensión que lo ilustra. */
  color: string;
}

export const CAPITULOS: Capitulo[] = [
  {
    id: 'que-es',
    titulo: '¿Qué es un arquetipo?',
    texto:
      'Un arquetipo es un patrón. Una forma de estar en el mundo que se repite en todas las culturas y en todas las épocas. El que gobierna. El que protege. El que sana. El que se ríe de todo. No los inventó nadie: aparecen una y otra vez porque responden a situaciones que todos los humanos vivimos.',
    rostros: ['rey', 'guerrero', 'sanador', 'bufon'],
    color: '#D6A84F',
  },
  {
    id: 'no-eres-uno',
    titulo: 'No eres uno. Los llevas todos',
    texto:
      'Esto no es un test que te asigne una casilla. Los dieciocho arquetipos están en ti. Lo que cambia es cuáles tienes despiertos ahora mismo y cuáles llevas dormidos. Por eso el resultado es un mapa y no una etiqueta.',
    rostros: ['integrador', 'soberano', 'explorador'],
    color: '#86EFAC',
  },
  {
    id: 'historia',
    titulo: 'Son mucho más viejos que la psicología',
    texto:
      'Antes de que nadie los llamara arquetipos, ya estaban en los mitos, en la tragedia griega y en las cartas del tarot. Platón hablaba de formas ideales que existían antes que las cosas. Cada cultura contó las mismas figuras con otros nombres.',
    rostros: ['sacerdote', 'mistico', 'sabio'],
    color: '#3B82F6',
  },
  {
    id: 'jung',
    titulo: 'Jung les puso nombre',
    texto:
      'Hace poco más de un siglo, el psiquiatra suizo Carl Jung propuso que compartimos un fondo común de imágenes heredadas, y lo llamó inconsciente colectivo. A esas figuras que lo habitan las llamó arquetipos. Décadas después, Joseph Campbell mostró que los héroes de todos los pueblos recorren el mismo viaje. Y ya en los noventa, Moore y Gillette popularizaron cuatro de ellos: el rey, el guerrero, el mago y el amante. De ahí viene el mapa que vas a recorrer.',
    rostros: ['sabio', 'mago', 'heroe'],
    color: '#3B82F6',
  },
  {
    id: 'luz-sombra',
    titulo: 'Cada uno tiene su luz y su sombra',
    texto:
      'En equilibrio, un arquetipo aporta un don. El rey ordena. El guerrero sostiene el límite. El cuidador acompaña. Desbordado o negado, ese mismo patrón se te vuelve en contra: la autoridad se hace tiranía, el coraje se hace dureza, el cuidado se hace sacrificio. Reconocer la sombra es la mitad del trabajo.',
    rostros: ['rey', 'guerrero', 'cuidador'],
    color: '#E06B6B',
  },
  {
    id: 'dimensiones',
    titulo: 'Cuatro territorios',
    texto:
      'Los dieciocho se reparten en cuatro dimensiones. Mente, que comprende. Acción, que avanza. Corazón, que vincula. Y construcción, que sostiene y da forma. Tu resultado no es un solo nombre: es el equilibrio entre estas cuatro fuerzas.',
    rostros: ['mago', 'guerrero', 'amante', 'constructor'],
    color: '#10B981',
  },
  {
    id: 'honestidad',
    titulo: 'Y una cosa más',
    texto:
      'Esto es un mapa simbólico para pensarte, no un diagnóstico. No mide tu salud mental ni predice tu futuro. Su valor está en las preguntas que te deja, no en el nombre que te sale. Úsalo así y te servirá.',
    rostros: ['integrador'],
    color: '#8A968D',
  },
];
