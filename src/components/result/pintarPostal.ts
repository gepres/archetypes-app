/**
 * Pinta la postal en un canvas propio, a su medida real, y la devuelve como PNG.
 *
 * Antes se fotografiaba una tarjeta de la pantalla con html-to-image, y fallaba en tres sitios: la
 * tarjeta medía lo que medía en la pantalla (en el móvil, el ancho del modal), la hoja de Google
 * Fonts no se deja leer desde otro origen (sin la fuente buena, el texto ocupaba otra cosa) y Safari
 * pintaba los desenfoques y las sombras como rectángulos encima de los retratos. Aquí se mide con el
 * mismo canvas que pinta, así que lo medido es lo dibujado, con la fuente que haya.
 */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import {
  BloqueBarras,
  BloqueTexto,
  CartaPostal,
  DatosPostal,
  FuentePostal,
  HuellaPostal,
  MEDIDAS_POSTAL,
  Medir,
  Postal,
  Tono,
  disenarPostal,
} from '../../services/disenoPostal';
import { ArchetypeId } from '../../types';

export interface TemaPostal {
  /** De arriba abajo. */
  fondo: [string, string, string];
  acento: string;
  /** El acento en «r, g, b», para los brillos con transparencia. */
  brillo: string;
}

export const TEMAS_POSTAL = {
  esmeralda: { fondo: ['#10221B', '#0B1712', '#050B09'], acento: '#D6A84F', brillo: '214, 168, 79' },
  obsidiana: { fondo: ['#121B33', '#0B1122', '#05070F'], acento: '#7DB7FF', brillo: '125, 183, 255' },
  carmesi: { fondo: ['#2A1019', '#1A0A10', '#0B0407'], acento: '#F2A93B', brillo: '242, 169, 59' },
} satisfies Record<string, TemaPostal>;

export type NombreTemaPostal = keyof typeof TEMAS_POSTAL;

const TONOS: Record<Exclude<Tono, 'acento'>, string> = {
  claro: '#F4EFE3',
  crema: '#E8D9B5',
  suave: '#A9B5AB',
  tenue: '#7A8880',
};

const FAMILIAS = {
  serif: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
  sans: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
};

const css = (f: FuentePostal) => `${f.cursiva ? 'italic ' : ''}${f.peso} ${Math.round(f.tamano)}px ${FAMILIAS[f.familia]}`;

const color = (tono: Tono, tema: TemaPostal) => (tono === 'acento' ? tema.acento : TONOS[tono]);

function conAlfa(hex: string, alfa: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}

/**
 * Espera a las fuentes de la postal, sin colgarse si no llegan: entonces se mide y se pinta con la
 * de reserva, que es la misma para las dos cosas, y nada se monta.
 */
async function cargarFuentes(): Promise<void> {
  if (!document.fonts?.load) return;
  const muestras = [
    '700 40px "Cormorant Garamond"',
    'italic 400 40px "Cormorant Garamond"',
    '600 40px "Plus Jakarta Sans"',
    '700 40px "Plus Jakarta Sans"',
  ];
  await Promise.race([
    Promise.all(muestras.map(m => document.fonts.load(m, 'ÁÉÍÓÚÑáéíóúñ¿?«»').catch(() => []))),
    new Promise(r => window.setTimeout(r, 2500)),
  ]);
}

// ─── Retratos: el mismo SVG de la app, como imagen ────────────────────────────────────────────

const retratos = new Map<ArchetypeId, Promise<HTMLImageElement | null>>();

/**
 * El SVG del retrato, renderizado aparte. Se espera a que React lo pinte (flushSync no sirve aquí:
 * si React está a mitad de su trabajo, no pinta nada y el retrato sale vacío).
 */
async function marcadoDelRetrato(id: ArchetypeId): Promise<string> {
  const caja = document.createElement('div');
  const raiz = createRoot(caja);
  raiz.render(createElement(ArchetypeIllustratedArtwork, { archetypeId: id, className: '' }));
  for (let i = 0; i < 60 && !caja.firstElementChild; i++) await new Promise(r => window.setTimeout(r, 5));
  const svg = caja.innerHTML;
  raiz.unmount();
  if (!svg) throw new Error('El retrato no llegó a pintarse.');
  // Con tamaño propio: Safari rasteriza el SVG a su tamaño y luego lo escala.
  return svg.replace('<svg', '<svg width="960" height="1140"');
}

