import { ArchetypeId } from '../types';

/**
 * Lecturas para profundizar en cada arquetipo.
 *
 * Solo libros y artículos cuya existencia se comprobó (octubre de 2026): los libros, en el
 * catálogo de Open Library (que da un enlace estable a la obra y sus ediciones); los artículos,
 * en su propia web. Cuando hay edición en español, también comprobada, se da su título.
 *
 * Los 18 arquetipos de la app son una síntesis propia de varias tradiciones (Moore y Gillette
 * trabajan cuatro figuras; Pearson, doce; Bolen, figuras de la mitología griega): asociar un
 * libro a un arquetipo es una lectura editorial, no una atribución. La interfaz lo dice.
 */
export interface Referencia {
  titulo: string;
  /** Edición en español comprobada: título, editorial y año. */
  enEspanol?: string;
  autores: string;
  anio: number;
  tipo: 'libro' | 'articulo';
  url: string;
}

export const REFERENCIAS = {
  mooreGillette: {
    titulo: 'King, Warrior, Magician, Lover',
    enEspanol: 'La nueva masculinidad: rey, guerrero, mago y amante (Paidós, 1993)',
    autores: 'Robert Moore y Douglas Gillette',
    anio: 1990,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL2470902W',
  },
  pearsonHeroes: {
    titulo: 'Awakening the Heroes Within',
    enEspanol: 'Despertando los héroes interiores (Mirach, 1992)',
    autores: 'Carol S. Pearson',
    anio: 1991,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL1873017W',
  },
  pearsonRelato: {
    titulo: 'What Story Are You Living?',
    autores: 'Carol S. Pearson y Hugh K. Marr',
    anio: 2007,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL18594701W',
  },
  pearsonSistema: {
    titulo: 'The Pearson 12-Archetype System',
    autores: 'Carol S. Pearson',
    anio: 0,
    tipo: 'articulo',
    url: 'https://carolspearson.com/about/the-pearson-12-archetype-system-human-development-and-evolution',
  },
  jung: {
    titulo: 'The Archetypes and the Collective Unconscious',
    enEspanol: 'Arquetipos e inconsciente colectivo (Paidós)',
    autores: 'C. G. Jung',
    anio: 1959,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL261714W',
  },
  bolenDiosas: {
    titulo: 'Goddesses in Everywoman',
    enEspanol: 'Las diosas de cada mujer (Kairós)',
    autores: 'Jean Shinoda Bolen',
    anio: 1984,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL82232W',
  },
  bolenDioses: {
    titulo: 'Gods in Everyman',
    enEspanol: 'Los dioses de cada hombre (Kairós)',
    autores: 'Jean Shinoda Bolen',
    anio: 1989,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL82230W',
  },
  bolenTao: {
    titulo: 'The Tao of Psychology',
    enEspanol: 'El Tao de la psicología (Kairós)',
    autores: 'Jean Shinoda Bolen',
    anio: 1979,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL82231W',
  },
  campbell: {
    titulo: 'The Hero with a Thousand Faces',
    enEspanol: 'El héroe de las mil caras',
    autores: 'Joseph Campbell',
    anio: 1949,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL2497175W',
  },
  neff: {
    titulo: 'Self-Compassion',
    enEspanol: 'Sé amable contigo mismo (Paidós, 2016)',
    autores: 'Kristin Neff',
    anio: 2011,
    tipo: 'libro',
    url: 'https://openlibrary.org/works/OL25328122W',
  },
  neffGreaterGood: {
    titulo: 'The Power of Self-Compassion',
    autores: 'Jason Marsh, entrevista a Kristin Neff (Greater Good, UC Berkeley)',
    anio: 2012,
    tipo: 'articulo',
    url: 'https://greatergood.berkeley.edu/article/item/the_power_of_self_compassion',
  },
} satisfies Record<string, Referencia>;

export type IdReferencia = keyof typeof REFERENCIAS;

export interface Lectura {
  ref: IdReferencia;
  /** Por qué leerla para este arquetipo, en una frase. */
  porQue: string;
}

