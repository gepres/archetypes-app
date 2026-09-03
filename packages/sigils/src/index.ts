/**
 * Sigilos de los arquetipos.
 *
 * Geometria pura: cada funcion devuelve cadenas de trazado SVG sobre un lienzo
 * de cien por cien. No dibuja nada por si misma y no depende de ninguna
 * plataforma, asi que la misma definicion la pinta Skia en el movil, un SVG en
 * la web y el compositor del video promocional. Un solo sitio donde cambiar la
 * forma de un sigilo.
 *
 * El estilo es geometria sagrada, no ilustracion literal. Dibujar una corona o
 * una espada reconocibles en vector simple sale mal y envejece peor; una
 * familia de sigilos construidos con las mismas reglas y parametros distintos
 * se lee como un sistema, que es lo que un mapa de arquetipos deberia parecer.
 */

/**
 * Los mismos identificadores que el dominio, escritos otra vez a proposito: este
 * paquete no importa del nucleo, es geometria y nada mas. El precio es que esta
 * lista hay que mantenerla a la par; si se queda corta, el arquetipo que falte no
 * compila al pedir su sigilo, que es el fallo ruidoso que se quiere.
 */
export type SigilArchetypeId =
  | 'rey' | 'guerrero' | 'mago' | 'sabio' | 'sacerdote' | 'amante'
  | 'padre' | 'cuidador' | 'bufon' | 'explorador' | 'creador' | 'heroe'
  | 'rebelde' | 'sanador' | 'constructor' | 'soberano' | 'mistico' | 'integrador';

export type SigilDimensionId = 'mente' | 'accion' | 'corazon' | 'construccion';

/** Las capas de un sigilo, en el orden en que deben trazarse. */
export interface SigilPaths {
  /** Anillo exterior: el limite. Se traza primero, siempre. */
  ring: string;
  /** Poligono regular: la estructura. */
  frame: string;
  /** Estrella interior: el caracter propio del arquetipo. */
  star: string;
  /** Glifo del centro: la dimension a la que pertenece. */
  core: string;
  /** Marcas en el borde: los rayos. */
  rays: string;
}

interface SigilRecipe {
  /** Puntas del poligono y de la estrella. */
  points: number;
  /** Salto de la estrella: 2 la hace abierta, 3 o mas la cierran sobre si. */
  skip: number;
  /** Giro inicial en grados, para que ninguno se lea igual que su vecino. */
  rotation: number;
  /** Cuantos rayos rompen el anillo exterior. */
  rays: number;
}

/**
 * La receta de cada arquetipo.
 *
 * Los numeros no son arbitrarios: el rey lleva doce puntas porque gobierna el
 * ciclo entero, el guerrero cuatro porque su virtud es la direccion, el mago
 * siete por la tradicion del heptagrama, y el amante seis porque el hexagrama
 * son dos triangulos que se penetran.
 *
 * Aqui NO se guarda la dimension del arquetipo, aunque el glifo central dependa
 * de ella. Estuvo un rato y ya habia divergido del dominio en dos de ellos:
 * el creador salia con el glifo de mente siendo de construccion, y el rebelde
 * al reves. Un dato copiado es un dato que se desincroniza, asi que la
 * dimension se pide como argumento y su unica fuente sigue siendo el dominio.
 */
