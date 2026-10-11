/**
 * La postal que se comparte, a medidas de verdad de las redes (1080×1920 para historias, 1080×1080
 * para el cuadrado) y no lo que mida una tarjeta en pantalla.
 *
 * Este módulo solo decide dónde va cada cosa; lo pinta `pintarPostal`. Es puro: mide el texto con la
 * función que le pasen (la del canvas en el navegador, una aproximada en las pruebas), así que lo
 * que se mide es lo que luego se dibuja, con la fuente que de verdad haya cargado.
 *
 * Nada se monta por construcción: los bloques se apilan uno debajo de otro con su alto medido. Si no
 * caben, se encoge el texto, luego la rueda, y por último se quitan los adornos (el gancho final con
 * la leyenda y, en el peor caso, la pregunta). Las cartas van dentro del anillo de la rueda: tampoco
 * tapan los rayos.
 */
import { DIMENSIONS, getArchetype, getDimensionShortName } from '../data/archetypesData';
import { ArchetypeId, AssessmentResult, DimensionId, GenderMode } from '../types';
import { getMapLead } from './scoringEngine';
import { ContenidoTarjeta, contenidoParaCompartir } from './tarjetaCompartir';

export type FormatoPostal = 'story' | 'square';

export const MEDIDAS_POSTAL: Record<FormatoPostal, { ancho: number; alto: number }> = {
  story: { ancho: 1080, alto: 1920 },
  square: { ancho: 1080, alto: 1080 },
};

export interface FuentePostal {
  familia: 'serif' | 'sans';
  peso: number;
  tamano: number;
  cursiva?: boolean;
  /** Espacio extra entre letras, en px (las versalitas). */
  espaciado?: number;
}

/** Cuánto mide de ancho un texto en una fuente. */
export type Medir = (texto: string, fuente: FuentePostal) => number;

export type Tono = 'claro' | 'crema' | 'acento' | 'suave' | 'tenue';