/** Dos o tres lecturas por arquetipo. */
export const LECTURAS: Record<ArchetypeId, Lectura[]> = {
  rey: [
    { ref: 'mooreGillette', porQue: 'La autoridad que ordena y da su lugar a los demás, y sus dos excesos: el tirano y el que no se atreve a decidir.' },
    { ref: 'pearsonRelato', porQue: 'Una guía práctica para reconocer el relato del que gobierna en tu propia vida.' },
  ],
  guerrero: [
    { ref: 'mooreGillette', porQue: 'La disciplina y los límites, y la diferencia entre fuerza y crueldad.' },
    { ref: 'pearsonHeroes', porQue: 'El Guerrero como una etapa del desarrollo personal, no como un carácter fijo.' },
  ],
  mago: [
    { ref: 'mooreGillette', porQue: 'El conocimiento que transforma, y el riesgo de usarlo para manipular.' },
    { ref: 'pearsonRelato', porQue: 'Cómo los patrones que repetimos se pueden ver y reescribir.' },
  ],
  sabio: [
    { ref: 'pearsonHeroes', porQue: 'El Sabio y su búsqueda de la verdad, con sus luces y sus trampas.' },
    { ref: 'jung', porQue: 'De dónde viene la idea de arquetipo, y la figura del anciano sabio.' },
  ],
  sacerdote: [
    { ref: 'jung', porQue: 'El símbolo y el ritual como formas de dar sentido a la experiencia.' },
    { ref: 'bolenTao', porQue: 'El sentido y las coincidencias significativas en la vida cotidiana.' },
  ],
  amante: [
    { ref: 'mooreGillette', porQue: 'La sensibilidad, el disfrute y la conexión, y lo que pasa cuando se desbordan o se apagan.' },
    { ref: 'bolenDiosas', porQue: 'El amor, la belleza y la creatividad, desde las figuras de la mitología griega.' },
  ],
  padre: [
    { ref: 'jung', porQue: 'El arquetipo de la madre y sus ambivalencias: lo que nutre y lo que retiene.' },
    { ref: 'bolenDioses', porQue: 'Las figuras paternas, el poder y la ternura en la vida de los hombres.' },
  ],
  cuidador: [
    { ref: 'pearsonHeroes', porQue: 'El Cuidador y cómo cuidar sin agotarse ni desaparecer.' },
    { ref: 'neff', porQue: 'Cuidar de ti mientras cuidas de otros.' },
    { ref: 'neffGreaterGood', porQue: 'Una entrada breve a la autocompasión, antes de leer el libro.' },
  ],
  bufon: [
    { ref: 'pearsonRelato', porQue: 'El Bufón en los relatos personales: el juego, el humor y la ligereza.' },
    { ref: 'jung', porQue: 'La figura del pícaro (el trickster), pariente cercano del Bufón.' },
  ],
  explorador: [
    { ref: 'pearsonHeroes', porQue: 'El Buscador: la necesidad de salir, probar y encontrar lo propio.' },
    { ref: 'bolenDiosas', porQue: 'La independencia y la exploración, desde la figura de Artemisa.' },
  ],
  creador: [
    { ref: 'pearsonHeroes', porQue: 'El Creador y el proceso de dar forma a lo que imaginas.' },
    { ref: 'bolenDioses', porQue: 'El oficio y la obra hecha con las manos, desde la figura de Hefesto.' },
  ],
  heroe: [
    { ref: 'campbell', porQue: 'El viaje del héroe: la llamada, la prueba y el regreso.' },
    { ref: 'pearsonHeroes', porQue: 'Hay muchas maneras de recorrer ese viaje, no una sola.' },
  ],
  rebelde: [
    { ref: 'pearsonHeroes', porQue: 'El que rompe lo que ya no sirve, y lo que viene después de romper.' },
    { ref: 'pearsonSistema', porQue: 'Las diferencias entre destruir, transformar y vivir al margen de las normas.' },
  ],
  sanador: [
    { ref: 'neff', porQue: 'Una relación amable con el propio dolor, base para acompañar el de otros.' },
    { ref: 'neffGreaterGood', porQue: 'Una lectura breve sobre autocompasión, para empezar.' },
  ],
  constructor: [
    { ref: 'pearsonHeroes', porQue: 'Crear y organizar: cómo una idea se vuelve algo que dura.' },
    { ref: 'pearsonRelato', porQue: 'Revisar los relatos de productividad y estructura con los que vives.' },
  ],
  soberano: [
    { ref: 'mooreGillette', porQue: 'Para contrastar con el Rey: la autoridad sobre la propia vida, más que sobre la de otros.' },
    { ref: 'jung', porQue: 'La individuación: llegar a ser quien eres.' },
  ],
  mistico: [
    { ref: 'bolenTao', porQue: 'La conexión, el sentido y la experiencia de unidad.' },
    { ref: 'jung', porQue: 'El simbolismo de las experiencias interiores y cómo integrarlas.' },
  ],
  integrador: [
    { ref: 'jung', porQue: 'La individuación como integración de partes distintas de uno mismo.' },
    { ref: 'pearsonRelato', porQue: 'Mirar los relatos que organizan tu experiencia y cómo conviven.' },
  ],
};