function retrato(id: ArchetypeId): Promise<HTMLImageElement | null> {
  let cargando = retratos.get(id);
  if (!cargando) {
    cargando = marcadoDelRetrato(id)
      .then(
        svg =>
          new Promise<HTMLImageElement | null>(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          })
      )
      .catch(() => null)
      .then(img => {
        // Un fallo no se guarda: la próxima vez se vuelve a intentar.
        if (!img) retratos.delete(id);
        return img;
      });
    retratos.set(id, cargando);
  }
  return cargando;
}

// ─── Pintar ──────────────────────────────────────────────────────────────────────────────────

/** Un azar con semilla: las estrellas de una persona salen siempre en el mismo sitio. */
function azar(semilla: string): () => number {
  let h = 2166136261;
  for (const c of semilla) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

function rectanguloRedondo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radio = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.arcTo(x + w, y, x + w, y + h, radio);
  ctx.arcTo(x + w, y + h, x, y + h, radio);
  ctx.arcTo(x, y + h, x, y, radio);
  ctx.arcTo(x, y, x + w, y, radio);
  ctx.closePath();
}

function escribir(ctx: CanvasRenderingContext2D, texto: string, xCentro: number, yMedio: number, f: FuentePostal, medir: Medir) {
  ctx.font = css(f);
  ctx.textBaseline = 'middle';
  const espaciado = f.espaciado ?? 0;
  if (!espaciado) {
    ctx.textAlign = 'center';
    ctx.fillText(texto, xCentro, yMedio);
    return;
  }
  ctx.textAlign = 'left';
  let x = xCentro - medir(texto, f) / 2;
  for (const letra of [...texto]) {
    ctx.fillText(letra, x, yMedio);
    x += ctx.measureText(letra).width + espaciado;
  }
}

function pintarFondo(ctx: CanvasRenderingContext2D, postal: Postal, tema: TemaPostal, semilla: string) {
  const { ancho, alto, huella } = postal;
  const fondo = ctx.createLinearGradient(0, 0, 0, alto);
  fondo.addColorStop(0, tema.fondo[0]);
  fondo.addColorStop(0.55, tema.fondo[1]);
  fondo.addColorStop(1, tema.fondo[2]);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ancho, alto);

  // El resplandor detrás de las cartas.
  const brillo = ctx.createRadialGradient(huella.cx, huella.cy, 0, huella.cx, huella.cy, huella.radioExterior * 1.7);
  brillo.addColorStop(0, `rgba(${tema.brillo}, 0.30)`);
  brillo.addColorStop(0.5, `rgba(${tema.brillo}, 0.08)`);
  brillo.addColorStop(1, `rgba(${tema.brillo}, 0)`);
  ctx.fillStyle = brillo;
  ctx.fillRect(0, 0, ancho, alto);

  // Estrellas.
  const r = azar(semilla);
  const cuantas = Math.round((ancho * alto) / 14000);
  for (let i = 0; i < cuantas; i++) {
    const x = r() * ancho;
    const y = r() * alto;
    const radio = 0.7 + r() * 1.9;
    ctx.fillStyle = `rgba(244, 239, 227, ${0.1 + r() * 0.45})`;
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fill();
  }

  // Viñeta: los bordes, más oscuros.
  const vineta = ctx.createRadialGradient(ancho / 2, alto / 2, Math.min(ancho, alto) * 0.35, ancho / 2, alto / 2, Math.max(ancho, alto) * 0.75);
  vineta.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vineta.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vineta;
  ctx.fillRect(0, 0, ancho, alto);

  // Un marco fino, con rombos en las esquinas.
  const m = postal.formato === 'story' ? 34 : 26;
  ctx.strokeStyle = `rgba(${tema.brillo}, 0.38)`;
  ctx.lineWidth = 2;
  ctx.strokeRect(m, m, ancho - 2 * m, alto - 2 * m);
  ctx.fillStyle = tema.acento;
  for (const [x, y] of [
    [m, m],
    [ancho - m, m],
    [m, alto - m],
    [ancho - m, alto - m],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 9, y);
    ctx.lineTo(x, y + 9);
    ctx.lineTo(x - 9, y);
    ctx.closePath();
    ctx.fill();
  }
}