export interface Caja {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export interface BloqueTexto {
  tipo: 'texto';
  clave: 'ceja' | 'alias' | 'leyenda' | 'etiqueta' | 'titulo' | 'frase' | 'pregunta' | 'gancho' | 'sitio';
  lineas: string[];
  fuente: FuentePostal;
  /** Alto de cada línea, en px. */
  altoLinea: number;
  tono: Tono;
  /** Centrado en la caja. En el sitio, la caja es la píldora que lo rodea. */
  caja: Caja;
}

export interface FilaBarra {
  etiqueta: string;
  /** 0–100. */
  valor: number;
  /** Un color, o 'acento' para el del tema. */
  color: string;
}

export interface BloqueBarras {
  tipo: 'barras';
  clave: 'dimensiones' | 'top3';
  filas: FilaBarra[];
  fuente: FuentePostal;
  altoFila: number;
  relleno: number;
  caja: Caja;
}

export type BloquePostal = BloqueTexto | BloqueBarras;

export interface CartaPostal {
  id: ArchetypeId;
  /** Centro de la carta. */
  cx: number;
  cy: number;
  ancho: number;
  alto: number;
  /** Giro en radianes. */
  giro: number;
  /** El nombre al pie, como una carta de tarot. Solo con una carta: con varias, las de detrás lo
   * tendrían tapado, y el título ya los nombra a todos. */
  rotulo: { lineas: string[]; fuente: FuentePostal; altoLinea: number } | null;
}

export interface RayoHuella {
  id: ArchetypeId;
  angulo: number;
  /** 0–1: cuánto sale el rayo. */
  valor: number;
  color: string;
  destacado: boolean;
}

/** El arco de una dimensión, por fuera de sus rayos. */
export interface ArcoHuella {
  desde: number;
  hasta: number;
  color: string;
}

/**
 * La rueda: un rayo por arquetipo en el anillo, largo según su puntuación, agrupados por dimensión
 * con su arco por fuera. Como una carta astral: la forma es propia de cada mapa, y las cartas van
 * dentro del círculo, así que nada tapa los rayos.
 */
export interface HuellaPostal {
  cx: number;
  cy: number;
  radioInterior: number;
  radioExterior: number;
  radioArco: number;
  grosor: number;
  rayos: RayoHuella[];
  arcos: ArcoHuella[];
}

export interface Postal {
  formato: FormatoPostal;
  ancho: number;
  alto: number;
  /** Donde va todo lo que se lee (las redes tapan arriba y abajo en las historias). */
  zonaSegura: Caja;
  /** Lo que ocupan la huella y las cartas. */
  heroe: Caja;
  huella: HuellaPostal;
  /** En orden de pintado: de atrás adelante. */
  cartas: CartaPostal[];
  bloques: BloquePostal[];
  /** Si todo cupo sin pasarse. Las pruebas exigen que sí con cualquier mapa. */
  cabe: boolean;
}

export interface DatosPostal {
  formato: FormatoPostal;
  contenido: ContenidoTarjeta;
  /** El nombre de cada figura que se enseña, en la perspectiva elegida. */
  nombres: Partial<Record<ArchetypeId, string>>;
  /** 0–100 por arquetipo. */
  puntuaciones: Partial<Record<ArchetypeId, number>>;
  alias?: string;
  dimensiones?: FilaBarra[] | null;
  top3?: FilaBarra[] | null;
  sitio?: string;
}

export const CEJA_POSTAL = 'Mi mapa de arquetipos';
export const GANCHO_POSTAL = '¿Y a ti, qué parte te mueve?';
export const SITIO_POSTAL = 'archetypes-mystical.web.app';

/** Los retratos miden 320×380: la carta tiene la misma proporción, para que no queden franjas. */
const PROPORCION_CARTA = 380 / 320;

interface Params {
  margen: number;
  arriba: number;
  abajo: number;
  /** Radio de la rueda. */
  rueda: number;
  grosor: number;
  /** Tamaño de la leyenda bajo la rueda (0: sin leyenda). */
  leyenda: number;
  ceja: number;
  alias: number;
  etiqueta: number;
  titulo: [number, number];
  frase: [number, number];
  pregunta: [number, number];
  gancho: number;
  sitio: number;
  barras: number;
  rotulo: [number, number];
  hueco: { cabecera: number; heroe: number; entre: number; pie: number };
  lineas: { titulo: number; frase: number; pregunta: number };
}

const PARAMS: Record<FormatoPostal, Params> = {
  story: {
    margen: 100,
    // Instagram tapa unos 200 px arriba (el perfil) y otros tantos abajo (la respuesta).
    arriba: 210,
    abajo: 1700,
    rueda: 340,
    grosor: 7,
    leyenda: 24,
    ceja: 26,
    alias: 32,
    etiqueta: 24,
    titulo: [78, 54],
    frase: [46, 34],
    pregunta: [32, 26],
    gancho: 40,
    sitio: 26,
    barras: 26,
    rotulo: [26, 16],
    hueco: { cabecera: 56, heroe: 44, entre: 26, pie: 40 },
    lineas: { titulo: 2, frase: 6, pregunta: 3 },
  },
  square: {
    margen: 80,
    arriba: 60,
    abajo: 1020,
    rueda: 188,
    grosor: 5,
    leyenda: 0,
    ceja: 20,
    alias: 24,
    etiqueta: 18,
    titulo: [56, 38],
    frase: [34, 26],
    pregunta: [25, 20],
    gancho: 28,
    sitio: 20,
    barras: 20,
    rotulo: [18, 11],
    hueco: { cabecera: 30, heroe: 26, entre: 14, pie: 24 },
    lineas: { titulo: 2, frase: 4, pregunta: 2 },
  },
};

/** De más holgado a más apretado: el primero que cabe es el que se pinta. */
const INTENTOS = [
  { texto: 1, cartas: 1, gancho: true, pregunta: true },
  { texto: 0.92, cartas: 1, gancho: true, pregunta: true },
  { texto: 0.86, cartas: 0.9, gancho: true, pregunta: true },
  { texto: 0.86, cartas: 0.9, gancho: false, pregunta: true },
  { texto: 0.8, cartas: 0.82, gancho: false, pregunta: true },
  { texto: 0.74, cartas: 0.76, gancho: false, pregunta: true },
  { texto: 0.74, cartas: 0.76, gancho: false, pregunta: false },
  { texto: 0.66, cartas: 0.68, gancho: false, pregunta: false },
];

type Intento = (typeof INTENTOS)[number];

// ─── Texto ────────────────────────────────────────────────────────────────────────────────────

/** Una palabra más ancha que la línea se parte por letras (un alias sin espacios, por ejemplo). */
function partirPalabra(palabra: string, fuente: FuentePostal, ancho: number, medir: Medir): string[] {
  const trozos: string[] = [];
  let actual = '';
  for (const letra of [...palabra]) {
    if (actual && medir(actual + letra, fuente) > ancho) {
      trozos.push(actual);
      actual = letra;
    } else actual += letra;
  }
  if (actual) trozos.push(actual);
  return trozos;
}

export function partirEnLineas(texto: string, fuente: FuentePostal, ancho: number, medir: Medir): string[] {
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of texto.split(/\s+/).filter(Boolean)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (!actual || medir(prueba, fuente) <= ancho) actual = prueba;
    else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.flatMap(l => (medir(l, fuente) <= ancho ? [l] : partirPalabra(l, fuente, ancho, medir)));
}

/** Las mismas líneas, pero repartidas a lo parejo: sin una última línea con una sola palabra. */
function equilibrar(texto: string, fuente: FuentePostal, ancho: number, medir: Medir): string[] {
  const base = partirEnLineas(texto, fuente, ancho, medir);
  if (base.length < 2) return base;
  let bajo = ancho / 2;
  let alto = ancho;
  for (let i = 0; i < 14; i++) {
    const medio = (bajo + alto) / 2;
    if (partirEnLineas(texto, fuente, medio, medir).length <= base.length) alto = medio;
    else bajo = medio;
  }
  return partirEnLineas(texto, fuente, alto, medir);
}

/** El tamaño más grande (de `max` a `min`) con el que el texto cabe en `maxLineas`. */
function ajustar(
  texto: string,
  fuente: Omit<FuentePostal, 'tamano'>,
  [max, min]: [number, number],
  maxLineas: number,
  ancho: number,
  medir: Medir
): { lineas: string[]; fuente: FuentePostal } {
  const paso = Math.max(1, Math.round(max / 40));
  for (let t = Math.round(max); t >= min; t -= paso) {
    const f = { ...fuente, tamano: t, espaciado: fuente.espaciado ? (fuente.espaciado * t) / max : undefined };
    if (partirEnLineas(texto, f, ancho, medir).length <= maxLineas) return { lineas: equilibrar(texto, f, ancho, medir), fuente: f };
  }
  const f = { ...fuente, tamano: Math.round(min), espaciado: fuente.espaciado ? (fuente.espaciado * min) / max : undefined };
  return { lineas: equilibrar(texto, f, ancho, medir), fuente: f };
}

function bloqueTexto(
  clave: BloqueTexto['clave'],
  ajuste: { lineas: string[]; fuente: FuentePostal },
  interlinea: number,
  tono: Tono,
  y: number,
  centro: number,
  medir: Medir
): BloqueTexto {
  const altoLinea = Math.round(ajuste.fuente.tamano * interlinea);
  const ancho = Math.max(0, ...ajuste.lineas.map(l => medir(l, ajuste.fuente)));
  return {
    tipo: 'texto',
    clave,
    lineas: ajuste.lineas,
    fuente: ajuste.fuente,
    altoLinea,
    tono,
    caja: { x: centro - ancho / 2, y, ancho, alto: altoLinea * ajuste.lineas.length },
  };
}

// ─── Composición ──────────────────────────────────────────────────────────────────────────────

export const LEYENDA_POSTAL = 'Cada rayo es uno de los 18 arquetipos';

/** Los 18 en círculo, agrupados por dimensión, con un hueco entre grupos. Empieza arriba. */
function rueda(puntuaciones: Partial<Record<ArchetypeId, number>>, destacados: ArchetypeId[]): { rayos: RayoHuella[]; arcos: ArcoHuella[] } {
  const grupos = (['mente', 'accion', 'corazon', 'construccion'] as DimensionId[]).map(d => DIMENSIONS[d]);
  const total = grupos.reduce((n, g) => n + g.archetypes.length, 0) + grupos.length;
  const paso = (2 * Math.PI) / total;
  const angulo = (ranura: number) => -Math.PI / 2 + (ranura + 0.5) * paso;
  const rayos: RayoHuella[] = [];
  const arcos: ArcoHuella[] = [];
  let ranura = 0;
  for (const g of grupos) {
    const primera = ranura;
    for (const id of g.archetypes as ArchetypeId[]) {
      const p = puntuaciones[id] ?? 0;
      rayos.push({ id, angulo: angulo(ranura), valor: Math.min(1, Math.max(0, p / 100)), color: g.color, destacado: destacados.includes(id) });
      ranura++;
    }
    arcos.push({ desde: angulo(primera) - paso * 0.35, hasta: angulo(ranura - 1) + paso * 0.35, color: g.color });
    ranura++;
  }
  return { rayos, arcos };
}

/** Medio ancho y medio alto de un rectángulo girado. */
function semiCaja(ancho: number, alto: number, giro: number) {
  const c = Math.abs(Math.cos(giro));
  const s = Math.abs(Math.sin(giro));
  return { x: (ancho * c + alto * s) / 2, y: (ancho * s + alto * c) / 2 };
}

/** La caja que ocupa una carta girada. */
export function cajaDeCarta(c: CartaPostal): Caja {
  const m = semiCaja(c.ancho, c.alto, c.giro);
  return { x: c.cx - m.x, y: c.cy - m.y, ancho: 2 * m.x, alto: 2 * m.y };
}

function componer(datos: DatosPostal, medir: Medir, intento: Intento): Postal {
  const p = PARAMS[datos.formato];
  const { ancho: W, alto: H } = MEDIDAS_POSTAL[datos.formato];
  const centro = W / 2;
  const util = W - 2 * p.margen;
  const T = intento.texto;
  const K = intento.cartas;

  // ── Cabecera, fija arriba ──
  const fijos: BloquePostal[] = [];
  let y = p.arriba;
  const ceja = bloqueTexto(
    'ceja',
    ajustar(CEJA_POSTAL.toLocaleUpperCase('es'), { familia: 'sans', peso: 700, espaciado: p.ceja * 0.3 }, [p.ceja, p.ceja * 0.75], 1, util, medir),
    1.25,
    'acento',
    y,
    centro,
    medir
  );
  fijos.push(ceja);
  y += ceja.caja.alto;
  const alias = datos.alias?.trim();
  if (alias) {
    y += Math.round(p.ceja * 0.35);
    const b = bloqueTexto('alias', ajustar(alias, { familia: 'sans', peso: 600 }, [p.alias, p.alias * 0.7], 1, util, medir), 1.25, 'crema', y, centro, medir);
    fijos.push(b);
    y += b.caja.alto;
  }
  const finCabecera = y;

  // ── Pie, fijo abajo: el sitio en una píldora y, encima, el gancho ──
  const sitio = ajustar(datos.sitio ?? SITIO_POSTAL, { familia: 'sans', peso: 600, espaciado: 1 }, [p.sitio, p.sitio * 0.75], 1, util - p.sitio * 3, medir);
  const anchoSitio = Math.max(...sitio.lineas.map(l => medir(l, sitio.fuente)));
  const rellenoV = Math.round(sitio.fuente.tamano * 0.75);
  const rellenoH = Math.round(sitio.fuente.tamano * 1.3);
  const altoLineaSitio = Math.round(sitio.fuente.tamano * 1.25);
  const altoSitio = altoLineaSitio * sitio.lineas.length + 2 * rellenoV;
  const bloqueSitio: BloqueTexto = {
    tipo: 'texto',
    clave: 'sitio',
    lineas: sitio.lineas,
    fuente: sitio.fuente,
    altoLinea: altoLineaSitio,
    tono: 'claro',
    caja: { x: centro - anchoSitio / 2 - rellenoH, y: p.abajo - altoSitio, ancho: anchoSitio + 2 * rellenoH, alto: altoSitio },
  };
  fijos.push(bloqueSitio);
  let inicioPie = bloqueSitio.caja.y;
  if (intento.gancho) {
    const g = ajustar(GANCHO_POSTAL, { familia: 'serif', peso: 400, cursiva: true }, [p.gancho, p.gancho * 0.75], 1, util, medir);
    const bloque = bloqueTexto('gancho', g, 1.25, 'crema', 0, centro, medir);
    bloque.caja.y = inicioPie - p.hueco.entre - bloque.caja.alto;
    fijos.push(bloque);
    inicioPie = bloque.caja.y;
  }

  // ── El cuerpo: héroe y textos, con y relativa; luego se centra en el hueco que queda ──
  const figuras = datos.contenido.figuras.slice(0, 3);
  const n = figuras.length;
  const radioExterior = Math.min(p.rueda * K, W / 2 - 60);
  const radioInterior = radioExterior * (n > 0 ? 0.64 : 0.3);
  const radioArco = radioExterior + Math.max(8, p.grosor * 2.2);
  // Medio lado de lo que ocupa la rueda entera, arcos incluidos.
  const semiRueda = Math.round(radioArco + p.grosor);
  const cartas: CartaPostal[] = [];

  if (n > 0) {
    // En unidades del ancho de la carta, de atrás adelante: quien encabeza va delante (y en el
    // centro si son tres).
    const g = (grados: number) => (grados * Math.PI) / 180;
    const disposicion =
      n === 1
        ? [{ id: figuras[0], x: 0, y: 0, g: 0 }]
        : n === 2
          ? [
              { id: figuras[1], x: 0.34, y: 0.04, g: g(8) },
              { id: figuras[0], x: -0.34, y: 0, g: g(-8) },
            ]
          : [
              { id: figuras[2], x: 0.56, y: 0.1, g: g(13) },
              { id: figuras[1], x: -0.56, y: 0.1, g: g(-13) },
              { id: figuras[0], x: 0, y: -0.02, g: 0 },
            ];
    // El abanico se escala para que su esquina más lejana quede dentro del anillo.
    const esquinas = disposicion.flatMap(d =>
      [
        [-0.5, -PROPORCION_CARTA / 2],
        [0.5, -PROPORCION_CARTA / 2],
        [-0.5, PROPORCION_CARTA / 2],
        [0.5, PROPORCION_CARTA / 2],
      ].map(([ex, ey]) => ({ x: d.x + ex * Math.cos(d.g) - ey * Math.sin(d.g), y: d.y + ex * Math.sin(d.g) + ey * Math.cos(d.g) }))
    );
    const medioY = (Math.min(...esquinas.map(e => e.y)) + Math.max(...esquinas.map(e => e.y))) / 2;
    const lejos = Math.max(...esquinas.map(e => Math.hypot(e.x, e.y - medioY)));
    const ancho = Math.floor((radioInterior * 0.97) / lejos);
    const alto = Math.round(ancho * PROPORCION_CARTA);
    const rotuloMax: [number, number] = [p.rotulo[0] * K, p.rotulo[1] * K];
    for (const d of disposicion) {
      let rotulo: CartaPostal['rotulo'] = null;
      if (n === 1) {
        const nombre = (datos.nombres[d.id] ?? d.id).toLocaleUpperCase('es');
        const r = ajustar(nombre, { familia: 'serif', peso: 700, espaciado: rotuloMax[0] * 0.12 }, rotuloMax, 2, ancho * 0.82, medir);
        rotulo = { lineas: r.lineas, fuente: r.fuente, altoLinea: Math.round(r.fuente.tamano * 1.15) };
      }
      cartas.push({ id: d.id, cx: centro + d.x * ancho, cy: semiRueda + (d.y - medioY) * ancho, ancho, alto, giro: d.g, rotulo });
    }
  }

  const cuerpo: BloquePostal[] = [];
  let yr = 2 * semiRueda + Math.round(p.hueco.heroe * T * 0.5);

  if (p.leyenda && intento.gancho) {
    const b = bloqueTexto(
      'leyenda',
      ajustar(LEYENDA_POSTAL, { familia: 'sans', peso: 600 }, [p.leyenda * T, p.leyenda * T * 0.8], 1, util, medir),
      1.3,
      'tenue',
      yr,
      centro,
      medir
    );
    cuerpo.push(b);
    yr += b.caja.alto;
  }
  yr += Math.round(p.hueco.heroe * T * 0.5);

  const etiqueta = bloqueTexto(
    'etiqueta',
    ajustar(datos.contenido.etiqueta.toLocaleUpperCase('es'), { familia: 'sans', peso: 700, espaciado: p.etiqueta * 0.16 }, [p.etiqueta * T, p.etiqueta * T * 0.8], 1, util, medir),
    1.3,
    'suave',
    yr,
    centro,
    medir
  );
  cuerpo.push(etiqueta);
  yr += etiqueta.caja.alto + Math.round(p.hueco.entre * T * 0.4);

  const titulo = bloqueTexto(
    'titulo',
    ajustar(datos.contenido.titulo, { familia: 'serif', peso: 700 }, [p.titulo[0] * T, p.titulo[1] * T], p.lineas.titulo, util, medir),
    1.08,
    'claro',
    yr,
    centro,
    medir
  );
  cuerpo.push(titulo);
  yr += titulo.caja.alto + Math.round(p.hueco.entre * T);

  const frase = bloqueTexto(
    'frase',
    ajustar(datos.contenido.frase, { familia: 'serif', peso: 400, cursiva: true }, [p.frase[0] * T, p.frase[1] * T], p.lineas.frase, util, medir),
    1.3,
    'crema',
    yr,
    centro,
    medir
  );
  cuerpo.push(frase);
  yr += frase.caja.alto;

  const textoPregunta = datos.contenido.pregunta ?? (datos.contenido.mantra ? `«${datos.contenido.mantra}»` : null);
  if (textoPregunta && intento.pregunta) {
    yr += Math.round(p.hueco.entre * T);
    const b = bloqueTexto(
      'pregunta',
      ajustar(textoPregunta, { familia: 'sans', peso: 600 }, [p.pregunta[0] * T, p.pregunta[1] * T], p.lineas.pregunta, util * 0.92, medir),
      1.35,
      'acento',
      yr,
      centro,
      medir
    );
    cuerpo.push(b);
    yr += b.caja.alto;
  }

  for (const [clave, filas] of [
    ['dimensiones', datos.dimensiones],
    ['top3', datos.top3],
  ] as const) {
    if (!filas || filas.length === 0) continue;
    yr += Math.round(p.hueco.entre * T);
    const fuente: FuentePostal = { familia: 'sans', peso: 600, tamano: Math.round(p.barras * T) };
    const altoFila = Math.round(fuente.tamano * 1.9);
    const relleno = Math.round(fuente.tamano * 0.8);
    const ancho = Math.min(util, Math.round(W * 0.66));
    const caja = { x: centro - ancho / 2, y: yr, ancho, alto: filas.length * altoFila + 2 * relleno };
    cuerpo.push({ tipo: 'barras', clave, filas, fuente, altoFila, relleno, caja });
    yr += caja.alto;
  }

  // ── Centrar el cuerpo en el hueco entre cabecera y pie ──
  const desde = finCabecera + p.hueco.cabecera;
  const hasta = inicioPie - p.hueco.pie;
  const libre = hasta - desde - yr;
  const desplazamiento = desde + Math.max(0, libre) / 2;
  for (const b of cuerpo) b.caja.y += desplazamiento;
  for (const c of cartas) c.cy += desplazamiento;

  const huella: HuellaPostal = {
    cx: centro,
    cy: desplazamiento + semiRueda,
    radioInterior,
    radioExterior,
    radioArco,
    grosor: Math.max(3, Math.round(p.grosor * K)),
    ...rueda(datos.puntuaciones, figuras),
  };

  const cajaHuella = { x: centro - semiRueda, y: desplazamiento, ancho: 2 * semiRueda, alto: 2 * semiRueda };
  const heroe = [cajaHuella, ...cartas.map(cajaDeCarta)].reduce((u, c) => {
    const x = Math.min(u.x, c.x);
    const y2 = Math.min(u.y, c.y);
    return { x, y: y2, ancho: Math.max(u.x + u.ancho, c.x + c.ancho) - x, alto: Math.max(u.y + u.alto, c.y + c.alto) - y2 };
  });

  return {
    formato: datos.formato,
    ancho: W,
    alto: H,
    zonaSegura: { x: p.margen, y: p.arriba, ancho: util, alto: p.abajo - p.arriba },
    heroe,
    huella,
    cartas,
    bloques: [...fijos, ...cuerpo],
    cabe: libre >= 0,
  };
}

/** Dónde va cada cosa. El primer intento que cabe; si ninguno, el más apretado (y `cabe: false`). */
export function disenarPostal(datos: DatosPostal, medir: Medir): Postal {
  let ultima: Postal | null = null;
  for (const intento of INTENTOS) {
    ultima = componer(datos, medir, intento);
    if (ultima.cabe) return ultima;
  }
  return ultima!;
}

/** Los datos de la postal de un resultado, en la perspectiva elegida. */
export function datosPostalDe(
  result: AssessmentResult,
  gender: GenderMode,
  opciones: { formato: FormatoPostal; alias?: string; conDimensiones?: boolean; conTop3?: boolean }
): DatosPostal {
  const contenido = contenidoParaCompartir(result, gender);
  const plano = getMapLead(result, gender).kind === 'flat';
  return {
    formato: opciones.formato,
    contenido,
    nombres: Object.fromEntries(contenido.figuras.map(id => [id, getArchetype(id, gender).name])) as DatosPostal['nombres'],
    puntuaciones: Object.fromEntries(result.ranking.map(s => [s.archetypeId, s.normalizedScore])) as DatosPostal['puntuaciones'],
    alias: opciones.alias,
    dimensiones: opciones.conDimensiones
      ? (['mente', 'accion', 'corazon', 'construccion'] as DimensionId[]).map(d => ({
          etiqueta: getDimensionShortName(d),
          valor: Math.round(result.dimensionScores[d] ?? 0),
          color: DIMENSIONS[d].color,
        }))
      : null,
    top3:
      opciones.conTop3 && !plano
        ? result.ranking.slice(0, 3).map((s, i) => ({
            etiqueta: `${i + 1}. ${getArchetype(s.archetypeId, gender).name}`,
            valor: Math.round(s.normalizedScore),
            color: 'acento',
          }))
        : null,
  };
}