const RECIPES: Record<SigilArchetypeId, SigilRecipe> = {
  rey:        { points: 12, skip: 5, rotation: 0,   rays: 12 },
  guerrero:   { points: 4,  skip: 1, rotation: 45,  rays: 8  },
  mago:       { points: 7,  skip: 3, rotation: 12,  rays: 7  },
  amante:     { points: 6,  skip: 2, rotation: 0,   rays: 6  },
  padre:      { points: 3,  skip: 1, rotation: 0,   rays: 6  },
  cuidador:   { points: 8,  skip: 2, rotation: 22,  rays: 8  },
  bufon:      { points: 5,  skip: 2, rotation: 18,  rays: 10 },
  explorador: { points: 8,  skip: 3, rotation: 0,   rays: 4  },
  creador:    { points: 9,  skip: 4, rotation: 20,  rays: 9  },
  sabio:      { points: 10, skip: 3, rotation: 18,  rays: 5  },
  heroe:      { points: 5,  skip: 2, rotation: 0,   rays: 5  },
  rebelde:    { points: 11, skip: 4, rotation: 16,  rays: 3  },

  // Los seis que llegaron con la ampliacion. Mismas reglas, misma familia.
  // Siete como el mago, pero el trazo mas abierto: el sacerdote no transforma la
  // materia, la consagra.
  sacerdote:  { points: 7,  skip: 2, rotation: 25,  rays: 14 },
  // Seis puntas cerradas sobre si mismas: el trazo que vuelve a unir lo partido.
  sanador:    { points: 6,  skip: 1, rotation: 30,  rays: 12 },
  // El octogono sin estrella: la planta de la torre antes de levantarla.
  constructor:{ points: 8,  skip: 1, rotation: 0,   rays: 4  },
  // Nueve puntas y solo tres rayos: mucha estructura hacia dentro, poca hacia
  // fuera. Es la diferencia con el rey, que gobierna el ciclo entero.
  soberano:   { points: 9,  skip: 2, rotation: 40,  rays: 3  },
  // Trece, el numero que sobra de la cuenta, y un solo rayo: la grieta por donde
  // entra lo que no se explica.
  mistico:    { points: 13, skip: 5, rotation: 27,  rays: 1  },
  // El mayor numero de puntas de la familia: no elige una direccion, las
  // sostiene todas a la vez.
  integrador: { points: 16, skip: 7, rotation: 11,  rays: 8  },
};

const CENTER = 50;
const R_RING = 46;
const R_FRAME = 34;
const R_STAR = 30;
const R_RAY_IN = 40;
const R_RAY_OUT = 46;

/**
 * Construye las capas del sigilo de un arquetipo.
 *
 * La dimension se pasa desde el dominio en vez de mirarse en una tabla local,
 * para que el glifo central no pueda contradecir a los datos.
 */
export function sigilFor(id: SigilArchetypeId, dimension: SigilDimensionId): SigilPaths {
  const recipe = RECIPES[id];
  return {
    ring: circlePath(CENTER, CENTER, R_RING),
    frame: polygonPath(recipe.points, R_FRAME, recipe.rotation),
    star: starPath(recipe.points, recipe.skip, R_STAR, recipe.rotation),
    core: corePath(dimension),
    rays: raysPath(recipe.rays, recipe.rotation),
  };
}

/** Las capas en el orden de trazado, para animarlas en cascada. */
export function sigilLayers(
  id: SigilArchetypeId,
  dimension: SigilDimensionId
): { key: keyof SigilPaths; d: string }[] {
  const paths = sigilFor(id, dimension);
  return [
    { key: 'ring', d: paths.ring },
    { key: 'frame', d: paths.frame },
    { key: 'star', d: paths.star },
    { key: 'rays', d: paths.rays },
    { key: 'core', d: paths.core },
  ];
}

export const SIGIL_VIEWBOX = '0 0 100 100';
export const SIGIL_SIZE = 100;

/**
 * El glifo central, uno por dimension.
 *
 * Mente es un ojo, accion una flecha, corazon dos arcos que se encuentran y
 * construccion un cuadrado apoyado. Cuatro arquetipos comparten glifo porque
 * comparten dimension, y eso es intencionado: al verlos juntos se agrupan solos.
 */