function pintarHuella(ctx: CanvasRenderingContext2D, h: HuellaPostal, tema: TemaPostal) {
  ctx.save();
  // El fondo del anillo, un punto más claro, para que la rueda se lea como una pieza.
  ctx.beginPath();
  ctx.arc(h.cx, h.cy, h.radioExterior, 0, Math.PI * 2);
  ctx.arc(h.cx, h.cy, h.radioInterior, 0, Math.PI * 2, true);
  ctx.fillStyle = `rgba(${tema.brillo}, 0.05)`;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(${tema.brillo}, 0.28)`;
  ctx.beginPath();
  ctx.arc(h.cx, h.cy, h.radioInterior, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([3, 12]);
  ctx.beginPath();
  ctx.arc(h.cx, h.cy, h.radioExterior, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // El arco de cada dimensión, por fuera, en su color.
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(3, h.grosor * 0.6);
  for (const a of h.arcos) {
    ctx.strokeStyle = conAlfa(a.color, 0.75);
    ctx.beginPath();
    ctx.arc(h.cx, h.cy, h.radioArco, a.desde, a.hasta);
    ctx.stroke();
  }
  const largo = h.radioExterior - h.radioInterior;
  for (const rayo of h.rayos) {
    const fin = h.radioInterior + largo * 0.1 + largo * 0.82 * Math.max(0.04, rayo.valor);
    const inicio = h.radioInterior + largo * 0.1;
    const cos = Math.cos(rayo.angulo);
    const sin = Math.sin(rayo.angulo);
    const grosor = rayo.destacado ? h.grosor * 1.3 : h.grosor;
    ctx.strokeStyle = rayo.destacado ? tema.acento : conAlfa(rayo.color, 0.55);
    ctx.lineWidth = grosor;
    ctx.beginPath();
    ctx.moveTo(h.cx + cos * inicio, h.cy + sin * inicio);
    ctx.lineTo(h.cx + cos * fin, h.cy + sin * fin);
    ctx.stroke();
    ctx.fillStyle = rayo.destacado ? tema.acento : conAlfa(rayo.color, 0.8);
    ctx.beginPath();
    ctx.arc(h.cx + cos * fin, h.cy + sin * fin, rayo.destacado ? grosor * 1.05 : grosor * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function pintarCarta(ctx: CanvasRenderingContext2D, c: CartaPostal, img: HTMLImageElement | null, tema: TemaPostal, medir: Medir) {
  const { ancho: w, alto: h } = c;
  const radio = Math.round(w * 0.06);
  const borde = Math.max(3, Math.round(w * 0.014));
  ctx.save();
  ctx.translate(c.cx, c.cy);
  ctx.rotate(c.giro);

  // Sombra (en el canvas, también en Safari).
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = w * 0.12;
  ctx.shadowOffsetY = w * 0.05;
  rectanguloRedondo(ctx, -w / 2, -h / 2, w, h, radio);
  ctx.fillStyle = '#07100D';
  ctx.fill();
  ctx.restore();

  // El retrato, que llena la carta: tienen la misma proporción. El velo de abajo, solo si lleva
  // nombre que leer.
  ctx.save();
  rectanguloRedondo(ctx, -w / 2, -h / 2, w, h, radio);
  ctx.clip();
  if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
  const velo = c.rotulo ? h * 0.36 : h * 0.18;
  const sombra = ctx.createLinearGradient(0, h / 2 - velo, 0, h / 2);
  sombra.addColorStop(0, 'rgba(5, 9, 8, 0)');
  sombra.addColorStop(1, 'rgba(5, 9, 8, 0.92)');
  ctx.fillStyle = sombra;
  ctx.fillRect(-w / 2, h / 2 - velo, w, velo);
  ctx.restore();

  // Marco doble, como una carta.
  rectanguloRedondo(ctx, -w / 2, -h / 2, w, h, radio);
  ctx.strokeStyle = tema.acento;
  ctx.lineWidth = borde;
  ctx.stroke();
  const dentro = w * 0.045;
  rectanguloRedondo(ctx, -w / 2 + dentro, -h / 2 + dentro, w - 2 * dentro, h - 2 * dentro, radio * 0.6);
  ctx.strokeStyle = `rgba(${tema.brillo}, 0.45)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // El nombre al pie, si lo lleva.
  if (c.rotulo) {
    const { lineas, fuente, altoLinea } = c.rotulo;
    const arriba = h / 2 - w * 0.08 - lineas.length * altoLinea;
    ctx.fillStyle = TONOS.claro;
    lineas.forEach((l, i) => escribir(ctx, l, 0, arriba + altoLinea * (i + 0.5), fuente, medir));
  }
  ctx.restore();
}

