/**
 * Tokens de diseño de Arquetipos.
 *
 * Extraidos del tema del proyecto de Stitch «Masculine Archetypes Premium UI».
 * Son valores planos, sin dependencias: los consume la clase de utilidad en web
 * y el objeto de estilos en movil, y ninguno de los dos tiene que saber del otro.
 *
 * Aqui no va logica. Si algo necesita decidir, no es un token.
 */

/** Paleta Material en modo oscuro, tal como la definio el tema. */
export const palette = {
  background: '#14140f',
  onBackground: '#e5e2da',

  surface: '#14140f',
  surfaceDim: '#14140f',
  surfaceBright: '#3a3933',
  surfaceVariant: '#35352f',
  onSurface: '#e5e2da',
  onSurfaceVariant: '#c3c7c5',

  /** Escalones de elevacion. Cuanto mas alto, mas cerca del ojo. */
  surfaceContainerLowest: '#0e0e0a',
  surfaceContainerLow: '#1c1c17',
  surfaceContainer: '#20201a',
  surfaceContainerHigh: '#2a2a25',
  surfaceContainerHighest: '#35352f',

  primary: '#c2c8c6',
  onPrimary: '#2b3230',
  primaryContainer: '#0b1110',
  onPrimaryContainer: '#777d7c',
  primaryFixed: '#dee4e1',
  primaryFixedDim: '#c2c8c6',

  secondary: '#bec9c3',
  onSecondary: '#28332e',
  secondaryContainer: '#3e4944',
  onSecondaryContainer: '#acb8b1',

  /**
   * El dorado. Es el acento de la marca y el color con el que se trazan los
   * sigilos de los arquetipos: el unico calido de una paleta entera de grises
   * verdosos, asi que todo lo que lleve este color se lee como especial.
   */
  tertiary: '#f0bf64',
  onTertiary: '#412d00',
  tertiaryContainer: '#180e00',
  onTertiaryContainer: '#9d7520',
  tertiaryFixed: '#ffdea6',
  tertiaryFixedDim: '#f0bf64',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  outline: '#8d9290',
  outlineVariant: '#434847',

  inverseSurface: '#e5e2da',
  inverseOnSurface: '#31312b',
  inversePrimary: '#59605e',
  surfaceTint: '#c2c8c6',
} as const;

/**
 * Tipografia.
 *
 * Una serif para los titulares y una grotesca para el resto. El contraste entre
 * las dos es lo que da el aire de libro antiguo sin volver ilegible el cuerpo.
 */
export const fonts = {
  headline: 'EBGaramond',
  body: 'HankenGrotesk',
  label: 'HankenGrotesk',
} as const;

/** Escala tipografica. Los tamaños en puntos, el interlineado en absoluto. */
export const typography = {
  display: { fontFamily: fonts.headline, fontSize: 44, lineHeight: 50, letterSpacing: -0.5 },
  title: { fontFamily: fonts.headline, fontSize: 30, lineHeight: 36, letterSpacing: -0.25 },
  heading: { fontFamily: fonts.headline, fontSize: 22, lineHeight: 28 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.label, fontSize: 13, lineHeight: 16, letterSpacing: 0.6 },
  /** Para mantras y citas: espaciada y en versalitas visuales. */
  inscription: { fontFamily: fonts.headline, fontSize: 18, lineHeight: 28, letterSpacing: 2 },
} as const;

/** Redondez del tema: cuatro pasos. */
export const radii = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

/** Espaciado en una escala de cuatro. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Movimiento.
 *
 * Vive aqui, y no suelto en cada componente, porque una animacion con una
 * duracion inventada a ojo es lo que hace que una app se sienta desigual. Los
 * valores siguen las reglas de animacion en movil: nada de curvas suaves al
 * entrar, y todo por debajo de trescientos milisegundos salvo las transiciones
 * de pantalla, que son las de la plataforma.
 */
export const motion = {
  duration: {
    press: 120,
    toggle: 180,
    reveal: 260,
    sheet: 300,
    /** El trazado de un sigilo. Es una excepcion consciente: es contemplativo. */
    sigil: 1600,
  },
  /**
   * Curvas de Bezier. Las integradas son demasiado debiles, asi que se dan
   * explicitas. Nunca una curva que arranque lenta en interfaz: retrasa justo
   * el instante que la persona esta mirando.
   */
  easing: {
    out: [0.23, 1, 0.32, 1],
    inOut: [0.77, 0, 0.175, 1],
    sheet: [0.32, 0.72, 0, 1],
  },
  /** Muelles, en los dos parametros que de verdad se perciben. */
  spring: {
    settle: { duration: 400, dampingRatio: 1 },
    snap: { duration: 400, dampingRatio: 0.8 },
    sheet: { duration: 300, dampingRatio: 0.8 },
  },
} as const;

/** Colores propios de cada arquetipo, para acentos y sigilos. */
export type ArchetypeAccent = { stroke: string; glow: string };

export const theme = { palette, fonts, typography, radii, spacing, motion } as const;
export type Theme = typeof theme;
