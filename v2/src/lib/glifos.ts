/**
 * El glifo del centro de cada sigilo.
 *
 * Sustituye al emoji, que era un dibujo de otro sistema —a color, con relleno,
 * con su propio estilo— pegado encima de una geometría de línea dorada. Nunca
 * iban a parecer la misma cosa.
 *
 * Cada glifo se dibuja con las mismas reglas que el sigilo que lo rodea: trazo
 * sin relleno, sobre el mismo lienzo de cien por cien y centrado en el medio, en
 * una caja de unas veintiocho unidades. Así el conjunto se lee como una sola
 * pieza, se traza con la misma animación y hereda el color del arquetipo.
 *
 * Cada uno sale del símbolo que el propio arquetipo declara en el dominio, no de
 * una idea suelta: el rey lleva su corona solar, el guerrero su espada, el
 * místico su espiral, el integrador su uróboros.
 */
export const GLIFOS: Record<string, string> = {
  // Corona Solar & Cetro de Orden
  rey: 'M38 60 L38 48 L44 53 L50 43 L56 53 L62 48 L62 60 Z M38 64 L62 64 M50 37 m-3.2 0 a3.2 3.2 0 1 0 6.4 0 a3.2 3.2 0 1 0 -6.4 0',

  // Espada de Discernimiento & Escudo de Límites
  guerrero: 'M50 29 L56 40 L56 52 L44 52 L44 40 Z M35 54 L65 54 M50 54 L50 64 M50 67 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',

  // Esfera Alquimica & Pentaculo de Sistemas
  mago: 'M50 50 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M50 39 L58.5 58 L41.5 46 L58.5 46 L41.5 58 Z',

  // Libro Abierto & Linterna de Diogenes
  sabio: 'M50 43 L50 63 M50 43 C45 39 39 39 35 41 L35 59 C39 57 45 57 50 63 M50 43 C55 39 61 39 65 41 L65 59 C61 57 55 57 50 63',

  // Caliz Sagrado & Velo del Misterio
  sacerdote: 'M38 38 L62 38 C62 50 57 55 50 55 C43 55 38 50 38 38 Z M50 55 L50 62 M41 65 L59 65',

  // Corazon Radiante & Flor de Loto
  amante: 'M50 64 C38 55 34 48 34 43 C34 38 38 35 42 35 C46 35 49 38 50 41 C51 38 54 35 58 35 C62 35 66 38 66 43 C66 48 62 55 50 64 Z',

  // Arbol de la Vida & Nido Protector
  padre: 'M50 66 L50 45 M50 54 L40 46 M50 54 L60 46 M50 47 L43 39 M50 47 L57 39 M50 40 L50 36 M44 68 L56 68',

  // Manos Abiertas & Brote Verde
  cuidador: 'M33 50 C35 62 41 68 50 68 C59 68 65 62 67 50 M39 54 L39 48 M45 52 L45 46 M55 52 L55 46 M61 54 L61 48 M50 60 L50 40 M50 48 C44 48 40 44 40 38 C46 38 50 42 50 48 M50 48 C56 48 60 44 60 38 C54 38 50 42 50 48',

  // Cascabeles & Espejo de la Risa
  bufon: 'M32 52 C32 36 68 36 68 52 M50 37 L50 32 M32 56 m-3.4 0 a3.4 3.4 0 1 0 6.8 0 a3.4 3.4 0 1 0 -6.8 0 M68 56 m-3.4 0 a3.4 3.4 0 1 0 6.8 0 a3.4 3.4 0 1 0 -6.8 0 M50 29 m-3.2 0 a3.2 3.2 0 1 0 6.4 0 a3.2 3.2 0 1 0 -6.4 0 M38 62 C43 68 57 68 62 62',

  // Brujula de Bronce & Baston de Peregrino
  explorador: 'M50 50 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M58 42 L46 46 L42 58 L54 54 Z M50 33 L50 30',

  // Paleta del Artista & Martillo del Escultor
  creador: 'M50 34 C60 34 66 41 66 49 C66 55 61 57 57 57 C54 57 52 59 53 62 C54 65 52 66 49 66 C39 66 34 58 34 49 C34 40 41 34 50 34 Z M43 44 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M52 41 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M59 47 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0',

  // Rayo de Fuerza & Laurel de Victoria
  heroe: 'M56 32 L42 52 L50 52 L44 68 L60 46 L51 46 Z',

  // Antorcha Encendida & Cadenas Rotas
  rebelde: 'M50 70 L50 56 M44 56 L56 56 L54 51 L46 51 Z M50 49 C42 43 45 33 50 26 C55 33 62 43 50 49 Z M50 44 C47 41 48 37 50 34 C52 37 55 41 50 44 Z',

  // Caduceo de la Salud & Manantial de Agua Pura
  sanador: 'M50 30 L50 70 M50 37 C40 42 40 49 50 53 C60 57 60 64 50 69 M50 37 C60 42 60 49 50 53 C40 57 40 64 50 69 M50 34 C46 30 41 30 38 33 C42 36 47 36 50 34 M50 34 C54 30 59 30 62 33 C58 36 53 36 50 34',

  // Escuadra & Piedra Angular
  constructor: 'M36 36 L36 64 L64 64 M36 64 L60 40 M40 60 L40 56 L44 56 L44 60 Z M52 36 L60 36 L60 44',

  // Sello Real & Trono Interior
  soberano: 'M50 50 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0 M50 50 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M50 41 L57 50 L50 59 L43 50 Z M50 32 L50 35 M50 65 L50 68 M32 50 L35 50 M65 50 L68 50',

  // Espiral Galactica & Gota en el Oceano
  mistico: 'M50 50 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0 a15 15 0 0 1 30 0',

  // Ouroboros & Mandala de la Totalidad
  integrador:
    'M63 46 A14 14 0 1 1 55 37 M55 37 L61 34 L63 41 Z M50 50 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0',
};

/** El glifo de un arquetipo, o el del integrador como red de seguridad. */
export function glifoDe(id: string): string {
  return GLIFOS[id] ?? GLIFOS.integrador;
}