function pintarTexto(ctx: CanvasRenderingContext2D, b: BloqueTexto, tema: TemaPostal, medir: Medir) {
  const centro = b.caja.x + b.caja.ancho / 2;
  if (b.clave === 'sitio') {
    rectanguloRedondo(ctx, b.caja.x, b.caja.y, b.caja.ancho, b.caja.alto, b.caja.alto / 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = `rgba(${tema.brillo}, 0.6)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    const arriba = b.caja.y + (b.caja.alto - b.altoLinea * b.lineas.length) / 2;
    ctx.fillStyle = color(b.tono, tema);
    b.lineas.forEach((l, i) => escribir(ctx, l, centro, arriba + b.altoLinea * (i + 0.5), b.fuente, medir));
    return;
  }
  ctx.fillStyle = color(b.tono, tema);
  b.lineas.forEach((l, i) => escribir(ctx, l, centro, b.caja.y + b.altoLinea * (i + 0.5), b.fuente, medir));
}

function pintarBarras(ctx: CanvasRenderingContext2D, b: BloqueBarras, tema: TemaPostal, medir: Medir) {
  const { x, y, ancho, alto } = b.caja;
  rectanguloRedondo(ctx, x, y, ancho, alto, b.fuente.tamano * 0.9);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();
  ctx.strokeStyle = `rgba(${tema.brillo}, 0.25)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const util = ancho - 2 * b.relleno;
  const anchoEtiqueta = util * 0.44;
  const anchoValor = b.fuente.tamano * 2.6;
  const inicioBarra = x + b.relleno + anchoEtiqueta + b.fuente.tamano * 0.5;
  const finBarra = x + ancho - b.relleno - anchoValor - b.fuente.tamano * 0.4;
  b.filas.forEach((fila, i) => {
    const medio = y + b.relleno + b.altoFila * (i + 0.5);
    // La etiqueta, encogida si hace falta para no pisar la barra.
    let f = b.fuente;
    while (medir(fila.etiqueta, f) > anchoEtiqueta && f.tamano > b.fuente.tamano * 0.7) f = { ...f, tamano: f.tamano - 1 };
    let etiqueta = fila.etiqueta;
    while (medir(etiqueta, f) > anchoEtiqueta && etiqueta.length > 2) etiqueta = `${etiqueta.slice(0, -2)}…`;
    ctx.font = css(f);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = TONOS.claro;
    ctx.fillText(etiqueta, x + b.relleno, medio);

    const grueso = Math.max(6, b.fuente.tamano * 0.34);
    rectanguloRedondo(ctx, inicioBarra, medio - grueso / 2, finBarra - inicioBarra, grueso, grueso / 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    const lleno = Math.max(grueso, ((finBarra - inicioBarra) * Math.min(100, Math.max(0, fila.valor))) / 100);
    rectanguloRedondo(ctx, inicioBarra, medio - grueso / 2, lleno, grueso, grueso / 2);
    ctx.fillStyle = fila.color === 'acento' ? tema.acento : fila.color;
    ctx.fill();

    ctx.font = css({ ...b.fuente, peso: 700 });
    ctx.textAlign = 'right';
    ctx.fillStyle = fila.color === 'acento' ? tema.acento : TONOS.crema;
    ctx.fillText(`${fila.valor}%`, x + ancho - b.relleno, medio);
  });
}

/** La postal como PNG, a su medida real. */
export async function generarPostal(datos: DatosPostal, tema: TemaPostal, semilla = 'postal'): Promise<Blob> {
  // Todo lo que se espera, antes de medir: las fuentes y los retratos. Si se midiera antes de
  // esperar a los retratos y la fuente buena llegara mientras tanto, se pintaría con una letra
  // distinta de la medida. De aquí al final, medir y pintar van seguidos, sin ninguna espera:
  // ninguna fuente puede cambiar entre las dos cosas.
  await cargarFuentes();
  const ids = datos.contenido.figuras.slice(0, 3);
  const imagenes = new Map(await Promise.all(ids.map(async id => [id, await retrato(id)] as const)));

  const { ancho, alto } = MEDIDAS_POSTAL[datos.formato];
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('Este navegador no deja dibujar la imagen.');

  // Se mide letra a letra cuando hay espaciado, igual que se pinta.
  const medir: Medir = (texto, f) => {
    ctx.font = css(f);
    const espaciado = f.espaciado ?? 0;
    if (!espaciado) return ctx.measureText(texto).width;
    const letras = [...texto];
    return letras.reduce((s, l) => s + ctx.measureText(l).width, 0) + espaciado * Math.max(0, letras.length - 1);
  };

  const postal = disenarPostal(datos, medir);
  pintarFondo(ctx, postal, tema, semilla);
  pintarHuella(ctx, postal.huella, tema);
  for (const c of postal.cartas) pintarCarta(ctx, c, imagenes.get(c.id) ?? null, tema, medir);
  for (const b of postal.bloques) {
    if (b.tipo === 'texto') pintarTexto(ctx, b, tema, medir);
    else pintarBarras(ctx, b, tema, medir);
  }

  return new Promise((resolve, reject) =>
    lienzo.toBlob(blob => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))), 'image/png')
  );
}