function corePath(dimension: SigilDimensionId): string {
  switch (dimension) {
    case 'mente':
      return `M ${CENTER - 12} ${CENTER} Q ${CENTER} ${CENTER - 10} ${CENTER + 12} ${CENTER}` +
             ` Q ${CENTER} ${CENTER + 10} ${CENTER - 12} ${CENTER} Z` +
             ` M ${CENTER - 4} ${CENTER} A 4 4 0 1 0 ${CENTER + 4} ${CENTER}` +
             ` A 4 4 0 1 0 ${CENTER - 4} ${CENTER} Z`;
    case 'accion':
      return `M ${CENTER} ${CENTER + 11} L ${CENTER} ${CENTER - 11}` +
             ` M ${CENTER - 6} ${CENTER - 5} L ${CENTER} ${CENTER - 11} L ${CENTER + 6} ${CENTER - 5}`;
    case 'corazon':
      return `M ${CENTER} ${CENTER + 9} C ${CENTER - 14} ${CENTER - 2} ${CENTER - 6} ${CENTER - 12} ${CENTER} ${CENTER - 4}` +
             ` C ${CENTER + 6} ${CENTER - 12} ${CENTER + 14} ${CENTER - 2} ${CENTER} ${CENTER + 9} Z`;
    case 'construccion':
      return `M ${CENTER - 9} ${CENTER - 9} H ${CENTER + 9} V ${CENTER + 9} H ${CENTER - 9} Z` +
             ` M ${CENTER - 9} ${CENTER - 9} L ${CENTER + 9} ${CENTER + 9}`;
  }
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
}

function polygonPath(points: number, radius: number, rotation: number): string {
  const vertices = ringPoints(points, radius, rotation);
  return closedPolyline(vertices);
}

/**
 * Estrella trazada de un tirón.
 *
 * Se une cada vertice con el que esta a `skip` posiciones. Cuando el salto y el
 * numero de puntas comparten divisor, el recorrido se cierra antes de pasar por
 * todos, asi que hay que arrancar de nuevo desde el primer vertice sin visitar:
 * de ahi salen las estrellas compuestas, como el hexagrama, que son dos
 * triangulos y no un trazo unico.
 */
function starPath(points: number, skip: number, radius: number, rotation: number): string {
  // Con pocos vertices o salto uno no existe estrella: unir cada punto con el
  // siguiente devuelve el poligono otra vez, y al lado de un heptagrama se ve
  // vacio. En su lugar se superpone una segunda copia girada media division,
  // que es como se construyen el hexagrama y el octograma de toda la vida: dos
  // triangulos, dos cuadrados. Asi el guerrero conserva su cuatro y el padre su
  // tres, que es lo que significan, sin quedarse en un poligono liso.
  if (points < 5 || skip < 2) {
    const half = 180 / points;
    return `${polygonPath(points, radius, rotation)} ${polygonPath(points, radius, rotation + half)}`;
  }

  const vertices = ringPoints(points, radius, rotation);
  const visited = new Array<boolean>(points).fill(false);
  const strokes: string[] = [];

  for (let start = 0; start < points; start++) {
    if (visited[start]) continue;

    const cycle: [number, number][] = [];
    let index = start;
    do {
      visited[index] = true;
      cycle.push(vertices[index]!);
      index = (index + skip) % points;
    } while (index !== start);

    if (cycle.length > 2) strokes.push(closedPolyline(cycle));
  }

  return strokes.join(' ');
}

function raysPath(count: number, rotation: number): string {
  const inner = ringPoints(count, R_RAY_IN, rotation);
  const outer = ringPoints(count, R_RAY_OUT, rotation);
  return inner
    .map((from, i) => `M ${round(from[0])} ${round(from[1])} L ${round(outer[i]![0])} ${round(outer[i]![1])}`)
    .join(' ');
}

/** Puntos repartidos en un circulo, empezando arriba. */
function ringPoints(count: number, radius: number, rotationDeg: number): [number, number][] {
  const offset = (rotationDeg * Math.PI) / 180 - Math.PI / 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = offset + (i * 2 * Math.PI) / count;
    return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)] as [number, number];
  });
}

function closedPolyline(points: [number, number][]): string {
  const [first, ...rest] = points;
  if (!first) return '';
  const head = `M ${round(first[0])} ${round(first[1])}`;
  const tail = rest.map(p => `L ${round(p[0])} ${round(p[1])}`).join(' ');
  return `${head} ${tail} Z`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
